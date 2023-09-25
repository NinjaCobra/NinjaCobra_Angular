/*
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

import { NgModule, ModuleWithProviders, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ninjaCallbackComponent } from './components/callback.component';
import { ninjaAuthGuard } from './ninja.guard';
import { ninjaAuthConfigService } from './services/auth-config.serice';
import { ninjaAuthStateService } from './services/auth-state.service';
import { ninjaAuthFactoryService } from './services/auth-factory.service';
import { ninjaHasAnyGroupDirective } from './has-any-group.directive';
import { ninjaConfig, ninja_CONFIG, ninja_AUTH } from './models/ninja.config';


@NgModule({
  declarations: [
    ninjaCallbackComponent,
    ninjaHasAnyGroupDirective,
  ],
  exports: [
    ninjaCallbackComponent,
    ninjaHasAnyGroupDirective,
  ],
  providers: [
    ninjaAuthConfigService,
    ninjaAuthStateService,
    ninjaAuthGuard,
    {
      provide: ninja_AUTH,
      useFactory: ninjaAuthFactoryService.createninjaAuth,
      deps: [
        ninjaAuthConfigService,
        [new Optional(), Router],
        [new Optional(), Location]
      ]
    },
  ]
})
export class ninjaAuthModule {
  static forRoot(config?: ninjaConfig): ModuleWithProviders<ninjaAuthModule> {
    return {
      ngModule: ninjaAuthModule,
      providers: [
        { provide: ninja_CONFIG, useValue: config },
      ]
    };
  }

  // Should not have constructor to support lazy load of config with APP_INITIALIZER

}
