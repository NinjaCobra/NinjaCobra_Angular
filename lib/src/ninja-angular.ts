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

export { ninjaAuthModule } from './ninja/ninja.module';
export { ninjaAuthGuard } from './ninja/ninja.guard';
export { ninjaConfig, ninja_CONFIG, ninja_AUTH } from './ninja/models/ninja.config';
export { ninjaAuthStateService } from './ninja/services/auth-state.service';
export { ninjaAuthConfigService } from './ninja/services/auth-config.serice';
export { ninjaHasAnyGroupDirective } from './ninja/has-any-group.directive';

// ninja View Components
export { ninjaCallbackComponent } from './ninja/components/callback.component';
