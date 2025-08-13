import {
	Component,
	ElementRef,
	ViewChild,
	OnInit,
	OnDestroy,
	output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { XMarkComponent } from '../../icons/xmark/xmark.component';
import { WindowObserverService } from '../../services/window-observer.service';
import gsap from 'gsap';
import { OverflowDirective } from '../../directives/overflow.directive';

interface VerticalMousePosition {
	y: number;
	time: number;
}
@Component({
	selector: 'drawer-component',
	imports: [XMarkComponent],
	templateUrl: './drawer.component.html',
})
export class DrawerComponent implements OnInit, OnDestroy {
	@ViewChild('drawerMain') set _dm(content: ElementRef) {
		this.drawerMain = content.nativeElement as HTMLDivElement;
	}
	drawerMain!: HTMLDivElement;

	@ViewChild('darkenedBg') set _db(content: ElementRef) {
		this.darkenedBg = content.nativeElement as HTMLDivElement;
	}
	darkenedBg!: HTMLDivElement;
	closed = output<void>();

	isDragging = false;
	dragStartTime = 0;
	dragStartPos = 0;
	objTranslate: { current: number; target: number } = { current: 0, target: 0 };
	carouselBounds: [number, number] = [90, 2];

	private currentMousePos: VerticalMousePosition | null = { y: 0, time: 0 };
	private prevMousePos: VerticalMousePosition | null = { y: 0, time: 0 };
	private drawerTween?: gsap.core.Tween;
	private mousePositionSub!: Subscription;
	private mouseUpSub!: Subscription;

	constructor(private woSvc: WindowObserverService) {}

	ngOnInit() {
		if (!this.woSvc.isTouchDevice()) {
			OverflowDirective.preOverflowHidden();
		}

		document.body.style.overflow = 'hidden';

		this.slideUp();

		window.addEventListener('touchstart', (event) => this.startDragging(event));
		this.mousePositionSub = this.woSvc.mousePositionObservable.subscribe(
			(event) => this.drag(event),
		);
		this.mouseUpSub = this.woSvc.mouseUpObservable.subscribe(() =>
			this.stopDragging(),
		);
	}

	ngOnDestroy() {
		if (this.mousePositionSub) this.mousePositionSub.unsubscribe();
		if (this.mouseUpSub) this.mouseUpSub.unsubscribe();
	}

	resetMouseVariables() {
		this.dragStartTime = 0;
		this.dragStartPos = 0;
		this.currentMousePos = null;
		this.prevMousePos = null;
	}

	slideUp() {
		const dkbg = document.getElementById('darkenedBg')!;
		const overlay = document.getElementById('mainOverlay')!;
		dkbg.style.opacity = '0.4';
		overlay.style.pointerEvents = 'auto';

		this.objTranslate = { current: 100, target: 2 }; // Target 2vh, start at 100vh (bottom of page)
		this.updateDrawerPosition(600, false, 'expo.out');
	}

	closeOverlay() {
		const dkbg = document.getElementById('darkenedBg')!;
		const overlay = document.getElementById('mainOverlay')!;
		dkbg.style.removeProperty('opacity');
		overlay.style.removeProperty('pointer-events');

		if (document.body.style.overflow === 'hidden') {
			document.body.style.removeProperty('overflow');

			if (!this.woSvc.isTouchDevice()) {
				OverflowDirective.postOverflowHidden();
			}
		}
	}

	slideDown() {
		this.objTranslate.target = 100;
		this.updateDrawerPosition(300, true, 'power2.in');
	}

	clickedOutside() {
		this.isDragging = false;
		this.slideDown();
	}

	keyPressed(event: KeyboardEvent) {
		if (event.key === 'Enter') this.clickedOutside();
	}

	getDragPosition(e: MouseEvent | TouchEvent): number {
		if (window.TouchEvent && e instanceof TouchEvent) {
			return e.changedTouches[0].clientY;
		} else {
			return (e as MouseEvent).clientY;
		}
	}

	setPrevMousePosition(y: number, time: number): void {
		if (this.currentMousePos) {
			this.prevMousePos = { ...this.currentMousePos };
		}

		this.currentMousePos = { y, time };
	}

	startDragging(e: MouseEvent | TouchEvent): void {
		if (
			(e.target as HTMLDivElement).id !== 'grabberDiv' &&
			(e.target as HTMLDivElement).id !== 'grabberImg'
		) {
			return;
		}

		if (this.isDragging) return;

		const currentTime = performance.now();
		this.resetMouseVariables();
		this.dragStartPos = this.getDragPosition(e);
		this.setPrevMousePosition(this.dragStartPos, currentTime);

		this.isDragging = true;
	}

	drag(e: MouseEvent | TouchEvent): void {
		if (!this.isDragging) return;

		const offsetY = this.getDragPosition(e);
		const dragDistance = offsetY - this.dragStartPos;

		this.objTranslate.target += dragDistance * 0.1;
		this.objTranslate.target = Math.min(
			Math.max(this.objTranslate.target, this.carouselBounds[1]),
			100,
		); // Clamp position
		this.dragStartPos = offsetY;

		const closeAfter = this.objTranslate.target > this.carouselBounds[0];
		this.isDragging = !closeAfter;

		this.updateDrawerPosition(150, closeAfter, '');
		this.setPrevMousePosition(offsetY, e.timeStamp);
	}

	stopDragging(): void {
		if (!this.isDragging) return;
		this.isDragging = false;

		if (this.prevMousePos === null || this.currentMousePos === null) return;

		const { y: curY, time: curTime } = this.currentMousePos;
		const { y: prevY, time: prevTime } = this.prevMousePos;

		const dt = curTime - prevTime;
		const dy = curY - prevY;
		const vel = Math.min(20, Math.max(-20, Math.round((dy / dt) * 2))); // Clamp velocity

		this.objTranslate.target += vel;
		const closeAfter = this.objTranslate.target > this.carouselBounds[0];

		this.objTranslate.target = closeAfter
			? 100
			: Math.max(this.objTranslate.target, this.carouselBounds[1]);

		this.resetMouseVariables();
		this.updateDrawerPosition(400, closeAfter, 'expo.out');
	}

	private updateDrawerPosition(
		duration: number,
		closeAfter = false,
		easing = 'sine.inOut',
	): void {
		if (closeAfter) this.closeOverlay();

		if (this.drawerTween) this.drawerTween.kill();

		this.drawerTween = gsap.to(this.objTranslate, {
			current: Math.min(
				Math.max(this.objTranslate.target, this.carouselBounds[1]),
				100,
			), // Clamp position
			duration: duration / 1000, // GSAP uses seconds for duration
			ease: easing,
			onUpdate: () => {
				this.drawerMain.style.top = this.objTranslate.current + 'vh';
			},
			onComplete: () => {
				if (closeAfter) {
					this.closed.emit();
					this.resetMouseVariables();
				}
			},
		});
	}
}
