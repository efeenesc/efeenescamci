import { Component } from '@angular/core';

@Component({
  selector: 'projects-section',
  standalone: true,
  imports: [],
  templateUrl: './projects.component.html',
  styles: `
  :host {
    display: 'flex';
    height: 100%;
    width: 100%;
  }
  `
})
export class ProjectsComponent {

}
