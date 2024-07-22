import { AfterViewInit, Component, ContentChildren, Query, QueryList } from '@angular/core';
import { CarouselItemComponent } from '../carousel-item/carousel-item.component';

@Component({
  selector: 'carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements AfterViewInit {
  @ContentChildren(CarouselItemComponent)
  children!: QueryList<any>;

  ngOnInit() {
    this.children.changes.subscribe((children: QueryList<any>) => {
      this.childrenChanged(children);
    })
  }

  ngAfterViewInit(): void {
    this.childrenChanged(this.children);
  }

  childrenChanged(children: QueryList<any>) {
    children.forEach((child) => {
      console.log("YOOO")
    })
  }
}
