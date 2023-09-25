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
import { Component, Inject, OnInit } from '@angular/core';
import { ninja_AUTH } from '@ninja/ninja-angular';
import { ninjaAuth } from '@ninja/ninja-auth-js';

@Component({
  selector: 'app-secure',
  template: `
  <div>
  {{ message }}<br/>
  Claims: <pre id="claims-container">{{ claims }}</pre>
  User: <pre id="userinfo-container">{{ user }}</pre>
  </div>`
})
export class ProtectedComponent implements OnInit {
  message;
  user = '';
  claims = '';

  constructor(@Inject(ninja_AUTH) public ninjaAuth: ninjaAuth) {
    this.message = 'Protected!';
  }

  async ngOnInit() {
    const user = await this.ninjaAuth.getUser();
    this.user = JSON.stringify(user, null, 4);
    const claims = await this.ninjaAuth.authStateManager.getAuthState()?.idToken?.claims;
    this.claims = JSON.stringify(claims, null, 4);
  }
}
