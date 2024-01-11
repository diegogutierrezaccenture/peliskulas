import { Component, OnInit, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { AuthService } from "../../core/services/auth.service";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";

import { TmdbService } from '../../core/services/tmdb.service';
import { MovieService } from '../../core/services/movie.service';

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
}