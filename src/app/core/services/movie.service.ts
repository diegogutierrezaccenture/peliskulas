import { Injectable } from '@angular/core';
import { getDatabase, ref, get, set } from "firebase/database";
import { isEqual } from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class MovieService {

  database = getDatabase();

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

  private async addMovieToCategory(userId: any, category: string, peli: any): Promise<boolean> {
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
        currentList.unshift(peli);

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
  }

}