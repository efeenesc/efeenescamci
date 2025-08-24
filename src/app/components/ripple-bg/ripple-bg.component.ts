import {
	Component,
	AfterViewInit,
	ViewChild,
	ElementRef,
	signal,
	OnDestroy,
} from '@angular/core';
import { VsThemeService } from '@services/vs-theme.service';
import { RippleCacheService } from '@services/ripple-cache.service';

@Component({
	selector: 'ripple-bg',
	imports: [],
	template: `<canvas
		#canvas
		class="block h-full w-full bg-theme-600"
		[width]="width()"
		[height]="height()"
	></canvas> `,
})
export class RippleBgComponent implements AfterViewInit, OnDestroy {
	// intentionally not using a viewChild call here because it's annoying to have to call
	// this.canvas() all the time, and there's probably a performance penalty - this is NOT
	// reactive
	@ViewChild('canvas', { static: false })
	canvas!: ElementRef<HTMLCanvasElement>;

	private ctx!: CanvasRenderingContext2D;
	CANVAS_WIDTH!: number;
	CANVAS_HEIGHT!: number;
	width = signal<number>(0);
	height = signal<number>(0);

	private readonly CHARS = " .':~*+=oxOXM@#";
	private readonly CHAR_SIZE = 14;
	private GRID_WIDTH!: number;
	private GRID_HEIGHT!: number;
	private rippleX = 10;
	private rippleY = 10;

	// Animation constants
	private readonly PHASE_MULTIPLIER = 0.02;
	private readonly WAVE_FREQUENCY = 0.2;
	private readonly INTENSITY_THRESHOLD = 0.0;
	private readonly CHARS_LENGTH_MINUS_ONE = this.CHARS.length - 1;

	private readonly LOOP_DURATION_FRAMES = 63; // near perfect loop
	private readonly FRAMES_PER_RENDER = 5;

	private resizeDebouncer: ReturnType<typeof setTimeout> | null = null;
	bg!: string;
	fg!: string;

	private currentLoopFrame = 0;
	private isVisible = true;
	private animationIntervalId: any = null;
	private initializerTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor(
		private vsSvc: VsThemeService,
		private rippleCache: RippleCacheService,
	) {
		const styles = getComputedStyle(document.documentElement);
		this.bg = styles.getPropertyValue('--theme-600').trim();
		this.fg = styles.getPropertyValue('--accent1').trim();
		window.addEventListener('resize', this.handleResize.bind(this), {
			passive: true,
		});

		this.vsSvc.activeThemeVariantName.subscribe(() => {
			const styles = getComputedStyle(document.documentElement);
			this.bg = styles.getPropertyValue('--theme-600').trim();
			this.fg = styles.getPropertyValue('--accent1').trim();

			this.generateCharBitmaps();
			this.precomputeIntensityMappings();

			if (this.ctx) {
				this.loadOrGeneratePrecomputedData();
			}
		});
	}

	private handleResize() {
		if (this.resizeDebouncer) {
			clearTimeout(this.resizeDebouncer);
		}

		this.resizeDebouncer = setTimeout(() => {
			this.stop();
			this.initializeAnimation(true);
			this.start();
		}, 500);
	}

	private loadOrGeneratePrecomputedData(recalculate = false) {
		if (!this.rippleCache.isInitialized || recalculate) {
			this.generateCharBitmaps();
			this.precomputeIntensityMappings();
			this.precomputeCellData();
			this.rippleCache.isInitialized = true;
		}
	}

	private generateCharBitmaps() {
		this.rippleCache.charBitmaps.clear();
		this.rippleCache.intensityToBitmapCache.clear();
		const accent2Rgb = this.getRgbValues(this.fg);

		this.CHARS.split('').forEach((char) => {
			const charCanvas = document.createElement('canvas');
			charCanvas.width = this.CHAR_SIZE;
			charCanvas.height = this.CHAR_SIZE;
			const charCtx = charCanvas.getContext('2d')!;
			charCtx.font = `${this.CHAR_SIZE}px monospace`;
			charCtx.textAlign = 'left';
			charCtx.textBaseline = 'top';
			charCtx.fillStyle = `rgb(${accent2Rgb.r}, ${accent2Rgb.g}, ${accent2Rgb.b})`;
			charCtx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
			charCtx.fillText(char, 0, 0);
			this.rippleCache.charBitmaps.set(char, charCanvas);
		});
	}

	private precomputeIntensityMappings() {
		for (let i = 0; i < this.CHARS.length; i++) {
			const intensity = i / this.CHARS.length;
			const charIndex = Math.floor(intensity * this.CHARS_LENGTH_MINUS_ONE);
			const char = this.CHARS[charIndex];
			const bitmap = this.rippleCache.charBitmaps.get(char);

			this.rippleCache.intensityToBitmapCache.set(i, bitmap);
		}
	}

