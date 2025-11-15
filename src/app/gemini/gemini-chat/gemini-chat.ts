import { Component, inject, signal } from '@angular/core';
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

  private readonly geminiService = inject(GeminiService);

  async sendPrompt() {
    const prompt = this.userInput().trim();
    if (!prompt) return;

    this.loading.set(true);
    this.response.set('');

    try {
      const result = await this.geminiService.askGemini(prompt);
      this.response.set(result);
    } catch (err) {
      console.error(err);
      this.response.set('❌ Error al comunicarse con Gemini.');
    } finally {
      this.loading.set(false);
    }
  }

  onInputChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.userInput.set(target.value);
  }
}
