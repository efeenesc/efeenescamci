import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	signal,
	ViewEncapsulation,
	WritableSignal,
} from '@angular/core';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { Router } from '@angular/router';

export interface NormalCardInfo {
	id: number | string;
	icon_url?: string;
	name: string;
	desc: string;
	source_url: string;
	read_more?: string;
	loaded?: boolean | WritableSignal<boolean>;
}

@Component({
	selector: 'normal-card',
	imports: [SkeletonLoaderComponent],
	templateUrl: './normal-card.component.html',
	styles: `
		.card {
			transition-property: transform;
			transition-duration: var(--duration, 400ms);
			transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
			transition-delay: var(--delay, 0ms);
		}
	`,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NormalCardComponent {
	info = input.required<NormalCardInfo>();
	isSameHost = computed(() => this.info().source_url.startsWith('/'));

	constructor(private router: Router) {}

	setLoaded() {
		if (this.info().loaded === undefined) {
			this.info().loaded = signal(true);
		}
	}

	linkClicked(e: Event) {
		if (this.isSameHost()) {
			e.preventDefault();
			this.router.navigateByUrl(this.info().source_url);
		}
	}
}
