import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { VsThemeService } from '../../services/vs-theme.service';
import * as vst from '../../types/vs-types';
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';
import { VsCardComponent } from '../vs-card/vs-card.component';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'vs-menu',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, LoadingBarComponent, VsCardComponent, MagnifyingGlassComponent, SkeletonLoaderComponent],
  templateUrl: './vs-menu.component.html',
  styles: `
  ::-webkit-scrollbar {
    background-color: var(--system);
    width: 5px;
    height: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background-color: var(--system-900);
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: #babac0;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-button {
    display:none;
  }`
})
export class VsMenuComponent {
  @ViewChild('themebtn') themeBtn!: HTMLElement;
  results?: vst.VSExtension;
  searchControl!: FormControl;
  searchDebounce: number = 500;
  searchFilter: vst.VSFilterBody = new vst.VSFilterBody();
  searchResults!: vst.VSResultBody | null;
  searching: boolean = false;
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
    this.getFeaturedThemes();
  }

  async getFeaturedThemes() {
    const requestedFilter = new vst.VSFilterBody;
    const results = await this.vsSvc.getFilteredResults(requestedFilter, 'small');
    this.searchResults = results;
  }

  async searchVSMarketplace(query: string) {
    this.searchFilter.addSearchFilter(query);
    this.searchResults = await this.vsSvc.getFilteredResults(this.searchFilter);
  }
}