import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'site-logo',
  imports: [],
  template: `<div class="h-full w-auto aspect-square hover:cursor-pointer">
    <svg
      viewBox="0 0 101 101"
      xmlns="http://www.w3.org/2000/svg"
      id="website-logo-svg"
      (mouseover)="this.onMouseOver()"
      (mouseleave)="this.restoreLogoPos()"
      (click)="this.onClick()"
    >
      <path
        id="website-logo-path"
        fill-rule="evenodd"
        clip-rule="evenodd"
        fill="#ffffffff"
        stroke="#ffffff"
        style="stroke-dashoffset: -100;"
        d="M 50.5 3.6 C 24.598 3.6 3.6 24.598 3.6 50.5 C 3.6 76.402 24.598 97.4 50.5 97.4 C 76.402 97.4 97.4 76.402 97.4 50.5 C 97.4 24.598 76.402 3.6 50.5 3.6 Z M 0.6 50.5 C 0.6 22.941 22.941 0.6 50.5 0.6 C 78.059 0.6 100.4 22.941 100.4 50.5 C 100.4 78.059 78.059 100.4 50.5 100.4 C 22.941 100.4 0.6 78.059 0.6 50.5 Z M 23.377 45.5 L 77.623 45.5 C 75.271 32.658 64.022 22.924 50.5 22.924 C 36.979 22.924 25.729 32.658 23.377 45.5 Z M 88.094 50.504 L 88.047 51.961 C 88.067 51.465 88.076 50.978 88.076 50.5 C 88.076 29.748 71.252 12.924 50.5 12.924 C 29.748 12.924 12.924 29.748 12.924 50.5 C 12.924 71.252 29.748 88.076 50.5 88.076 C 63.012 88.076 74.093 81.957 80.915 72.57 L 80.917 72.568 C 82.314 70.643 83.534 68.581 84.553 66.404 L 75.495 62.165 C 74.748 63.762 73.853 65.276 72.826 66.691 C 67.805 73.6 59.676 78.076 50.5 78.076 C 36.979 78.076 25.729 68.342 23.377 55.5 L 88.01 55.106 L 88.094 50.504 Z"
      />
    </svg>
  </div>`,
})
export class SiteLogoComponent {
  @Input('animate') animate: boolean = true;
  restoreTween?: gsap.core.Tween;

  constructor(private router: Router) {}

  onClick() {
    if (this.animate) this.playClickAnimation();

    if (this.router.url !== '/') this.router.navigateByUrl('/');
  }

  onMouseOver() {
    if (this.animate) this.playHoverAnimation();
  }

  playClickAnimation() {
    gsap.to('#website-logo-svg', {
      scale: 0.8,
      rotateZ: (Math.random() - 0.5) * 100, // Rotate different amounts to the left or right
      duration: 0.1,
      ease: 'power2.out',
      onComplete: () => {
        this.restoreLogoPos();
      },
    });
  }

  restoreLogoPos() {
    if (this.restoreTween) this.restoreTween.kill();

    this.restoreTween = gsap.to('#website-logo-svg', {
      scale: 1,
      rotateZ: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
  }

  private playHoverAnimation() {
    gsap.to('#website-logo-svg', {
      color: 0.95,
      duration: 0.1,
      ease: 'power2.inOut',
    });
  }
}
