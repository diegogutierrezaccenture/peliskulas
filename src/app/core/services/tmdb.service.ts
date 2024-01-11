import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private apiKey = 'ca9ded467251d3f837b8cee8f403364d';

  constructor(private http: HttpClient) { }

  getPopularMovies(): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}`;
    return this.http.get(url);
  }

  getMovieDetails(movieId: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${this.apiKey}`;
    return this.http.get(url);
  }

  searchMovies(query: string): Observable<any> {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${query}`;
    return this.http.get(url);
  }

  getMoviesByGenre(genreId: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}`;
    return this.http.get(url);
  }
}