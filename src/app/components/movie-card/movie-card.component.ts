import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MovieService } from '../../core/services/movie.service';
import { MatButtonModule } from "@angular/material/button";

import { MatDialog } from '@angular/material/dialog';
import { MovieDetailsComponent } from '../../components/movie-details/movie-details.component';
import { MovieModalService } from '../../core/services/movie-modal.service';

@Component({
  standalone: true,
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css'],
  imports: [MatIconModule, MatButtonModule]
})

export class MovieCardComponent {
  constructor(public dialog: MatDialog,
    private movieService: MovieService,
    private movieModalService: MovieModalService
  ) { }

  @Input() movie: any;
  @Input() userId: any;
  @Input() listaPelis: any;
  @Input() categoria: any;
  @Output() listaPelisActualizada: EventEmitter<any> = new EventEmitter();

  openDialog(movie: any) {
    // Llama al servicio para pasar la información de la película al componente de detalles
    this.movieModalService.openModal(movie);

    // Abre el componente de detalles utilizando MatDialog
    const dialogRef = this.dialog.open(MovieDetailsComponent);
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

  eliminarPeliPendiente(movie: any) {
    this.movieService.removeMovieFromCategory(this.userId, this.categoria, movie)
      .then((filteredList) => {
        this.listaPelis = filteredList;
        // Emite el evento al padre para pasarle la lista actualizada
        this.listaPelisActualizada.emit(this.listaPelis);
      })
      .catch((error) => {
        console.error('Error al eliminar película pendiente:', error);
      });
  }
}
