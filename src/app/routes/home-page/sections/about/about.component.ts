import { Component } from '@angular/core';
import { HeadingDirective } from '@directives/heading.directive';

@Component({
	selector: 'about-section',
	imports: [HeadingDirective],
	templateUrl: './about.component.html',
	styles: `
		.hats-list li:not(:last-of-type) {
			margin-bottom: 5px;
		}
	`,
})
export class AboutComponent {}
