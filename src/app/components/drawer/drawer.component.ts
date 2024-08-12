import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import anime from 'animejs';
import { Subject } from 'rxjs';

@Component({
  selector: 'drawer-component',
  standalone: true,
  imports: [],
  templateUrl: './drawer.component.html',
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

  @Input() closeEvent?: Subject<any>;
  @Output() closed: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    if (this.closeEvent) {
      this.closeEvent.subscribe(() => {
        this.slideDown();
      })
    }
    this.slideUp();
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
}
