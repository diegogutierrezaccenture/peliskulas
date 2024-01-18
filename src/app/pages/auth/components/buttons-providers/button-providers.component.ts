import { NgOptimizedImage } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

export type Provider = 'google';

@Component({
    standalone: true,
    imports: [NgOptimizedImage],
    selector: 'app-button-providers',
    templateUrl: './button-providers.component.html',
    styleUrls: ['./button-providers.component.scss'],
})
export class ButtonProviders {
    @Input() isLogin = false;

    private _authService = inject(AuthService);
    private _router = inject(Router);

    providerAction(provider: Provider): void {
        if (provider === 'google') {
            this.signUpWithGoogle();
        }
    }

    async signUpWithGoogle(): Promise<void> {
        try {
            const result = await this._authService.signInWithGoogleProvider();
            this._router.navigateByUrl('/');
        } catch (error) {
            console.log(error);
        }
    }
}