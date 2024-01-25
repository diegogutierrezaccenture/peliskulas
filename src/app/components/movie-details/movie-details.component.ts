import { Component, OnInit } from '@angular/core';
import { MovieModalService } from '../../core/services/movie-modal.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
  imports: [CommonModule]
})
export class MovieDetailsComponent implements OnInit {
  movieDetails: any;

  constructor(private movieModalService: MovieModalService) { }

  ngOnInit() {
    this.movieModalService.currentMovie.subscribe((movieDetails) => (this.movieDetails = movieDetails));
  }
}
