/*!
 * Copyright (c) 2017-Present, ninja, Inc. and/or its affiliates. All rights reserved.
 * The ninja software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*eslint import/no-unresolved: [2, { ignore: ['@ninja/ninja-angular$'] }]*/
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, APP_INITIALIZER, Provider } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

/**
 * ninja Library
 */
import { ninjaAuth } from '@ninja/ninja-auth-js';
import {
  ninjaAuthGuard,
  ninjaAuthModule,
  ninjaCallbackComponent,
  ninjaAuthConfigService,
  ninjaConfig,
} from '@ninja/ninja-angular';

/**
 * App Components
 */
import { ProtectedComponent } from './protected.component';
import { AppComponent } from './app.component';
import { SessionTokenLoginComponent } from './sessionToken-login.component';
import { PublicComponent } from './public.component';
import { HasGroupComponent } from './has-group.component';

// eslint-disable-next-line node/no-unpublished-import, node/no-missing-import
import { environment } from '../environments/environment';

export function onNeedsAuthenticationGuard(ninjaAuth: ninjaAuth, injector: Injector) {
  const router = injector.get(Router);
  router.navigate(['/sessionToken-login']);
}

const appRoutes: Routes = [
  {
    path: 'sessionToken-login',
    component: SessionTokenLoginComponent
  },
  {
    path: 'login/callback',
    component: ninjaCallbackComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ ninjaAuthGuard ],
    children: [
      {
        path: 'foo',
        component: ProtectedComponent
        // protected by canActivate on parent route
      }
    ]
  },
  {
    path: 'protected-with-data',
    component: ProtectedComponent,
    canActivate: [ ninjaAuthGuard ],
    data: {
      onAuthRequired: onNeedsAuthenticationGuard
    }
  },
  {
    path: 'public',
    component: PublicComponent,
    canActivateChild: [ ninjaAuthGuard ],
    children: [
      {
        path: 'private',
        component: ProtectedComponent,
      },
      {
        path: '2fa',
        component: ProtectedComponent,
        data: {
          ninja: {
            acrValues: 'urn:ninja:loa:2fa:any'
          }
        },
      },
      {
        path: '1fa',
        component: ProtectedComponent,
        data: {
          ninja: {
            acrValues: 'urn:ninja:loa:1fa:any'
          }
        },
      }
    ]
  },
  {
    path: 'lazy',
    loadChildren: () => import('./lazy-load/lazy-load.module').then(mod => mod.LazyLoadModule),
    canLoad: [ ninjaAuthGuard ]
  },
  {
    path: 'group',
    component: HasGroupComponent,
  },
];

let providers: Provider[] = [];
let ninjaConfig: ninjaConfig | undefined;
if (environment.asyncninjaConfig) {
  const configInitializer = (configService: ninjaAuthConfigService) => {
    return async () => {
      // Use asynchronous import of configuration
      // You can also load configuration with HTTP request here with HttpClient
      // eslint-disable-next-line node/no-unpublished-import, node/no-missing-import, import/no-unresolved
      const { environment: { oidc } } = await import('../environments/environment');
      const ninjaAuth = new ninjaAuth(oidc);
      ninjaConfig = {
        ninjaAuth
      };
      configService.setConfig(ninjaConfig);
    };
  };
  providers = [{
    provide: APP_INITIALIZER,
    useFactory: configInitializer,
    deps: [ninjaAuthConfigService],
    multi: true
  }];
} else {
  const ninjaAuth = new ninjaAuth(environment.oidc);
  ninjaConfig = {
    ninjaAuth
  };
}


@NgModule({
  providers,
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    ninjaAuthModule.forRoot(ninjaConfig),
  ],
  declarations: [
    AppComponent,
    ProtectedComponent,
    SessionTokenLoginComponent,
    PublicComponent,
    HasGroupComponent,
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
