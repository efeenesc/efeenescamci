import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VsCardComponent } from './vs-card.component';

describe('VsCardComponent', () => {
	let component: VsCardComponent;
	let fixture: ComponentFixture<VsCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [VsCardComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(VsCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
