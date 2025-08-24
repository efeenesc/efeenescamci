import {
	Component,
	OnDestroy,
	signal,
	viewChild,
	viewChildren,
	ElementRef,
	effect,
	input,
} from '@angular/core';
import { HeadingDirective } from '@directives/heading.directive';
import { Subscription } from 'rxjs';
import { PopoverDirective } from '@directives/popover.directive';
import gsap from 'gsap';

interface HeadingElement {
	el: HTMLElement;
	type: 1 | 2 | 3 | 4 | 5 | 6;
}

@Component({
	selector: 'mini-toc',
	imports: [PopoverDirective],
	templateUrl: './mini-toc.component.html',
	styles: `
		:host {
			width: 100%;
		}
		.mini-toc {
			-ms-overflow-style: none;
			scrollbar-width: none;
		}
		.mini-toc::-webkit-scrollbar {
			display: none;
		}
	`,
})
export class MiniTocComponent implements OnDestroy {
	container = viewChild.required<ElementRef<HTMLDivElement>>('minitoc');
	items = HeadingDirective.tocElements;
	activeIndex = HeadingDirective.activeIndex;
	isPopoverVisible = signal(false);
	show = input(false);
	private subscription!: Subscription;
	readonly tocButtons = viewChildren<ElementRef<HTMLElement>>('tocButton');

	constructor(private elementRef: ElementRef) {
		effect(() => {
			const activeIndex = this.activeIndex();
			if (activeIndex >= 0 && this.items().length > 0) {
				this.scrollToActiveItem(activeIndex);
			}
		});

		effect(() => {
			if (this.show()) {
				this.showToc();
			} else {
				this.hideToc();
			}
		});
	}

	/**
	 * Scrolls to the clicked heading element
	 * @param item The heading element to scroll to
	 */
	scrollTo(item: HeadingElement) {
		if (this.items().indexOf(item) === 0) {
			scrollTo({ behavior: 'smooth', top: 0 });
		} else {
			const { top } = item.el.getBoundingClientRect();
			scrollTo({ behavior: 'smooth', top: window.scrollY + top - 100 });
		}
		this.isPopoverVisible.set(false);
	}

	private showToc() {
		gsap.fromTo(
			this.elementRef.nativeElement,
			{ opacity: 0, width: 0 },
			{ opacity: 1, duration: 0.5, width: '100%' },
		);
	}

	private hideToc() {
		gsap.to(this.elementRef.nativeElement, {
			opacity: 0,
			duration: 0.3,
			width: 0,
		});
	}

	/**
	 * Uses set width, gap, padding values to calculate the supposed position of the active item
	 * in the scroll container.
	 *
	 * Watch out for these values! If values don't match in the template or the calculation, this will
	 * not work accurately
	 */
	private scrollToActiveItem(activeIndex: number) {
		const container = this.container().nativeElement;
		const itemWidth = 8; // w-2
		const gap = 8; // gap-2
		const padding = 16; // px-4

		const itemPosition = activeIndex * (itemWidth + gap);
		const containerWidth = container.clientWidth;
		const scrollPosition =
			itemPosition - containerWidth / 2 + itemWidth / 2 + padding;

		container.scrollTo({
			left: Math.max(0, scrollPosition),
			behavior: 'smooth',
		});
	}

	ngOnDestroy() {
		if (this.subscription && !this.subscription.closed) {
			this.subscription.unsubscribe();
		}
	}

	openPopover() {
		this.isPopoverVisible.set(true);
	}
}
