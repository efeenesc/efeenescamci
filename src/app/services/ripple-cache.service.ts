import { Injectable } from '@angular/core';

interface PrecomputedCell {
	x: number;
	y: number;
	distance: number;
	canvasX: number;
	canvasY: number;
	waveMultiplier: number;
	sinValues: number[];
	intensityValues: number[];
}

@Injectable({
	providedIn: 'root',
})
export class RippleCacheService {
	precomputedCells: PrecomputedCell[] = [];
	charBitmaps = new Map<string, HTMLCanvasElement>();
	intensityToBitmapCache = new Map<number, HTMLCanvasElement | undefined>();
	isInitialized = false;
}
