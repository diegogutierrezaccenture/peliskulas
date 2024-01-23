import { Injectable, OnInit } from '@angular/core';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Observable, Subject } from 'rxjs';
import { AuthService } from "../../core/services/auth.service";
import { User } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    private database = getDatabase();
    private dataSubject = new Subject<{ pelisPendientes: any[], pelisVistas: any[], pelisFavs: any[] }>();
    public user$: Observable<User | null> | undefined;
    public userId: any;
    private userDataLoaded: boolean = false;

    constructor(public authService: AuthService) {
        this.user$ = this.authService.user$;

        this.user$.subscribe(async (user) => {
            if (user) {
                this.userId = user.uid;
                // Llama a listenToUserData solo si aún no se ha cargado la información del usuario
                if (!this.userDataLoaded) {
                    await this.listenToUserData();
                }
            }
        })
    }

    private async listenToUserData() {
        // Obtener el userId según tu lógica (por ejemplo, desde la autenticación de Firebase)
        const userRef = ref(this.database, 'users/' + this.userId);

        // Adjuntar un oyente asincrónico para cambios en la referencia de usuario
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val() || {};

            const pelisPendientes = userData.pelisPendientes || [];
            const pelisVistas = userData.pelisVistas || [];
            const pelisFavs = userData.pelisFavs || [];

            // Notificar a los observadores (componentes) sobre los cambios
            this.dataSubject.next({ pelisPendientes, pelisVistas, pelisFavs });

            // Marcar que los datos del usuario han sido cargados
            this.userDataLoaded = true;
        });
    }

    getLists(): Observable<{ pelisPendientes: any[], pelisVistas: any[], pelisFavs: any[] }> {
        return this.dataSubject.asObservable();
    }
}
