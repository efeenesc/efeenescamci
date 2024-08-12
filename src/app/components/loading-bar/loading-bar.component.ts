import { Component, OnInit, Input, ViewChild } from '@angular/core';
import anime from 'animejs';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'loading-bar',
  standalone: true,
  imports: [],
  template:`
  <div class="w-full h-full rounded-full outline outline-1 outline-border1 bg-dark overflow-hidden block items-center justify-center">
    <div id="progressbar" class="h-full bg-blue-500 w-0"></div>
  </div>
  `
})
export class LoadingBarComponent {
  @Input() set progress(v: number | undefined) { if (v === undefined) return; this.pProgress = v; this.progress$.next(null); }
  private pProgress!: number
  protected readonly progress$ = new ReplaySubject(1);

  ngOnInit() {
    this.progress$.subscribe(() => {
      anime({
        targets: "#progressbar",
        width: this.pProgress + "%",
        duration: 50,
        easing: 'easeInOutQuad'
      })
    })
  }

  testComponent() {
    setTimeout(() => {
      this.progress = 0;
    }, 100)
    setTimeout(() => {
      this.progress = 50;
    }, 1000)
    setTimeout(() => {
      this.progress = 100;
    }, 2000)
  }
}
