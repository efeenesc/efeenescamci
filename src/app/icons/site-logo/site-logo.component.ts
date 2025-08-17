import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'site-logo',
	imports: [],
	template: ` <!-- Safari fix - box-shadow gets cut off despite overflow-visible being set, delete the outside box-shadow, add filter: drop-shadow instead which won't get cut off -->
		<svg
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			class="aspect-square h-full min-h-[40px] w-auto transition-colors duration-500"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M 23.377 45.5 L 77.623 45.5 C 75.271 32.658 64.022 22.924 50.5 22.924 C 36.979 22.924 25.729 32.658 23.377 45.5 Z M 88.094 50.504 L 88.047 51.961 C 88.067 51.465 88.076 50.978 88.076 50.5 C 88.076 29.748 71.252 12.924 50.5 12.924 C 29.748 12.924 12.924 29.748 12.924 50.5 C 12.924 71.252 29.748 88.076 50.5 88.076 C 63.012 88.076 74.093 81.957 80.915 72.57 L 80.917 72.568 C 82.314 70.643 83.534 68.581 84.553 66.404 L 75.495 62.165 C 74.748 63.762 73.853 65.276 72.826 66.691 C 67.805 73.6 59.676 78.076 50.5 78.076 C 36.979 78.076 25.729 68.342 23.377 55.5 L 88.01 55.106 L 88.094 50.504 Z"
			></path>
		</svg>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteLogoComponent {}
