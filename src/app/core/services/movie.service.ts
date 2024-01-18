import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { getDatabase, ref, get, set } from "firebase/database";
import { isEqual } from 'lodash';
=======
import { getDatabase, ref, get, set, onValue } from "firebase/database";
import { isEqual } from 'lodash';
import { BehaviorSubject } from 'rxjs';
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b

@Injectable({
  providedIn: 'root'
})

export class MovieService {

  database = getDatabase();

<<<<<<< HEAD
=======
  // BehaviorSubject para emitir eventos cuando cambian las listas de películas
  private pelisPendientesSubject = new BehaviorSubject<any[]>([]);
  private pelisVistasSubject = new BehaviorSubject<any[]>([]);
  private pelisFavsSubject = new BehaviorSubject<any[]>([]);

  // Obtener las películas pendientes como un observable
  public pelisPendientes$ = this.pelisPendientesSubject.asObservable();
  public pelisVistas$ = this.pelisVistasSubject.asObservable();
  public pelisFavs$ = this.pelisFavsSubject.asObservable();

  subscribeToUserMovieLists(userId: any): void {
    const userRef = ref(this.database, 'users/' + userId);

    // Utilizar onValue para obtener datos iniciales y suscribirse a cambios
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val() || {};

      const pelisPendientes = userData.pelisPendientes || [];
      const pelisVistas = userData.pelisVistas || [];
      const pelisFavs = userData.pelisFavs || [];

      pelisPendientes.reverse();
      pelisVistas.reverse();
      pelisFavs.reverse();

      this.pelisPendientesSubject.next(pelisPendientes);
      this.pelisVistasSubject.next(pelisVistas);
      this.pelisFavsSubject.next(pelisFavs);
    });
  }

>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b
  // Obtener las peliculas pendientes, vistas y favoritas de un usuario
  async getListsByUserId(userId: any): Promise<{ pelisPendientes: any[], pelisVistas: any[], pelisFavs: any[] }> {
    const userRef = ref(this.database, 'users/' + userId);

    // Obtener los datos actuales del usuario
    const snapshot = await get(userRef);
    const userData = snapshot.val() || {};

    // Obtener las listas o devolver arrays vacíos si no existen
    const pelisPendientes = userData.pelisPendientes || [];
    const pelisVistas = userData.pelisVistas || [];
    const pelisFavs = userData.pelisFavs || [];

    pelisPendientes.reverse();
    pelisVistas.reverse();
    pelisFavs.reverse();

    return { pelisPendientes, pelisVistas, pelisFavs };
  }

  // Añadir pelicula a la BD
  async addPelisPendientesDB(userId: any, peli: string): Promise<boolean> {
    return await this.addMovieToCategory(userId, 'pelisPendientes', peli);
  }

  async addPelisVistasDB(userId: any, peli: string): Promise<boolean> {
    return await this.addMovieToCategory(userId, 'pelisVistas', peli);
  }

  async addPelisFavoritasDB(userId: any, peli: string): Promise<boolean> {
    return await this.addMovieToCategory(userId, 'pelisFavs', peli);
  }

<<<<<<< HEAD
  private async addMovieToCategory(userId: any, category: string, peli: any): Promise<boolean> {
=======
  public async addMovieToCategory(userId: any, category: string, peli: any): Promise<boolean> {
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b
    const userRef = ref(this.database, 'users/' + userId);

    try {
      // Obtener los datos actuales del usuario
      const userData = (await get(userRef)).val() || {};

      // Obtener la lista actual de la categoría (o inicializarla si es la primera vez)
      const currentList = userData[category] || [];

      // Verificar si la película ya está en la lista (comparación basada en un campo único, como 'id')
      const isMovieAlreadyAdded = currentList.some((item: any) => item.id === peli.id);

      if (!isMovieAlreadyAdded) {
        // Agregar la nueva película a la lista
        currentList.push(peli);

        // Modificar solo la categoría relevante
        userData[category] = currentList;

        // Actualizar la base de datos con los datos modificados
        await set(userRef, userData);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error al agregar la película a la categoría:", error);
      return false;
    }
  }

  // Eliminar pelicula de la BD
  async removeFromPelisPendientesDB(userId: any, peli: string): Promise<any[]> {
    return await this.removeMovieFromCategory(userId, 'pelisPendientes', peli);
  }

  async removeFromPelisVistasDB(userId: any, peli: string): Promise<any[]> {
    return await this.removeMovieFromCategory(userId, 'pelisVistas', peli);
  }

  async removeFromPelisFavoritasDB(userId: any, peli: string): Promise<any[]> {
    return await this.removeMovieFromCategory(userId, 'pelisFavs', peli);
  }

<<<<<<< HEAD
  private async removeMovieFromCategory(userId: any, category: string, peli: any): Promise<any[]> {
    const userRef = ref(this.database, 'users/' + userId);

    // Obtener los datos actuales del usuario
    const userData = (await get(userRef)).val() || {};

    // Obtener la lista actual de la categoría (o inicializarla si es la primera vez)
    const currentList = userData[category] || [];

    // Filtrar todos los elementos que no sean iguales a peli mediante comparación profunda
    const filteredList = currentList.filter((item: any) => !isEqual(item, peli));

    // Modificar solo la categoría relevante
    userData[category] = filteredList;

    // Actualizar la base de datos con los datos modificados
    set(userRef, userData);

    // Devolver la lista filtrada
    return filteredList;
=======
  public async removeMovieFromCategory(userId: any, category: string, movieToRemove: any): Promise<any[]> {
    const userRef = ref(this.database, 'users/' + userId);

    try {
      // Obtener los datos actuales del usuario
      const userData = (await get(userRef)).val() || {};

      // Obtener la lista actual de la categoría (o inicializarla si es la primera vez)
      const currentList = userData[category] || [];

      // Actualizar la lista eliminando la película
      const updatedList = currentList.filter((movie: any) => movie.id !== movieToRemove.id);

      // Modificar solo la categoría relevante
      userData[category] = updatedList;

      // Actualizar la base de datos con los datos modificados
      await set(userRef, userData);

      // Devolver la lista actualizada
      return updatedList;
    } catch (error) {
      console.error("Error al eliminar la película de la categoría:", error);
      return [];
    }
>>>>>>> f5ef997608c053e13fc5aa39f9ccd6948fd9156b
  }

}