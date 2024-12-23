import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { FormControl } from '@angular/forms';
import { routes } from './app.routes';
import { IMAGE_CONFIG } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';

const imgConfig = {
  provide: IMAGE_CONFIG,
  useValue: {
    disableImageSizeWarning: true,
    disableImageLazyLoadWarning: true,
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withRouterConfig({ onSameUrlNavigation: 'ignore' }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      })
    ),
    FormControl,
    imgConfig,
    provideHttpClient(withFetch()),
  ],
};
