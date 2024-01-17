import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
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

  popularMovies: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];

  userLists: any;
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
          this.userLists = await this.movieService.getListsByUserId(this.userId);
          this.pelisPendientes = this.userLists.pelisPendientes;
          this.pelisVistas = this.userLists.pelisVistas;
          this.pelisFavoritas = this.userLists.pelisFavoritas;
        } catch (error) {
          console.error('Error al obtener listas del usuario:', error);
        }
      }
    });
  }

  search(): void {
    this.tmdbService.searchMovies(this.searchQuery).subscribe((data) => {

      if (data.results.length === 0)
        this.openSnackBarPeliNoEncontrada();

      this.searchResults = data.results;
    });
  }

  // Añadir peliculas a las listas
  async addPeliPendienteToDB(movie: any): Promise<void> {
    if (this.existeEnListaPendientes(movie)) {
      this.confirmDelete(movie, 'pelisPendientes');
    }
    else {
      try {
        // Lógica para agregar la película a la base de datos
        const resultado = await this.movieService.addMovieToCategory(this.userId, 'pelisPendientes', movie);

        if (resultado) {
          this.openSnackBarOK();
          this.pelisPendientes.push(movie); // Actualizar la lista local
        } else {
          this.openSnackBarError();
        }
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
    // Verificar si 'userList.pelisPendientes' está definido
    if (this.pelisPendientes) {
      // Utilizar 'some' para comprobar si hay alguna película en la lista que coincida con 'movie'
      return this.pelisPendientes.some((pelicula: { id: any; }) => pelicula.id === movie.id);
    }
    return false;
  }

  existeEnListaVistas(movie: any): boolean {
    if (this.pelisVistas) {
      return this.pelisVistas.some((pelicula: { id: any; }) => pelicula.id === movie.id);
    }
    return false;
  }

  existeEnListaFavoritas(movie: any): boolean {
    if (this.pelisFavoritas) {
      return this.pelisFavoritas.some((pelicula: { id: any; }) => pelicula.id === movie.id);
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