import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  // private api = 'https://api.efeenescamci.com';
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getLimitedNumberOfPosts(limit: number, skip: number): Observable<BlogQueryResult> {
    return this.http.get<BlogQueryResult>(this.api + `/blog?limit=${limit}&skip=${skip}`, {responseType: 'json'}).pipe(
      map(response => response as BlogQueryResult),
      catchError(error => {
        console.error('Error fetching blog post briefs:', error);
        return throwError(() => error);
      })
    )
  }

  getNewBlogPostBriefs(): Observable<BlogQueryResult> {
    return this.http.get<BlogQueryResult>(this.api + '/blog/latest', { responseType: 'json' }).pipe(
      map(response => response as BlogQueryResult),
      catchError(error => {
        console.error('Error fetching new blog post briefs:', error);
        return throwError(() => error);
      })
    );
  }

  getBlogPostByRouteName(route: string): Observable<FullBlog> {
    return this.http.get<FullBlog>(this.api + '/blog/' + route, { responseType: 'json' }).pipe(
      map(response => response as FullBlog),
      catchError(error => {
        console.error('Error fetching blog post by route name:', error);
        return throwError(() => error);
      })
    );
  }
}