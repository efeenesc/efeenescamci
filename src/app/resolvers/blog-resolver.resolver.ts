import { Injectable } from '@angular/core';
import {
	Resolve,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BackendService } from '@services/backend.service';

@Injectable({
	providedIn: 'root',
})
export class BlogPostResolver implements Resolve<FullBlog | null> {
	constructor(private backend: BackendService) {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<FullBlog | null> {
		const curRoute = route.paramMap.get('route');
		if (curRoute) {
			return this.backend
				.getBlogPostByRouteName(curRoute)
				.pipe(catchError(() => of(null)));
		} else {
			return of(null);
		}
	}
}
