import {
	Component,
	ElementRef,
	signal,
	viewChild,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocalStorageService } from './services/local-storage.service';
import { VsThemeService } from './services/vs-theme.service';
import { DrawerComponent } from './components/drawer/drawer.component';
import { VsMenuComponent } from './components/vs-menu/vs-menu.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { OverflowDirective } from './directives/overflow.directive';
import { FooterComponent } from './components/footer/footer.component';
import beigeIcon from './icons/beige-theme-icon/beigeiconb64';
import { FakeLoadingBarService } from './services/fake-loading-bar.service';
import gsap from 'gsap';
import { FakeLoadingBarComponent } from './components/fake-loading-bar/fake-loading-bar.component';
import { SidepanelTocComponent } from '@components/sidepanel-toc/sidepanel-toc.component';
import { PortalOutletDirective } from '@directives/portal.directive';
import { RippleBgComponent } from '@components/ripple-bg/ripple-bg.component';

@Component({
	selector: 'app-root',
	imports: [
		RouterOutlet,
		DrawerComponent,
		VsMenuComponent,
		TopBarComponent,
		OverflowDirective,
		FooterComponent,
		FakeLoadingBarComponent,
		SidepanelTocComponent,
		PortalOutletDirective,
		RippleBgComponent,
	],
	templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	main = viewChild.required<ElementRef<HTMLDivElement>>('main');
	contentarea = viewChild.required<ElementRef<HTMLDivElement>>('contentarea');

	title = 'efeenescamci';
	blendClass?: string;
	scrollPos = 0;
	elTranslatePos: { current: number } = { current: 0 };
	themeBarStyle = '';
	drawerOpened = signal<boolean>(false);
	showUI = signal<boolean>(false);

	constructor(
		private lss: LocalStorageService,
		private vsSvc: VsThemeService,
		private fakeLoadingBarSvc: FakeLoadingBarService,
	) {
		this.restoreLastTheme();
		gsap.config({
			nullTargetWarn: false,
		});
	}

	ngOnInit() {
		console.log(
			`█████████████████████████████████████
████████████             ████████████
████████    █████████████    ████████
██████   ████           ████   ██████
█████  ███                 ███  █████
███   ██        █████        ██   ███
██   ██      ████████████     ██   ██
██  ██     ███████████████     ██  ██
█  ██     █████████████████     ██  █
█  ██                           ██  █
█  ██                           ██  █
█  ██     ████████████████████████  █
██  ██     ███████████████    ███  ██
██   ██      ███████████      ██   ██
███   ██         ███         ██   ███
█████  ████               ████  █████
██████   █████         █████   ██████
████████    █████████████    ████████
████████████              ███████████
█████████████████████████████████████
`,
		);
	}

	drawerClosed() {
		this.drawerOpened.set(false);
	}

	themeButtonClicked() {
		this.drawerOpened.set(true);
	}

	routerActivated() {
		this.showUI.set(true);
	}

	onMainResized(entries: ResizeObserverEntry[]) {
		const main = entries.find((e) => e.target.id === 'main');
		if (!main) return;

		const rect = main.contentRect;
		document.body.style.height = rect.height + 'px';
	}

	/**
	 * Checks if the default theme is enabled by comparing the theme name and author with the default values.
	 *
	 * @returns {boolean} True if the default theme is enabled, false otherwise.
	 */
	checkIfDefaultThemeEnabled(): boolean {
		// Get the theme name and author from local storage
		const themeName = this.lss.get('theme_name');
		const themeAuthor = this.lss.get('theme_author');

		// Compare the theme name and author with the default values
		return themeName === 'Beige' && themeAuthor === 'efeenesc';
	}

	/**
	 * Restores the last theme from local storage.
	 * If the theme is invalid or resetToDefault is true, it sets the default color scheme.
	 *
	 * @param resetToDefault Whether to reset to the default theme. Defaults to false.
	 */
	restoreLastTheme(resetToDefault = false) {
		// Get the color scheme from local storage
		const cs = this.vsSvc.getFromLocalStorage();

		// Check if the color scheme is invalid or if we need to reset to default
		if (!cs || resetToDefault || Object.keys(cs).includes('darkest')) {
			// Set the default color scheme if the conditions are met
			return this.vsSvc.setDefaultColorScheme('default', beigeIcon);
		}

		this.vsSvc.activeThemeVariantName.next(cs!.name);

		// Change the color variables to the restored color scheme
		this.vsSvc.changeColorVariables(cs);
	}
}
