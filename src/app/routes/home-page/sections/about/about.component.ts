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
		.hats-list li::before {
			content: '🧙🏻';
			background-color: var(--accent2);
			border-radius: 100px;
			padding: 0px 4px;
			display: inline-block;
			margin-right: 10px;
		}
		.hats-list li:nth-of-type(2n)::before {
			content: '🕵🏻‍♂️';
		}
		.hats-list li:nth-of-type(3n)::before {
			content: '👨🏻‍✈️';
		}
		.hats-list li:nth-of-type(4n)::before {
			content: '👨🏻‍🚒';
		}
		.hats-list li:nth-of-type(5n)::before {
			content: '💂🏻‍♂️';
		}
		.hats-list span li::before {
			content: '👷🏻‍♂️';
		}
	`,
})
export class AboutComponent {}
