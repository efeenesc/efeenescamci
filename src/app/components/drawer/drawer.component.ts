import { afterNextRender, Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import anime from 'animejs';
import { Subject } from 'rxjs';
import { XMarkComponent } from "../../icons/xmark/xmark.component";
import { WindowObserverService } from '../../services/window-observer.service';
import { WINDOW } from '../../classes/windowinjection';

interface VerticalMousePosition {
  y: number;
  time: number;
}
@Component({
  selector: 'drawer-component',
  standalone: true,
  imports: [XMarkComponent],
  templateUrl: './drawer.component.html'
})
export class DrawerComponent {
  @ViewChild('drawerMain') set _dm(content: ElementRef) {
    this.drawerMain = content.nativeElement as HTMLDivElement;
  }
  drawerMain!: HTMLDivElement;

  @ViewChild('darkenedBg') set _db(content: ElementRef) {
    this.darkenedBg = content.nativeElement as HTMLDivElement;
  }
  darkenedBg!: HTMLDivElement;

  @Input()
  closeEvent?: Subject<any>;
  
  @Output()
  closed: EventEmitter<any> = new EventEmitter();

  isDragging: boolean = false;
  dragStartTime: number = 0;
  dragStartPos: number = 0;
  translatePos: number = 0;
  elTranslatePos: {current: number} = {current: 0};
  carouselBounds: [number, number] = [90, 2];
  private currentMousePos: VerticalMousePosition | null = { y: 0, time: 0 };
  private prevMousePos: VerticalMousePosition | null = { y: 0, time: 0 };
  private wnd = inject(WINDOW);

  constructor(private woSvc : WindowObserverService) {
    afterNextRender(() => {
      document.body.style.overflow = 'hidden';
      if (this.closeEvent) {
        this.closeEvent.subscribe(() => {
          this.slideDown();
        })
      }
      this.slideUp();

      this.wnd.addEventListener('touchstart', (event) => this.startDragging(event));
      this.woSvc.mousePositionObservable.subscribe((event) => this.drag(event));
      this.woSvc.mouseUpObservable.subscribe(() => this.stopDragging());
    })
  }

  ngOnDestroy() {
    if (this.closeEvent) {
      this.closeEvent.unsubscribe();
    }
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

    this.translatePos = 2; // Set target to 2vh
    this.elTranslatePos = {current: 100}; // Set current position to 100vh - bottom of page
    this.updateCarouselPosition(600, false, 'easeOutExpo');
  }

  closeOverlay() {
    const dkbg = document.getElementById('darkenedBg')!;
    const overlay = document.getElementById('mainOverlay')!;
    dkbg.style.removeProperty('opacity');
    overlay.style.removeProperty('pointer-events');
    document.body.style.removeProperty('overflow');
  }

  slideDown() {
    this.translatePos = 100;
    this.updateCarouselPosition(300, true, 'easeInQuad');
  }

  clickedOutside() {
    this.isDragging = false;
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

  startDragging(e: MouseEvent | TouchEvent): void {
    if ((e.target as HTMLDivElement).id !== "grabberDiv" &&
        (e.target as HTMLDivElement).id !== "grabberImg"
      )
      return;
      
    if (this.isDragging) return;

    this.resetMouseVariables();
    this.dragStartPos = this.getDragPosition(e);
    this.setPrevMousePosition(this.dragStartPos, e.timeStamp);

    this.isDragging = true;
  }

  drag(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    const offsetY = this.getDragPosition(e);

    const dragDistance = offsetY - this.dragStartPos;

    this.translatePos += dragDistance * 0.1;
    this.dragStartPos = offsetY;
    let closeAfter = false;

    if (this.translatePos > this.carouselBounds[0]) {
      this.translatePos = 100;
      closeAfter = true
    }

    this.updateCarouselPosition(150, closeAfter);
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

    const vel = Math.round((dy / dt) * 2);
    this.translatePos += vel;

    let closeAfter = false;

    if (this.translatePos > this.carouselBounds[0]) {
      this.translatePos = 110;
      closeAfter = true;
    } else {
      this.translatePos = Math.max(this.translatePos, this.carouselBounds[1]);
    }
    
    this.resetMouseVariables();
    this.updateCarouselPosition(750, closeAfter);
  }

  private updateCarouselPosition(duration: number, closeAfter: boolean = false, easing: string = 'easeOutExpo'): void {
    if (closeAfter)
      this.closeOverlay();

    anime({
      targets: this.elTranslatePos,
      current: this.translatePos,
      duration,
      easing,
      update: (() => {
        this.drawerMain.style.top = this.elTranslatePos.current + 'vh';
      }),
      complete: () => {
        if (closeAfter) {
          this.closed.emit();
          this.resetMouseVariables();
          this.translatePos = 0;
        }
      }
    });
  }
}
