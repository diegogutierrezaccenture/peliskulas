import { Component, OnInit, inject } from "@angular/core";
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

@Component({
  standalone: true,
  selector: 'pelisPendientes-name',
  templateUrl: './pelisPendientes.component.html',
  styleUrls: ['./pelisPendientes.component.css'],
  providers: [TmdbService],
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, FormsModule, CommonModule]
})

export default class pelisPendientesComponent implements OnInit {

  constructor(private tmdbService: TmdbService,
    private movieService: MovieService,
    public authService: AuthService,
    public dialog: MatDialog
  ) { }

  user$ = this.authService.user$;
  public userId: any;
  public userLists: any;
  listaPelisPendientes: any[] = [];

  ngOnInit(): void {
    // Obtener UID del usuario
    this.user$.subscribe(async (user) => {
      if (user) {
        this.userId = user.uid;

        // Obtener la lista de películas PENDIENTES del usuario
        try {
          this.userLists = await this.movieService.getListsByUserId(this.userId);
          this.listaPelisPendientes = this.userLists.pelisPendientes;

        } catch (error) {
          console.error('Error al obtener listas del usuario:', error);
        }
      }
    });
  }

  eliminarPeliPendiente(movie: any) {
    this.movieService.removeFromPelisPendientesDB(this.userId, movie)
      .then((filteredList) => {
        this.listaPelisPendientes = filteredList;
      })
      .catch((error) => {
        console.error('Error al eliminar película pendiente:', error);
      });
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
}