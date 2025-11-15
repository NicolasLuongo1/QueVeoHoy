
import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home/home';
import { TmdbLogin } from './tmdb/tmdb-login/tmdb-login';
import { MovieDetail } from './pages/movie-detail/movie-detail';

export const routes: Routes = [
	{ path: 'login', component: TmdbLogin },
	{ path: 'home', component: HomeComponent },
	{path:'detail/:id', component:MovieDetail, title:'Detalle de pelicula'},
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
];
