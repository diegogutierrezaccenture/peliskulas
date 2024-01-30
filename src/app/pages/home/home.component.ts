import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { User } from '@angular/fire/auth';
import { Observable, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MovieModalService } from '../../core/services/movie-modal.service';
import { ListasPelis } from "../../core/services/listas.service";
import { MatDialog } from "@angular/material/dialog";
import { MovieDetailsComponent } from "../../components/movie-details/movie-details.component";
import { MovieCardComponent } from "../../components/movie-card/movie-card.component";

@Component({
  standalone: true,
  selector: 'home-name',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [TmdbService],
  imports: [MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MovieCardComponent
  ]
})

export default class HomeComponent implements OnInit {

  constructor(
    private tmdbService: TmdbService,
    private movieService: MovieService,
    public authService: AuthService,
    public router: Router,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private listasPelis: ListasPelis,
    private movieModalService: MovieModalService
  ) { }

  movieDetails: any;
  home: boolean = true;

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

  async logOut(): Promise<void> {
    try {
      await this.authService.logOut();
      this.router.navigateByUrl('/auth/login');
    } catch (error) {
      console.log(error);
    }
  }

  public user$: Observable<User | null> | undefined;
  public userId: any;
  searchControl = new FormControl();

  popularMovies: any[] = [];

  listaPelisPendientes: any[] = [];
  listaPelisVistas: any[] = [];
  listaPelisFavs: any[] = [];

  async ngOnInit(): Promise<void> {
    this.tmdbService.getPopularMovies().subscribe((data) => {
      this.popularMovies = data.results;
    });

    // Obtener todos los datos del usuario actual
    this.user$ = this.authService.user$;

    // Obtener UID del usuario
    this.user$.subscribe(async (user) => {
      if (user) {
        this.userId = user.uid;

        this.searchControl.valueChanges
          .pipe(
            debounceTime(1000),
            distinctUntilChanged()
          )
          .subscribe(() => {
            this.search();
          });
        // Obtener todas las listas de películas del usuario
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
    });
  }

  searchQuery: string = '';
  searchResults: any[] = [];

  // Puede que le tenga que poner un buttonClick como parametro
  search(): void {
    if (this.searchControl.value) {
      this.tmdbService.searchMovies(this.searchControl.value).subscribe((data) => {

        // Y aqui comprovarlo
        if (data.results.length === 0)
          this.openSnackBarPeliNoEncontrada();

        this.searchResults = data.results;
      });
    }
  }

  openSnackBarPeliNoEncontrada() {
    return this._snackBar.open('Película no encontrada😅', 'Cerrar', {
      duration: 2000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });
  }
}