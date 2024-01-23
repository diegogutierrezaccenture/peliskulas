// movie-list.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ListasPelis {
  private pelisPendientesSubject = new BehaviorSubject<any[]>([]);
  private pelisVistasSubject = new BehaviorSubject<any[]>([]);
  private pelisFavsSubject = new BehaviorSubject<any[]>([]);

  pelisPendientes$: Observable<any[]> = this.pelisPendientesSubject.asObservable();
  pelisVistas$: Observable<any[]> = this.pelisVistasSubject.asObservable();
  pelisFavs$: Observable<any[]> = this.pelisFavsSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    this.firebaseService.getLists().subscribe(data => {
      if (data) {
        this.pelisPendientesSubject.next(data.pelisPendientes.slice());
        this.pelisVistasSubject.next(data.pelisVistas.slice());
        this.pelisFavsSubject.next(data.pelisFavs.slice());
      }
    });
  }
}
