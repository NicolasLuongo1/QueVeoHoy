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

  @Output() filtersEvent = new EventEmitter<{ genres: string[]; actors: string[] }>();

  private readonly geminiService = inject(GeminiService);

  onInputChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.userInput.set(value);
}

async sendPrompt() {
  const prompt = this.userInput().trim();
  if (!prompt) return;

  this.loading.set(true);
  this.response.set('');

  try {
    // 1️⃣ Consultar Gemini
    const result = await this.geminiService.askGemini(prompt);

    // 🔹 Log respuesta cruda
    console.log("💬 Respuesta cruda de Gemini:", result);
    this.response.set(result);

    // 2️⃣ Extraer listas del formato devuelto por Gemini
    // Regex robusta: acepta corchetes o no, y saltos de línea
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

    // 🔹 Logs de depuración
    console.log("💡 Géneros parseados:", categories);
    console.log("💡 Actores parseados:", actors);

    // 3️⃣ Emitir filtros hacia Home
    this.filtersEvent.emit({ genres: categories, actors });

  } catch (err) {
    console.error("❌ Error al comunicarse con Gemini:", err);
    this.response.set('❌ Error al comunicarse con Gemini.');
  } finally {
    this.loading.set(false);
  }
}

}
