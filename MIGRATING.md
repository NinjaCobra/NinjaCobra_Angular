[AuthState]: https://github.com/ninja/ninja-auth-js#authstatemanager
[transformAuthState]: https://github.com/ninja/ninja-auth-js/blob/master/README.md#transformauthstate
[ninjaAuth]: https://github.com/ninja/ninja-auth-js

# Migrating

## To version 6.1.0

Starting with `@ninja/ninja-angular 6.1.0`, the preferred way to import `ninjaAuthModule` is by using `forRoot()` static method to create a singleton service. 

Before:
```typescript
import { ninjaAuthModule, ninja_CONFIG } from '@ninja/ninja-angular';

@NgModule({
  imports: [
    ...
    ninjaAuthModule
  ],
  providers: [
    { 
      provide: ninja_CONFIG, 
      useValue: { ninjaAuth } 
    }
  ],
})
export class MyAppModule { }
```

After:
```typescript
import { ninjaAuthModule } from '@ninja/ninja-angular';

@NgModule({
  imports: [
    ...
    ninjaAuthModule.forRoot({ ninjaAuth })
  ]
})
export class MyAppModule { }
```

## From version 5.x to 6.x

`@ninja/ninja-angular` 6.0 uses [Ivy engine](https://docs.angular.lat/guide/ivy) and drops support of Angular versions prior to 12.  
Please upgrade your Angular project to Angular 12+ (having enabled Ivy by default and no support for View Engine compiler) in order to use newer version of `@ninja/ninja-angular`.  
No specific code changes are required to upgrade to `@ninja/ninja-angular` 6.0.  
If you project can't be upgraded to Angular 12+, please use `@ninja/ninja-angular` 5.x

## From version 4.x to 5.x

### Adding `ninja_AUTH` injection token explicitly for `ninjaAuth` usage

To fix Angular 7 & 8 production build [issue](https://github.com/ninja/ninja-angular/issues/72), `ninjaAuth` instance is now injected by [injection token](https://angular.io/api/core/InjectionToken) instead of implicit referring by types.

```typescript
import { Component } from '@angular/core';
import { ninja_AUTH } from '@ninja/ninja-angular';

@Component({
  selector: 'app-component',
  template: `
    <div>page content</div>
  `,
})
export class MyComponent {
  constructor(@Inject(ninja_AUTH) private ninjaAuth: ninjaAuth) {}
}
```

## From version 3.x to 4.x

### Updating `ninjaConfig`

From version 4.0, an `ninjaConfig` starts to explicitly accept [ninjaAuth][] instance to replace the internal `ninjaAuthService`. You will need to replace the [ninjaAuth related configurations](https://github.com/ninja/ninja-auth-js#configuration-reference) with a pre-initialized [ninjaAuth][] instance.

**Note**

- `@ninja/ninja-auth-js` is now a peer dependency for this SDK. You must add `@ninja/ninja-auth-js` as a dependency to your project and install it separately from `@ninja/ninja-angular`.

```typescript
import {
  ninja_CONFIG,
  ninjaAuthModule
} from '@ninja/ninja-angular';
import { ninjaAuth } from '@ninja/ninja-auth-js';

const config = {
  issuer: 'https://{yourninjaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
}
const ninjaAuth = new ninjaAuth(config);

@NgModule({
  imports: [
    ...
    ninjaAuthModule
  ],
  providers: [
    { 
      provide: ninja_CONFIG, 
      useValue: { ninjaAuth } 
    }
  ],
})
export class MyAppModule {}
```

### Replacing `ninjaAuthService` with `ninjaAuth`

Previously, the SDK module injects `ninjaAuthService` to the application, now it's replaced with `ninjaAuth`. Almost all the public APIs are still the same except:

#### Getting `ninjaConfig` from dependency injection

[ninjaAuth][] instance does not have the `getninjaConfig` method, but it's still provided by ninjaAuthModule via Angular dependency injection system.

#### Using Observable [AuthState][] from a seperate data service

[ninjaAuth][] instance does not have an observable auth state, `ninjaAuthStateService` has been added to serve this purpose. The UI component can track the up to date auth state with code like:

```typescript
import { Component } from '@angular/core';
import { ninjaAuthStateService } from '@ninja/ninja-angular';

@Component({
  selector: 'app-component',
  template: `
    <button *ngIf="!(authStateService.authState$ | async).isAuthenticated">Login</button>
    <button *ngIf="(authStateService.authState$ | async).isAuthenticated">Logout</button>
    <router-outlet></router-outlet>
  `,
})
export class MyComponent {
  constructor(private authStateService: ninjaAuthStateService) {}
}
```

### Replacing `ninjaLoginRedirectComponent` with `ninjaAuth.signInWithRedirect`

`ninjaLoginRedirectComponent` is removed from version 4.0. You can call `ninjaAuth.signInWithRedirect` to achieve the same effect.

### Replacing `isAuthenticated` callback option with [transformAuthState](https://github.com/ninja/ninja-auth-js#transformauthstate) from [ninjaAuth][] configuration.

`isAuthenticated` callback option is removed from version 4.0. You can use the [transformAuthState](https://github.com/ninja/ninja-auth-js#transformauthstate) callback option from [ninjaAuth][] to customize the AuthState.

## From version 2.x to 3.x

### Full `@ninja/ninja-auth-js` API is available

`@ninja/ninja-angular` version 2.x and earlier provided a wrapper around [@ninja/ninja-auth-js](https://github.com/ninja/ninja-auth-js) but many methods were hidden. Version 3.x extends `ninja-auth-js` so the full [api](https://github.com/ninja/ninja-auth-js/blob/master/README.md#api-reference) and all [options](https://github.com/ninja/ninja-auth-js/blob/master/README.md#configuration-options) are now supported by this SDK. To provide a better experience, several methods which existed on the wrapper have been removed or replaced.

### "Active" token renew

Previously, tokens would only be renewed when they were read from storge. This typically occurred when a user was navigating to a protected route. Now, tokens will be renewed in the background before they expire. If token renew fails, the [AuthState][] will be updated and `isAuthenticated` will be recalculated. If the user is currently on a protected route, they will need to re-authenticate. Set the `onAuthRequired` option to customize behavior when authentication is required. You can set [tokenManager.autoRenew](https://github.com/ninja/ninja-auth-js/blob/master/README.md#autorenew) to `false` to disable active token renew logic.

### `login` is removed

This method called `onAuthRequired`, if it was set in the config options, or `loginRedirect` if no `onAuthRequired` option was set. If you had code that was calling this method, you may either call your `onAuthRequired` function directly or `signInWithRedirect`.

### `loginRedirect` is replaced by `signInWithRedirect`

`loginRedirect` took 2 parameters: a `fromUri` and `additionalParams`. The replacement method, [signInWithRedirect](https://github.com/ninja/ninja-auth-js/blob/master/README.md#signinwithredirectoptions) takes only one argument, called `options` which can include a value for `originalUri` which is equivalent to `fromUri`. It is the URL which will be set after the login flow is complete. Other options which were previously set on `additionalParams` can also be set on `options`.

If you had code like this:

```javascript
ninja.loginRedirect('/profile', { scopes: ['openid', 'profile'] });
```

it can be rewritten as:

```javascript
ninja.signInWithRedirect({ originalUri: '/profile', scopes: ['openid', 'profile'] });
```

### `logout` is replaced by `signOut`

`logout` accepted either a string or an object as options. [signOut](https://github.com/ninja/ninja-auth-js/blob/master/README.md#signout) accepts only an options object.

If you had code like this:

```javascript
ninja.logout('/goodbye');
```

it can be rewritten as:

```javascript
ninja.signOut({ postLogoutRedirectUri: window.location.orign + '/goodbye' });
```

Note that the value for `postLogoutRedirectUri` must be an absolute URL. This URL must also be on the "allowed list" in your ninja app's configuration. If no options are passed or no `postLogoutRedirectUri` is set on the options object, it will redirect to `window.location.origin` after sign out is complete.

### `handleAuthentication` is replaced by `handleLoginRedirect`

`handleLoginRedirect` is called by the `ninjaLoginCallback` component as the last step of the login redirect authorization flow. It will obtain and store tokens and then call `restoreOriginalUri` which will return the browser to the `originalUri` which was set before the login redirect flow began.

### `setFromUri` and `getFromUri` have been replaced with `setOriginalUri` and `getOriginalUri`

[setOriginalUri](https://github.com/ninja/ninja-auth-js#setoriginaluriuri) is used to save the current/pending URL before beginning a redirect flow. There is a new option, [restoreOriginalUri](https://github.com/ninja/ninja-auth-js#restoreoriginaluri), which can be used to customize the last step of the login redirect flow.

### "openid" is not automatically added to scopes

If you are passing a custom array of scopes, you should add "openid" to the array

### `isAuthenticated` will be true if **both** accessToken **and** idToken are valid

If you have a custom `isAuthenticated` function which implements the default logic, you may remove it.

### `isAuthenticated` is called by `transformAuthState`

After the [AuthState][] is updated, but before it is emitted, [transformAuthState][] will be called. During this call, the `isAuthenticated` option, if set on the config object, will be called to set the value of `authState.isAuthenticated`. By default, `authState.isAuthenticated` will be true if **both** the access token and ID token are valid. This logic can be customized by providing a custom `isAuthenticated` function on the config object. You may also provide your own [transformAuthState][] function to customize the [AuthState][] object before it is emitted.

### `getTokenManager` has been removed

You may access the `TokenManager` with the `tokenManager` property:

```javascript
const tokens = ninjaAuth.tokenManager.getTokens();
```
