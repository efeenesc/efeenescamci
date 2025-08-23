import {
	Directive,
	ElementRef,
	input,
	effect,
	Renderer2,
	computed,
	OnDestroy,
	ViewContainerRef,
	TemplateRef,
	EmbeddedViewRef,
	output,
} from '@angular/core';
import { WindowService } from '@services/window.service';
import gsap from 'gsap';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[popover]',
})
export class PopoverDirective implements OnDestroy {
	anchor = input<ElementRef<HTMLElement> | HTMLElement | null>(null);
	show = input<boolean>(false);
	template = input.required<TemplateRef<any>>();
	position = input<'top' | 'bottom' | 'left' | 'right'>('bottom');
	offset = input<number>(8);
	closeOnClickOutside = input<boolean>(true);
	closeOnEscape = input<boolean>(true);
	closeOnScroll = input<boolean>(false);

	showChange = output<boolean>();
	closed = output<void>();

	private popoverElement: HTMLElement | null = null;
	private popoverView: EmbeddedViewRef<any> | null = null;
	private clickOutsideListener?: (e: Event) => void;
	private escapeListener?: (e: KeyboardEvent) => void;
	private subscriptions: Subscription[] = [];

	private anchorElement = computed(() => {
		const anchorInput = this.anchor();
		if (anchorInput) {
			return anchorInput instanceof ElementRef
				? anchorInput.nativeElement
				: anchorInput;
		}
		return (
			this.elementRef.nativeElement.parentElement ||
			this.elementRef.nativeElement
		);
	});

	constructor(
		private elementRef: ElementRef<HTMLElement>,
		private renderer: Renderer2,
		private viewContainer: ViewContainerRef,
		private wndSvc: WindowService,
	) {
		effect(() => {
			if (this.show()) {
				this.showPopover();
			} else {
				this.hidePopover();
			}
		});
	}

	private showPopover() {
		if (this.popoverView) return;

		// Create embedded view from template
		this.popoverView = this.viewContainer.createEmbeddedView(this.template());
		this.popoverElement = this.popoverView.rootNodes[0];

		if (this.popoverElement) {
			this.renderer.appendChild(document.body, this.popoverElement);
			this.renderer.setStyle(this.popoverElement, 'position', 'fixed');

			requestAnimationFrame(() => {
				this.updatePosition();
				gsap.fromTo(
					this.popoverElement,
					{ opacity: 0, translateY: '-20px', scale: 0.8 },
					{
						opacity: 1,
						translateY: 0,
						duration: 0.1,
						ease: 'power1.out',
						scale: 1,
					},
				);
			});
			this.setupEventListeners();

			this.subscriptions.push(
				this.wndSvc.scrollObservable.subscribe(this.updatePosition),
			);
			this.subscriptions.push(
				this.wndSvc.sizeObservable.subscribe(this.updatePosition),
			);
		}
	}

	private hidePopover() {
		this.cleanupEventListeners();

		gsap.to(this.popoverElement, {
			opacity: 0,
			translateY: '-20px',
			duration: 0.1,
			ease: 'power1.in',
			scale: 0.8,
			onComplete: () => {
				if (this.popoverView) {
					this.popoverView.destroy();
					this.popoverView = null;
				}

				if (this.popoverElement) {
					this.renderer.removeChild(document.body, this.popoverElement);
					this.popoverElement = null;
				}
			},
		});
	}

	updatePosition = () => {
		if (!this.popoverElement || !this.anchorElement()) return;

		const anchorRect = this.anchorElement()!.getBoundingClientRect();
		const popoverRect = this.popoverElement.getBoundingClientRect();
		const offset = this.offset();
		const position = this.position();

		let top = 0;
		let left = 0;

		switch (position) {
			case 'top':
				top = anchorRect.top - popoverRect.height - offset;
				left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
				break;
			case 'bottom':
				top = anchorRect.bottom + offset;
				left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
				break;
			case 'left':
				top = anchorRect.top + (anchorRect.height - popoverRect.height) / 2;
				left = anchorRect.left - popoverRect.width - offset;
				break;
			case 'right':
				top = anchorRect.top + (anchorRect.height - popoverRect.height) / 2;
				left = anchorRect.right + offset;
				break;
		}

		// Ensure popover stays within viewport
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		if (left < 0) left = 8;
		if (left + popoverRect.width > viewportWidth) {
			left = viewportWidth - popoverRect.width - 8;
		}
		if (top < 0) top = 8;
		if (top + popoverRect.height > viewportHeight) {
			top = viewportHeight - popoverRect.height - 8;
		}

		this.renderer.setStyle(this.popoverElement, 'top', `${top}px`);
		this.renderer.setStyle(this.popoverElement, 'left', `${left}px`);
	};

	private setupEventListeners() {
		if (this.closeOnClickOutside()) {
			this.clickOutsideListener = (e: Event) => {
				if (
					this.popoverElement &&
					!this.popoverElement.contains(e.target as Node)
				) {
					this.close();
				}
			};
			document.addEventListener(
				'click',
				this.clickOutsideListener as EventListener,
				true,
			);
		}

		// Escape key listener
		if (this.closeOnEscape()) {
			this.escapeListener = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					this.close();
				}
			};
			document.addEventListener('keydown', this.escapeListener);
		}
	}

	private cleanupEventListeners() {
		if (this.clickOutsideListener) {
			document.removeEventListener(
				'click',
				this.clickOutsideListener as EventListener,
				true,
			);
			this.clickOutsideListener = undefined;
		}

		if (this.escapeListener) {
			document.removeEventListener('keydown', this.escapeListener);
			this.escapeListener = undefined;
		}

		this.subscriptions.map((s) => s.unsubscribe());
		this.subscriptions = [];
	}

	private close() {
		this.showChange.emit(false);
		this.closed.emit();
	}

	ngOnDestroy() {
		this.hidePopover();
	}
}
