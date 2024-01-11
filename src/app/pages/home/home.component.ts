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

import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';

@Component({
  standalone: true,
  selector: 'home-name',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [TmdbService],
  imports: [MatToolbarModule,
    MatButtonModule,
    MatIconModule,
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
    public router: Router
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

  listaPelisPendientes: any[] = [];

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
        console.log("UID del usuario:", this.userId);

        // Obtener todas las listas de películas del usuario
        try {
          const userLists = await this.movieService.getListsByUserId(this.userId);
          console.log('Películas Pendientes:', userLists.pelisPendientes);
          console.log('Películas Vistas:', userLists.pelisVistas);
          console.log('Películas Favoritas:', userLists.pelisFavs);
        } catch (error) {
          console.error('Error al obtener listas del usuario:', error);
        }
      }
    });
  }

  search(): void {
    this.tmdbService.searchMovies(this.searchQuery).subscribe((data) => {
      this.searchResults = data.results;
    });
  }

  addPeliPendienteToDB(movie: any): void {
    this.movieService.addPelisPendientesDB(this.userId, movie);
  }

  addPeliVistaToDB(movie: any): void {
    this.movieService.addPelisVistasDB(this.userId, movie);
  }

  addPeliFavToDB(movie: any): void {
    this.movieService.addPelisFavoritasDB(this.userId, movie);
  }
}