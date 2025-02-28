import { Component } from '@angular/core';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styles: `
  .test {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0%;
  transform-origin: top;
  // background: rgba(0,0,0,0.5);
  background: var(--rainbow-bg);
  transform: rotateX(1deg);
}
// .test::before {
//   content: "";
//   width: 100%;
//   height: 1000%;
//   position: absolute;
//   top: 50%;
//   background-image: var(--bg);
//   transform-origin: top;
//   transform: rotateX(85deg);
// }
`
})
export class FooterComponent {

}
