import { Location } from '@angular/common';
import { VERSION } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSdkError, ninjaAuth, toRelativeUrl } from '@ninja/ninja-auth-js';
import { ninjaAuthConfigService } from './auth-config.serice';
import { compare } from 'compare-versions';
import packageInfo from '../packageInfo';

export class ninjaAuthFactoryService {
  private static setupninjaAuth(
    ninjaAuth: ninjaAuth,
    router?: Router, 
    location?: Location
  ): void {
    const isAuthJsSupported = ninjaAuth._ninjaUserAgent && compare(ninjaAuth._ninjaUserAgent.getVersion(), packageInfo.authJSMinSupportedVersion, '>=');
    if (!isAuthJsSupported) {
      throw new AuthSdkError(`Passed in ninjaAuth is not compatible with the SDK, minimum supported ninja-auth-js version is ${packageInfo.authJSMinSupportedVersion}.`);
    }

    // Add ninja UA
    ninjaAuth._ninjaUserAgent.addEnvironment(`${packageInfo.name}/${packageInfo.version}`);
    ninjaAuth._ninjaUserAgent.addEnvironment(`Angular/${VERSION.full}`);

    // Provide a default implementation of `restoreOriginalUri`
    if (!ninjaAuth.options.restoreOriginalUri && router && location) {
      ninjaAuth.options.restoreOriginalUri = async (_, originalUri: string | undefined) => {
        const baseUrl = window.location.origin + location.prepareExternalUrl('');
        const routePath = toRelativeUrl(originalUri || '/', baseUrl);
        router.navigateByUrl(routePath);
      };
    }

    // Start services
    ninjaAuth.start();
  }

  public static createninjaAuth(
    configService: ninjaAuthConfigService, 
    router?: Router, 
    location?: Location
  ): ninjaAuth {
    const config = configService.getConfig();
    if (!config) {
      throw new Error('ninja config is not provided');
    }

    const { ninjaAuth } = config;
    if (!ninjaAuth) {
      throw new Error('ninja config should contain ninjaAuth');
    }

    ninjaAuthFactoryService.setupninjaAuth(ninjaAuth, router, location);

    return ninjaAuth;
  }
}