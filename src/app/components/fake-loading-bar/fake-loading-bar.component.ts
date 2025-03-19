import { Component, effect, ElementRef, signal, ViewChild } from '@angular/core';
import { FakeLoadingBarService, LoadingState } from '../../services/fake-loading-bar.service';
import gsap from "gsap";

@Component({
  selector: 'fake-loading-bar',
  imports: [],
  templateUrl: './fake-loading-bar.component.html',
})
export class FakeLoadingBarComponent {
  @ViewChild('loadingbar') set _lb(content: ElementRef) {
    this.loadingBar = content.nativeElement as HTMLDivElement;
  }
  loadingBar!: HTMLDivElement;
  
  showLoading = signal<boolean>(true);
  loadingProgress = signal<number>(0);
  stopLoadingTimeout: ReturnType<typeof setTimeout> | null = null;
  private loadingTween?: gsap.core.Tween;

  constructor(private fakeLoadingBarSvc: FakeLoadingBarService) {
    fakeLoadingBarSvc.state.subscribe((state) => {
      if (state === LoadingState.STARTED) {
        this.showLoading.set(true);
        if (this.stopLoadingTimeout) {
          clearTimeout(this.stopLoadingTimeout);
          this.stopLoadingTimeout = null;
        }
      } else {
        clearTimeout(this.stopLoadingTimeout as unknown as number);
        this.stopLoadingTimeout = setTimeout(() => {
          this.showLoading.set(false);
        }, 100);
      }
    })

    fakeLoadingBarSvc.value.subscribe((val) => {
      this.loadingProgress.set(val);
    })
    
    effect(() => {
      this.updateLoadingBar(this.loadingProgress());
    })

    effect(() => {
      if (this.showLoading()) {
        this.showLoadingBar();
      } else {
        this.hideLoadingBar();
      }
    })
  }

  showLoadingBar() {
    if (this.loadingBar) {
      if (this.loadingTween?.isActive()) {
        gsap.killTweensOf(this.loadingTween);
      }

      this.loadingBar.style.opacity = '1';
      this.loadingBar.style.width = '';
    };
  }

  updateLoadingBar(progress: number) {
    if (this.loadingTween?.isActive()) {
      gsap.killTweensOf(this.loadingTween);
    }

    this.loadingTween = gsap.to(this.loadingBar, {
      width: progress + '%',
      duration: 0.5,
      ease: 'expo.inOut',
    })
  }

  hideLoadingBar() {
    if (this.loadingTween?.isActive()) {
      gsap.killTweensOf(this.loadingTween);
    }

    gsap.to(this.loadingBar, {
      opacity: 0,
      duration: 0.5,
      ease: 'expo.inOut',
    })
  }
}
