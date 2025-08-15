import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'skeleton-loader',
	imports: [],
	styles: `
		:host {
			overflow: hidden;
			display: block;
		}
		:host div {
			background: linear-gradient(
				0deg,
				#ffffff00,
				#ffffff00,
				#bbbbbb52,
				#ffffff00,
				#ffffff00
			);
			background-size: 400% 400%;
			background-attachment: fixed;
			animation: gradient 1.5s ease infinite;
		}

		@keyframes gradient {
			0% {
				background-position: 0% 0%;
			}
			100% {
				background-position: 0% 100%;
			}
		}
	`,
	template: ` <div class="skeleton size-full"></div> `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {}
