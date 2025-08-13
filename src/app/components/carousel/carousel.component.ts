import {
	AfterViewInit,
	Component,
	ElementRef,
	ViewChild,
	OnInit,
} from '@angular/core';
import { WindowObserverService } from '../../services/window-observer.service';
import gsap from 'gsap';

interface MousePosition {
	x: number;
	time: number;
}

@Component({
	selector: 'carousel',
	imports: [],
	templateUrl: './carousel.component.html',
})
export class CarouselComponent implements AfterViewInit, OnInit {
	@ViewChild('carousel') set _carouselDiv(content: ElementRef) {
		this.carousel = content.nativeElement as HTMLDivElement;
	}
	carousel!: HTMLDivElement;

	@ViewChild('content') set _contentDiv(content: ElementRef) {
		this.contentDiv = content.nativeElement as HTMLDivElement;
	}
	contentDiv!: HTMLDivElement;

	isDragging = false;
	dragStartTime = 0;
	dragStartPos = 0;
	translatePos = 0;
	elTranslatePos: { current: number } = { current: 0 };
	carouselRect!: DOMRect;
	carouselBounds!: [number, number];
	private currentMousePos: MousePosition | null = { x: 0, time: 0 };
	private prevMousePos: MousePosition | null = { x: 0, time: 0 };
	private carouselTween?: gsap.core.Tween;
	private supressClick = false;

	constructor(private woSvc: WindowObserverService) {}

	ngOnInit() {
		window.addEventListener('resize', () => this.onWindowSizeChange());
		this.woSvc.mouseUpObservable.subscribe(() => this.stopDragging());
		this.woSvc.mousePositionObservable.subscribe((event) => this.drag(event));
	}

	onWindowSizeChange() {
		this.carouselRect = this.carousel.getBoundingClientRect();
		this.carouselBounds = [this.contentDiv.clientWidth * 0.9, 0];
	}

	ngAfterViewInit(): void {
		// this.carousel.addEventListener(
		//   'touchstart',
		//   (event: MouseEvent | TouchEvent) => this.startDragging(event)
		// );
		this.carousel.addEventListener(
			'click',
			(event: MouseEvent | TouchEvent) => this.onClick(event),
			true,
		);

		this.onWindowSizeChange();
	}

	getDragPosition(e: MouseEvent | TouchEvent): number {
		if (window.TouchEvent && e instanceof TouchEvent) {
			return e.changedTouches[0].clientX - this.carouselRect.left;
		} else {
			return (e as MouseEvent).clientX - this.carouselRect.left;
		}
	}

	setPrevMousePosition(x: number, time: number): void {
		if (this.currentMousePos) this.prevMousePos = { ...this.currentMousePos };

		this.currentMousePos = { x, time };
	}

	clearMousePosition() {
		this.prevMousePos = null;
		this.currentMousePos = null;
	}

	startDragging(e: MouseEvent | TouchEvent): void {
		if (this.isDragging) return;
		this.isDragging = true;
		this.clearMousePosition();

		const currentTime = performance.now();
		this.dragStartPos = this.getDragPosition(e);
		this.setPrevMousePosition(this.dragStartPos, currentTime);
	}

	drag(e: MouseEvent | TouchEvent): void {
		if (!this.isDragging) return;
		this.supressClick = true;

		const offsetX = this.getDragPosition(e);
		const currentTime = performance.now();
		const dragDistance = offsetX - this.dragStartPos;

		this.translatePos += dragDistance;
		this.dragStartPos = offsetX;

		this.updateCarouselPosition(150);
		this.setPrevMousePosition(offsetX, currentTime);
	}

	stopDragging(): void {
		if (!this.isDragging) return;
		this.isDragging = false;
		setTimeout(() => (this.supressClick = false), 0);

		if (this.prevMousePos === null || this.currentMousePos === null) return;

		const { x: curX, time: curTime } = this.currentMousePos;
		const { x: prevX, time: prevTime } = this.prevMousePos;

		const dt = curTime - prevTime;
		const dx = curX - prevX;

		const vel = Math.round((dx / dt) * 100);
		this.translatePos += vel;
		this.translatePos = Math.max(
			Math.min(this.translatePos, this.carouselBounds[1]),
			-this.carouselBounds[0],
		);

		this.updateCarouselPosition(750);
	}

	onClick(e: MouseEvent | TouchEvent): void {
		if (this.supressClick) {
			e.stopImmediatePropagation();
			e.preventDefault();
		}
	}

	private updateCarouselPosition(duration: number): void {
		if (this.carouselTween) this.carouselTween.kill();

		this.carouselTween = gsap.to(this.elTranslatePos, {
			current: this.translatePos,
			duration: duration / 1000, // Convert milliseconds to seconds
			ease: 'expo.out',
			onUpdate: () => {
				const newStyle = `translateX(${this.elTranslatePos.current}px)`;
				gsap.set(this.carousel, {
					transform: newStyle,
					webkitTransform: newStyle,
				});
			},
		});
	}
}
