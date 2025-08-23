import {
	ChangeDetectionStrategy,
	Component,
	effect,
	ElementRef,
	input,
	OnDestroy,
	signal,
	viewChild,
} from '@angular/core';
import { VSExtension } from '@apptypes/vs-types';
import { ArrowUpRightComponent } from '@icons/arrow-up-right/arrow-up-right.component';
import { MissingIconComponent } from '@icons/missing-icon/missing-icon.component';
import { VsThemeService } from '@services/vs-theme.service';
import beigeIcon from '@icons/beige-theme-icon/beigeiconb64';
import gsap from 'gsap';

export interface VsCardStyleProps {
	bg900Class?: string;
	bg300Class?: string;
	hoverClass?: string;
	fgTextClass?: string;
	fgTextAccent?: string;
	fgSvg?: string;
}

export class VsCardStyle {
	bg900 = 'bg-system-900';
	bg300 = 'bg-system-700';
	hover = 'bg-system-300';
	fgText = 'text-contrast';
	fgAccent = 'text-contrast text-bold';
	fgSvg = '[&_svg]:fill-contrast';
	constructor(props?: VsCardStyleProps) {
		if (!props) return;
		if (props.bg900Class) this.bg900 = props.bg900Class;
		if (props.bg300Class) this.bg300 = props.bg300Class;
		if (props.hoverClass) this.hover = props.hoverClass;
		if (props.fgTextClass) this.fgText = props.fgTextClass;
		if (props.fgTextAccent) this.fgAccent = props.fgTextAccent;
		if (props.fgSvg) this.fgSvg = props.fgSvg;
	}
}

