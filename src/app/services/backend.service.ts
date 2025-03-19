import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private api = environment.api;
  private monthNames = ["Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"];

  constructor(private http: HttpClient) { }

  private toReadableDate(date: string): string {
    const d = new Date(date);
    const day = d.getDate();
    const monthIndex = d.getMonth();
    const monthName = this.monthNames[monthIndex];
    const year = d.getFullYear();
    return `${monthName} ${day}, ${year}`;
  }

  private mapToReadableDate(res: BlogQueryResult): BlogQueryResult {
    return { total: res.total, briefs: res.briefs.map((v) => { v.last_updated = this.toReadableDate(v.last_updated); v.created_at = this.toReadableDate(v.created_at); return v; }) }
  }

  getLimitedNumberOfPosts(limit: number, skip: number): Observable<BlogQueryResult> {
    return this.http.get<BlogQueryResult>(this.api + `/blog?limit=${limit}&skip=${skip}`, {responseType: 'json'}).pipe(
      map(response => this.mapToReadableDate(response)),
      catchError(error => {
        console.error('Error fetching blog post briefs:', error);
        return throwError(() => error);
      })
    )
  }

  getNewBlogPostBriefs(): Observable<BlogQueryResult> {
    return this.http.get<BlogQueryResult>(this.api + '/blog/latest', { responseType: 'json' }).pipe(
      map(response => this.mapToReadableDate(response)),
      catchError(error => {
        console.error('Error fetching new blog post briefs:', error);
        return throwError(() => error);
      })
    );
  }

  getBlogPostByRouteName(route: string): Observable<FullBlog> {
    return this.http.get<FullBlog>(this.api + '/blog/' + route, { responseType: 'json' }).pipe(
      map(response => { response.created_at = this.toReadableDate(response.created_at); return response; } ),
      catchError(error => {
        console.error('Error fetching blog post by route name:', error);
        return throwError(() => error);
      })
    );
  }
}