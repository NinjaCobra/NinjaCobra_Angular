/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, APP_INITIALIZER } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ninjaAuth, ninjaAuthOptions } from '@ninja/ninja-auth-js';
import { 
  ninjaAuthModule, 
  ninja_CONFIG, 
  ninja_AUTH,
  ninjaAuthStateService, 
  ninjaAuthGuard,
  ninjaAuthConfigService
} from '../../lib/src/ninja-angular';
import { of } from 'rxjs';
import { map, tap, take, catchError } from 'rxjs/operators';

@Component({ template: '' })
class MockComponent {}

// Simulate fetching ninjaAuthOptions from backend with GET /config
// In APP_INITIALIZER factory the config should be set with configService.setConfig()
async function setupWithAppInitializer(
  ninjaAuthOptions?: ninjaAuthOptions,
  imports: any[] = [ ninjaAuthModule ],
) {
  const configInitializer = (configService: ninjaAuthConfigService, httpClient: HttpClient) => {
    return () => httpClient.get<ninjaAuthOptions>('/config')
      .pipe(
        map((res) => ({
          issuer: res.issuer,
          clientId: res.clientId,
          redirectUri: res.redirectUri,
        })),
        tap((authConfig: ninjaAuthOptions) => {
          const ninjaAuth = new ninjaAuth(authConfig);
          ninjaAuth.start = jest.fn();
          configService.setConfig({
            ninjaAuth,
          });
        }),
        take(1),
        catchError(() => of(null)),
      );
  };

  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      ...imports,
    ],
    declarations: [ MockComponent ],
    providers: [{
      provide: APP_INITIALIZER,
      useFactory: configInitializer,
      deps: [ninjaAuthConfigService, HttpClient],
      multi: true
    }],
  });

  const httpTestingController = TestBed.inject(HttpTestingController);
  const req = httpTestingController.expectOne('/config');
  expect(req.request.method).toEqual('GET');
  if (ninjaAuthOptions) {
    req.flush(ninjaAuthOptions);
  } else {
    req.flush('404', { status: 404, statusText: 'Not Found' });
  }
  httpTestingController.verify();

  await TestBed.createComponent(MockComponent);
}

function setup(ninjaAuth?: ninjaAuth) {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      ninjaAuthModule
    ],
    declarations: [ MockComponent ],
    providers: [{
      provide: ninja_CONFIG,
      useValue: {
        ninjaAuth
      }
    }],
  });
  return TestBed.createComponent(MockComponent);
}

function setupForRoot(ninjaAuth?: ninjaAuth) {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      ninjaAuth ? ninjaAuthModule.forRoot({ ninjaAuth }) : ninjaAuthModule.forRoot()
    ],
    declarations: [ MockComponent ],
  });
  return TestBed.createComponent(MockComponent);
}


