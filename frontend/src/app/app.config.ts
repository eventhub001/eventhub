import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { baseUrlInterceptor } from './interceptors/base-url.interceptor';
import { accessTokenInterceptor } from './interceptors/access-token.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { handleErrorsInterceptor } from './interceptors/handle-errors.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
    provideHttpClient(
    withInterceptors([
      baseUrlInterceptor,
      accessTokenInterceptor,
      handleErrorsInterceptor
    ])), provideAnimationsAsync(), provideAnimationsAsync()
    //handleErrorsInterceptor
  ]
};
