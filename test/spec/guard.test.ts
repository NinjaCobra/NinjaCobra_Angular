import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  ninjaAuthGuard,
  ninjaConfig,
  ninja_CONFIG,
} from '../../lib/src/ninja-angular';
import { AuthRequiredFunction } from '../../lib/src/ninja/models/ninja.config';
import { ninjaAuthConfigService } from '../../lib/src/ninja/services/auth-config.serice';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  RouterState, 
  Route
} from '@angular/router';
import { Injector } from '@angular/core';
import { ninjaAuth } from '@ninja/ninja-auth-js';

jest.mock('../../lib/src/ninja/packageInfo', () => ({
  __esModule: true,
  default: {
    authJSMinSupportedVersion: '5.3.1',
    version: '99.9.9',
    name: '@ninja/ninja-angular',
  }
}));

function createConfigService(config: ninjaConfig) {
  return {
    getConfig: jest.fn().mockReturnValue(config),
    setConfig: jest.fn(),
  } as unknown as ninjaAuthConfigService;
}

function setup(ninjaAuth: ninjaAuth, config: ninjaConfig) {
  config = config || {};

  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
    ],
    providers: [
      ninjaAuthGuard,
      {
        provide: ninjaAuth,
        useValue: ninjaAuth
      },
      {
        provide: ninja_CONFIG,
        useValue: config
      },
    ],
  });
}

