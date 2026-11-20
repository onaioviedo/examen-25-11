import { useEffect, useState } from 'react';

// Router mínimo basado en el hash (#/test?modo=fallos). Funciona en Vercel sin
// configurar reescrituras y al abrir dist/index.html directamente.

export interface Ruta {
  partes: string[];
  query: URLSearchParams;
}

function leer(): Ruta {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [camino, qs = ''] = hash.split('?');
  return {
    partes: camino.split('/').filter(Boolean),
    query: new URLSearchParams(qs),
  };
}

export function useRuta(): Ruta {
  const [ruta, setRuta] = useState<Ruta>(leer);
  useEffect(() => {
    const f = () => {
      setRuta(leer());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return ruta;
}

export function ir(destino: string) {
  window.location.hash = destino.startsWith('/') ? destino : `/${destino}`;
}
