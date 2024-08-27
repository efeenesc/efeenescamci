import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormControl } from '@angular/forms';

import { routes } from './app.routes';
import { IMAGE_CONFIG } from '@angular/common';
import { provideClientHydration } from '@angular/platform-browser';

const imgConfig = { provide: IMAGE_CONFIG, useValue: { disableImageSizeWarning: true, disableImageLazyLoadWarning: true } };

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), FormControl, imgConfig, provideClientHydration(),]
};
