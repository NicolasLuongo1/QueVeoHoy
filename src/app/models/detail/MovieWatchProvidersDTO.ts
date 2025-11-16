export interface MovieWatchProvidersDTO {
  id: number;
  // Objeto indexado: clave = código de país, valor = regiones con plataformas
  results: { [countryCode: string]: WatchProviderRegion };
}

export interface WatchProviderRegion {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

