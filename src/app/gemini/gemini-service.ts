import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promptBase } from './gemini-chat/promt';
import { environment } from '../enviroments/enviroment';
import { TMDBClient } from '../services/tmbdClient';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private readonly genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  private readonly tmdb = inject(TMDBClient);

  async askGemini(prompt: string): Promise<string> {

    const categories = this.tmdb.categories();
    const categoriesList = categories.join(', ');

    const aiContext = `
Lista de categorías válidas (no mostrar al usuario):
${categoriesList}`.trim();

    const finalPrompt = `
${promptBase}

${aiContext}

Usuario: "${prompt}"
`.trim();

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });

    const result = await model.generateContent(finalPrompt);
    return result.response.text();
  }
}
