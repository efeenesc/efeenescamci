import { Component, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { WindowObserverService } from '../../services/window-observer.service';

@Component({
	selector: 'site-logo',
	imports: [],
	template: ` <div
			id="site-logo-placeholder"
			class="block aspect-square h-full w-auto rounded-full"
		></div>
		<!-- Safari fix - box-shadow gets cut off despite overflow-visible being set, delete the outside box-shadow, add filter: drop-shadow instead which won't get cut off -->
		<svg
			id="website-logo-svg"
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			(mouseover)="this.onMouseOver()"
			(mouseleave)="this.restoreLogoPos()"
			(click)="this.onClick()"
			class="fixed z-10 aspect-square h-full min-h-[40px] w-auto rounded-full bg-highlight-solid bg-gradient-to-tl from-theme-300 to-theme-900 transition-colors duration-500 will-change-transform hover:cursor-pointer hover:bg-none focus:outline-0 focus-visible:outline-1"
			(mousedown)="this.startDragging($event)"
			(focus)="this.onMouseOver()"
			(pointerdown)="this.startDragging($event)"
			(keydown)="this.keyPressed($event)"
			tabindex="0"
			style="box-shadow: rgba(255, 255, 255, 0.3) 0px 2px 1px inset, rgba(0, 0, 0, 0.1) 0px -3px 0px inset; filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.2));"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				class="fill-contrast stroke-contrast"
				d="M 23.377 45.5 L 77.623 45.5 C 75.271 32.658 64.022 22.924 50.5 22.924 C 36.979 22.924 25.729 32.658 23.377 45.5 Z M 88.094 50.504 L 88.047 51.961 C 88.067 51.465 88.076 50.978 88.076 50.5 C 88.076 29.748 71.252 12.924 50.5 12.924 C 29.748 12.924 12.924 29.748 12.924 50.5 C 12.924 71.252 29.748 88.076 50.5 88.076 C 63.012 88.076 74.093 81.957 80.915 72.57 L 80.917 72.568 C 82.314 70.643 83.534 68.581 84.553 66.404 L 75.495 62.165 C 74.748 63.762 73.853 65.276 72.826 66.691 C 67.805 73.6 59.676 78.076 50.5 78.076 C 36.979 78.076 25.729 68.342 23.377 55.5 L 88.01 55.106 L 88.094 50.504 Z"
			></path>
		</svg>`,
})
export class SiteLogoComponent implements OnInit {
	animate = input<boolean>(true);
	private restoreTween?: gsap.core.Tween;
	private clickAnimationTween?: gsap.core.Tween;
	private _isDragging = false;

	set isDragging(v: boolean) {
		this._isDragging = v;
		// Safari fix - do not use .style here for user-select
		if (v) document.body.classList.add('select-none');
		else document.body.classList.remove('select-none');
	}
	get isDragging(): boolean {
		return this._isDragging;
	}

	initialPos?: {
		x: number;
		y: number;
		h: number;
		w: number;
		offset: { x: number; y: number };
	};

	constructor(
		private router: Router,
		private woSvc: WindowObserverService,
	) {}

	ngOnInit() {
		this.woSvc.mousePositionObservable.subscribe(
			(event: MouseEvent | TouchEvent) => {
				this.drag(event);
			},
		);
		this.woSvc.mouseUpObservable.subscribe(() => {
			this.stopDragging();
		});
		this.woSvc.sizeObservable.subscribe(() => {
			this.applyPlaceholderHeight();
		});

		this.applyPlaceholderHeight();
	}

	applyPlaceholderHeight() {
		const { x, y, height, width } = document
			.getElementById('site-logo-placeholder')!
			.getBoundingClientRect();
		this.initialPos = { x, y, h: height, w: width, offset: { x: 0, y: 0 } };

		document.getElementById('website-logo-svg')!.style.left = x + 'px';
		document.getElementById('website-logo-svg')!.style.top = y + 'px';
		document.getElementById('website-logo-svg')!.style.height = height + 'px';
	}

	onClick() {
		if (this.animate()) this.playClickAnimation();

		if (this.router.url !== '/') this.router.navigateByUrl('/');
	}

	onMouseOver() {
		if (this.animate() && !this.clickAnimationTween?.isActive())
			this.playHoverAnimation();
	}

	keyPressed(event: KeyboardEvent) {
		if (event.key === 'Enter') this.onClick();
	}

	playClickAnimation() {
		if (this.clickAnimationTween) this.clickAnimationTween.kill();

		this.clickAnimationTween = gsap.to('#website-logo-svg', {
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

		this.restoreTween = gsap.to('#website-logo-svg', {
			scale: 1,
			rotateZ: 0,
			duration: 0.25,
			ease: 'power2.in',
		});
	}

	private playHoverAnimation() {
		if (this.restoreTween?.isActive()) return;

		gsap.to('#website-logo-svg', {
			scale: 1.05,
			duration: 0.1,
			ease: 'power2.inOut',
		});
	}

	getDragPosition(e: MouseEvent | TouchEvent): { x: number; y: number } {
		if (window.TouchEvent && e instanceof TouchEvent) {
			return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
		} else {
			return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
		}
	}

	startDragging(event: MouseEvent | PointerEvent) {
		this.isDragging = true;
		this.initialPos!.offset = { x: event.offsetX, y: event.offsetY };
	}

	drag(event: MouseEvent | TouchEvent) {
		if (!this.isDragging) return;

		const { x, y } = this.getDragPosition(event);

		gsap.to('#website-logo-svg', {
			x: x - this.initialPos!.offset.x,
			y: y - this.initialPos!.offset.y,
			left: 0,
			top: 0,
		});
	}

	stopDragging() {
		if (!this.isDragging) return;
		this.isDragging = false;
		gsap.to('#website-logo-svg', {
			x: 0,
			y: 0,
			left: this.initialPos!.x,
			top: this.initialPos!.y,
			duration: 0.8,
			ease: 'elastic.out(0.5, 0.5)',
		});

		this.initialPos!.offset = { x: 0, y: 0 };
	}
}
