import { Routes } from '@angular/router';

import { authGuard, publicGuard } from './core/guards';

import HomeComponent from './pages/home/home.component';
import pelisPendientesComponent from './pages/pendientes/pelisPendientes.component';
import pelisVistasComponent from './pages/vistas/pelisVistas.component';
import pelisFavsComponent from './pages/favs/pelisFavs.component';
import SignUpComponent from './pages/auth/sign-up/sign-up.component';
import LogInComponent from './pages/auth/login/login.component';

export const routes: Routes = [
  {
    path: 'inicio',
    canActivate: [authGuard],
    component: HomeComponent,
    children: [
      {
        path: 'pendientes',
        component: pelisPendientesComponent,
      },
      {
        path: 'vistas',
        component: pelisVistasComponent,
      },
      {
        path: 'favs',
        component: pelisFavsComponent,
      },
    ]
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'sign-up',
        component: SignUpComponent,
      },
      {
        path: 'login',
        component: LogInComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  },
];
