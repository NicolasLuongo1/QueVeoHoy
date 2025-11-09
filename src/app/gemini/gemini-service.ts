import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMjA4MGVhN2VlODk0NmM5MGUyOGIyOTBkNzlkM2ZiZiIsIm5iZiI6MTYyNjM3NjI0Mi42NDksInN1YiI6IjYwZjA4ODMyNzQ2NDU3MDA0NjVmN2FiZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A3fJ583trdgwhIXOVRc2ACT9K5mmy6Vk_86ZB9qs5Po';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async askGemini(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const promptBase = `
Actúa como un analizador inteligente de películas. 

Tienes estas categorías posibles: Acción, Aventura, Ciencia Ficción, Comedia, Documental, Drama, Fantasía, Musical, Suspenso, Terror, Romance.

Cuando recibas un texto del usuario, debes devolver **dos listas separadas**:
1. Categorías: solo de la lista de arriba, que correspondan al contenido del mensaje.
2. Actores/Personajes: nombres de actores conocidos, personajes o franquicias mencionadas o inferibles. 
   - Si el usuario menciona un personaje o película con año o contexto, intenta deducir automáticamente el actor correspondiente.
   - Si no podés inferir el actor, devuelve al menos el personaje o franquicia exacta mencionada.
   - No inventes actores que no existan.

Formato **exacto** de salida (sin explicaciones adicionales, sin texto extra):
Categorías: [lista separada por comas]
Actores/Personajes: [lista separada por comas]

Ejemplos de entrada y salida:

Entrada: "Quiero ver una película de Batman con Christian Bale, que tenga tiros y autos de carreras"
Salida:
Categorías: Acción, Aventura
Actores/Personajes: Batman, Christian Bale

Entrada: "Quiero ver una película de Batman que lo interprete el que hizo batman que sea el actor que lo interpretó en 2008"
Salida:
Categorías: Acción, Aventura
Actores/Personajes: Batman, Christian Bale

Entrada: "Quiero ver una película de Iron Man con Robert Downey Jr."
Salida:
Categorías: Acción, Ciencia Ficción
Actores/Personajes: Iron Man, Robert Downey Jr.

Ahora analiza el siguiente mensaje del usuario y devuelve solo las listas:

Usuario: `;

const finalPrompt = `${promptBase} "${prompt}"`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response.text();
  }

}

