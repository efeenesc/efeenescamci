import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemesComponent } from './sections/themes/themes.component';
import { ExperimentsComponent } from './sections/experiments/experiments.component';
import { BlogSectionComponent } from './sections/blog/blog.component';
import { LivePhotoComponent } from '../../components/live-photo/live-photo.component';
import { HeadingDirective } from '@directives/heading.directive';
import { PortalContentDirective } from '@directives/portal.directive';
import { AboutComponent } from './sections/about/about.component';
import { TechnologiesComponent } from './sections/technologies/technologies.component';

@Component({
	selector: 'home-page',
	imports: [
		ThemesComponent,
		ExperimentsComponent,
		BlogSectionComponent,
		LivePhotoComponent,
		HeadingDirective,
		PortalContentDirective,
		AboutComponent,
		TechnologiesComponent,
	],
	templateUrl: './home-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
