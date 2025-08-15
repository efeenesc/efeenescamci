import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'hamburger-menu',
	imports: [],
	template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 385">
		<!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
		<path
			d="M 0 31.999 C 0 14.299 14.3 -0.001 32 -0.001 L 416 -0.001 C 433.7 -0.001 448 14.299 448 31.999 C 448 49.699 433.7 63.999 416 63.999 L 32 63.999 C 14.3 63.999 0 49.699 0 31.999 Z M 0 191.999 C 0 174.299 14.3 159.999 32 159.999 L 416 159.999 C 433.7 159.999 448 174.299 448 191.999 C 448 209.699 433.7 223.999 416 223.999 L 32 223.999 C 14.3 223.999 0 209.699 0 191.999 Z M 448 351.999 C 448 369.699 433.7 383.999 416 383.999 L 32 383.999 C 14.3 383.999 0 369.699 0 351.999 C 0 334.299 14.3 319.999 32 319.999 L 416 319.999 C 433.7 319.999 448 334.299 448 351.999 Z"
		></path>
	</svg>`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HamburgerMenuComponent {}
