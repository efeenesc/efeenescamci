import {
	ChangeDetectionStrategy,
	Component,
	ViewChild,
	ElementRef,
	AfterViewInit,
	OnDestroy,
	signal,
} from '@angular/core';
import { ThemesComponent } from './sections/themes/themes.component';
import { ExperimentsComponent } from './sections/experiments/experiments.component';
import { BlogSectionComponent } from './sections/blog/blog.component';
import { LivePhotoComponent } from '../../components/live-photo/live-photo.component';
import { HeadingDirective } from '@directives/heading.directive';
import { PortalContentDirective } from '@directives/portal.directive';

@Component({
	selector: 'home-page',
	imports: [
		ThemesComponent,
		ExperimentsComponent,
		BlogSectionComponent,
		LivePhotoComponent,
		HeadingDirective,
		PortalContentDirective,
	],
	templateUrl: './home-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
	@ViewChild('heroBackground') heroBackground!: ElementRef<HTMLDivElement>;

	placeholderHeight = signal(320); // default
	private resizeObserver?: ResizeObserver;

	ngAfterViewInit() {
		if (this.heroBackground?.nativeElement) {
			this.resizeObserver = new ResizeObserver(() => {
				this.updatePlaceholderHeight();
			});
			this.resizeObserver.observe(this.heroBackground.nativeElement);

			// Initial height update
			setTimeout(() => this.updatePlaceholderHeight(), 0);
		}
	}

	ngOnDestroy() {
		this.resizeObserver?.disconnect();
	}

	private updatePlaceholderHeight() {
		if (this.heroBackground?.nativeElement) {
			const height = this.heroBackground.nativeElement.offsetHeight;
			if (height !== this.placeholderHeight()) {
				this.placeholderHeight.set(height);
			}
		}
	}
}
