import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface WindowSize {
	x: number;
	y: number;
}

@Injectable({
	providedIn: 'root',
})
export class WindowService implements OnDestroy {
	scrollObservable!: Subject<number>;
	sizeObservable!: Subject<WindowSize>;
	firstOpenedPage = true;

	throttle(fn: () => void, duration: number) {
		// eslint-disable-next-line no-var
		var time = performance.now();
		return function () {
			if (time + duration - performance.now() < 0) {
				fn();
				time = performance.now();
			}
		};
	}

	/**
	 * Tracks window events and forwards them to subscribers.
	 * `mouseUpObservable`, `mousePositionObservable`, `scrollObservable`, and `sizeObservable` are provided by this service.
	 */
	constructor(private router: Router) {
		this.scrollObservable = new Subject();
		this.sizeObservable = new Subject();
		this.router.events.subscribe(
			() =>
				(this.firstOpenedPage = this.router.lastSuccessfulNavigation === null),
		); // If lastSuccessfulNavigation is null, then it's the first opened page

		window.addEventListener('resize', this.onWindowResize);
		window.addEventListener('scroll', this.throttle(this.onWindowScroll, 3));
	}

	ngOnDestroy(): void {
		window.removeEventListener('resize', this.onWindowResize);
		window.removeEventListener('scroll', this.onWindowScroll);
	}

	/**
	 * Scroll event handler that emits the current scroll position (Y-coordinate)
	 * to the `scrollObservable` subject.
	 */
	private onWindowScroll = () => {
		this.scrollObservable.next(window.scrollY); // Used an anon function here, else 'this' doesn't work
	};

	/**
	 * Resize event handler that calculates the current window size and emits it
	 * to the `sizeObservable` subject if the body's overflow style is not set to 'hidden'.
	 */
	private onWindowResize = () => {
		const windowSize = this.getWindowSize();

		if (document.body.style.overflow !== 'hidden') {
			this.sizeObservable.next(windowSize);
		}
	};

	/**
	 * Returns the current size of the window.
	 *
	 * @returns An object containing the width (`x`) and height (`y`) of the window.
	 */
	getWindowSize(): WindowSize {
		return {
			x: window.innerWidth,
			y: window.innerHeight,
		};
	}

	/**
	 * Determines if the current device is a mobile device.
	 *
	 * @returns `true` if the device is mobile; otherwise, `false`.
	 */
	isTouchDevice() {
		const ua = navigator.userAgent;

		if (
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
				ua,
			)
		)
			return true;
		else return false;
	}

	checkIfFirstOpenedPage() {
		return this.firstOpenedPage;
	}
}
