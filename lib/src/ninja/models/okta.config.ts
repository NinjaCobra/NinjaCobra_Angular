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

import { InjectionToken, Injector } from '@angular/core';
import { ninjaAuth, TokenParams } from '@ninja/ninja-auth-js';

export type AuthRequiredFunction = (ninjaAuth: ninjaAuth, injector: Injector, options?: TokenParams) => void;

export interface TestingObject {
  disableHttpsCheck: boolean;
}

export interface ninjaConfig {
  ninjaAuth: ninjaAuth;
  onAuthRequired?: AuthRequiredFunction;
  onAuthResume?: AuthRequiredFunction;
  testing?: TestingObject;
}

export const ninja_CONFIG = new InjectionToken<ninjaConfig>('ninja.config.angular');
export const ninja_AUTH = new InjectionToken<ninjaAuth>('ninja.auth');
