import {
	Component,
	ElementRef,
	OnInit,
	OnDestroy,
	output,
	ChangeDetectionStrategy,
	viewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { XMarkComponent } from '@icons/xmark/xmark.component';
import { WindowService } from '@services/window.service';
import gsap from 'gsap';
import { OverflowDirective } from '@directives/overflow.directive';

interface VerticalMousePosition {
	y: number;
	time: number;
}
@Component({
	selector: 'drawer-component',
	imports: [XMarkComponent],
	templateUrl: './drawer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent implements OnInit, OnDestroy {
	drawerMain = viewChild.required<ElementRef<HTMLDivElement>>('drawerMain');
	mainOverlay = viewChild.required<ElementRef<HTMLDivElement>>('mainOverlay');
	darkenedBg = viewChild.required<ElementRef<HTMLDivElement>>('darkenedBg');
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

	constructor(private wndSvc: WindowService) {}

	ngOnInit() {
		if (!this.wndSvc.isTouchDevice()) {
			OverflowDirective.preOverflowHidden();
		}

		document.body.style.overflow = 'hidden';
		this.slideUp();
		window.addEventListener('touchstart', (event) => this.startDragging(event));
	}

	ngOnDestroy() {
		if (this.mousePositionSub) this.mousePositionSub.unsubscribe();
		if (this.mouseUpSub) this.mouseUpSub.unsubscribe();
	}

	private bindOnMouseClickEvents() {
		window.addEventListener('mousemove', this.drag, { passive: true });
		window.addEventListener('touchmove', this.drag, { passive: true });
		window.addEventListener('mouseup', this.stopDragging);
		window.addEventListener('touchend', this.stopDragging);
	}

	private unbindOnMouseClickEvents() {
		window.removeEventListener('mousemove', this.drag);
		window.removeEventListener('touchmove', this.drag);
		window.removeEventListener('mouseup', this.stopDragging);
		window.removeEventListener('touchend', this.stopDragging);
	}

	resetMouseVariables() {
		this.dragStartTime = 0;
		this.dragStartPos = 0;
		this.currentMousePos = null;
		this.prevMousePos = null;
	}

	slideUp() {
		this.darkenedBg()!.nativeElement.style.opacity = '0.4';
		this.mainOverlay()!.nativeElement.style.pointerEvents = 'auto';

		this.objTranslate = { current: 100, target: 2 }; // Target 2vh, start at 100vh (bottom of page)
		this.updateDrawerPosition(600, false, 'expo.out');
	}

	closeOverlay() {
		this.darkenedBg()!.nativeElement.style.removeProperty('opacity');
		this.mainOverlay()!.nativeElement.style.removeProperty('pointer-events');

		if (document.body.style.overflow === 'hidden') {
			document.body.style.removeProperty('overflow');

			if (!this.wndSvc.isTouchDevice()) {
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

		this.bindOnMouseClickEvents();

		const currentTime = performance.now();
		this.resetMouseVariables();
		this.dragStartPos = this.getDragPosition(e);
		this.setPrevMousePosition(this.dragStartPos, currentTime);

		this.isDragging = true;
	}

	drag = (e: MouseEvent | TouchEvent) => {
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
	};

	stopDragging = () => {
		if (!this.isDragging) return;
		this.isDragging = false;

		if (this.prevMousePos === null || this.currentMousePos === null) return;

		this.unbindOnMouseClickEvents();

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
	};

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
				this.drawerMain()!.nativeElement.style.top =
					this.objTranslate.current + 'vh';
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
