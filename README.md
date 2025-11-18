# 🎬 QueVeoHoy

**QueVeoHoy** es una aplicación web que ayuda a los usuarios a descubrir películas de manera rápida y personalizada.  

Conectándose a la **API de TMDB**, la app permite a los usuarios:  
- 🎥 Explorar películas disponibles.  
- ⭐ Marcar sus favoritas.  
- 🤖 Filtrar películas de manera inteligente usando **Gemini**, nuestra integración de IA, que interpreta búsquedas en lenguaje natural y convierte las preferencias del usuario en categorías y actores para consultar TMDB automáticamente.  

Por ejemplo, si el usuario escribe: "quiero ver películas de disparos y Batman"


Gemini analiza la intención, devuelve categorías y actores, y la app muestra directamente los resultados filtrados de TMDB, sin necesidad de recorrer categorías manualmente.  

---

## 📌 Características principales

- 🎬 **Exploración de películas:** Trae datos de TMDB y los muestra de forma clara.  
- ⭐ **Favoritos:** Permite guardar películas favoritas para consultar luego.  
- 🤖 **Búsqueda inteligente con IA:**  
  - Integración con **Gemini** para interpretar consultas en lenguaje natural.  
  - Convierte frases de búsqueda en categorías, géneros y actores.  
  - Filtra automáticamente los resultados de TMDB según estas categorías.  
- 🔐 **Integración con TMDB para autenticación:** Usuarios autenticados pueden persistir sus favoritos mediante el token de TMDB.  

---

## 🛠 Tecnologías utilizadas

- **Frontend:** Angular  
- **APIs:**  
  - TMDB para películas y autenticación  
  - Gemini para búsqueda inteligente y categorización  
- **Lenguaje:** TypeScript / JavaScript  
- **Otras:** HTTPClient para llamadas a APIs, integración con servicios externos  

---

## 🚀 Instalación

1. Clonar el repositorio:  
```bash
git clone https://github.com/NicolasLuongo1/QueVeoHoy.git
cd QueVeoHoy
```

2. Instalar dependencias:  
```bash
npm install
```

3. Configurar claves de API (TMDB y Gemini) en environment.ts::

```
export const environment = {
  production: false,
  tmdbApiKey: 'TU_API_KEY_TMDB',
  geminiApiKey: 'TU_API_KEY_GEMINI'
};
```

4. Ejecutar la app:
```
ng serve
```

