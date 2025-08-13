import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VsMenuComponent } from './vs-menu.component';

describe('VsMenuComponent', () => {
	let component: VsMenuComponent;
	let fixture: ComponentFixture<VsMenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [VsMenuComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(VsMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
