import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VsSearchComponent } from '../vs-search/vs-search.component';
import anime from 'animejs';
import { ScrollObserverService } from '../../services/scroll-observer.service';

@Component({
  selector: 'top-bar',
  standalone: true,
  imports: [VsSearchComponent],
  templateUrl: './top-bar.component.html'
})
export class TopBarComponent {
  @ViewChild('topbar') set _tb(content: ElementRef) {
    this.topbar = content.nativeElement as HTMLDivElement;
  }
  topbar!: HTMLDivElement;

  @Input()
  themeBarStyle?: string; 

  @Output()
  themeButtonClicked: EventEmitter<boolean> = new EventEmitter();

  topbarExtended: boolean = true;

  constructor(private soSvc: ScrollObserverService) {}

  ngOnInit() {
    this.soSvc.scrollObservable.subscribe((newYval) => {
      this.trackTopBar(newYval);
    })
  }

  emitThemeBarClickedEvent() {
    this.themeButtonClicked.emit();
  }

  trackTopBar(newYval: number) {
    if (newYval > 50) {

      if (this.topbarExtended)
        this.playTopBarAnimation(false);

    } else {

      if (!this.topbarExtended)
        this.playTopBarAnimation(true);
      
    }
  }

  playTopBarAnimation(forward: boolean) {
    this.topbarExtended = forward;
    const newHeight = forward ? '10vh' : '5vh';

    const themeBarStyle = forward ? '' : 'padding: 0; padding-right: 10px; font-size: 1em';

    this.themeBarStyle = themeBarStyle;

    anime({
      targets: '#topbar',
      height: newHeight,
      duration: 100,
      easing: 'easeInOutQuad'
    })
  }
}
