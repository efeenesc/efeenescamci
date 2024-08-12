import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ScopeFinder } from '../../classes/scopefinder';
import { VsThemeService } from '../../services/vs-theme.service';
import * as vst from '../../types/vs-types';
import anime from 'animejs';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';
import { GetSetObj } from '../../classes/getsetobj';
import { VsCardComponent } from '../vs-card/vs-card.component';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'vs-menu',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, LoadingBarComponent, VsCardComponent, MagnifyingGlassComponent, SkeletonLoaderComponent],
  templateUrl: './vs-menu.component.html'
})
export class VsMenuComponent {
  @ViewChild('themebtn') themeBtn!: HTMLElement;
  results?: vst.VSExtension;
  searchControl!: FormControl;
  searchDebounce: number = 500;
  searchFilter: vst.VSFilterBody = new vst.VSFilterBody();
  searchResults!: vst.VSResultBody | null;
  searching: boolean = false;
  displayLoading: GetSetObj<boolean> = new GetSetObj<boolean>(
    false,
    this.playLoadingAnimation
  );
  downloadPercent: number = 0;

  constructor(
    private vsSvc: VsThemeService
  ) {}

  ngOnInit() {
    this.searchControl = new FormControl('');
    this.searchControl.valueChanges
      .pipe(debounceTime(this.searchDebounce), distinctUntilChanged())
      .subscribe((query: string) => {
        this.searching = true;
        this.searchVSMarketplace(query)
        .then(() => this.searching = false);
      });
  }

  playLoadingAnimation(show: boolean) {
    const opacityChange = show ? '1' : '0';

    setTimeout(() => {
      anime({
        targets: '#extrablur',
        opacity: opacityChange,
        duration: 150,
        easing: 'easeInOutQuad',
      });
    }, 0);
  }

  // clickedOutside(event: MouseEvent) {
  //   if (!this.suppressClick) return;
  //   if (!(event.target as HTMLDivElement).id.includes("fullscreen")) return;
  //   this.fullscreen.value = false;

  //   setTimeout(() => {
  //     const widthChange = '-=5vw';

  //     anime({
  //       targets: '#themebtn',
  //       left: this.buttonCoords?.left,
  //       top: this.buttonCoords?.top,
  //       width: widthChange,
  //       height: '12vh',
  //       duration: 500,
  //       easing: 'easeInOutQuad',
  //       fontSize: '-=0.5em',
  //     }).finished.then(() => {
  //       document.getElementById('themebtn')!.style.removeProperty('left');

  //       setTimeout(() => {
  //         this.hoverState.value = false;
  //         setTimeout(() => {
  //           this.suppressClick = false;
  //           this.suppressHover = false;
  //         });
  //       }, 0);
  //     });
  //   }, 0);
  // }

  async searchVSMarketplace(query: string) {
    this.searchFilter.addSearchFilter(query);
    this.searchResults = await this.vsSvc.getFilteredResults(this.searchFilter);
  }

  async themeSelected(ext: vst.VSExtension, showLoading: boolean = false) {
    if (showLoading) this.displayLoading.value = true;

    try {
      await this.vsSvc.changeTheme(ext, (loaded, total) => {
        this.downloadPercent = Math.round((loaded / total) * 100);
      });
    } catch (err) {
      console.error('ERROR', err);
    } finally {
      if (showLoading) {
        this.displayLoading.value = false;
        this.downloadPercent = 0;
      }
    }
  }
}