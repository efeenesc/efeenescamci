import {
	Directive,
	OnInit,
	OnDestroy,
	ViewContainerRef,
	TemplateRef,
	OnChanges,
	input,
} from '@angular/core';
import { PortalService } from '@services/portal.service';

@Directive({
	selector: '[portalOutlet]',
})
export class PortalOutletDirective implements OnInit, OnDestroy {
	portalName = input<string>('', { alias: 'portalOutlet' });

	constructor(
		private viewContainer: ViewContainerRef,
		private portalService: PortalService,
	) {}

	ngOnInit(): void {
		this.portalService.registerOutlet(this.portalName(), this.viewContainer);
	}

	ngOnDestroy(): void {
		this.portalService.unregisterOutlet(this.portalName());
	}
}

@Directive({
	selector: '[portalContent]',
})
export class PortalContentDirective implements OnInit, OnDestroy, OnChanges {
	portalName = input<string>('', { alias: 'portalContent' });
	context = input<any>();

	constructor(
		private template: TemplateRef<any>,
		private portalService: PortalService,
	) {}

	ngOnInit(): void {
		this.portalService.setPortalContent(
			this.portalName(),
			this.template,
			this.context,
		);
	}

	ngOnChanges(): void {
		if (this.context !== undefined) {
			this.portalService.updatePortalContext(this.portalName(), this.context);
		}
	}

	ngOnDestroy(): void {
		this.portalService.clearPortalContent(this.portalName());
	}
}