describe('ninja Module', () => {
  let ninjaAuth: ninjaAuth;
  let ninjaAuthOptions: ninjaAuthOptions;

  beforeEach(() => {
    ninjaAuthOptions = {
      issuer: 'http://xyz',
      clientId: 'fake clientId',
      redirectUri: 'fake redirectUri'
    };

    ninjaAuth = {
      options: {},
      authStateManager: {
        updateAuthState: jest.fn(),
        getAuthState: jest.fn(),
        subscribe: jest.fn()
      },
      start: jest.fn(),
      _ninjaUserAgent: {
        addEnvironment: jest.fn(),
        getVersion: jest.fn().mockReturnValue(`999.9.9`)
      },
    } as unknown as ninjaAuth;
  });


  describe('DI', () => {
    describe('with ninja_CONFIG injection token', () => {
      it('provides ninjaAuth', () => {
        setup(ninjaAuth);
        expect(TestBed.get(ninja_AUTH)).toBeDefined();
        expect(ninjaAuth.start).toHaveBeenCalled();
      });
      it('provides AuthStateService', () => {
        setup(ninjaAuth);
        expect(TestBed.get(ninjaAuthStateService)).toBeDefined();
      });
      it('provides ninjaAuthGuard', () => {
        setup(ninjaAuth);
        expect(TestBed.get(ninjaAuthGuard)).toBeDefined();
      });
      it('provides ninjaAuthConfigService', () => {
        setup(ninjaAuth);
        expect(TestBed.get(ninjaAuthConfigService)).toBeDefined();
        expect(TestBed.get(ninjaAuthConfigService).getConfig()).toBeDefined();
        expect(TestBed.get(ninjaAuthConfigService).getConfig().ninjaAuth).toEqual(ninjaAuth);
      });
      it('should throw if ninjaAuth is not provided in ninja_CONFIG value', () => {
        setup();
        expect(() => TestBed.get(ninja_AUTH)).toThrow('ninja config should contain ninjaAuth');
      });
    });

    describe('with .forRoot(config)', () => {
      it('should provide ninjaAuth', () => {
        setupForRoot(ninjaAuth);
        expect(TestBed.get(ninja_AUTH)).toBeDefined();
        expect(ninjaAuth.start).toHaveBeenCalled();
      });

      it('should provide ninja_CONFIG', () => {
        setupForRoot(ninjaAuth);
        expect(TestBed.get(ninja_CONFIG)).toBeDefined();
        expect(TestBed.get(ninja_CONFIG).ninjaAuth).toEqual(ninjaAuth);
      });

      it('should provide ninjaAuthConfigService', () => {
        setupForRoot(ninjaAuth);
        expect(TestBed.get(ninjaAuthConfigService)).toBeDefined();
        expect(TestBed.get(ninjaAuthConfigService).getConfig()).toBeDefined();
        expect(TestBed.get(ninjaAuthConfigService).getConfig().ninjaAuth).toEqual(ninjaAuth);
      });
  
      it('should provide ninjaAuthStateService', () => {
        setupForRoot(ninjaAuth);
        expect(TestBed.get(ninjaAuthStateService)).toBeDefined();
      });
  
      it('should provide ninjaAuthGuard', () => {
        setupForRoot(ninjaAuth);
        expect(TestBed.get(ninjaAuthGuard)).toBeDefined();
      });
  
      it('should throw if ninjaAuth is not provided', () => {
        setupForRoot();
        expect(() => TestBed.get(ninja_AUTH)).toThrow('ninja config is not provided');
      });
    });
  
    describe('with APP_INITIALIZER', () => {
      it('should set loaded config with configService.setConfig()', async () => {
        await setupWithAppInitializer(ninjaAuthOptions);
        expect(TestBed.get(ninjaAuthConfigService)).toBeDefined();
        expect(TestBed.get(ninjaAuthConfigService).getConfig()).toBeDefined();
        expect(TestBed.get(ninjaAuthConfigService).getConfig().ninjaAuth.options.issuer).toEqual(ninjaAuthOptions.issuer);
      });

      it('should provide ninjaAuth', async () => {
        await setupWithAppInitializer(ninjaAuthOptions);
        expect(TestBed.get(ninja_AUTH)).toBeDefined();
        expect(TestBed.get(ninja_AUTH).start).toHaveBeenCalled();
      });
  
      it('should provide ninjaAuthStateService', async () => {
        await setupWithAppInitializer(ninjaAuthOptions);
        expect(TestBed.get(ninjaAuthStateService)).toBeDefined();
      });
  
      it('should provide ninjaAuthGuard', async () => {
        await setupWithAppInitializer(ninjaAuthOptions);
        expect(TestBed.get(ninjaAuthGuard)).toBeDefined();
      });
  
      it('should throw if ninjaAuth is not provided', async () => {
        await setupWithAppInitializer();
        expect(() => TestBed.get(ninja_AUTH)).toThrow('ninja config is not provided');
      });
  
      it('should work if ninjaAuthModule is imported with .forRoot()', async () => {
        await setupWithAppInitializer(ninjaAuthOptions, [ ninjaAuthModule.forRoot() ]);
        expect(TestBed.get(ninja_CONFIG)).not.toBeDefined();
        expect(TestBed.get(ninja_AUTH)).toBeDefined();
        expect(TestBed.get(ninjaAuthConfigService).getConfig()).toBeDefined();
      });

    });
  });
  
});
