import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-project-page',
	standalone: true,
	imports: [],
	templateUrl: './project-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPageComponent {}
