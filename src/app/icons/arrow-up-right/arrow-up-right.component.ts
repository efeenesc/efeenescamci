import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'icon-arrow-up-right',
	imports: [],
	template: `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			class="{{ applyClass }}"
		>
			<!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
			<g id="Arrow / Arrow_Up_Right_SM">
				<path
					id="Vector"
					d="M8 16L16 8M16 8H10M16 8V14"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</g>
		</svg>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrowUpRightComponent {
	@Input() applyClass?: string;
}
