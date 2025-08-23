import {
	Component,
	ElementRef,
	signal,
	OnInit,
	OnDestroy,
	output,
	ChangeDetectionStrategy,
	viewChild,
} from '@angular/core';
import { VsSearchComponent } from '@components/vs-search/vs-search.component';
import { WindowService, WindowSize } from '@services/window.service';
import { SiteLogoComponent } from '@icons/site-logo/site-logo.component';
import { OverflowDirective } from '@directives/overflow.directive';
import gsap from 'gsap';
import { PortalService } from '@services/portal.service';
import { Router } from '@angular/router';
import { MiniTocComponent } from '@components/mini-toc/mini-toc.component';

@Component({
	selector: 'top-bar',
	imports: [
		VsSearchComponent,
		SiteLogoComponent,
		OverflowDirective,
		MiniTocComponent,
	],
	templateUrl: './top-bar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent implements OnInit, OnDestroy {
	topbar = viewChild.required<ElementRef<HTMLDivElement>>('topbar');
	sitelogo = viewChild.required<ElementRef<HTMLDivElement>>('sitelogo');
	placeholder =
		viewChild.required<ElementRef<HTMLDivElement>>('logoplaceholder');
	themeButtonClicked = output<void>();

	topbarScrollProgress = signal<number>(1);
	topbarExtended = signal<boolean>(true);
	mobileMode = signal<boolean>(false);
	minScrollY = 0;
	maxScrollY = 200;
	backgroundApplyScrollYTarget = 400;
	applyBackground = signal(false);
	applyBackgroundBlur = signal(false);
	private topBarTween!: gsap.core.Tween;
	private lastProgress = -1;
	private subscriptions: (() => void)[] = [];

	// Logo dragging properties
	private _isDragging = false;
	initialPos?: {
		x: number;
		y: number;
		h: number;
		w: number;
		offset: { x: number; y: number };
	};

	set isDragging(v: boolean) {
		this._isDragging = v;
		// Safari fix - do not use .style here for user-select
		if (v) document.body.classList.add('select-none');
		else document.body.classList.remove('select-none');
	}
	get isDragging(): boolean {
		return this._isDragging;
	}

	// Logo animation properties
	private restoreTween?: gsap.core.Tween;
	private clickAnimationTween?: gsap.core.Tween;

	constructor(
		private wndSvc: WindowService,
		private portalSvc: PortalService,
		private router: Router,
	) {}

	ngOnInit() {
		const scrollSub = this.wndSvc.scrollObservable.subscribe((newYval) => {
			this.trackScroll(newYval);
			const appliedBg = this.applyBackground();
			const appliedBgBlur = this.applyBackgroundBlur();
			const target = this.backgroundApplyScrollYTarget;
			if (appliedBgBlur && newYval < 50) {
				this.applyBackgroundBlur.set(false);
			} else if (!appliedBgBlur && newYval > 50) {
				this.applyBackgroundBlur.set(true);
			}
			if (appliedBg && newYval < target) {
				this.applyBackground.set(false);
			} else if (!appliedBg && newYval > target) {
				this.applyBackground.set(true);
			}
		});
		const sizeSub = this.wndSvc.sizeObservable.subscribe((newWndSize) => {
			this.setTopBarMode(newWndSize);
			this.applyPlaceholderHeight();
		});

		this.subscriptions.push(scrollSub.unsubscribe);
		this.subscriptions.push(sizeSub.unsubscribe);

		this.setTopBarMode(this.wndSvc.getWindowSize());
		this.portalSvc.portalChanges$.subscribe(() => {
			const t = this.portalSvc.getPortalContent('header');
			if (!t) return;
			const n = t?.viewRef?.rootNodes.at(0) as HTMLElement;
			if (!n) return;
			const scrollTarget = n.clientHeight;
			this.backgroundApplyScrollYTarget = scrollTarget;
		});

		// Initialize logo positioning
		this.applyPlaceholderHeight();
	}

	ngOnDestroy() {
		this.subscriptions.forEach((unsub) => unsub());
		if (this.topBarTween) {
			this.topBarTween.kill();
		}
		if (this.restoreTween) {
			this.restoreTween.kill();
		}
		if (this.clickAnimationTween) {
			this.clickAnimationTween.kill();
		}
		this.unbindOnMouseClickEvents();
	}

	emitThemeBarClickedEvent() {
		this.themeButtonClicked.emit();
	}

	trackScroll(newYval: number) {
		if (newYval < this.minScrollY) {
			return;
		}

		let newProgress: number;
		if (newYval > this.maxScrollY) {
			newProgress = 0;
		} else {
			newProgress = 1 - newYval / this.maxScrollY;
		}

		if (Math.abs(newProgress - this.lastProgress) < 0.01) {
			return;
		}

		this.topbarScrollProgress.set(newProgress);
		this.lastProgress = newProgress;
		this.playNewTopBarAnimation(newProgress);
	}

	// This relies on the window size to determine whether the user is on mobile or not.
	// If on mobile, a different top bar will be shown.
	setTopBarMode(newWndSize: WindowSize) {
		this.mobileMode.set(newWndSize.x < 768 ? true : false);
	}

	playNewTopBarAnimation(progress: number) {
		const baseHeight = 5;
		const extraHeight = progress * 5;
		const finalHeight = baseHeight + extraHeight;
		const newHeight = finalHeight + 'vh';

		if (this.topBarTween) {
			this.topBarTween.kill();
		}

		this.topBarTween = gsap.to(
			[this.topbar().nativeElement, this.sitelogo().nativeElement],
			{
				height: newHeight,
				duration: 0.3,
				ease: 'elastic.out(1.2, 1)',
			},
		);
	}

	// Logo dragging methods
	bindOnMouseClickEvents = () => {
		window.addEventListener('mousemove', this.drag, { passive: true });
		window.addEventListener('touchmove', this.drag, { passive: true });
		window.addEventListener('mouseup', this.stopDragging);
		window.addEventListener('touchend', this.stopDragging);
	};

	unbindOnMouseClickEvents = () => {
		window.removeEventListener('mousemove', this.drag);
		window.removeEventListener('touchmove', this.drag);
		window.removeEventListener('mouseup', this.stopDragging);
		window.removeEventListener('touchend', this.stopDragging);
	};

	applyPlaceholderHeight() {
		if (!this.placeholder() || !this.sitelogo()) return;

		const { x, y, height, width } =
			this.placeholder().nativeElement.getBoundingClientRect();
		this.initialPos = { x, y, h: height, w: width, offset: { x: 0, y: 0 } };

		// Position SVG absolutely within the container instead of fixed
		this.sitelogo().nativeElement.style.left = x + 'px';
		this.sitelogo().nativeElement.style.top = y + 'px';
		this.sitelogo().nativeElement.style.height = height + 'px';
	}

	getDragPosition(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (window.TouchEvent && e instanceof TouchEvent) {
			return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
		} else {
			return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
		}
	}

	startDragging(event: MouseEvent | PointerEvent) {
		this.bindOnMouseClickEvents();
		if (this.isDragging) return;
		this.isDragging = true;
		this.initialPos!.offset = { x: event.offsetX, y: event.offsetY };
	}

	drag = (event: MouseEvent | TouchEvent) => {
		if (!this.isDragging) return;

		const { x, y } = this.getDragPosition(event);

		// Calculate position relative to the initial container position
		const relativeX = x - this.initialPos!.x - this.initialPos!.offset.x;
		const relativeY = y - this.initialPos!.y - this.initialPos!.offset.y;

		gsap.to(this.sitelogo().nativeElement, {
			x: relativeX,
			y: relativeY,
			duration: 0.1,
		});
	};

	stopDragging = () => {
		this.unbindOnMouseClickEvents();
		if (!this.isDragging) return;
		this.isDragging = false;

		gsap.to(this.sitelogo().nativeElement, {
			x: 0,
			y: 0,
			duration: 0.8,
			ease: 'elastic.out(0.5, 0.5)',
		});

		this.initialPos!.offset = { x: 0, y: 0 };
	};

	// Logo interaction methods
	onClick() {
		this.playClickAnimation();
		if (this.router.url !== '/') this.router.navigateByUrl('/');
	}

	onMouseOver() {
		if (!this.clickAnimationTween?.isActive()) this.playHoverAnimation();
	}

	keyPressed(event: KeyboardEvent) {
		if (event.key === 'Enter') this.onClick();
	}

	playClickAnimation() {
		if (this.clickAnimationTween) this.clickAnimationTween.kill();

		this.clickAnimationTween = gsap.to(this.sitelogo().nativeElement, {
			scale: 0.8,
			rotateZ: (Math.random() - 0.5) * 100, // Rotate different amounts to the left or right
			duration: 0.1,
			ease: 'power2.out',
			onComplete: () => {
				this.restoreLogoPos();
			},
		});
	}

	restoreLogoPos() {
		if (this.restoreTween) this.restoreTween.kill();

		this.restoreTween = gsap.to(this.sitelogo().nativeElement, {
			scale: 1,
			rotateZ: 0,
			duration: 0.25,
			ease: 'power2.in',
		});
	}

	private playHoverAnimation() {
		if (this.restoreTween?.isActive()) return;

		gsap.to(this.sitelogo().nativeElement, {
			scale: 1.05,
			duration: 0.15,
			ease: 'power2.inOut',
		});
	}
}
