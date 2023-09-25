import { Inject, Injectable, Optional } from '@angular/core';
import { ninjaConfig, ninja_CONFIG } from '../models/ninja.config';

@Injectable({
  providedIn: 'root'
})
export class ninjaAuthConfigService {
  private config: ninjaConfig | undefined;

  constructor(
    @Optional() @Inject(ninja_CONFIG) config?: ninjaConfig
  ) {
    if (config) {
      this.config = config;
    }
  }

  public getConfig(): ninjaConfig | undefined {
    return this.config;
  }

  public setConfig(config: ninjaConfig): void {
    this.config = config;
  }
}
