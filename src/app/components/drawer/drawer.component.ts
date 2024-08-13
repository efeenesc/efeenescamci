import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import anime from 'animejs';
import { Subject } from 'rxjs';
import { XMarkComponent } from "../../icons/xmark/xmark.component";

interface VerticalMousePosition {
  y: number;
  time: number;
}
@Component({
  selector: 'drawer-component',
  standalone: true,
  imports: [XMarkComponent],
  templateUrl: './drawer.component.html',
})
export class DrawerComponent implements AfterViewInit {
  @ViewChild('drawerMain') set _dm(content: ElementRef) {
    this.drawerMain = content.nativeElement as HTMLDivElement;
  }
  drawerMain!: HTMLDivElement;

  @ViewChild('darkenedBg') set _db(content: ElementRef) {
    this.darkenedBg = content.nativeElement as HTMLDivElement;
  }
  darkenedBg!: HTMLDivElement;

  @Input() closeEvent?: Subject<any>;
  @Output() closed: EventEmitter<any> = new EventEmitter();

  isDragging: boolean = false;
  dragStartTime: number = 0;
  dragStartPos: number = 0;
  translatePos: number = 0;
  carouselRect!: DOMRect;
  carouselBounds!: [number, number];
  private currentMousePos: VerticalMousePosition | null = { y: 0, time: 0 };
  private prevMousePos: VerticalMousePosition | null = { y: 0, time: 0 };

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    if (this.closeEvent) {
      this.closeEvent.subscribe(() => {
        this.slideDown();
      })
    }
    this.slideUp();
  }

  ngAfterViewInit(): void {
      this.onWindowSizeChange();
  }

  onWindowSizeChange() {
    this.carouselRect = this.drawerMain.getBoundingClientRect();
    this.carouselBounds = [
      this.drawerMain.clientHeight * 0.8,
      this.drawerMain.clientHeight * 0.1,
    ];
  }

  ngOnDestroy() {
    if (this.closeEvent) {
      this.closeEvent.unsubscribe();
    }
  }

  slideUp() {
    const dkbg = document.getElementById('darkenedBg')!;
    const overlay = document.getElementById('mainOverlay')!;
    dkbg.style.opacity = '0.4';
    overlay.style.pointerEvents = 'auto';
    
    anime({
      targets: '#drawerMain',
      top: '5vh',
      easing: 'easeOutExpo',
      duration: 600
    })
  }

  slideDown() {
    const dkbg = document.getElementById('darkenedBg')!;
    const overlay = document.getElementById('mainOverlay')!;
    dkbg.style.removeProperty('opacity');
    overlay.style.removeProperty('pointer-events');
    document.body.style.removeProperty('overflow');

    anime({
      targets: '#drawerMain',
      top: '100vh',
      easing: 'easeInQuad',
      duration: 300,
      complete: () => {
        this.closed.emit();
      }
    })
  }

  clickedOutside() {
    this.slideDown();
  }

  getDragPosition(e: MouseEvent | TouchEvent): number {
    if (e instanceof TouchEvent) {
      return e.changedTouches[0].clientY;
    } else {
      return e.clientY;
    }
  }

  setPrevMousePosition(y: number, time: number): void {
    if (this.currentMousePos)
      this.prevMousePos = { ...this.currentMousePos };

    this.currentMousePos = { y, time };
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

    const offsetY = this.getDragPosition(e);
    const dragDistance = offsetY - this.dragStartPos;

    this.translatePos += dragDistance;
    this.dragStartPos = offsetY;

    this.updateCarouselPosition(150);
    this.setPrevMousePosition(offsetY, e.timeStamp);
  }

  stopDragging(): void {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (this.prevMousePos === null || this.currentMousePos === null) return;

    const { y: curY, time: curTime } = this.currentMousePos;
    const { y: prevY, time: prevTime } = this.prevMousePos;

    console.log(curY, prevY)

    const dt = curTime - prevTime;
    const dx = curY - prevY;

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
      targets: this.drawerMain,
      top: this.translatePos,
      duration: duration,
      easing: 'easeOutExpo',
    });
  }
}
