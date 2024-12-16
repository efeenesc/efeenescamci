import { Component, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { VsThemeService } from '../../services/vs-theme.service';
import * as vst from '../../types/vs-types';
import { VsCardComponent } from '../vs-card/vs-card.component';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { ColorScheme } from '../../classes/colorscheme';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
    selector: 'vs-menu',
    imports: [FormsModule, ReactiveFormsModule, VsCardComponent, MagnifyingGlassComponent, SkeletonLoaderComponent],
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
export class VsMenuComponent implements OnDestroy {
  @ViewChild('themebtn') themeBtn!: HTMLElement;

  @ViewChildren(VsCardComponent) cards!: QueryList<VsCardComponent>;

  results?: vst.VSExtension;
  searchControl!: FormControl;
  searchDebounce: number = 500;
  searchFilter: vst.VSFilterBody = new vst.VSFilterBody();
  featuredThemes!: vst.VSResultBody | null;
  searchResults!: vst.VSResultBody | null;
  searching: boolean = false;
  downloadPercent: number = 0;
  variants: ColorScheme[] = [];
  currentVariantName: string = '';
  viewingVariants: boolean = false;

  constructor(
    private lss: LocalStorageService,
    private vsSvc: VsThemeService
  ) {}

  ngOnDestroy(): void {
    console.log("Destroyed");
    this.cards.forEach((item) => {
      item.cancelThemeChange();
    })
  }

  ngOnInit() {
    this.variants = this.vsSvc.getLocalThemeVariants() || [];

    this.searchControl = new FormControl('');
    this.searchControl.valueChanges
      .pipe(debounceTime(this.searchDebounce), distinctUntilChanged())
      .subscribe((query: string) => {
        this.searching = true;

        if (query === '') {
          this.searchResults = this.featuredThemes;
          return;
        }
        
        this.searchVSMarketplace(query)
        .then(() => this.searching = false);
      });
    this.getFeaturedThemes();
      
    this.lss.valueChanges.subscribe((newVal) => {
      if (newVal.key === "theme_name") {
        setTimeout(() => this.variants = this.vsSvc.getLocalThemeVariants() || [], 0);
      }
        
    })
    this.vsSvc.activeThemeVariantName.subscribe((newVariant) => { this.currentVariantName = newVariant; console.log(newVariant); });
  }

  showVariantPanel() {
    this.viewingVariants = true;
  }

  hideVariantPanel() {
    if (this.viewingVariants)
      this.viewingVariants = false;
  }

  changeVariant(variantName: string) {
    const variant = this.variants.find((v) => v.name === variantName);
    if (!variant) return;
    this.vsSvc.setThemeVariant(variant);
  }

  async getFeaturedThemes() {
    const requestedFilter = new vst.VSFilterBody;
    const results = await this.vsSvc.getFilteredResults(requestedFilter, 'small');
    this.featuredThemes = results;
    this.searchResults = results;
  }

  async searchVSMarketplace(query: string) {
    this.searchFilter.addSearchFilter(query);
    this.searchResults = await this.vsSvc.getFilteredResults(this.searchFilter);
  }
}