@Component({
	selector: 'vs-card',
	imports: [ArrowUpRightComponent, MissingIconComponent],
	templateUrl: './vs-card.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VsCardComponent implements OnDestroy {
	themeInfoDiv = viewChild.required<ElementRef<HTMLDivElement>>('themeinfo');
	loadingContainerDiv =
		viewChild.required<ElementRef<HTMLDivElement>>('loadingcontainer');
	shadowContainerDiv =
		viewChild.required<ElementRef<HTMLDivElement>>('shadowcontainer');
	mainContainerDiv =
		viewChild.required<ElementRef<HTMLDivElement>>('maincontainer');
	backgroundDiv = viewChild.required<ElementRef<HTMLDivElement>>('background');
	loadingDiv = viewChild.required<ElementRef<HTMLDivElement>>('loadingdiv');

	cardInfo = input.required<VSExtension>();
	cardStyle = input<VsCardStyle>();
	cardIcon = signal<string | undefined | null>(undefined);

	abortController: AbortController | null = null;

	bg900 = signal<string>('bg-system-900');
	bg300 = signal<string>('bg-system-700');
	hover = signal<string>(
		'group-hover:bg-system-600 dark:group-hover:bg-system-300',
	);
	fgText = signal<string>('text-contrast');
	fgAccent = signal<string>(
		'text-neutral-400 text-bold border-neutral-400 [&_svg]:stroke-neutral-400',
	);
	currentProgress = 0;
	downloadProgress = 0;
	downloadProgressObj = { current: 0 };
	private progressTween?: gsap.core.Tween;
	private loadingTweens: gsap.core.Tween[] = [];

	constructor(
		private vs: VsThemeService,
		private vsSvc: VsThemeService,
	) {
		effect(() => {
			if (!this.cardStyle()) return;
			this.bg900.set(this.cardStyle()!.bg900);
			this.bg300.set(this.cardStyle()!.bg300);
			this.hover.set(this.cardStyle()!.hover);
			this.fgText.set(this.cardStyle()!.fgText);
			this.fgAccent.set(this.cardStyle()!.fgAccent);
		});

		effect(() => {
			if (this.cardInfo() && this.cardInfo().versions) this.getIcon();
		});
	}

	async getIcon() {
		if (typeof this.cardInfo().extensionIcon === 'string') {
			this.cardIcon.set(this.cardInfo().extensionIcon as string);
			return;
		}
		this.cardIcon.set(
			(await this.vsSvc.getIcon(this.cardInfo(), 'small')) ?? null,
		);
	}

	themeSelected(event: { target: EventTarget | null }) {
		if ((event.target as HTMLElement).tagName === 'A') return;

		if (
			this.cardInfo().displayName === 'Beige' &&
			this.cardInfo().publisher.displayName === 'efeenesc'
		) {
			this.vs.setDefaultColorScheme('default', beigeIcon);
		} else {
			this.itemSelected(this.cardInfo());
		}
	}

	keyPressed(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.themeSelected(event);
		}
	}

	itemSelected(ext: VSExtension) {
		this.abortController = new AbortController();
		this.resetLoadingBarNoAnim();
		this.currentProgress = 0;
		this.downloadProgress = 0;
		this.downloadProgressObj = { current: 0 };
		this.startLoadingAnimation();
		this.vs.changeTheme(ext, (loaded, total) => {
			const progress = parseInt((loaded / total) * 100 + ''); // Working with float in JS is never good. Convert to string then int

			if (this.downloadProgress > progress)
				// Failsafe
				return;

			this.downloadProgress = progress;
			this.setCalculatedGradient(this.downloadProgress);
		});
	}

	cancelThemeChange() {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
			this.stopLoadingAnimation();
		}
	}

	resetLoadingBarNoAnim() {
		this.loadingDiv().nativeElement.style.background = '';
	}

	startLoadingAnimation() {
		// Kill existing animations
		this.loadingTweens.forEach((tween) => tween.kill());
		this.loadingTweens = [];

		this.loadingTweens.push(
			gsap.to(this.shadowContainerDiv().nativeElement, {
				opacity: 0,
				duration: 0.05,
			}),
		);
		this.loadingTweens.push(
			gsap.to(this.mainContainerDiv().nativeElement, {
				translateY: '0.25rem',
				duration: 0.05,
			}),
		);

		// Fade in the loading container
		this.loadingTweens.push(
			gsap.to(this.loadingContainerDiv().nativeElement, {
				opacity: 1,
				duration: 0.05,
			}),
		);

		// Scale the theme info div
		this.loadingTweens.push(
			gsap.to(this.backgroundDiv().nativeElement, {
				opacity: 0,
				duration: 1,
				ease: 'power1.inOut',
			}),
		);
	}

	stopLoadingAnimation() {
		// Kill existing animations
		this.loadingTweens.forEach((tween) => tween.kill());
		this.loadingTweens = [];

		this.loadingTweens.push(
			gsap.to(this.mainContainerDiv().nativeElement, {
				translateY: 0,
				duration: 0.05,
			}),
		);
		this.loadingTweens.push(
			gsap.to(this.shadowContainerDiv().nativeElement, {
				opacity: 1,
				duration: 0.05,
			}),
		);
		this.loadingTweens.push(
			gsap.to(this.loadingContainerDiv().nativeElement, {
				opacity: 0,
				duration: 0.5,
			}),
		);

		// Second animation (scale the theme info div back to 1.0)
		this.loadingTweens.push(
			gsap.to(this.backgroundDiv().nativeElement, {
				opacity: 1,
				duration: 1,
				ease: 'power1.inOut',
			}),
		);
	}

	setCalculatedGradient(downloadProgress: number) {
		// Kill existing progress animation
		if (this.progressTween) {
			this.progressTween.kill();
		}

		this.progressTween = gsap.to(this.downloadProgressObj, {
			current: downloadProgress,
			ease: 'power1.out',
			duration: 0.1,
			onUpdate: () => {
				// Throttle DOM updates to reduce repaints
				const progress = Math.round(this.downloadProgressObj.current);
				if (progress !== this.currentProgress) {
					this.currentProgress = progress;
					this.loadingDiv().nativeElement.style.setProperty(
						'background',
						`conic-gradient(#3b82f6 ${this.currentProgress}% 0, transparent 0%)`,
					);
				}
			},
			onComplete: () => {
				if (this.currentProgress === 100) {
					setTimeout(() => {
						this.stopLoadingAnimation();
					}, 250);
				}
			},
		});
	}

	ngOnDestroy() {
		this.cancelThemeChange();

		if (this.progressTween) {
			this.progressTween.kill();
		}
		this.loadingTweens.forEach((tween) => tween.kill());
	}
}
