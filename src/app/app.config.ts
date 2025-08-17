import {
	ApplicationConfig,
	provideZonelessChangeDetection,
} from '@angular/core';
import {
	provideRouter,
	withInMemoryScrolling,
	withRouterConfig,
} from '@angular/router';
import { FormControl } from '@angular/forms';
import { routes } from './app.routes';
import { IMAGE_CONFIG } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
// import { provideLoadingBarRouter } from '@ngx-loading-bar/router';
import { provideLoadingBar } from './services/fake-loading-bar-injector.service';

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
			withRouterConfig({ onSameUrlNavigation: 'ignore' }),
			withInMemoryScrolling({
				scrollPositionRestoration: 'enabled',
			}),
		),
		FormControl,
		imgConfig,
		provideHttpClient(withFetch()),
		provideZonelessChangeDetection(),
		provideLoadingBar(),
	],
};
