import {
	Directive,
	ElementRef,
	OnInit,
	OnDestroy,
	signal,
	computed,
	effect,
	EffectRef,
	inject,
} from '@angular/core';
import { FakeLoadingBarService } from '@services/fake-loading-bar.service';

interface HeadingMeta {
	el: HTMLElement;
	type: 1 | 2 | 3 | 4 | 5 | 6;
}

@Directive({
	selector: '[is-heading]',
	// eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
	inputs: ['excludeLink'],
})
export class HeadingDirective implements OnInit, OnDestroy {
	private static loader: FakeLoadingBarService;

	private static _tocElements = signal<HeadingMeta[]>([]);
	private static _visibleMap = signal<Map<HTMLElement, boolean>>(new Map());
	static activeIndex = signal<number>(-1);
	static tocElements = computed(() => {
		return [...HeadingDirective._tocElements()].sort(
			HeadingDirective.orderDOMElements,
		);
	});

	private static observer: IntersectionObserver | null = null;
	private static effectRef: EffectRef | null = null;
	private static lastScrollY = 0;

	private tag!: number;
	private element!: HeadingMeta;
	excludeLink = false;

	constructor(private el: ElementRef<HTMLElement>) {
		if (!HeadingDirective.effectRef) {
			HeadingDirective.lastScrollY = window.scrollY;
			HeadingDirective.effectRef = effect(() => {
				const metas = HeadingDirective.tocElements();
				const vis = HeadingDirective._visibleMap();

				if (metas.length === 0) {
					HeadingDirective.activeIndex.set(-1);
					return;
				}

				const idx = metas.findIndex((m) => vis.get(m.el) === true);

				if (idx === -1) {
					const currentScrollY = window.scrollY;
					const scrollingUp = currentScrollY < HeadingDirective.lastScrollY;
					const currentIndex = HeadingDirective.activeIndex();

					if (scrollingUp && currentIndex > 0) {
						HeadingDirective.activeIndex.set(currentIndex - 1);
					}

					HeadingDirective.lastScrollY = currentScrollY;
				} else {
					HeadingDirective.activeIndex.set(idx);
					HeadingDirective.lastScrollY = window.scrollY;
				}
			});
		}

		if (!HeadingDirective.loader) {
			HeadingDirective.loader = inject(FakeLoadingBarService);
			HeadingDirective.loader.state.subscribe((state) => {
				if (state === 'completed') {
					setTimeout(() => this.handleHashChange(), 200); // arbitrary timeout, could've subscribed to items here but too lazy
				}
			});
		}
	}

	ngOnInit(): void {
		this.tag = this.getTag(this.el.nativeElement);
		if (this.tag === -1) return;

		if (!this.excludeLink) {
			this.el.nativeElement.classList.add('link-icon');
			this.el.nativeElement.addEventListener(
				'click',
				this.onLinkClick.bind(this),
				{ passive: true },
			);
		}

		this.element = {
			el: this.el.nativeElement,
			type: this.tag as any,
		};

		HeadingDirective._tocElements.update((elements) => [
			...elements,
			this.element,
		]);
		this.setupIntersectionObserver();
	}

	ngOnDestroy(): void {
		this.el.nativeElement.removeEventListener('click', this.onLinkClick);
		if (HeadingDirective.observer) {
			HeadingDirective.observer.unobserve(this.el.nativeElement);
		}

		HeadingDirective._tocElements.update((elements) =>
			elements.filter((item) => item.el !== this.el.nativeElement),
		);

		HeadingDirective._visibleMap.update((map) => {
			const next = new Map(map);
			next.delete(this.el.nativeElement);
			return next;
		});

		if (HeadingDirective._tocElements().length === 0) {
			if (HeadingDirective.observer) {
				HeadingDirective.observer.disconnect();
				HeadingDirective.observer = null;
			}
			if (HeadingDirective.effectRef) {
				HeadingDirective.effectRef.destroy();
				HeadingDirective.effectRef = null;
			}
			HeadingDirective.activeIndex.set(-1);
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

	handleHashChange() {
		const encodedHeading = window.location.hash;
		if (!encodedHeading) return;

		try {
			const decodedHeading = decodeURIComponent(
				encodedHeading.replaceAll('-', ' ').slice(1),
			);
			this.scrollToHeading(decodedHeading);
		} catch {
			console.warn('Failed to decode heading hash:', encodedHeading);
		}
	}

	scrollToHeading(headingText: string) {
		const elements = HeadingDirective._tocElements();
		const targetElement = elements.find(
			(meta) =>
				meta.el.textContent?.trim().toLocaleLowerCase() ===
				headingText.toLocaleLowerCase(),
		);

		if (targetElement) {
			const { top } = targetElement.el.getBoundingClientRect();
			scrollTo({ behavior: 'smooth', top: window.scrollY + top - 100 });
		}
	}

	onLinkClick() {
		const headingText = this.el.nativeElement.textContent?.trim() || '';
		const encodedHeading = encodeURIComponent(
			headingText.replaceAll(' ', '-').toLocaleLowerCase(),
		);

		const currentUrl = window.location.pathname;
		const newUrl = `${currentUrl}#${encodedHeading}`;
		window.history.replaceState(null, '', newUrl);

		const { top } = this.el.nativeElement.getBoundingClientRect();
		scrollTo({
			behavior: 'smooth',
			top: Math.floor(window.scrollY + top - 100),
		});
	}

	private static orderDOMElements(a: HeadingMeta, b: HeadingMeta): number {
		/**
		 * if POSITION_PRECEDING (2), subtracting by 3 returns negative value;
		 * if POSITION_FOLLOWING (4), subtracting by 3 returns positive value
		 */
		return b.el.compareDocumentPosition(a.el) - 3;
	}

	private setupIntersectionObserver(): void {
		if (!HeadingDirective.observer) {
			HeadingDirective.observer = new IntersectionObserver(
				(entries) => {
					HeadingDirective._visibleMap.update((map) => {
						let changed = false;
						const next = new Map(map);
						for (const entry of entries) {
							const target = entry.target as HTMLElement;
							const newState = entry.isIntersecting;
							if (next.get(target) !== newState) {
								next.set(target, newState);
								changed = true;
							}
						}
						return changed ? next : map;
					});
				},
				{
					rootMargin: '0% 0px 0% 0px',
					threshold: 0,
				},
			);
		}

		HeadingDirective.observer.observe(this.el.nativeElement);
	}
}
