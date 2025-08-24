import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortalContentDirective } from '@directives/portal.directive';
import { FakeLoadingBarService } from '@services/fake-loading-bar.service';

@Component({
	selector: 'error-page',
	imports: [RouterLink, PortalContentDirective],
	templateUrl: './error-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPageComponent {
	constructor(private loader: FakeLoadingBarService) {
		this.loader.complete('custom');
	}
}
