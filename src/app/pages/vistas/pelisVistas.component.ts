import { Component, OnInit, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from "@angular/material/snack-bar";

import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  standalone: true,
  selector: 'pelisVistas-name',
  templateUrl: './pelisVistas.component.html',
  styleUrls: ['./pelisVistas.component.css'],
  providers: [TmdbService],
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, FormsModule, CommonModule]
})

export default class pelisVistasComponent implements OnInit {

  constructor(private tmdbService: TmdbService,
    private movieService: MovieService,
    public authService: AuthService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  user$ = this.authService.user$;
  public userId: any;
  public userLists: any;
  listaPelisVistas: any[] = [];

  ngOnInit(): void {
    // Obtener UID del usuario
    this.user$.subscribe(async (user) => {
      if (user) {
        this.userId = user.uid;

        // Obtener la lista de películas VISTAS del usuario
        try {
          this.userLists = await this.movieService.getListsByUserId(this.userId);
          this.listaPelisVistas = this.userLists.pelisVistas;

        } catch (error) {
          console.error('Error al obtener listas del usuario:', error);
        }
      }
    });
  }

  searchQuery: string = '';
  searchResults: any[] = [];
  searchPendientes() {
    this.searchResults = this.listaPelisVistas.filter(movie => movie.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
    if (this.searchResults.length === 0)
      this.openSnackBarPeliNoEncontrada();
  }

  eliminarPeliVista(movie: any) {
    this.movieService.removeFromPelisVistasDB(this.userId, movie)
      .then((filteredList) => {
        this.listaPelisVistas = filteredList;
      })
      .catch((error) => {
        console.error('Error al eliminar película vista:', error);
      });
  }

  confirmDelete(movie: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: `¿Estás seguro de que quieres eliminar "${movie.title}" de la lista Vistas?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eliminarPeliVista(movie);
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