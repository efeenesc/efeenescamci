import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum LoadingState {
	STARTED,
	COMPLETED,
}

@Injectable({
	providedIn: 'root',
})
export class FakeLoadingBarService {
	state = new BehaviorSubject<LoadingState>(LoadingState.STARTED);
	value = new BehaviorSubject<number>(0);
	updateInterval: ReturnType<typeof setInterval> | null = null;

	start() {
		this.state.next(LoadingState.STARTED);
		this.value.next(0);

		this.updateInterval = setInterval(() => {
			this.update();
		}, 100);
	}

	update() {
		let modifier;
		const val = this.value.getValue();

		if (val < 25) {
			modifier = 3;
		} else if (val < 50) {
			modifier = 1;
		} else if (val < 75) {
			modifier = 0.5;
		} else if (val < 99) {
			modifier = 0.2;
		} else {
			return;
		}

		const incr = Math.random() * modifier;
		this.value.next(Math.round(val + incr));
	}

	complete() {
		this.state.next(LoadingState.COMPLETED);
		this.value.next(100);

		clearInterval(this.updateInterval as unknown as number);
		this.updateInterval = null;
	}
}
