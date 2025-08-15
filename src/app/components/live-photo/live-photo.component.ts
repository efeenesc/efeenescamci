import {
	Component,
	input,
	signal,
	ElementRef,
	ViewChild,
	OnDestroy,
	ChangeDetectionStrategy,
} from '@angular/core';
import { LivePhotoIconComponent } from '../../icons/live-photo/live-photo-icon.component';
import gsap from 'gsap';

@Component({
	selector: 'live-photo',
	imports: [LivePhotoIconComponent],
	templateUrl: './live-photo.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivePhotoComponent implements OnDestroy {
	constructor(private elementRef: ElementRef) {}
	mainPhotoUrl = input.required<string>();
	shortVideoUrls = input<string[]>();
	triggerMode = input<'hover' | 'press'>('hover');
	longPressDuration = input(800);
	shortVideoShownUrl = signal<string | undefined>(undefined);
	longPressProgress = signal<number>(0);
	isLongPressing = signal<boolean>(false);

	@ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
	@ViewChild('image') imageRef!: ElementRef<HTMLImageElement>;

	private progressInterval?: number;
	private fadeInTween?: gsap.core.Tween;
	private fadeOutTween?: gsap.core.Tween;
	private clickOutsideListener(event: Event) {
		if (!this.elementRef.nativeElement.contains(event.target as Node)) {
			this.onMouseLeave();
		}
	}

	triggerVideo() {
		const urls = this.shortVideoUrls();
		if (urls && urls.length) {
			const idx = Math.floor(Math.random() * urls.length);
			this.shortVideoShownUrl.set(urls[idx]);
		}
	}

	onVideoLoad() {
		// Fade out image when video is ready
		if (this.imageRef?.nativeElement) {
			if (this.fadeInTween) this.fadeInTween.kill();
			this.fadeInTween = gsap.to(this.imageRef.nativeElement, {
				opacity: 0,
				duration: 0.3,
				ease: 'power2.out',
			});
		}
	}

	onMouseEnter() {
		if (this.triggerMode() === 'hover' && !this.shortVideoShownUrl()) {
			this.startTimer();
			this.addClickOutsideListener();
		}
	}

	onMouseLeave() {
		if (this.triggerMode() === 'hover' && !this.shortVideoShownUrl()) {
			this.stopTimer();
			this.removeClickOutsideListener();
		}
	}

	onPointerDown(event: PointerEvent) {
		if (this.triggerMode() === 'press' && !this.shortVideoShownUrl()) {
			event.preventDefault();
			this.startTimer();
		}
	}

	onPointerUp(event: PointerEvent) {
		if (this.triggerMode() === 'press' && !this.shortVideoShownUrl()) {
			event.preventDefault();
			this.stopTimer();
		}
	}

	onPointerLeave() {
		if (this.triggerMode() === 'press' && !this.shortVideoShownUrl()) {
			this.stopTimer();
		}
	}

	private startTimer() {
		this.isLongPressing.set(true);
		this.longPressProgress.set(0);

		const startTime = Date.now();
		this.progressInterval = window.setInterval(() => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / this.longPressDuration(), 1);
			this.longPressProgress.set(progress);

			if (progress >= 1) {
				this.completeTimer();
			}
		}, 16); // ~60fps
	}

	private stopTimer() {
		this.isLongPressing.set(false);
		this.longPressProgress.set(0);

		if (this.progressInterval) {
			clearInterval(this.progressInterval);
			this.progressInterval = undefined;
		}
	}

	private completeTimer() {
		this.stopTimer();
		this.triggerVideo();
	}

	videoEnded() {
		// Fade image back in when video ends
		if (this.imageRef?.nativeElement) {
			if (this.fadeOutTween) this.fadeOutTween.kill();
			this.fadeOutTween = gsap.to(this.imageRef.nativeElement, {
				opacity: 1,
				duration: 0.3,
				ease: 'power2.out',
				onComplete: () => {
					this.shortVideoShownUrl.set(undefined);
				},
			});
		}
	}

	private addClickOutsideListener() {
		this.removeClickOutsideListener();
		document.addEventListener('click', this.clickOutsideListener, true);
		document.addEventListener('touchstart', this.clickOutsideListener, true);
	}

	private removeClickOutsideListener() {
		document.removeEventListener('click', this.clickOutsideListener, true);
		document.removeEventListener('touchstart', this.clickOutsideListener, true);
	}

	ngOnDestroy() {
		this.stopTimer();
		this.removeClickOutsideListener();
		if (this.fadeInTween) this.fadeInTween.kill();
		if (this.fadeOutTween) this.fadeOutTween.kill();
	}
}