describe('Angular auth guard', () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canLoad', () => {
    describe('isAuthenticated() = true', () => {
      it('returns true', async () => {
        const ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
        } as unknown;
        const configService = createConfigService({} as ninjaConfig);
        setup(ninjaAuth as ninjaAuth, {} as ninjaConfig);
        const injector: Injector = TestBed.get(Injector);
        const guard = new ninjaAuthGuard(ninjaAuth as ninjaAuth, injector as Injector, configService);
        const route: unknown = {};
        const res = await guard.canLoad(route as Route);
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = false', () => {
      let ninjaAuth: ninjaAuth;
      let guard: ninjaAuthGuard;
      let route: Route;
      let router: Router;
      let injector: Injector;
      let onAuthRequired: AuthRequiredFunction;
      beforeEach(() => {
        ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(false),
          setOriginalUri: jest.fn(),
          signInWithRedirect: jest.fn()
        } as unknown as ninjaAuth;
        onAuthRequired = jest.fn();
        const config = { ninjaAuth } as ninjaConfig;
        const configService = createConfigService(config);
        setup(ninjaAuth, config);
        injector = TestBed.get(Injector);
        guard = new ninjaAuthGuard(ninjaAuth, injector, configService);
        route = {} as unknown as Route;
      });

      it('returns false', async () => {
        const res = await guard.canLoad(route);
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect()"', async () => {
        await guard.canLoad(route);
        expect(ninjaAuth.signInWithRedirect).toHaveBeenCalled();
      });

      it('calls "setOriginalUri" with state url', async () => {
        const path = '/path';
        const query = '?query=foo&bar=baz';
        const hash = '#hash=foo';
        const routerUrl = `${path}${query}${hash}`;
        router = TestBed.get(Router);
        jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({
          extractedUrl: router.parseUrl(routerUrl),
          extras: {},
          id: 1,
          initialUrl: router.parseUrl('fakepath'),
          previousNavigation: null,
          trigger: 'imperative',
        });

        await guard.canLoad(route);
        expect(ninjaAuth.setOriginalUri).toHaveBeenCalledWith('/path?query=foo&bar=baz#hash=foo');
      });

      it('onAuthRequired can be set on route', async () => {
        const mockFn = jest.fn();
        route.data = {
          onAuthRequired: mockFn
        };
        await guard.canLoad(route);
        const options = {};
        expect(mockFn).toHaveBeenCalledWith(ninjaAuth, injector, options);
      });

      it('onAuthRequired can be set on config', async () => {
        const config = { ninjaAuth, onAuthRequired };
        const configService = createConfigService(config);
        guard = new ninjaAuthGuard(ninjaAuth, injector, configService);
        await guard.canLoad(route);
        const options = {};
        expect(onAuthRequired).toHaveBeenCalledWith(ninjaAuth, injector, options);
      });
    });

    describe('isAuthenticated() = true and "acr" claim matches provided acrValues', () => {
      it('returns true', async () => {
        const ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:ninja:loa:2fa:any'
                }
              }
            })
          },
          _ninjaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown;
        const configService = createConfigService({} as ninjaConfig);
        setup(ninjaAuth as ninjaAuth, {} as ninjaConfig);
        const injector: Injector = TestBed.get(Injector);
        const guard = new ninjaAuthGuard(ninjaAuth as ninjaAuth, injector as Injector, configService);
        const route: unknown = {
          data: {
            ninja: {
              acrValues: 'urn:ninja:loa:2fa:any'
            }
          }
        };
        const res = await guard.canLoad(route as Route);
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = true and "acr" claim does not match provided acrValues', () => {
      let ninjaAuth: ninjaAuth;
      let guard: ninjaAuthGuard;
      let route: Route;
      let injector: Injector;
      beforeEach(() => {
        ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:ninja:loa:1fa:any'
                }
              }
            })
          },
          signInWithRedirect: jest.fn(),
          _ninjaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown as ninjaAuth;
        const config = { ninjaAuth } as ninjaConfig;
        const configService = createConfigService(config);
        setup(ninjaAuth, config);
        injector = TestBed.get(Injector);
        guard = new ninjaAuthGuard(ninjaAuth, injector, configService);
        route = {
          data: {
            ninja: {
              acrValues: 'urn:ninja:loa:2fa:any'
            }
          }
        } as unknown as Route;
      });

      it('returns false', async () => {
        const res = await guard.canLoad(route);
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect({ acrValues })"', async () => {
        await guard.canLoad(route);
        expect(ninjaAuth.signInWithRedirect).toHaveBeenCalledWith({
          acrValues: 'urn:ninja:loa:2fa:any'
        });
      });

      it('if onAuthRequired is provided, calls with options { acrValues }', async () => {
        const mockFn = jest.fn();
        route.data = {
          ...route.data,
          onAuthRequired: mockFn,
        };
        await guard.canLoad(route);
        const options = {
          acrValues: 'urn:ninja:loa:2fa:any'
        };
        expect(mockFn).toHaveBeenCalledWith(ninjaAuth, injector, options);
      });
    });
  });

  describe('canActivate', () => {
    describe('isAuthenticated() = true', () => {
      it('returns true', async () => {
        const ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            subscribe: jest.fn()
          }
        } as unknown;
        const configService = createConfigService({} as ninjaConfig);
        setup(ninjaAuth as ninjaAuth, {} as ninjaConfig);
        const injector: Injector = TestBed.get(Injector);
        const guard = new ninjaAuthGuard(ninjaAuth as ninjaAuth, injector as Injector, configService);
        const route: unknown = {};
        const state: unknown = {};
        const res = await guard.canActivate(route as ActivatedRouteSnapshot, state as RouterStateSnapshot);
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = false', () => {
      let ninjaAuth: ninjaAuth;
      let guard: ninjaAuthGuard;
      let state: RouterStateSnapshot;
      let route: ActivatedRouteSnapshot;
      let router: Router;
      let injector: Injector;
      let onAuthRequired: AuthRequiredFunction;
      beforeEach(() => {
        ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(false),
          authStateManager: {
            subscribe: jest.fn()
          },
          setOriginalUri: jest.fn(),
          signInWithRedirect: jest.fn()
        } as unknown as ninjaAuth;
        onAuthRequired = jest.fn();
        const config = { ninjaAuth } as ninjaConfig;
        const configService = createConfigService(config);
        setup(ninjaAuth, config);
        router = TestBed.get(Router);
        injector = TestBed.get(Injector);
        guard = new ninjaAuthGuard(ninjaAuth, injector, configService);
        const routerState: RouterState = router.routerState;
        state = routerState.snapshot;
        route = state.root;
      });

      it('returns false', async () => {
        const res = await guard.canActivate(route, state);
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect()"', async () => {
        await guard.canActivate(route, state);
        expect(ninjaAuth.signInWithRedirect).toHaveBeenCalled();
      });

      it('calls "setOriginalUri" with state url', async () => {
        const baseUrl = 'http://fake.url/path';
        const query = '?query=foo&bar=baz';
        const hash = '#hash=foo';
        state.url = `${baseUrl}${query}${hash}`;
        const queryObj = { 'bar': 'baz' };
        route.queryParams = queryObj;
        await guard.canActivate(route, state);
        expect(ninjaAuth.setOriginalUri).toHaveBeenCalledWith(state.url);
      });

      it('onAuthRequired can be set on route', async () => {
        const fn = route.data['onAuthRequired'] = jest.fn();
        await guard.canActivate(route, state);
        const options = {};
        expect(fn).toHaveBeenCalledWith(ninjaAuth, injector, options);
      });

      it('onAuthRequired can be set on config', async () => {
        const config = { ninjaAuth, onAuthRequired };
        const configService = createConfigService(config);
        guard = new ninjaAuthGuard(ninjaAuth, injector, configService);
        await guard.canActivate(route, state);
        const options = {};
        expect(onAuthRequired).toHaveBeenCalledWith(ninjaAuth, injector, options);
      });
    });

    describe('isAuthenticated() = true and "acr" claim matches provided acrValues', () => {
      it('returns true', async () => {
        const ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:ninja:loa:2fa:any'
                }
              }
            }),
            subscribe: jest.fn()
          },
          _ninjaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown;
        const configService = createConfigService({} as ninjaConfig);
        setup(ninjaAuth as ninjaAuth, {} as ninjaConfig);
        const injector: Injector = TestBed.get(Injector);
        const guard = new ninjaAuthGuard(ninjaAuth as ninjaAuth, injector as Injector, configService);
        const route: unknown = {
          data: {
            ninja: {
              acrValues: 'urn:ninja:loa:2fa:any'
            }
          }
        };
        const state: unknown = {};
        const res = await guard.canActivate(route as ActivatedRouteSnapshot, state as RouterStateSnapshot);
        expect(res).toBe(true);
      });
    });

    describe('isAuthenticated() = true and "acr" claim does not match provided acrValues', () => {
      let ninjaAuth: ninjaAuth;
      let guard: ninjaAuthGuard;
      let state: RouterStateSnapshot;
      let route: ActivatedRouteSnapshot;
      let router: Router;
      let injector: Injector;
      beforeEach(() => {
        ninjaAuth = {
          isAuthenticated: jest.fn().mockResolvedValue(true),
          authStateManager: {
            getAuthState: jest.fn().mockReturnValue({
              idToken: {
                claims: {
                  acr: 'urn:ninja:loa:1fa:any'
                }
              }
            }),
            subscribe: jest.fn(),
          },
          signInWithRedirect: jest.fn(),
          _ninjaUserAgent: {
            getVersion: jest.fn().mockReturnValue('7.1.0')
          }
        } as unknown as ninjaAuth;
        const config = { ninjaAuth } as ninjaConfig;
        const configService = createConfigService(config);
        setup(ninjaAuth, config);
        router = TestBed.get(Router);
        injector = TestBed.get(Injector);
        guard = new ninjaAuthGuard(ninjaAuth, injector, configService);
        const routerState: RouterState = router.routerState;
        state = routerState.snapshot;
        route = state.root;
        route.data = {
          ninja: {
            acrValues: 'urn:ninja:loa:2fa:any'
          }
        };
      });

      it('returns false', async () => {
        const res = await guard.canActivate(route, state);
        expect(res).toBe(false);
      });

      it('by default, calls "signInWithRedirect({ acrValues })"', async () => {
        await guard.canActivate(route, state);
        expect(ninjaAuth.signInWithRedirect).toHaveBeenCalledWith({
          acrValues: 'urn:ninja:loa:2fa:any'
        });
      });

      it('if onAuthRequired is provided, calls with options { acrValues }', async () => {
        const mockFn = jest.fn();
        route.data = {
          ...route.data,
          onAuthRequired: mockFn
        };
        await guard.canActivate(route, state);
        const options = {
          acrValues: 'urn:ninja:loa:2fa:any'
        };
        expect(mockFn).toHaveBeenCalledWith(ninjaAuth, injector, options);
      });
    });
  });

  describe('canActivateChild', () => {
    let ninjaAuth;
    it('calls canActivate', () => {
      ninjaAuth = {
        isAuthenticated: jest.fn().mockResolvedValue(false),
        authStateManager: {
          subscribe: jest.fn()
        },
        setOriginalUri: jest.fn(),
        signInWithRedirect: jest.fn()
      } as unknown as ninjaAuth;
      const config = { ninjaAuth } as ninjaConfig;
      const configService = createConfigService(config);
      setup(ninjaAuth, config);
      const injector = TestBed.get(Injector);
      const guard = new ninjaAuthGuard(ninjaAuth, injector, configService);
      const router = TestBed.get(Router);
      const routerState: RouterState = router.routerState;
      const state = routerState.snapshot;
      const route = state.root;

      jest.spyOn(guard, 'canActivate').mockReturnValue(Promise.resolve(true));
      guard.canActivateChild(route, state);
      expect(guard.canActivate).toHaveBeenCalledWith(route, state);
    });
  });
});
