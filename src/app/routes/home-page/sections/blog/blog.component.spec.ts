import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogSectionComponent } from './blog.component';

describe('BlogSectionComponent', () => {
	let component: BlogSectionComponent;
	let fixture: ComponentFixture<BlogSectionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [BlogSectionComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(BlogSectionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
