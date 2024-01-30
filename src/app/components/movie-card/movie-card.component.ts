import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MovieService } from '../../core/services/movie.service';
import { MatButtonModule } from "@angular/material/button";

import { MatDialog } from '@angular/material/dialog';
import { MovieDetailsComponent } from '../../components/movie-details/movie-details.component';
import { MovieModalService } from '../../core/services/movie-modal.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { Observable, forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css'],
  imports: [MatIconModule, MatButtonModule]
})

export class MovieCardComponent {
  constructor(public dialog: MatDialog,
    private movieService: MovieService,
    private movieModalService: MovieModalService,
    private tmdbService: TmdbService
  ) { }

  @Input() movie: any;
  @Input() userId: any;
  @Input() listaPelis: any;
  @Input() categoria: any;
  @Output() listaPelisActualizada: EventEmitter<any> = new EventEmitter();

  movieDetails: any;

  openDialog(movie: any) {
    // Realiza ambas llamadas a la API simultáneamente
    forkJoin([
      this.obtenerDetallesDePelicula(movie.id),
      this.obtenerDirector(movie.id),
      this.obtenerTrailer(movie.id)
    ]).subscribe(
      ([movieDetails, movieCredits, movieTrailers]: [any, any, any]) => {
        // Combina los detalles de la película y los créditos en un solo objeto
        const movieData = { ...movieDetails, mainDirector: movieCredits, movieTrailers };
        // Llama al servicio para pasar la información de la película al componente de detalles
        this.movieModalService.openModal(movieData);
        console.log(movieData)
        // Abre el componente de detalles utilizando MatDialog
        this.dialog.open(MovieDetailsComponent);
      },
      (error: any) => {
        console.error('Error al obtener detalles de la película:', error);
      }
    );
  }

  obtenerDetallesDePelicula(movieId: number): Observable<any> {
    return this.tmdbService.getMovieDetails(movieId);
  }

  obtenerDirector(movieId: number): Observable<any> {
    return this.tmdbService.getMainDirector(movieId);
  }

  obtenerTrailer(movieId: number): Observable<any> {
    return this.tmdbService.getTrailer(movieId);
  }

  confirmDelete(movie: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: `¿Estás seguro de que quieres eliminar "${movie.title}" de la lista Pendientes?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eliminarPeliPendiente(movie);
      }
    });
  }

  eliminarPeliPendiente(movie: any) {
    this.movieService.removeMovieFromCategory(this.userId, this.categoria, movie)
      .catch((error) => {
        console.error('Error al eliminar película pendiente:', error);
      });
  }
}