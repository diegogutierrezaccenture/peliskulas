import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MovieService } from '../../core/services/movie.service';
import { MatButtonModule } from "@angular/material/button";

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
  ) { }

  @Input() movie: any;
  @Input() userId: any;
  @Input() listaPelis: any;
  @Input() categoria: any;
  @Output() listaPelisActualizada: EventEmitter<any> = new EventEmitter();

  confirmDelete(movie: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message: `¿Estás seguro de que quieres eliminar "${movie.title}" de la lista Pendientes?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(this.categoria)
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
