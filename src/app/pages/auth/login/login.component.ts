import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Credential } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ButtonProviders } from "../components/buttons-providers/button-providers.component";

interface LogInForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
    standalone: true,
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: [],
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        ReactiveFormsModule,
        RouterModule,
        CommonModule,
        ButtonProviders
    ]
})

export default class LogInComponent {
  hide = true;

  formBuilder = inject(FormBuilder);

  form: FormGroup<LogInForm> = this.formBuilder.group({
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: this.formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  private authService = inject(AuthService);
  private router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  get isEmailValid(): string | boolean {
    const control = this.form.get('email');

    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'Campo requerido'
        : 'Entra un correo válido';
    }

    return false;
  }

  async logIn(): Promise<void> {
    if (this.form.invalid) return;

    const credential: Credential = {
      email: this.form.value.email || '',
      password: this.form.value.password || '',
    };

    try {
      await this.authService.logInWithEmailAndPassword(credential);
      const snackBarRef = this.openSnackBar();

      snackBarRef.afterDismissed().subscribe(() => {
        this.router.navigateByUrl('/');
      });
    } catch (error) {
      console.error(error);
    }
  }

  openSnackBar() {
    return this._snackBar.open('Inicio de sesión con éxito 😀', 'Cerrar', {
      duration: 2000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });
  }
}