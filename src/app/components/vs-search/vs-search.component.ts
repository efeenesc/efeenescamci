import {
	Component,
	input,
	OnDestroy,
	signal,
	ViewChild,
	OnInit,
	effect,
	output,
	ChangeDetectionStrategy,
} from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';
import gsap from 'gsap';
import { Subscription } from 'rxjs';

@Component({
	selector: 'vs-search',
	imports: [],
	templateUrl: './vs-search.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VsSearchComponent implements OnDestroy, OnInit {
	@ViewChild('themebtn') themeBtn!: HTMLElement;
	animationSeekAt = input(0);

	internalStyle = input<string | undefined>();
	clicked = output();

	themeName = signal<string | null>(null);
	themeAuthor = signal<string | null>(null);
	themeIcon = signal<string | null>(null);

	valueChangesSubscription!: Subscription;

	constructor(private lss: LocalStorageService) {
		effect(() => {
			this.playScrollAnimation(this.animationSeekAt());
		});
	}

	ngOnInit() {
		this.restoreThemeInformation();
		this.valueChangesSubscription = this.lss.valueChanges.subscribe((obj) => {
			switch (obj.key) {
				case 'theme_author':
					this.themeAuthor.set(obj.value);
					break;

				case 'theme_name':
					this.themeName.set(obj.value);
					break;

				case 'theme_icon':
					if (obj.value.startsWith('data:image')) {
						this.themeIcon.set(obj.value);
					} else {
						this.themeIcon.set('data:image/png;base64,' + obj.value);
					}
					break;
			}
		});
	}

	restoreThemeInformation() {
		this.themeAuthor.set(this.lss.get('theme_author'));
		this.themeName.set(this.lss.get('theme_name'));
		const themeIcon = this.lss.get('theme_icon');
		if (!themeIcon) return;

		if (themeIcon.startsWith('data:image')) {
			this.themeIcon.set(themeIcon);
		} else {
			this.themeIcon.set('data:image/png;base64,' + themeIcon);
		}
	}

	cardClicked() {
		this.clicked.emit();
	}

	keyPressed(event: KeyboardEvent) {
		if (event.key === 'Enter') this.cardClicked();
	}

	playScrollAnimation(progress: number) {
		const pad = progress * 8 + 'px';

		gsap.to('#vs-search-main', {
			paddingLeft: pad,
			paddingTop: pad,
			paddingBottom: pad,
			duration: 0.01,
			ease: 'none',
		});

		gsap.to('#theme-author', {
			opacity: progress,
			duration: 0.01,
			ease: 'none',
		});

		const top = (1 - progress) * 1.2;

		gsap.to('#theme-name', {
			top: top + 'vh',
			duration: 0.01,
			ease: 'none',
		});
	}

	ngOnDestroy(): void {
		this.valueChangesSubscription.unsubscribe();
	}
}
