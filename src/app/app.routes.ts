
import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { TmdbLogin } from './tmdb/tmdb-login/tmdb-login';
import { MovieDetail } from './pages/movie-detail/movie-detail';
import { authGuard } from './guards/auth.guard';
import { Favorites } from './pages/favorites/favorites';
import { loginGuard } from './guards/login.guards';


export const routes: Routes = [
	{ path: 'login', component: TmdbLogin, canActivate: [loginGuard] },
	{ path: 'home', component: HomeComponent, canActivate: [authGuard] },
	{ path: 'favorites', component: Favorites, canActivate: [authGuard] },
	{ path: 'detail/:id', component: MovieDetail, title: 'Detalle de pelicula', canActivate: [authGuard] },
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{path: '**', redirectTo: '/login' }

];
