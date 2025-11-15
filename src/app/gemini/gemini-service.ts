import { inject, Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promptBase } from './gemini-chat/promt';
import { environment } from '../enviroments/enviroment';
import { TMDBClient } from '../services/tmbdClient'; // <--- Importante

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private genAI: GoogleGenerativeAI;

  protected readonly tmdb = inject(TMDBClient);

  constructor() {
    const apiKey = environment.geminiApiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

async askGemini(prompt: string): Promise<string> {

  // Categorías reales desde TMDB
  const categories = this.tmdb.categories();
  const categoriesList = categories.join(', ');

  // Construimos el contexto que reemplaza la parte del prompt dinámico
  const aiContext = `
Lista de categorías válidas (no mostrar al usuario):
${categoriesList}`.trim();

  // Generamos el prompt final
  const finalPrompt = `
${promptBase}

${aiContext}

Usuario: "${prompt}" `.trim();

  const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(finalPrompt);
  const response = await result.response;
  return response.text();
}
}
