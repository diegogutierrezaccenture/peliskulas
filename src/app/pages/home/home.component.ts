import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';

import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
<<<<<<< HEAD
=======
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component";
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b

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
  ]
})

export default class HomeComponent implements OnInit, OnDestroy {

  constructor(
    private tmdbService: TmdbService,
    private movieService: MovieService,
    public authService: AuthService,
    public router: Router,
<<<<<<< HEAD
    private _snackBar: MatSnackBar
=======
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b
  ) { }

  private subscriptions: Subscription[] = [];

  ngOnDestroy() {
    // Desuscribirse de todas las suscripciones al destruir el componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

  popularMovies: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];

  // userLists: any;
  pelisPendientes: any[] = [];
  pelisVistas: any[] = [];
  pelisFavoritas: any[] = [];

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

        // Obtener todas las listas de películas del usuario
        try {
<<<<<<< HEAD
          const userLists = await this.movieService.getListsByUserId(this.userId);
=======
          this.movieService.pelisPendientes$.subscribe((pelisPendientes) => {
            this.pelisPendientes = pelisPendientes;
            console.log('Pelis Pendientes:', this.pelisPendientes);
          });

          this.movieService.pelisVistas$.subscribe((pelisVistas) => {
            this.pelisVistas = pelisVistas;
            console.log('Pelis Vistas:', this.pelisVistas);
          });

          this.movieService.pelisFavs$.subscribe((pelisFavoritas) => {
            this.pelisFavoritas = pelisFavoritas;
            console.log('Pelis Favoritas:', this.pelisFavoritas);
          });
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b
        } catch (error) {
          console.error('Error al obtener listas del usuario:', error);
        }
      }
    });
  }

  search(): void {
    this.tmdbService.searchMovies(this.searchQuery).subscribe((data) => {
<<<<<<< HEAD
      
      if(data.results.length === 0)
=======

      if (data.results.length === 0)
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b
        this.openSnackBarPeliNoEncontrada();

      this.searchResults = data.results;
    });
  }

