import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GeminiChat } from './gemini/gemini-chat/gemini-chat';
import { TMDBClient } from './services/TMBDClient';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GeminiChat],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly tmdbClient = inject(TMDBClient);

  ngOnInit(): void {
    this.loadSampleMovies();
    this.loadCategories();
   }

  private loadSampleMovies(): void {
    this.tmdbClient.discoverMovies({
      page: 1,
      with_cast: '1100',
      with_genres: '28'
    }).subscribe({
      next: (response) => {
        console.log('Resultados discover/movie:', response);
      },
      error: (error) => {
        console.error('Error al consultar TMDB:', error);
      }
    });
  }

  private loadCategories(){
    this.tmdbClient.getCategories().subscribe({
      next:(resp)=>{
        console.log('Resultados de generos',resp)
      },
      error:(msj)=>{
        console.error('Fallo consultar las categorias', msj)
      }
    })
  }

  protected readonly title = signal('QueVeoHoy');
}
