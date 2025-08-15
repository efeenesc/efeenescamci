import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VSExtension, VSFilterBody } from '@apptypes/vs-types';
import { VsThemeService } from '@services/vs-theme.service';
import { LocalStorageService } from '@services/local-storage.service';
import {
	VsCardComponent,
	VsCardStyle,
} from '@components/vs-card/vs-card.component';
import { DeferLoadDirective } from '@classes/deferload';
import beigeIcon from '@icons/beige-theme-icon/beigeiconb64';

@Component({
	selector: 'themes-section',
	standalone: true,
	imports: [VsCardComponent, DeferLoadDirective],
	templateUrl: './themes.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		:host {
			display: flex;
			width: 100%;
		}
	`,
})
export class ThemesComponent {
	favoriteThemes = [
		'0',
		'c56274bf-4605-4ffe-8302-a1c94ca32e76', // Noir
		'f5d7ffda-c1d6-4070-ba80-803c705a1ee6', // Monokai Pro
		'469aea7c-9f56-40d2-bf75-2874886663be', // C64 Purple Pro
		'043cbe69-59a0-4952-a548-2366587a1226', // GitHub Theme
		'26a529c9-2654-4b95-a63f-02f6a52429e6', // One Dark Pro
	];
	defaultTheme: VSExtension = {
		publisher: {
			displayName: 'efeenesc',
			publisherId: '0',
			publisherName: 'efeenesc',
			flags: '0',
			isDomainVerified: true,
			domain: 'efeenescamci.com',
		},
		extensionId: '0',
		extensionName: 'Beige',
		displayName: 'Beige',
		extensionIcon: beigeIcon,
		flags: '0',
		lastUpdated: '',
		publishedDate: '',
		releaseDate: '',
		shortDescription: '',
		versions: [],
		categories: [],
		tags: [],
		statistics: [],
		deploymentType: 0,
	};
	placeholders = signal(
		this.favoriteThemes.map((id) => {
			return signal<VSExtension>({ extensionId: id } as VSExtension);
		}),
	);
	vsCardTheme: VsCardStyle = new VsCardStyle({
		bg300Class: 'bg-theme-600',
		bg900Class: 'bg-theme-900',
		hoverClass: 'group-hover:bg-highlight-solid',
		fgTextClass: 'text-foreground',
		fgTextAccent: 'text-accent1',
		fgSvg: '[&_svg]:fill-accent1',
	});
	currentThemeId?: string;

	constructor(
		private lss: LocalStorageService,
		private vs: VsThemeService,
	) {}

	async beginLoading() {
		this.currentThemeId = this.lss.get('theme_id')!;

		await Promise.all(
			this.favoriteThemes.map(async (themeId, idx) => {
				let newValue: any;
				if (themeId !== '0') {
					const filter = new VSFilterBody();
					filter.addSearchFilter(themeId);
					filter.filters[0].pageSize = 1;

					const val = await this.vs.getFilteredResults(filter);

					// +1 because default theme is unshifted at the start
					if (val && val.results[0] && val.results[0].extensions[0]) {
						newValue = val.results[0].extensions[0];
					}
				} else {
					newValue = this.defaultTheme;
				}

				this.placeholders.update((current) => {
					current[idx] = signal(newValue);
					return [...current];
				});
			}),
		);
	}

	async getTheme(id: string) {
		const filter = new VSFilterBody();
		filter.addSearchFilter(id);
		filter.filters[0].pageSize = 1;
		const response = await this.vs.getFilteredResults(filter);
		if (response!.results.length === 0) return;

		return response!.results[0];
	}
}
