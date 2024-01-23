import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { FirebaseService } from "../../core/services/firebase.service";
import { ListasPelis } from "../../core/services/listas.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component";

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
    ReactiveFormsModule
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
    private listasPelis: ListasPelis
  ) { }

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
            this.search(false);
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

  search(buttonClick: boolean): void {
    this.tmdbService.searchMovies(this.searchControl.value).subscribe((data) => {

      if (data.results.length === 0 && buttonClick)
        this.openSnackBarPeliNoEncontrada();

      this.searchResults = data.results;
    });
  }

  async addPeliPendienteToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisPendientesDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.confirmDelete(movie, this.listaPelisPendientes, "pelisPendientes")
  }


  async addPeliVistaToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisVistasDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.confirmDelete(movie, this.listaPelisVistas, "pelisVistas")
  }

  async addPeliFavToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisFavoritasDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.confirmDelete(movie, this.listaPelisFavs, "pelisFavs")
  }

  // Mensaje que se muestra al añadir una peli a una lista
  openSnackBarOK() {
    return this._snackBar.open('Película añadida con éxito😀', 'Cerrar', {
      duration: 2000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });
  }

  openSnackBarPeliNoEncontrada() {
    return this._snackBar.open('Película no encontrada😅', 'Cerrar', {
      duration: 2000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });
  }

  // Método para verificar si una película está en la lista
  isMovieInList(movie: any, lista: any[]): boolean {
    return lista.some(peli => peli.id === movie.id);
  }

  confirmDelete(movie: any, listaComparar: any, lista: any): void {
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

}