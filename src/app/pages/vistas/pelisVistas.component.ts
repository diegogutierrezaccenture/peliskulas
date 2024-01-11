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
}