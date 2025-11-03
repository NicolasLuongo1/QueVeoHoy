import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GeminiChat } from './gemini/gemini-chat/gemini-chat';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GeminiChat],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('QueVeoHoy');
}
