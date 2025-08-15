import {
	Component,
	ElementRef,
	input,
	signal,
	ViewChild,
	OnInit,
	OnDestroy,
	output,
	ChangeDetectionStrategy,
} from '@angular/core';
import { VsSearchComponent } from '@components/vs-search/vs-search.component';
import {
	WindowObserverService,
	WindowSize,
} from '@services/window-observer.service';
import { SiteLogoComponent } from '@icons/site-logo/site-logo.component';
import { OverflowDirective } from '@directives/overflow.directive';
import gsap from 'gsap';

@Component({
	selector: 'top-bar',
	imports: [VsSearchComponent, SiteLogoComponent, OverflowDirective],
	templateUrl: './top-bar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent implements OnInit, OnDestroy {
	@ViewChild('topbar') set _tb(content: ElementRef) {
		this.topbar = content.nativeElement as HTMLDivElement;
	}
	topbar!: HTMLDivElement;
	themeBarStyle = input.required<string>();
	themeButtonClicked = output<void>();

	topbarScrollProgress = signal<number>(1);
	topbarExtended = signal<boolean>(true);
	mobileMode = signal<boolean>(false);
	minScrollY = 0;
	maxScrollY = 200;
	private topBarTween!: gsap.core.Tween;
	private lastProgress = -1;
	private subscriptions: (() => void)[] = [];

	constructor(private woSvc: WindowObserverService) {}

	ngOnInit() {
		const scrollSub = this.woSvc.scrollObservable.subscribe((newYval) =>
			this.trackScroll(newYval),
		);
		const sizeSub = this.woSvc.sizeObservable.subscribe((newWndSize) =>
			this.setTopBarMode(newWndSize),
		);

		this.subscriptions.push(() => scrollSub.unsubscribe());
		this.subscriptions.push(() => sizeSub.unsubscribe());

		this.setTopBarMode(this.woSvc.getWindowSize());
	}

	ngOnDestroy() {
		this.subscriptions.forEach((unsub) => unsub());
		if (this.topBarTween) {
			this.topBarTween.kill();
		}
	}

	emitThemeBarClickedEvent() {
		this.themeButtonClicked.emit();
	}

	trackScroll(newYval: number) {
		if (newYval < this.minScrollY) {
			return;
		}

		let newProgress: number;
		if (newYval > this.maxScrollY) {
			newProgress = 0;
		} else {
			newProgress = 1 - newYval / this.maxScrollY;
		}

		if (Math.abs(newProgress - this.lastProgress) < 0.01) {
			return;
		}

		this.topbarScrollProgress.set(newProgress);
		this.lastProgress = newProgress;
		this.playNewTopBarAnimation(newProgress);
	}

	// This relies on the window size to determine whether the user is on mobile or not.
	// If on mobile, a different top bar will be shown.
	setTopBarMode(newWndSize: WindowSize) {
		this.mobileMode.set(newWndSize.x < 768 ? true : false);
	}

	playNewTopBarAnimation(progress: number) {
		const baseHeight = 5;
		const extraHeight = progress * 5;
		const finalHeight = baseHeight + extraHeight;
		const newHeight = finalHeight + 'vh';

		if (this.topBarTween) {
			this.topBarTween.kill();
		}

		this.topBarTween = gsap.to(['#topbar', '#website-logo-svg'], {
			height: newHeight,
			ease: 'elastic.out(1.2, 1)',
		});
	}
}
