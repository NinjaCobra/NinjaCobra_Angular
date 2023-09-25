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

import { Component, OnInit, Optional, Injector, Inject } from '@angular/core';
import { ninjaAuth } from '@ninja/ninja-auth-js';
import { ninja_AUTH } from '../models/ninja.config';
import { ninjaAuthConfigService } from '../services/auth-config.serice';

@Component({
  template: `<div>{{error}}</div>`
})
export class ninjaCallbackComponent implements OnInit {
  error?: string;

  constructor(
    private configService: ninjaAuthConfigService,
    @Inject(ninja_AUTH) private ninjaAuth: ninjaAuth,
    @Optional() private injector?: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('ninja config is not provided');
    }
    try {
      // Parse code or tokens from the URL, store tokens in the TokenManager, and redirect back to the originalUri
      await this.ninjaAuth.handleLoginRedirect();
    } catch (e) {
      // Callback from social IDP. Show custom login page to continue.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Supports auth-js v5 & v6-7
      const isInteractionRequiredError = this.ninjaAuth.isInteractionRequiredError || this.ninjaAuth.idx.isInteractionRequiredError;
      if (isInteractionRequiredError(e) && this.injector) {
        const { onAuthResume, onAuthRequired } = config;
        const callbackFn = onAuthResume || onAuthRequired;
        if (callbackFn) {
          callbackFn(this.ninjaAuth, this.injector);
          return;
        }
      }
      this.error = (e as Error).toString();
    }
  }
}
