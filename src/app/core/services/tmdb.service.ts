import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private apiKey = 'ca9ded467251d3f837b8cee8f403364d';

  constructor(private http: HttpClient) { }

  getPopularMovies(): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/popular?language=es-ES&api_key=${this.apiKey}`;
    return this.http.get(url);
  }

  getMovieDetails(movieId: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?language=es-ES&api_key=${this.apiKey}`
    return this.http.get(url);
  }

  getMovieCredits(movieId: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=es-ES&api_key=${this.apiKey}`
    return this.http.get(url);
  }

  getMainDirector(movieId: number): Observable<any> {
    return this.getMovieCredits(movieId).pipe(
      map((creditos: any) => {
        // Filtra la lista de personas para encontrar a los directores
        const directores = creditos.crew.filter(
          (person: { known_for_department: string; }) => person.known_for_department === 'Directing'
        );

        if (directores.length > 0) {
          // Ordena los directores por popularidad en orden descendente
          const directoresOrdenados = directores.sort(
            (a: { popularity: number; }, b: { popularity: number; }) => b.popularity - a.popularity
          );

          // Elige al director principal (el más popular)
          const directorPrincipal = directoresOrdenados[0];
          return directorPrincipal;
        } else {
          return null; // Devuelve null o algo apropiado en caso de que no haya director
        }
      }),
      catchError((error: any) => {
        console.error('Error al obtener créditos de la película:', error);
        return of(null); // Devuelve null o algo apropiado en caso de error
      })
    );
  }

  getTrailer(movieId: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=es-ES&api_key=${this.apiKey}`
    return this.http.get(url);
  }

  searchMovies(query: string): Observable<any> {
    const url = `https://api.themoviedb.org/3/search/movie?language=es-ES&api_key=${this.apiKey}&query=${query}`;
    return this.http.get(url);
  }

  getMoviesByGenre(genreId: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}`;
    return this.http.get(url);
  }
}