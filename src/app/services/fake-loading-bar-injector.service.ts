import { APP_ID, Provider } from '@angular/core';
import { EventType, Router } from '@angular/router';
import { FakeLoadingBarService } from './fake-loading-bar.service';

export function registerLoadingBarRouterMiddleware(
	router: Router,
	fakeLoadingBarService: FakeLoadingBarService,
) {
	router.events.subscribe((e) => {
		switch (e.type) {
			case EventType.NavigationStart: {
				fakeLoadingBarService.start();
				break;
			}

			case EventType.NavigationEnd: {
				fakeLoadingBarService.complete();
				break;
			}
		}
	});
}

export function provideLoadingBar(): Provider {
	return {
		provide: APP_ID,
		useFactory: registerLoadingBarRouterMiddleware,
		deps: [Router, FakeLoadingBarService],
	};
}
