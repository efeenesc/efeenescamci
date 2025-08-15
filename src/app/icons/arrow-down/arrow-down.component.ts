import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'icon-arrow-down',
	imports: [],
	template: `
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="{{ applyClass }}"
		>
			<!--
			Vectors and icons by Vlad Cristea
			https://www.figma.com/@thevladc?ref=svgrepo.com
			in CC Attribution License via SVG Repo
			-->
			<path
				d="M19 9L14 14.1599C13.7429 14.4323 13.4329 14.6493 13.089 14.7976C12.7451 14.9459 12.3745 15.0225 12 15.0225C11.6255 15.0225 11.2549 14.9459 10.9109 14.7976C10.567 14.6493 10.2571 14.4323 10 14.1599L5 9"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrowDownComponent {
	@Input() applyClass?: string;
}
