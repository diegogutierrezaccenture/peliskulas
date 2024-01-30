import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MovieService } from '../../core/services/movie.service';
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MovieDetailsComponent } from '../../components/movie-details/movie-details.component';
import { MovieModalService } from '../../core/services/movie-modal.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { Observable, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListasPelis } from '../../core/services/listas.service';

@Component({
  standalone: true,
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css'],
  imports: [MatIconModule, MatButtonModule, CommonModule]
})

export class MovieCardComponent implements OnInit {
  constructor(public dialog: MatDialog,
    private movieService: MovieService,
    private movieModalService: MovieModalService,
    private tmdbService: TmdbService,
    private _snackBar: MatSnackBar,
    private listasPelis: ListasPelis,

  ) { }

  listaPelisPendientes: any[] = [];
  listaPelisVistas: any[] = [];
  listaPelisFavs: any[] = [];

  ngOnInit(): void {
    try {
      // Escuchar cambios en las listas a través del servicio listasPelis
      this.listasPelis.pelisPendientes$.subscribe(data => {
        this.listaPelisPendientes = data;
      });

      this.listasPelis.pelisVistas$.subscribe(data => {
        this.listaPelisVistas = data;
      });

      this.listasPelis.pelisFavs$.subscribe(data => {
        this.listaPelisFavs = data;
      });
    } catch (error) {
      console.error('Error al obtener listas del usuario:', error);
    }
  }

  @Input() movie: any;
  @Input() userId: any;
  @Input() listaPelis: any;
  @Input() categoria: any;
  @Input() home: any;
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
      data: { message: `¿Estás seguro de que quieres eliminar "${movie.title}" de la lista?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eliminarPeliPendiente(movie);
      }
    });
  }

  // Método para verificar si una película está en la lista
  isMovieInList(movie: any, lista: any[]): boolean {
    return lista.some(peli => peli.id === movie.id);
  }

  confirmDeleteHome(movie: any, listaComparar: any, lista: any): void {
    if (this.isMovieInList(movie, listaComparar)) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '250px',
        data: { message: `¿Estás seguro de que quieres eliminar "${movie.title}" de la lista?` },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.movieService.removeMovieFromCategory(this.userId, lista, movie)
        }
      });
    }
  }

  eliminarPeliPendiente(movie: any) {
    this.movieService.removeMovieFromCategory(this.userId, this.categoria, movie)
      .catch((error) => {
        console.error('Error al eliminar película pendiente:', error);
      });
  }

  async addPeliPendienteToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisPendientesDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.confirmDeleteHome(movie, this.listaPelisPendientes, "pelisPendientes")
  }


  async addPeliVistaToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisVistasDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.confirmDeleteHome(movie, this.listaPelisVistas, "pelisVistas")
  }

  async addPeliFavToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisFavoritasDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.confirmDeleteHome(movie, this.listaPelisFavs, "pelisFavs")
  }

  openSnackBarOK() {
    return this._snackBar.open('Película añadida con éxito😀', 'Cerrar', {
      duration: 2000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });
  }
}