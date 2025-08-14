import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalCardComponent } from './normal-card.component';

describe('IconCardComponent', () => {
	let component: NormalCardComponent;
	let fixture: ComponentFixture<NormalCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NormalCardComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(NormalCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
