import { Component } from '@angular/core';

@Component({
	selector: 'footer',
	templateUrl: './footer.component.html',
	styles: `
		.test {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0%;
			transform-origin: top;
			background: var(--rainbow-bg);
			transform: rotateX(1deg);
		}
	`,
})
export class FooterComponent {}
