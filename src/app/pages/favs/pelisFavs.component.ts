import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';

import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  standalone: true,
  selector: 'pelisFavs-name',
  templateUrl: './pelisFavs.component.html',
  styleUrls: ['./pelisFavs.component.css'],
  providers: [TmdbService],
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, FormsModule, CommonModule]
})

export default class pelisFavsComponent implements OnInit {

  constructor(private tmdbService: TmdbService,
    private movieService: MovieService,
    public authService: AuthService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  user$ = this.authService.user$;
  public userId: any;
  public userLists: any;
  listaPelisFavs: any[] = [];

  ngOnInit(): void {
    // Obtener UID del usuario
    this.user$.subscribe(async (user) => {
      if (user) {
        this.userId = user.uid;

        // Obtener la lista de películas FAVORITAS del usuario
        try {
          this.userLists = await this.movieService.getListsByUserId(this.userId);
          this.listaPelisFavs = this.userLists.pelisFavs;

        } catch (error) {
          console.error('Error al obtener listas del usuario:', error);
        }
      }
    });
  }

  searchQuery: string = '';
  searchResults: any[] = [];

  searchPendientes() {
    this.searchResults = this.listaPelisFavs.filter(movie => movie.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
    if (this.searchResults.length === 0)
      this.openSnackBarPeliNoEncontrada();
  }

  eliminarPeliFav(movie: any) {
    this.movieService.removeFromPelisFavoritasDB(this.userId, movie)
      .then((filteredList) => {
        this.listaPelisFavs = filteredList;
      })
      .catch((error) => {
        console.error('Error al eliminar película favorita:', error);
      });
  }

  confirmDelete(movie: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: `¿Estás seguro de que quieres eliminar "${movie.title}" de la lista Favoritas?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eliminarPeliFav(movie);
      }
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