import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class FakeLoadingBarService {
	state = new BehaviorSubject<'started' | 'completed'>('started');
	value = new BehaviorSubject<number>(0);
	private _strategy: 'pageload' | 'custom' = 'pageload';
	updateInterval: ReturnType<typeof setInterval> | number | undefined;

	/**
	 * Start the loading animation.
	 */
	start() {
		this.state.next('started');
		this.value.next(0);

		this.updateInterval = setInterval(() => {
			this.update();
		}, 100);
	}

	/**
	 * Updates loading bar progress by faking progress.
	 */
	private update() {
		let modifier;
		const val = this.value.getValue();

		if (val < 25) {
			modifier = 3;
		} else if (val < 50) {
			modifier = 2;
		} else if (val < 75) {
			modifier = 1;
		} else if (val < 99) {
			modifier = 0.7;
		} else {
			return;
		}

		const incr = Math.random() * modifier;
		this.value.next(Math.round(val + incr));
	}

	/**
	 * Complete the loading bar. When called, the loading bar will quickly move to its 100% completed state.
	 *
	 * @param strategy use "custom" if the current page has set the loading strategy to "custom". Refer to
	 * the `setStrategy` method for reference.
	 */
	complete(strategy: 'pageload' | 'custom' = 'pageload') {
		if (strategy !== this._strategy) return;
		this.state.next('completed');
		this.value.next(100);

		clearInterval(this.updateInterval);
		this.updateInterval = undefined;
		this._strategy = 'pageload'; // reset the strategy to pageload
	}

	/**
	 * Set page load strategy.
	 *
	 * pageload (default):
	 *
	 * This is the default strategy. Loading is complete when the Angular router says the page is loaded.
	 *
	 * custom:
	 *
	 * This strategy is used in pages where additional data needs to be loaded for the page to be displayed.
	 * Use `setStrategy("custom")` in the page constructor; when loading is complete, call `complete("custom")`.
	 *
	 * Notes:
	 *
	 * The strategy will reset to "pageload" after complete is called.
	 */
	setStrategy(strategy: 'pageload' | 'custom' = 'custom') {
		this._strategy = strategy;
	}
}
