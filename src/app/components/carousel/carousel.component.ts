import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  Query,
  QueryList,
  ViewChild,
} from '@angular/core';
import { CarouselItemComponent } from '../carousel-item/carousel-item.component';
import anime from 'animejs';

interface MousePosition {
  x: number;
  time: number;
}

@Component({
  selector: 'carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent implements AfterViewInit {
  @ViewChild('carousel') set _carouselDiv(content: ElementRef) {
    this.carousel = content.nativeElement as HTMLDivElement;
  }
  carousel!: HTMLDivElement;

  @ViewChild('content') set _contentDiv(content: ElementRef) {
    this.contentDiv = content.nativeElement as HTMLDivElement;
  }
  contentDiv!: HTMLDivElement;

  @ContentChildren(CarouselItemComponent)
  children!: QueryList<any>;

  isDragging: boolean = false;
  dragStartTime: number = 0;
  dragStartPos: number = 0;
  translatePos: number = 0;
  carouselRect!: DOMRect;
  carouselBounds!: [number, number];
  private currentMousePos: MousePosition | null = { x: 0, time: 0 };
  private prevMousePos: MousePosition | null = { x: 0, time: 0 };

  ngOnInit() {
    window.addEventListener('resize', () => this.onWindowSizeChange());
    this.children.changes.subscribe((children: QueryList<any>) => {
      this.childrenChanged(children);
    });
  }

  onWindowSizeChange() {
    this.carouselRect = this.carousel.getBoundingClientRect();
    this.carouselBounds = [
      this.contentDiv.clientWidth * 0.8,
      this.contentDiv.clientWidth * 0.1,
    ];
  }

  ngAfterViewInit(): void {
    this.carousel.addEventListener(
      'touchstart',
      (event: MouseEvent | TouchEvent) => this.startDragging(event)
    );
    this.carousel.addEventListener(
      'touchmove',
      (event: MouseEvent | TouchEvent) => this.drag(event)
    );
    this.carousel.addEventListener(
      'touchend',
      (event: MouseEvent | TouchEvent) => this.stopDragging()
    );

    this.childrenChanged(this.children);
    this.onWindowSizeChange();
  }

  childrenChanged(children: QueryList<any>) {
    children.forEach((child) => {
      console.log('YOOO');
    });
  }
  getDragPosition(e: MouseEvent | TouchEvent): number {
    if (e instanceof TouchEvent) {
      return e.changedTouches[0].clientX - this.carouselRect.left;
    } else {
      return e.clientX - this.carouselRect.left;
    }
  }

  setPrevMousePosition(x: number, time: number): void {
    if (this.currentMousePos)
      this.prevMousePos = { ...this.currentMousePos };

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

    this.dragStartPos = this.getDragPosition(e);
    this.setPrevMousePosition(this.dragStartPos, e.timeStamp);
  }

  drag(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    const offsetX = this.getDragPosition(e);
    const dragDistance = offsetX - this.dragStartPos;

    this.translatePos += dragDistance;
    this.dragStartPos = offsetX;

    this.updateCarouselPosition(150);
    this.setPrevMousePosition(offsetX, e.timeStamp);
  }

  stopDragging(): void {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (this.prevMousePos === null || this.currentMousePos === null) return;

    const { x: curX, time: curTime } = this.currentMousePos;
    const { x: prevX, time: prevTime } = this.prevMousePos;

    console.log(curX, prevX)

    const dt = curTime - prevTime;
    const dx = curX - prevX;

    const vel = Math.round((dx / dt) * 100);
    this.translatePos += vel;
    this.translatePos = Math.max(
      Math.min(this.translatePos, this.carouselBounds[1]),
      -this.carouselBounds[0]
    );

    this.updateCarouselPosition(750);
  }

  private updateCarouselPosition(duration: number): void {
    anime({
      targets: this.carousel,
      translateX: this.translatePos,
      duration: duration,
      easing: 'easeOutExpo',
    });
  }
}
