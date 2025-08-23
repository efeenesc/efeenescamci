import { Component } from '@angular/core';
import { HeadingDirective } from '@directives/heading.directive';

@Component({
	selector: 'technologies-section',
	imports: [HeadingDirective],
	templateUrl: './technologies.component.html',
})
export class TechnologiesComponent {}
