import { Component, OnDestroy, OnInit } from '@angular/core';

import * as ninjaSignIn from '@ninja/ninja-signin-widget';
// eslint-disable-next-line node/no-missing-import
import { environment } from '../environments/environment';

@Component({
  selector: 'app-secure',
  template: `
    <!-- Container to inject the Sign-In Widget -->
    <div id="ninja-signin-container"></div>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  widget = new ninjaSignIn({
    el: '#ninja-signin-container',
    baseUrl: `https://${environment.yourninjaDomain}`,
    authParams: {
      pkce: true
    },
    clientId: environment.clientId,
    redirectUri: 'http://localhost:8080/login/callback'
  });

  ngOnInit() {
    this.widget.showSignInAndRedirect().catch(err => {
      throw(err);
    });
  }

  ngOnDestroy() {
    this.widget.remove();
  }
}