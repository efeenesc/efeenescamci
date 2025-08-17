import {
	ChangeDetectionStrategy,
	Component,
	signal,
	ViewEncapsulation,
} from '@angular/core';
import { NormalCardComponent } from '@components/normal-card/normal-card.component';
import { ArrowDownComponent } from '@icons/arrow-down/arrow-down.component';
import { HeadingDirective } from '@directives/heading.directive';

@Component({
	selector: 'experiments-section',
	imports: [NormalCardComponent, ArrowDownComponent, HeadingDirective],
	templateUrl: './experiments.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		:host {
			display: flex;
			width: 100%;
		}
	`,
	styleUrl: './experiments.component.css',
	encapsulation: ViewEncapsulation.None,
})
export class ExperimentsComponent {
	showingMore = signal(false);
	showCount = 3;

	expCards = [
		{
			id: 4,
			icon_url:
				'https://github.com/efeenesc/simple-invoice-latex/raw/master/logo.png',
			name: 'simple-invoice-latex',
			desc: 'A simple invoice generator. Comes with a nice looking LaTeX invoice template. Has a pipe-based date syntax for date generation, conversion and formatting in JSON configs. Built using TypeScript.',
			source_url: 'https://github.com/efeenesc/simple-invoice-latex',
			read_more: '',
			loaded: signal(false),
		},
		{
			id: 3,
			icon_url:
				'https://github.com/efeenesc/recap/raw/master/assets/appicon.png',
			name: 'WinFloatingDock',
			desc: 'A floating, always-on-top transparent dock that functions like a minimal taskbar. Built using C++ and MSVC.',
			source_url: 'https://github.com/efeenesc/simple-invoice-latex',
			read_more: '',
			loaded: signal(false),
		},
		{
			id: 2,
			icon_url:
				'https://github.com/efeenesc/recap/raw/master/assets/appicon.png',
			name: 'Recap',
			desc: 'Get a Recap of your daily activity. Built using Go and Wails.',
			source_url: 'https://github.com/efeenesc/recap',
			read_more: '',
			loaded: signal(false),
		},
		{
			id: 1,
			icon_url:
				'https://github.com/efeenesc/c-twig-server/raw/main/assets/icon.png',
			name: 'c-twig-server',
			desc: 'C server that snaps like a twig. Educational purposes only.',
			source_url: 'https://github.com/efeenesc/c-twig-server',
			read_more: '',
			loaded: signal(false),
		},
		{
			id: 0,
			icon_url: 'assets/efeenescamci-logo.png',
			name: 'efeenescamci',
			desc: 'This website. Built using Angular and Go.',
			source_url: 'https://github.com/efeenesc/efeenescamci',
			read_more: '',
			loaded: signal(false),
		},
	];

	toggleShowMore() {
		this.showingMore.set(!this.showingMore());
	}
}
