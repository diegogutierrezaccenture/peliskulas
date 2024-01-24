import { Component, OnInit } from '@angular/core';
import { MovieModalService } from '../../core/services/movie-modal.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent implements OnInit {
  movie: any;

  constructor(private movieModalService: MovieModalService) { }

  ngOnInit() {
    this.movieModalService.currentMovie.subscribe((movie) => (this.movie = movie));
  }
}
