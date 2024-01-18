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
          const userLists = await this.movieService.getListsByUserId(this.userId);
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