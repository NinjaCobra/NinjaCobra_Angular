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
import { Component, Inject } from '@angular/core';
import { ninja_AUTH } from '@ninja/ninja-angular';
import { ninjaAuth } from '@ninja/ninja-auth-js';

@Component({
  selector: 'app-public',
  template: `
  <div id="public-message">
  {{ message }}
  </div>
  <router-outlet></router-outlet>
  `
})
export class PublicComponent {
  message;

  constructor(@Inject(ninja_AUTH) public ninjaAuth: ninjaAuth) {
    this.message = 'Public!';
  }

}
