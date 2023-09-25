import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
// eslint-disable-next-line node/no-missing-import
import { environment } from '../environments/environment';

import { ninjaAuth } from '@ninja/ninja-auth-js';
import {
  ninjaAuthModule,
  ninjaCallbackComponent,
  ninjaAuthGuard
} from '@ninja/ninja-angular';

import { AppComponent } from './app.component';
import { ProtectedComponent } from './protected.component';
import { LoginComponent } from './login.component';

const config = {
  issuer: `https://${environment.yourninjaDomain}/oauth2/default`,
  redirectUri: 'http://localhost:8080/login/callback',
  clientId: environment.clientId,
  pkce: true
};
const ninjaAuth = new ninjaAuth(config);

export function onAuthRequired(ninjaAuth, injector) {
  const router = injector.get(Router);

  // Redirect the user to your custom login page
  router.navigate(['/login']);
}

const appRoutes: Routes = [
  {
    path: 'login/callback',
    component: ninjaCallbackComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ ninjaAuthGuard ],
    data: {
      onAuthRequired
    }
  }
];
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProtectedComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    ninjaAuthModule.forRoot({ninjaAuth})
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
