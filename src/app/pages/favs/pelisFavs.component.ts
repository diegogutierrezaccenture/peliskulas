import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { MovieCardComponent } from "../../components/movie-card/movie-card.component";
import { MovieService } from '../../core/services/movie.service';
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  standalone: true,
  selector: 'pelisFavs-name',
  templateUrl: './pelisFavs.component.html',
  styleUrls: ['./pelisFavs.component.css'],
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, FormsModule, CommonModule, MovieCardComponent]
})

export default class pelisFavsComponent implements OnInit {

  constructor(
    private movieService: MovieService,
    public authService: AuthService,
    private _snackBar: MatSnackBar
  ) { }

  user$ = this.authService.user$;
  public userId: any;
  public userLists: any;
  listaPelisFavs: any[] = [];
  categoria: string = 'pelisFavs';

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

  obtenerListaPelisActualizada(listaPelisActualizada: any): void {
    this.listaPelisFavs = listaPelisActualizada;
  }

  searchFavs() {
    this.searchResults = this.listaPelisFavs.filter(movie => movie.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
    if (this.searchResults.length === 0)
      this.openSnackBarPeliNoEncontrada();
  }

  openSnackBarPeliNoEncontrada() {
    return this._snackBar.open('Película no encontrada😅', 'Cerrar', {
      duration: 2500,
      verticalPosition: 'top',
      horizontalPosition: 'end',
    });
  }
}