<<<<<<< HEAD
  async addPeliPendienteToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisPendientesDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.openSnackBarError()
  }


  async addPeliVistaToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisVistasDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.openSnackBarError()
  }

  async addPeliFavToDB(movie: any): Promise<void> {
    const resultado = await this.movieService.addPelisFavoritasDB(this.userId, movie);

    if (resultado) {
      this.openSnackBarOK();
    }
    else
      this.openSnackBarError()
=======
  // Añadir peliculas a las listas
  async addPeliPendienteToDB(movie: any): Promise<void> {
    if (this.existeEnListaPendientes(movie)) {
      this.confirmDelete(movie, 'pelisPendientes');
    }
    else {
      try {
        console.log('Antes de agregar a Pendientes:', this.pelisPendientes);
        // Lógica para agregar la película a la base de datos
        const resultado = await this.movieService.addMovieToCategory(this.userId, 'pelisPendientes', movie);

        if (resultado) {
          this.openSnackBarOK();
          this.pelisPendientes.push(movie); // Actualizar la lista local
        } else {
          this.openSnackBarError();
        }
        console.log('Después de agregar a Pendientes:', this.pelisPendientes);
      } catch (error) {
        console.error("Error al agregar la película a la categoría:", error);
        this.openSnackBarError();
      }
    }
  }

  async addPeliVistaToDB(movie: any): Promise<void> {
    if (this.existeEnListaVistas(movie)) {
      this.confirmDelete(movie, 'pelisVistas');
    }
    else {
      try {
        const resultado = await this.movieService.addMovieToCategory(this.userId, 'pelisVistas', movie);

        if (resultado) {
          this.openSnackBarOK();
          this.pelisVistas.push(movie);
        } else {
          this.openSnackBarError();
        }
      } catch (error) {
        console.error("Error al agregar la película a la categoría:", error);
        this.openSnackBarError();
      }
    }
  }

  async addPeliFavToDB(movie: any): Promise<void> {
    if (this.existeEnListaFavoritas(movie)) {
      this.confirmDelete(movie, 'pelisFavs');
    }
    else {
      try {
        const resultado = await this.movieService.addMovieToCategory(this.userId, 'pelisFavs', movie);

        if (resultado) {
          this.openSnackBarOK();
          console.log(this.pelisFavoritas)
          this.pelisFavoritas.push(movie);
        } else {
          this.openSnackBarError();
        }
      } catch (error) {
        console.error("Error al agregar la película a la categoría:", error);
        this.openSnackBarError();
      }
    }
  }

  // Métodos para eliminar pelis de listas
  async eliminarPeliPendiente(movie: any) {
    try {
      // Lógica para eliminar la película de la base de datos
      await this.movieService.removeMovieFromCategory(this.userId, 'pelisPendientes', movie);

      // Obtener la lista actualizada después de eliminar la película de la base de datos
      const updatedPelisPendientes = await this.movieService.getListsByUserId(this.userId);
      this.pelisPendientes = updatedPelisPendientes.pelisPendientes;

      // Lógica adicional según tus necesidades
    } catch (error) {
      console.error("Error al eliminar la película de la categoría:", error);
    }
  }

  async eliminarPeliVista(movie: any) {
    try {
      // Lógica para eliminar la película de la base de datos
      await this.movieService.removeMovieFromCategory(this.userId, 'pelisVistas', movie);

      // Obtener la lista actualizada después de eliminar la película de la base de datos
      const updatedPelisVistas = await this.movieService.getListsByUserId(this.userId);
      this.pelisVistas = updatedPelisVistas.pelisVistas;

      // Lógica adicional según tus necesidades
    } catch (error) {
      console.error("Error al eliminar la película de la categoría:", error);
    }
  }

  async eliminarPeliFavorita(movie: any) {
    try {
      // Lógica para eliminar la película de la base de datos
      await this.movieService.removeMovieFromCategory(this.userId, 'pelisFavs', movie);

      // Obtener la lista actualizada después de eliminar la película de la base de datos
      const updatedPelisFavs = await this.movieService.getListsByUserId(this.userId);
      this.pelisFavoritas = updatedPelisFavs.pelisFavs;

      // Lógica adicional según tus necesidades
    } catch (error) {
      console.error("Error al eliminar la película de la categoría:", error);
    }
  }

  // Comprovar las pelis que ya estén en alguna lista
  existeEnListaPendientes(movie: any): boolean {
    // Verificar si 'pelisPendientes' está definido
    if (this.pelisPendientes) {
      // Utilizar 'some' para comprobar si hay alguna película en la lista que coincida con 'movie'
      return this.pelisPendientes.some(function (pelicula) {
        return pelicula.id === movie.id;
      });
    }
    return false;
  }


  existeEnListaVistas(movie: any): boolean {
    if (this.pelisVistas) {
      return this.pelisVistas.some(function (pelicula) {
        return pelicula.id === movie.id;
      });
    }
    return false;
  }

  existeEnListaFavoritas(movie: any): boolean {
    if (this.pelisFavoritas) {
      return this.pelisFavoritas.some(function (pelicula) {
        return pelicula.id === movie.id;
      });
    }
    return false;
  }


  // Dialog para confirmar la eliminación de la peli de una lista
  confirmDelete(movie: any, category: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: `¿Estás seguro de que quieres eliminar "${movie.title}" de la lista?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (category == 'pelisPendientes')
          this.eliminarPeliPendiente(movie);
        if (category == 'pelisVistas')
          this.eliminarPeliVista(movie);
        if (category == 'pelisFavs')
          this.eliminarPeliFavorita(movie);
      }
    });
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b
  }

  openSnackBarOK() {
    return this._snackBar.open('Película añadida con éxito😀', 'Cerrar', {
      duration: 2500,
      verticalPosition: 'top',
      horizontalPosition: 'end',
    });
  }

  openSnackBarError() {
    return this._snackBar.open('Esta película ya ha sido añadida anteriormente🥴', 'Cerrar', {
      duration: 2500,
      verticalPosition: 'top',
      horizontalPosition: 'end',
    });
  }

  openSnackBarPeliNoEncontrada() {
    return this._snackBar.open('Película no encontrada😅', 'Cerrar', {
      duration: 2500,
      verticalPosition: 'top',
      horizontalPosition: 'end',
    });
  }
}