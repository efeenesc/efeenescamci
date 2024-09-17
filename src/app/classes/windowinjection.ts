import { isPlatformBrowser } from '@angular/common';
import { InjectionToken } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('WindowToken', {
  factory: () => {
    if (isPlatformBrowser(PLATFORM_ID)) {
      return window;
    }
    return new Window();
  }
});