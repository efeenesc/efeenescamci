import {
	Component,
	signal,
	viewChild,
	viewChildren,
	ElementRef,
	effect,
} from '@angular/core';
import { HeadingDirective } from '@directives/heading.directive';

interface HeadingElement {
	el: HTMLElement;
	type: 1 | 2 | 3 | 4 | 5 | 6;
}

@Component({
	selector: 'sidepanel-toc',
	imports: [],
	templateUrl: './sidepanel-toc.component.html',
	styles: `
		.toc-container {
			-ms-overflow-style: none;
			scrollbar-width: none;
		}
		.toc-container::-webkit-scrollbar {
			display: none;
		}
		.toc-active-box {
			animation: fade-in 1s forwards;
		}
		@keyframes fade-in {
			100% {
				opacity: 1;
			}
		}
	`,
})
export class SidepanelTocComponent {
	items = HeadingDirective.tocElements;
	activeIndex = HeadingDirective.activeIndex;
	buttonCoords = signal<{
		top: number;
		left: number;
		width: number;
		height: number;
	}>({ top: -1, left: -1, width: -1, height: -1 });
	readonly tocButtons = viewChildren<ElementRef<HTMLElement>>('tocButton');
	readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

	constructor() {
		effect(() => {
			this.calculateActiveButtonCoords(this.activeIndex());
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
	}

	calculateActiveButtonCoords(idx: number) {
		const activeButton = this.tocButtons()[idx];
		if (!activeButton) {
			this.buttonCoords.set({ top: 0, left: 0, width: 0, height: 0 });
			return;
		}

		this.buttonCoords.set({
			top: activeButton.nativeElement.offsetTop,
			left: activeButton.nativeElement.offsetLeft,
			width: activeButton.nativeElement.offsetWidth,
			height: activeButton.nativeElement.offsetHeight,
		});
	}
}
