import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieModalService {
  private movieSource = new BehaviorSubject(null);
  currentMovie = this.movieSource.asObservable();

  openModal(movieDetails: any) {
    this.movieSource.next(movieDetails);
  }
}
