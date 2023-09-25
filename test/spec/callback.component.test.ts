/* eslint-disable @typescript-eslint/no-explicit-any */
import { APP_INITIALIZER } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ninjaAuth } from '@ninja/ninja-auth-js';
import {
  ninjaCallbackComponent,
  ninjaAuthModule,
  ninjaAuthConfigService
} from '../../lib/src/ninja-angular';

describe('ninjaCallbackComponent', () => {
  let component: ninjaCallbackComponent;
  let fixture: ComponentFixture<ninjaCallbackComponent>;
  let ninjaAuth: ninjaAuth;
  let originalLocation: Location;
  beforeEach(() => {
    originalLocation = window.location;
    (window.location as unknown) = {
      protocol: 'https:',
      replace: jest.fn(),
      // simulate callback
      href: 'https://foo',
      search: '?code=fake'
    };
  });
  afterEach(() => {
    window.location = originalLocation;
  });

  function bootstrap(config = {}) {
    ninjaAuth = {
      handleLoginRedirect: jest.fn(),
      idx: {
        isInteractionRequiredError: jest.fn()
      },
      _ninjaUserAgent: {
        addEnvironment: jest.fn(),
        getVersion: jest.fn().mockReturnValue(`999.9.9`)
      },
      options: {},
      start: jest.fn(),
    } as unknown as ninjaAuth;

    const configInitializer = (configService: ninjaAuthConfigService) => {
      return () => {
        configService.setConfig({
          ninjaAuth,
          ...config
        });
      };
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
        ninjaAuthModule,
      ],
      providers: [{
        provide: APP_INITIALIZER,
        useFactory: configInitializer,
        deps: [ninjaAuthConfigService],
        multi: true
      }],
      declarations: [
        ninjaCallbackComponent
      ],
    });

    fixture = TestBed.createComponent(ninjaCallbackComponent);
    component = fixture.componentInstance;
  }

  it('should create the component', async(() => {
    bootstrap();
    expect(component).toBeTruthy();
  }));

  it('should call handleLoginRedirect', async(() => {
    bootstrap();
    jest.spyOn(ninjaAuth, 'handleLoginRedirect').mockReturnValue(Promise.resolve());
    fixture.detectChanges();
    expect(ninjaAuth.handleLoginRedirect).toHaveBeenCalled();
  }));

  it('catches errors from handleLoginRedirect', async(() => {
    bootstrap();
    const error = new Error('test error');
    jest.spyOn(ninjaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
    fixture.detectChanges();
    expect(ninjaAuth.handleLoginRedirect).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      expect(component.error).toBe('Error: test error');
    });
  }));

  describe('interaction code flow', () => {
    it('will call `onAuthResume` function, if defined', async(() => {
      const onAuthResume = jest.fn();
      bootstrap({ onAuthResume });
      const error = new Error('my fake error');
      jest.spyOn(ninjaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(ninjaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(ninjaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(onAuthResume).toHaveBeenCalledWith(ninjaAuth, (component as any).injector);
        expect(component.error).toBe(undefined);
      });
    }));

    it('will call `onAuthRequired` function, if `onAuthResume` is not defined', async(() => {
      const onAuthRequired = jest.fn();
      bootstrap({ onAuthRequired });
      const error = new Error('my fake error');
      jest.spyOn(ninjaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(ninjaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(ninjaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(onAuthRequired).toHaveBeenCalledWith(ninjaAuth, (component as any).injector);
        expect(component.error).toBe(undefined);
      });
    }));

    it('if neither `onAuthRequired` or `onAuthResume` are defined, the error is displayed', async(() => {
      bootstrap();
      const error = new Error('my fake error');
      jest.spyOn(ninjaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(ninjaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(ninjaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(component.error).toBe('Error: my fake error');
      });
    }));
  });
});