	private getRgbValues(colorString: string): {
		r: number;
		g: number;
		b: number;
	} {
		const hex = colorString.slice(1);

		return {
			r: parseInt(hex.slice(0, 2), 16),
			g: parseInt(hex.slice(2, 4), 16),
			b: parseInt(hex.slice(4, 6), 16),
		};
	}

	initializeAnimation(recalculate = false) {
		if (!this.ctx) {
			this.ctx = this.canvas.nativeElement.getContext('2d', {
				alpha: true,
				desynchronized: true,
			})!;
		}

		const w = this.canvas.nativeElement.clientWidth;
		const h = this.canvas.nativeElement.clientHeight;

		// if either of these is zero, canvas's parent hasn't appeared yet; retry in 10ms
		if (w === 0 || h === 0) {
			if (this.initializerTimeout) clearTimeout(this.initializerTimeout);

			setTimeout(() => this.initializeAnimation(recalculate), 10);
			return;
		}

		this.CANVAS_WIDTH = w * 0.8;
		this.CANVAS_HEIGHT = h * 0.8;
		this.width.set(this.CANVAS_WIDTH);
		this.height.set(this.CANVAS_HEIGHT);

		this.GRID_WIDTH = Math.ceil(this.CANVAS_WIDTH / this.CHAR_SIZE);
		this.GRID_HEIGHT = Math.ceil(this.CANVAS_HEIGHT / this.CHAR_SIZE);

		this.loadOrGeneratePrecomputedData(recalculate);

		this.currentLoopFrame = 0;
		this.start();
	}

	private precomputeCellData() {
		this.rippleCache.precomputedCells = [];

		for (let y = 0; y < this.GRID_HEIGHT; y++) {
			for (let x = 0; x < this.GRID_WIDTH; x++) {
				const distance = Math.sqrt(
					(x - this.rippleX) ** 2 + (y - this.rippleY) ** 2,
				);

				const waveMultiplier = distance * this.WAVE_FREQUENCY;

				const sinValues: number[] = [];
				const intensityValues: number[] = [];

				for (let frame = 0; frame < this.LOOP_DURATION_FRAMES; frame++) {
					const phase = frame * this.FRAMES_PER_RENDER * this.PHASE_MULTIPLIER;

					const wave = Math.sin(waveMultiplier - phase) * 0.5;
					const intensity = Math.max(0, Math.min(1, (wave + 1) / 2));

					sinValues.push(wave);
					intensityValues.push(intensity);
				}

				this.rippleCache.precomputedCells.push({
					x,
					y,
					distance,
					canvasX: x * this.CHAR_SIZE,
					canvasY: y * this.CHAR_SIZE,
					waveMultiplier,
					sinValues,
					intensityValues,
				});
			}
		}
	}

	renderFrame() {
		this.ctx.fillStyle = this.bg;
		this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

		if (this.rippleCache.charBitmaps.size === 0) return;

		// Process precomputed cells using precomputed values
		for (const cell of this.rippleCache.precomputedCells) {
			// Get precomputed intensity for current frame in the loop
			const intensity = cell.intensityValues[this.currentLoopFrame];

			if (intensity < this.INTENSITY_THRESHOLD) continue;

			// Use precomputed intensity mappings
			const intensityKey = Math.floor(intensity * this.CHARS.length);
			const bitmap = this.rippleCache.intensityToBitmapCache.get(intensityKey);

			if (!bitmap) continue;

			this.ctx.drawImage(bitmap, cell.canvasX, cell.canvasY);
		}
	}

	animate = () => {
		this.renderFrame();

		// Advance the loop frame counter
		this.currentLoopFrame =
			(this.currentLoopFrame + 1) % this.LOOP_DURATION_FRAMES;
	};

	start() {
		this.renderFrame();

		if (this.animationIntervalId) {
			clearInterval(this.animationIntervalId);
			this.animationIntervalId = null;
		}

		this.animationIntervalId = setInterval(this.animate, 1000 / 12);
	}

	stop() {
		if (this.animationIntervalId) {
			clearInterval(this.animationIntervalId);
			this.animationIntervalId = null;
		}
	}

	ngAfterViewInit() {
		this.initializeAnimation();
		this.setupIntersectionObserver();
	}

	private setupIntersectionObserver() {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !this.isVisible) {
						this.isVisible = true;
						this.start();
					} else if (!entry.isIntersecting && this.isVisible) {
						this.isVisible = false;
						this.stop();
					}
				});
			},
			{ threshold: 0 },
		);
		observer.observe(this.canvas.nativeElement);
	}

	ngOnDestroy() {
		this.stop();
		// Don't clear the data - it's cached in the service for reuse
	}
}
