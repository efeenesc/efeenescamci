import {
	Component,
	input,
	signal,
	ViewEncapsulation,
	WritableSignal,
} from '@angular/core';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

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
})
export class NormalCardComponent {
	info = input.required<NormalCardInfo>();

	setLoaded() {
		if (this.info().loaded === undefined) {
			this.info().loaded = signal(true);
		}
	}
}
