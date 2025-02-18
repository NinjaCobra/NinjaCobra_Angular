/*!
 * Copyright (c) 2021-Present, ninja, Inc. and/or its affiliates. All rights reserved.
 * The ninja software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'has-group',
  template: `
  <div id="in-group" *ninjaHasAnyGroup="['Test']">
    In "Test" group
  </div>
  <div id="not-in-group" *ninjaHasAnyGroup="['NotExistGroup']">
    Not in "Test" group
  </div>
  `
})
export class HasGroupComponent { }
