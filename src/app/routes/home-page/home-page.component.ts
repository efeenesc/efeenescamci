import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class HomePageComponent {}
