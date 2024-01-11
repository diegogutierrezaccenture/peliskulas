import { Injectable } from '@angular/core';
import { getDatabase, ref, get, set } from "firebase/database";
import { AuthService } from "../../core/services/auth.service";

@Injectable({
  providedIn: 'root'
})

export class MovieService {

  database = getDatabase();

  async addPelisPendientesDB(userId: any, peli: string): Promise<void> {
    await this.addMovieToCategory(userId, 'pelisPendientes', peli);
  }

  async addPelisVistasDB(userId: any, peli: string): Promise<void> {
    await this.addMovieToCategory(userId, 'pelisVistas', peli);
  }

  async addPelisFavoritasDB(userId: any, peli: string): Promise<void> {
    await this.addMovieToCategory(userId, 'pelisFavs', peli);
  }

  private async addMovieToCategory(userId: any, category: string, peli: string): Promise<void> {
    const userRef = ref(this.database, 'users/' + userId);

    // Obtener los datos actuales del usuario
    const snapshot = await get(userRef);
    const userData = snapshot.val() || {};

    // Obtener la lista actual de la categoría (o inicializarla si es la primera vez)
    const currentList = userData[category] || [];

    // Verificar si la película ya está en la lista
    if (!currentList.includes(peli)) {
      // Agregar la nueva película a la lista
      currentList.push(peli);

      // Modificar solo la categoría relevante
      userData[category] = currentList;

      // Actualizar la base de datos con los datos modificados
      set(userRef, userData);
    }
  }

  async getListsByUserId(userId: any): Promise<{ pelisPendientes: any[], pelisVistas: any[], pelisFavs: any[] }> {
    const userRef = ref(this.database, 'users/' + userId);

    // Obtener los datos actuales del usuario
    const snapshot = await get(userRef);
    const userData = snapshot.val() || {};

    // Obtener las listas o devolver arrays vacíos si no existen
    const pelisPendientes = userData.pelisPendientes.reverse() || [];
    const pelisVistas = userData.pelisVistas.reverse() || [];
    const pelisFavs = userData.pelisFavs.reverse() || [];

    return { pelisPendientes, pelisVistas, pelisFavs };
  }
}