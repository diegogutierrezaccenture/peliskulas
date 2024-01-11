import { Injectable, inject } from '@angular/core';
import {
    Auth,
    AuthProvider,
    GithubAuthProvider,
    GoogleAuthProvider,
    UserCredential,
    authState,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface Credential {
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private authInstance: Auth;
    readonly authState$ = authState(this.auth);

    // Propiedades para almacenar detalles del usuario actual
    user$: Observable<User | null>;

    constructor(private auth: Auth) {
        this.authInstance = auth;
        this.user$ = authState(this.authInstance);
    }

    signUpWithEmailAndPassword(credential: Credential): Promise<UserCredential> {
        return createUserWithEmailAndPassword(
            this.auth,
            credential.email,
            credential.password
        );
    }

    logInWithEmailAndPassword(credential: Credential) {
        return signInWithEmailAndPassword(
            this.auth,
            credential.email,
            credential.password
        );
    }

    logOut(): Promise<void> {
        return this.auth.signOut();
    }

    signInWithGoogleProvider(): Promise<UserCredential> {
        const provider = new GoogleAuthProvider();

        return this.callPopUp(provider);
    }

    signInWithGithubProvider(): Promise<UserCredential> {
        const provider = new GithubAuthProvider();

        return this.callPopUp(provider);
    }

    async callPopUp(provider: AuthProvider): Promise<UserCredential> {
        try {
            const result = await signInWithPopup(this.auth, provider);

            return result;
        } catch (error: any) {
            return error;
        }
    }
}