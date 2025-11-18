import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { GeminiService } from '../gemini-service';

@Component({
  selector: 'gemini-chat',
  standalone: true,
  imports: [],
  templateUrl: './gemini-chat.html',
  styleUrl: './gemini-chat.css'
})
export class GeminiChat {

  userInput = signal('');
  response = signal('');
  loading = signal(false);
  searchOnlyTitles = signal(false);

  @Output()
  filtersEvent = new EventEmitter<{
    genres: string[];
    actors: string[];
    onlyTitles?: boolean;
  }>();

  private readonly geminiService = inject(GeminiService);

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.userInput.set(value);
  }

  toggleOnlyTitles(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.searchOnlyTitles.set(checked);
  }

  async sendPrompt() {
    const prompt = this.userInput().trim();
    if (!prompt) return;

    this.loading.set(true);
    this.response.set('');

    try {
      const result = await this.geminiService.askGemini(prompt);
      this.response.set(result);

      // Intentar parsear JSON (Gemini ahora devuelve JSON)
      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch {
        console.warn("La respuesta no es JSON válido, intento fallback.");
        parsed = null;
      }

      if (parsed) {
        const categorias = parsed.categorias ?? [];
        const actores = parsed.actores ?? [];
        const personajes = parsed.personajes ?? [];

        this.filtersEvent.emit({
          genres: this.searchOnlyTitles() ? [] : categorias,
          actors: this.searchOnlyTitles() ? [] : [...actores, ...personajes],
          onlyTitles: this.searchOnlyTitles()
        });

        return;
      }

      // Si no vino JSON, fallback a texto (regex viejo)
      const regexCategories = /Categorías:\s*\[?(.*?)\]?(\n|$)/is;
      const regexActors = /Actores\/Personajes:\s*\[?(.*?)\]?(\n|$)/is;

      const categories = (regexCategories.exec(result)?.[1] ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const actors = (regexActors.exec(result)?.[1] ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      this.filtersEvent.emit({
        genres: categories,
        actors
      });

    } catch (err) {
      console.error("Error al comunicarse con Gemini:", err);
      this.response.set('Error al comunicarse con Gemini.');
    } finally {
      this.loading.set(false);
    }
  }

}
