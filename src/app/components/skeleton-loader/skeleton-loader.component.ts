import { Component } from '@angular/core';

@Component({
  selector: 'skeleton-loader',
  standalone: true,
  imports: [],
  styles: `
  div {
    background: linear-gradient(0deg, #ffffff00, #ffffff00, #bbbbbb52, #ffffff00, #ffffff00);
    background-size: 400% 400%;
    animation: gradient 1.5s ease infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 0% 100%;
    }
  }
  `,
  template: `
  <div class="w-full h-full"></div>
  `
})
export class SkeletonLoaderComponent {}
