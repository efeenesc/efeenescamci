import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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
    document.getElementById('darkenedBg')!.style.opacity = '0.4';
    
    anime({
      targets: '#drawerMain',
      top: '5vh',
      easing: 'easeOutExpo',
      duration: 600,
      complete: () => {
        // this.slideDown();
      }
    })
  }

  slideDown() {
    document.getElementById('darkenedBg')!.style.removeProperty('opacity');
    document.body.style.removeProperty('overflow');

    anime({
      targets: '#drawerMain',
      top: '100vh',
      easing: 'easeInQuad',
      duration: 200
    })
  }

  clickedOutside() {
    this.slideDown();
  }
}
