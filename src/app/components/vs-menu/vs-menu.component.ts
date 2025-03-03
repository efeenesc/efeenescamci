import {
  Component,
  OnDestroy,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
  OnInit,
  ElementRef,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, from, of, Subscription, switchMap } from 'rxjs';
import { VsThemeService } from '../../services/vs-theme.service';
import * as vst from '../../types/vs-types';
import { VsCardComponent } from '../vs-card/vs-card.component';
import { MagnifyingGlassComponent } from '../../icons/magnifying-glass/magnifying-glass.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { ColorScheme } from '../../classes/colorscheme';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'vs-menu',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    VsCardComponent,
    MagnifyingGlassComponent,
    SkeletonLoaderComponent,
  ],
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
      display: none;
    }
  `,
})
export class VsMenuComponent implements OnDestroy, OnInit {
  @ViewChild('themebtn') themeBtn!: ElementRef<HTMLElement>;
  @ViewChildren(VsCardComponent) cards!: QueryList<VsCardComponent>;

  // Removed unused property: results?: vst.VSExtension;
  searchControl!: FormControl;
  searchDebounce = 100;
  searchFilter: vst.VSFilterBody = new vst.VSFilterBody();
  featuredThemes!: vst.VSResultBody | null;
  searchResults = signal<vst.VSResultBody | null>(null);
  searching = signal(false);
  downloadPercent = 0;
  variants = signal<ColorScheme[]>([]);
  currentVariantName = signal('');
  viewingVariants = signal(false);

  private subscriptions = new Subscription();

  constructor(
    private lss: LocalStorageService,
    private vsSvc: VsThemeService
  ) {
  }

  ngOnInit() {
    this.variants.set(this.vsSvc.getLocalThemeVariants() || []);

    this.searchControl = new FormControl('');
    const searchSub = this.searchControl.valueChanges
    .pipe(
      debounceTime(this.searchDebounce),
      distinctUntilChanged(),
      switchMap((query: string) => {
        this.searching.set(true);
        if (!query) {
          this.searching.set(false);
          return of(this.featuredThemes);
        }
        // Reset filter and create a new observable for search results.
        this.searchFilter = new vst.VSFilterBody();
        this.searchFilter.addSearchFilter(query);
        return from(this.vsSvc.getFilteredResults(this.searchFilter));
      })
    ).subscribe((results: vst.VSResultBody | null) => {
      this.searchResults.set(results);
      this.searching.set(false);
    });

    this.subscriptions.add(searchSub);

    this.subscriptions.add(searchSub);

    this.getFeaturedThemes();

    const lssSub = this.lss.valueChanges.subscribe((newVal) => {
      if (newVal.key === 'theme_name') {
        setTimeout(() => {
          this.variants.set(this.vsSvc.getLocalThemeVariants() || []);
        }, 0);
      }
    });
    this.subscriptions.add(lssSub);

    const variantSub = this.vsSvc.activeThemeVariantName.subscribe((newVariant) => {
      this.currentVariantName.set(newVariant);
    });
    this.subscriptions.add(variantSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.cards.forEach((item) => {
      item.cancelThemeChange();
    });
  }

  showVariantPanel() {
    this.viewingVariants.set(true);
  }

  hideVariantPanel() {
    if (this.viewingVariants()) {
      this.viewingVariants.set(false);
    }
  }

  changeVariant(variantName: string) {
    const variant = this.variants().find((v) => v.name === variantName);
    if (!variant) return;
    this.vsSvc.setThemeVariant(variant);
  }

  async getFeaturedThemes() {
    const requestedFilter = new vst.VSFilterBody();
    const results = await this.vsSvc.getFilteredResults(requestedFilter);
    this.featuredThemes = results;
    this.searchResults.set(results);
  }

  async searchVSMarketplace(query: string) {
    this.searchFilter.addSearchFilter(query);
    const results = await this.vsSvc.getFilteredResults(this.searchFilter);
    this.searchResults.set(results);
  }
}
