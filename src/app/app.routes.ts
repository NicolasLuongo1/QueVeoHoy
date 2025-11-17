
import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home/home';
import { TmdbLogin } from './tmdb/tmdb-login/tmdb-login';
import { MovieDetail } from './pages/movie-detail/movie-detail';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: TmdbLogin },
	{ path: 'home', component: HomeComponent, canActivate: [authGuard] },
	{path:'detail/:id', component:MovieDetail, title:'Detalle de pelicula', canActivate: [authGuard]},
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
];
