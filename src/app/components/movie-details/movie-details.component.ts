import { Component, OnInit } from '@angular/core';
import { MovieModalService } from '../../core/services/movie-modal.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule,]
})
export class MovieDetailsComponent implements OnInit {
  movieDetails: any;

  constructor(private movieModalService: MovieModalService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.movieModalService.currentMovie.subscribe((movieDetails) => (this.movieDetails = movieDetails));
  }

  getSafeUrl(movieDetails: { movieTrailers: { results: string | any[]; }; }) {
    const videoKey = movieDetails.movieTrailers.results[movieDetails.movieTrailers.results.length - 1].key;
    const url = `https://www.youtube.com/embed/${videoKey}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
