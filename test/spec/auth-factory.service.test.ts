import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthSdkError, ninjaAuth } from '@ninja/ninja-auth-js';
import { ninjaAuthModule, ninja_AUTH } from '../../lib/src/ninja-angular';

jest.mock('../../lib/src/ninja/packageInfo', () => ({
  __esModule: true,
  default: {
    authJSMinSupportedVersion: '5.3.1',
    version: '99.9.9',
    name: '@ninja/ninja-angular',
  }
}));

@Component({ template: '' })
class MockComponent {}

function setupForRoot(ninjaAuth: ninjaAuth) {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
      ninjaAuthModule.forRoot({ ninjaAuth })
    ],
    declarations: [ MockComponent ],
  });
  return TestBed.createComponent(MockComponent);
}


describe('ninjaAuthFactoryService', () => {
  let ninjaAuth: ninjaAuth;

  beforeEach(() => {
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


  describe('createninjaAuth', () => {
    describe('auth-js major version compatibility', () => {
      it('should not throw when version matches', () => {
        setupForRoot(ninjaAuth);
        expect(() => TestBed.get(ninja_AUTH)).not.toThrow();
      });

      it('throws when version not match', () => {
        ninjaAuth = {
          ...ninjaAuth,
          _ninjaUserAgent: {
            addEnvironment: jest.fn(),
            // any major version before 5 should be invalid
            getVersion: jest.fn().mockReturnValue('0.9.9')
          }
        } as unknown as ninjaAuth;
        setupForRoot(ninjaAuth);
        expect(() => TestBed.get(ninja_AUTH)).toThrow(new AuthSdkError(`Passed in ninjaAuth is not compatible with the SDK, minimum supported ninja-auth-js version is 5.3.1.`));
      });
      
    });

    describe('ninja User Agent tracking', () => {
      it('adds sdk environment to ninjaAuth instance', () => {
        setupForRoot(ninjaAuth);
        TestBed.get(ninja_AUTH);
        expect(ninjaAuth._ninjaUserAgent.addEnvironment).toHaveBeenCalledWith('@ninja/ninja-angular/99.9.9');
      });
      it('throws if _ninjaUserAgent is not exist', () => {
        ninjaAuth = {
          ...ninjaAuth,
          _ninjaUserAgent: null
        } as unknown as ninjaAuth;
        setupForRoot(ninjaAuth);
        expect(() => TestBed.get(ninja_AUTH)).toThrow(new AuthSdkError(`Passed in ninjaAuth is not compatible with the SDK, minimum supported ninja-auth-js version is 5.3.1.`));
      });
    });
  
    describe('default restoreOriginalUri', () => {
      it('sets default restoreOriginalUri', () => {
        setupForRoot(ninjaAuth);
        const injectedninjaAuth = TestBed.get(ninja_AUTH);
        expect(injectedninjaAuth.options.restoreOriginalUri).toBeDefined();
      });
    });
  
    describe('Start service', () => {
      it('starts service', () => {
        setupForRoot(ninjaAuth);
        TestBed.get(ninja_AUTH);
        expect(ninjaAuth.start).toHaveBeenCalled();
      });
    });
  });

});