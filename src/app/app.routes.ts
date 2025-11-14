
import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home/home';
import { TmdbLogin } from './tmdb/tmdb-login/tmdb-login';

export const routes: Routes = [
	{ path: 'login', component: TmdbLogin },
	{ path: 'home', component: HomeComponent },
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
];
