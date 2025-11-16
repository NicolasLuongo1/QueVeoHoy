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

## 📁 Estructura de páginas y componentes

```
./src/app/pages
    /movie-detail
        /_components
            /movie-header
                movie-header.ts
                movie-header.html
                movie-header.css
            /movie-banner
                movie-banner.ts
                movie-banner.html
                movie-banner.css
            /movie-description
                movie-description.ts
                movie-description.html
                movie-description.css
            /movie-cast
                movie-cast.ts
                movie-cast.html
                movie-cast.css
            /movie-reviews
                movie-reviews.ts
                movie-reviews.html
                movie-reviews.css
            /movie-info-sidebar
                movie-info-sidebar.ts
                movie-info-sidebar.html
                movie-info-sidebar.css
        movie-detail.ts
        movie-detail.html
        movie-detail.css
```

### Componentes modulares

La página de detalle de película (`movie-detail`) está estructurada de forma modular:

- **`movie-header`**: Header con logo y acciones de navegación
- **`movie-banner`**: Banner principal con imagen de fondo, título y botones de acción
- **`movie-description`**: Sección de descripción de la película
- **`movie-cast`**: Sección de reparto con scroll horizontal
- **`movie-reviews`**: Sección de reseñas de usuarios
- **`movie-info-sidebar`**: Barra lateral con información adicional (año, idiomas, calificaciones, géneros, director, música)


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

