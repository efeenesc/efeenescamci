import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface HeadingElement {
	el: HTMLElement;
	type: 1 | 2 | 3 | 4 | 5 | 6;
	isVisible?: boolean;
}

interface TocState {
	elements: HeadingElement[];
	activeIndex: number; // -1 if none active
}

@Directive({
	selector: '[is-heading]',
})
export class HeadingDirective implements OnInit, OnDestroy {
	private static tocStateSubject = new BehaviorSubject<TocState>({
		elements: [],
		activeIndex: -1,
	});
	static tocState$: Observable<TocState> =
		HeadingDirective.tocStateSubject.asObservable();

	private static observer: IntersectionObserver | null = null;
	private static scrollListener: (() => void) | null = null;
	private static lastScrollY = 0;
	private static scrollDirection: 'up' | 'down' = 'down';
	private static scrollThrottleTimeout: number | null = null;

	private tag!: number;
	private element!: HeadingElement;

	constructor(private el: ElementRef) {}

	ngOnInit(): void {
		const currentState = HeadingDirective.tocStateSubject.value;
		this.tag = this.getTag(this.el.nativeElement);
		if (this.tag === -1) return;

		this.element = {
			el: this.el.nativeElement,
			type: this.tag as any,
			isVisible: false,
		};

		const ordered = [...currentState.elements, this.element].sort(
			/**
			 * if POSITION_PRECEDING (2), subtracting by 3 returns negative value;
			 * if POSITION_FOLLOWING (4), subtracting by 3 returns positive value
			 */
			(a, b) => b.el.compareDocumentPosition(a.el) - 3,
		);

		HeadingDirective.updateTocState({ elements: ordered });
		this.setupIntersectionObserver();
		this.setupScrollListener();

		if (HeadingDirective.observer) {
			HeadingDirective.observer.observe(this.el.nativeElement);
		}
	}

	ngOnDestroy(): void {
		if (HeadingDirective.observer) {
			HeadingDirective.observer.unobserve(this.el.nativeElement);
		}

		const currentState = HeadingDirective.tocStateSubject.value;
		const filteredElements = currentState.elements.filter(
			(item) => item.el !== this.el.nativeElement,
		);

		HeadingDirective.updateTocState({ elements: filteredElements });

		// If no more elements, disconnect observer and scroll listener
		if (filteredElements.length === 0) {
			if (HeadingDirective.observer) {
				HeadingDirective.observer.disconnect();
				HeadingDirective.observer = null;
			}
			if (HeadingDirective.scrollListener) {
				window.removeEventListener('scroll', HeadingDirective.scrollListener);
				HeadingDirective.scrollListener = null;
			}
		}
	}

	getTag(el: HTMLElement): number {
		switch (el.tagName) {
			case 'H1':
			case 'H2':
			case 'H3':
			case 'H4':
			case 'H5':
			case 'H6':
				return Number(el.tagName.slice(1, 2));
			default:
				return -1;
		}
	}

	/**
	 * Gets the current table of contents state
	 * @returns Current TocState containing elements and activeIndex
	 */
	static getTocState(): TocState {
		return HeadingDirective.tocStateSubject.value;
	}

	/**
	 * Updates the table of contents state and calculates the active index
	 * @param updates Partial state updates to apply
	 */
	private static updateTocState(updates: Partial<TocState>): void {
		const currentState = HeadingDirective.tocStateSubject.value;
		const newState = { ...currentState, ...updates };

		// Calculate activeIndex based on visible elements
		if (updates.elements) {
			const visibleIndex = newState.elements.findIndex((el) => el.isVisible);

			// Update activeIndex if we have a visible element
			if (visibleIndex !== -1) {
				newState.activeIndex = visibleIndex;
			}
		}

		HeadingDirective.tocStateSubject.next(newState);
	}

	/**
	 * Sets up the IntersectionObserver to track heading visibility
	 * Uses 50% threshold and 10% margins to determine when headings are "active"
	 */
	private setupIntersectionObserver(): void {
		if (HeadingDirective.observer) return;

		HeadingDirective.observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const currentState = HeadingDirective.tocStateSubject.value;
					const elementIndex = currentState.elements.findIndex(
						(item) => item.el === entry.target,
					);

					if (elementIndex !== -1) {
						const updatedElements = [...currentState.elements];
						updatedElements[elementIndex] = {
							...updatedElements[elementIndex],
							isVisible: entry.isIntersecting,
						};

						HeadingDirective.updateTocState({ elements: updatedElements });
					}
				});
			},
			{
				threshold: 0.5,
				rootMargin: '-10% 0px -10% 0px',
			},
		);
	}

	/**
	 * Sets up throttled scroll listener to track scroll direction and apply fallback logic
	 * Throttles scroll events to 16ms (~60fps) for performance
	 */
	private setupScrollListener(): void {
		if (HeadingDirective.scrollListener) return;

		HeadingDirective.scrollListener = () => {
			// Clear existing timeout if it exists
			if (HeadingDirective.scrollThrottleTimeout) {
				clearTimeout(HeadingDirective.scrollThrottleTimeout);
			}

			// Throttle the scroll handler to 16ms (~60fps)
			HeadingDirective.scrollThrottleTimeout = window.setTimeout(() => {
				const currentScrollY = window.scrollY;
				HeadingDirective.scrollDirection =
					currentScrollY > HeadingDirective.lastScrollY ? 'down' : 'up';
				HeadingDirective.lastScrollY = currentScrollY;

				HeadingDirective.applyScrollBasedFallback();
			}, 16);
		};

		window.addEventListener('scroll', HeadingDirective.scrollListener, {
			passive: true,
		});
	}

	/**
	 * Applies scroll-based fallback logic when no headings are visible
	 * Uses scroll direction to intelligently guess the current section
	 */
	private static applyScrollBasedFallback(): void {
		const currentState = HeadingDirective.tocStateSubject.value;
		const visibleCount = currentState.elements.filter(
			(el) => el.isVisible,
		).length;

		// Only apply fallback if no headings are currently visible
		if (visibleCount === 0 && currentState.activeIndex !== -1) {
			let fallbackIndex = currentState.activeIndex;

			// Adjust based on scroll direction
			if (HeadingDirective.scrollDirection === 'up' && fallbackIndex > 0) {
				// When scrolling up, assume we might be in the previous section
				const currentHeading = currentState.elements[fallbackIndex];

				// Check if we've scrolled above the current heading
				if (
					currentHeading &&
					window.scrollY < currentHeading.el.offsetTop - 100
				) {
					fallbackIndex = fallbackIndex - 1;
				}
			}
			// When scrolling down, keep current section until we definitively enter next one

			HeadingDirective.updateTocState({
				activeIndex: fallbackIndex,
			});
		}
	}
}
