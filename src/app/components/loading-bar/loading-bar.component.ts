import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import gsap from 'gsap';

@Component({
	selector: 'loading-bar',
	imports: [],
	template: `
		<div
			class="block size-full items-center justify-center overflow-hidden rounded-full bg-theme-300 outline outline-1 outline-border1"
		>
			<div id="progressbar" class="h-full w-0 bg-blue-500"></div>
		</div>
	`,
})
export class LoadingBarComponent implements OnInit {
	@Input() set progress(v: number | undefined) {
		if (v === undefined) return;
		this.pProgress = v;
		this.progress$.next(null);
	}
	private pProgress!: number;
	protected readonly progress$ = new ReplaySubject(1);

	ngOnInit() {
		this.progress$.subscribe(() => {
			gsap.to('#progressbar', {
				width: this.pProgress + '%',
				duration: 0.05,
				ease: 'power1.inOut',
			});
		});
	}

	testComponent() {
		setTimeout(() => {
			this.progress = 0;
		}, 100);
		setTimeout(() => {
			this.progress = 50;
		}, 1000);
		setTimeout(() => {
			this.progress = 100;
		}, 2000);
	}
}
