import {
	Directive,
	ElementRef,
	OnInit,
	OnDestroy,
	input,
	inject,
} from '@angular/core';
import { WindowService } from '@services/window.service';

enum OverflowState {
	NOT_CORRECTED,
	CORRECTED,
}
@Directive({
	selector: '[correct-overflow]',
})
export class OverflowDirective implements OnInit, OnDestroy {
	padBy = input(10);
	useTransform = input(false);
	private static wndSvc: WindowService;
	private static elements = new Set<{
		el: HTMLElement;
		val: number;
		useTransform: boolean;
	}>();
	static state: OverflowState = OverflowState.NOT_CORRECTED;

	constructor(private el: ElementRef) {
		if (!OverflowDirective.wndSvc) {
			OverflowDirective.wndSvc = inject(WindowService);
		}
	}

	ngOnInit(): void {
		OverflowDirective.elements.add({
			el: this.el.nativeElement,
			val: this.padBy(),
			useTransform: this.useTransform(),
		});
	}

	ngOnDestroy(): void {
		OverflowDirective.elements.delete({
			el: this.el.nativeElement,
			val: this.padBy(),
			useTransform: this.useTransform(),
		});
	}

	static setOverflowHidden() {
		if (!this.wndSvc.isTouchDevice()) {
			OverflowDirective.preOverflowHidden();
		}
		document.body.style.overflow = 'hidden';
	}

	static removeOverflowHidden() {
		document.body.style.removeProperty('overflow');
		if (!OverflowDirective.wndSvc.isTouchDevice()) {
			OverflowDirective.postOverflowHidden();
		}
	}

	static getAllElements(): {
		el: HTMLElement;
		val: number;
		useTransform: boolean;
	}[] {
		return Array.from(OverflowDirective.elements);
	}

	/**
	 * Corrects document overflow being set to 'hidden' by getting registered absolute pos. elements'
	 * margin-right before setting it to the value specified in 'padBy'.
	 * This is to prevent the element from shifting when the overflow is set to 'hidden'.
	 *
	 * Call this right before setting overflow to 'hidden'.
	 *
	 * Call `postOverflowHidden` after setting overflow to its initial, non-hidden value.
	 */
	static preOverflowHidden() {
		if (window.innerWidth - document.body.clientWidth === 0) return;
		OverflowDirective.getAllElements().forEach(({ el, val, useTransform }) => {
			let origPad;
			let newPad;

			if (useTransform) {
				origPad = el.style.transform;
				newPad = `translateX(${val}px)`;
				el.style.transform = newPad;
			} else {
				origPad = el.style.marginRight;
				newPad = el.style.marginRight + val + 'px';
				el.style.marginRight = newPad;
			}

			el.dataset['originalPad'] = origPad;
		});
	}

	/**
	 * Resets the margin-right style of all registered absolute pos. elements.
	 *
	 * Call this right after setting overflow to its initial, non-hidden value.
	 *
	 * Call `preOverflowHidden` before setting overflow to 'hidden'.
	 */
	static postOverflowHidden() {
		if (window.innerWidth - document.body.clientWidth === 0) return;

		OverflowDirective.getAllElements().forEach(({ el, useTransform }) => {
			if (useTransform) {
				el.style.transform = el.dataset['originalPad']!;
			} else {
				el.style.marginRight = el.dataset['originalPad']!;
			}
		});
	}
}
