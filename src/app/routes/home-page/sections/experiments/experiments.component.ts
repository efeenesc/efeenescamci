import { Component } from '@angular/core';
import { SkeletonLoaderComponent } from "../../../../components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'experiments-section',
  imports: [
    SkeletonLoaderComponent
],
  templateUrl: './experiments.component.html',
  styles: `
  :host {
    display: flex;
    width: 100%;
  }
  `,
})
export class ExperimentsComponent {
  expCards = [
    {
      id: 0,
      icon_url: "https://github.com/efeenesc/recap/raw/master/assets/appicon.png",
      name: "Recap",
      desc: "Get a Recap of your daily activity. Built using Go and Wails.",
      source_url: "https://github.com/efeenesc/recap",
      read_more: "",
      loaded: false
    },
    {
      id: 1,
      icon_url: "https://github.com/efeenesc/c-twig-server/raw/main/assets/icon.png",
      name: "c-twig-server",
      desc: "C server as durable as a twig found in the wild. Educational purposes only.",
      source_url: "https://github.com/efeenesc/c-twig-server",
      read_more: "",
      loaded: false
    },
    {
      id: 2,
      icon_url: "assets/efeenescamci-logo.png",
      name: "efeenescamci",
      desc: "This website. Built with Angular.",
      source_url: "https://github.com/efeenesc/efeenescamci",
      read_more: "",
      loaded: false
    }
  ]

  constructor() {}

  setLoaded(id: number) {
    this.expCards[id].loaded = true;
  }
}
