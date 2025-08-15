import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'error-page',
	imports: [RouterLink],
	templateUrl: './error-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPageComponent {}
