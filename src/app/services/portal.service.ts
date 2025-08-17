import {
	Injectable,
	TemplateRef,
	ViewContainerRef,
	EmbeddedViewRef,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PortalContent {
	template: TemplateRef<any>;
	context?: any;
	viewRef?: EmbeddedViewRef<any>;
}

@Injectable({
	providedIn: 'root',
})
export class PortalService {
	private portals = new Map<string, PortalContent>();
	private outlets = new Map<string, ViewContainerRef>();

	// Observable for portal changes
	private portalChanges = new BehaviorSubject<string[]>([]);
	public portalChanges$ = this.portalChanges.asObservable();

	// Register a portal outlet (where content will be rendered)
	registerOutlet(name: string, viewContainer: ViewContainerRef): void {
		this.outlets.set(name, viewContainer);

		// If there's already content for this outlet, render it
		const portal = this.portals.get(name);
		if (portal) {
			this.renderPortal(name, portal);
		}
	}

	// Unregister outlet
	unregisterOutlet(name: string): void {
		const portal = this.portals.get(name);
		if (portal?.viewRef) {
			portal.viewRef.destroy();
		}
		this.outlets.delete(name);
	}

	// Set content for a portal
	setPortalContent(
		name: string,
		template: TemplateRef<any>,
		context?: any,
	): void {
		// Clear existing content
		this.clearPortalContent(name);

		const portal: PortalContent = { template, context };
		this.portals.set(name, portal);

		// Render immediately if outlet exists
		const outlet = this.outlets.get(name);
		if (outlet) {
			this.renderPortal(name, portal);
		}

		this.emitChanges();
	}

	// Clear portal content
	clearPortalContent(name: string): void {
		const portal = this.portals.get(name);
		if (portal?.viewRef) {
			portal.viewRef.destroy();
		}
		this.portals.delete(name);

		const outlet = this.outlets.get(name);
		if (outlet) {
			outlet.clear();
		}

		this.emitChanges();
	}

	// Update context for existing portal
	updatePortalContext(name: string, context: any): void {
		const portal = this.portals.get(name);
		if (portal) {
			portal.context = context;
			if (portal.viewRef) {
				// Update the context
				Object.assign(portal.viewRef.context, context);
				portal.viewRef.markForCheck();
			}
		}
	}

	getPortalContent(name: string) {
		return this.portals.get(name);
	}

	// Check if portal has content
	hasPortalContent(name: string): boolean {
		return this.portals.has(name);
	}

	private renderPortal(name: string, portal: PortalContent): void {
		const outlet = this.outlets.get(name);
		if (!outlet) return;

		outlet.clear();
		portal.viewRef = outlet.createEmbeddedView(portal.template, portal.context);
	}

	private emitChanges(): void {
		this.portalChanges.next(Array.from(this.portals.keys()));
	}
}
