import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { AuthState, ninjaAuth, UserClaims } from '@ninja/ninja-auth-js';
import { 
  ninjaAuthModule, 
  ninjaAuthStateService
} from '../../lib/src/ninja-angular';

function setup(ninjaAuth: ninjaAuth) {
  TestBed.configureTestingModule({
    imports: [
      ninjaAuthModule.forRoot({ninjaAuth})
    ]
  });
}

describe('ninjaAuthStateService', () => {
  let ninjaAuth: ninjaAuth;
  
  beforeEach(() => {
    ninjaAuth = new ninjaAuth({
      issuer: 'http://xyz',
      clientId: 'fake clientId',
      redirectUri: 'fake redirectUri'
    });
    ninjaAuth.start = jest.fn();
  });

  it('should be created and subscribe to authState change', () => {
    jest.spyOn(ninjaAuth.authStateManager, 'subscribe');
    setup(ninjaAuth);
    const service: ninjaAuthStateService = TestBed.get(ninjaAuthStateService);
    expect(service).toBeTruthy();
    expect(service.authState$).toBeInstanceOf(Observable);
    expect(ninjaAuth.authStateManager.subscribe).toHaveBeenCalled();
  });

  it('initials with the current authState of ninjaAuth', () => {
    const mockState = { mock: 'mock' } as unknown as AuthState;
    jest.spyOn(ninjaAuth.authStateManager, 'getAuthState').mockReturnValue(mockState);
    setup(ninjaAuth);
    const service: ninjaAuthStateService = TestBed.get(ninjaAuthStateService);
    return new Promise(resolve => {
      service.authState$.subscribe(authState => {
        expect(authState).toBe(mockState);
        resolve(undefined);
      });
    });
  });

  it('initials with default authState when ninjaAuth state is not ready', () => {
    jest.spyOn(ninjaAuth.authStateManager, 'getAuthState').mockReturnValue(null as unknown as AuthState);
    setup(ninjaAuth);
    const service: ninjaAuthStateService = TestBed.get(ninjaAuthStateService);
    return new Promise(resolve => {
      service.authState$.subscribe(authState => {
        expect(authState).toEqual({ isAuthenticated: false });
        resolve(undefined);
      });
    });
  });

  it('updates with ninjaAuth state changes', () => {
    const states = [{ mock1: 'mock1' }, { mock2: 'mock2' }];
    setup(ninjaAuth);
    const service: ninjaAuthStateService = TestBed.get(ninjaAuthStateService);
    const fn = jest.fn();
    return new Promise(resolve => {
      let calls = 0;
      service.authState$.subscribe(authState => {
        if (++calls === 3) {
          resolve(undefined);
        }
        fn(authState);
      });
      states.forEach(state => ninjaAuth.emitter.emit('authStateChange', state));
    }).then(() => {
      expect(fn).toHaveBeenNthCalledWith(1, { isAuthenticated: false });
      expect(fn).toHaveBeenNthCalledWith(2, states[0]);
      expect(fn).toHaveBeenNthCalledWith(3, states[1]);
    });
  });

  describe('hasAnyGroups', () => {
    describe('isAuthenticated === false', () => {
      it('observes false result', () => {
        jest.spyOn(ninjaAuth.authStateManager, 'getAuthState').mockReturnValue({ isAuthenticated: false } as AuthState);
        setup(ninjaAuth);
        const service: ninjaAuthStateService = TestBed.get(ninjaAuthStateService);
        return new Promise(resolve => {
          service.hasAnyGroups(['mock']).subscribe(result => {
            expect(result).toEqual(false);
            resolve(undefined);
          });
        });
      });
    });

    describe('idToken not exist', () => {
      it('observes false result', () => {
        jest.spyOn(ninjaAuth.authStateManager, 'getAuthState').mockReturnValue({ idToken: undefined } as AuthState);
        setup(ninjaAuth);
        const service: ninjaAuthStateService = TestBed.get(ninjaAuthStateService);
        return new Promise(resolve => {
          service.hasAnyGroups(['mock']).subscribe(result => {
            expect(result).toEqual(false);
            resolve(undefined);
          });
        });
      });
    });

    describe('isAuthenticated === true and idToken exist', () => {
      describe('has groups claim', () => {
        let service: ninjaAuthStateService;
        beforeEach(() => {
          jest.spyOn(ninjaAuth.authStateManager, 'getAuthState')
            .mockReturnValue({ 
              isAuthenticated: true,
              idToken: { 
                claims: {
                  groups: ['test']
                } 
              }
            } as unknown as AuthState);
          setup(ninjaAuth);
          service = TestBed.get(ninjaAuthStateService);
        });

        describe('can verify with string input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('test').subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('non-exist-group').subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with array input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['test']).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['non-exist-group']).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with object input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['test'] }).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['non-exist-group'] }).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
      });

      describe('has custom claims', () => {
        let service: ninjaAuthStateService;
        beforeEach(() => {
          jest.spyOn(ninjaAuth.authStateManager, 'getAuthState')
            .mockReturnValue({ 
              isAuthenticated: true,
              idToken: { 
                claims: {
                  'custom-groups': ['test']
                } 
              }
            } as unknown as AuthState);
          jest.spyOn(ninjaAuth, 'getUser').mockResolvedValue({
            'custom-groups': ['test']
          } as unknown as UserClaims);
          setup(ninjaAuth);
          service = TestBed.get(ninjaAuthStateService);
        });
        describe('can verify with object input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ 'custom-groups': ['test'] }).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ 'custom-groups': ['non-exist-group'] }).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        it('fails with array input', () => {
          return new Promise(resolve => {
            service.hasAnyGroups(['test']).subscribe(result => {
              expect(result).toEqual(false);
              resolve(undefined);
            });
          });
        });
        it('fails with string input', () => {
          return new Promise(resolve => {
            service.hasAnyGroups('test').subscribe(result => {
              expect(result).toEqual(false);
              resolve(undefined);
            });
          });
        });
      });

      describe('has thin idToken (groups claim not in idToken)', () => {
        let service: ninjaAuthStateService;
        beforeEach(() => {
          jest.spyOn(ninjaAuth.authStateManager, 'getAuthState')
            .mockReturnValue({ 
              isAuthenticated: true,
              idToken: {
                claims: {}
              }
            } as unknown as AuthState);
          jest.spyOn(ninjaAuth, 'getUser').mockResolvedValue({
            groups: ['test']
          } as unknown as UserClaims);
          setup(ninjaAuth);
          service = TestBed.get(ninjaAuthStateService);
        });

        it('calls ninjaAuth.getUser()', () => {
          return new Promise(resolve => {
            service.hasAnyGroups('test').subscribe(() => {
              expect(ninjaAuth.getUser).toHaveBeenCalled();
              resolve(undefined);
            });
          });
        });

        describe('can verify with string input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('test').subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups('non-exist-group').subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with array input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['test']).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups(['non-exist-group']).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
        describe('can verify with object input', () => {
          it('observes true when groups match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['test'] }).subscribe(result => {
                expect(result).toEqual(true);
                resolve(undefined);
              });
            });
          });
          it('observes false when groups not match', () => {
            return new Promise(resolve => {
              service.hasAnyGroups({ groups: ['non-exist-group'] }).subscribe(result => {
                expect(result).toEqual(false);
                resolve(undefined);
              });
            });
          });
        });
      });

    });
  });
});
