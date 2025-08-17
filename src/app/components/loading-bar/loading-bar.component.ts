import {
	ChangeDetectionStrategy,
	Component,
	effect,
	ElementRef,
	input,
	OnInit,
	viewChild,
} from '@angular/core';
import gsap from 'gsap';

@Component({
	selector: 'loading-bar',
	imports: [],
	template: `
		<div
			class="block size-full items-center justify-center overflow-hidden rounded-full bg-theme-300 outline outline-1 outline-border1"
		>
			<div #progressbar class="h-full w-0 bg-blue-500"></div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingBarComponent implements OnInit {
	progressBar = viewChild.required<ElementRef<HTMLElement>>('progressbar');
	progress = input<number>();

	ngOnInit() {
		effect(() => {
			const progressValue = this.progress();
			if (progressValue !== undefined) {
				gsap.to(this.progressBar().nativeElement, {
					width: progressValue + '%',
					duration: 0.05,
					ease: 'power1.inOut',
				});
			}
		});
	}
}
