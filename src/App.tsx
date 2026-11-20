import { useState } from 'react';
import { Icono, type NombreIcono } from './components/Icono';
import { cambiarTema, esOscuro } from './lib/progreso';
import { useRuta } from './lib/ruta';
import { clases } from './lib/util';
import Inicio from './pages/Inicio';
import Temario from './pages/Temario';
import Flashcards from './pages/Flashcards';
import Test from './pages/Test';
import Codigo from './pages/Codigo';
import Simulacro from './pages/Simulacro';

const SECCIONES: { id: string; nombre: string; icono: NombreIcono }[] = [
  { id: 'inicio', nombre: 'Inicio', icono: 'inicio' },
  { id: 'temario', nombre: 'Temario', icono: 'temario' },
  { id: 'flashcards', nombre: 'Flashcards', icono: 'flashcards' },
  { id: 'test', nombre: 'Test', icono: 'test' },
  { id: 'codigo', nombre: 'Código', icono: 'codigo' },
  { id: 'simulacro', nombre: 'Simulacro', icono: 'simulacro' },
];

function BotonTema() {
  const [oscuro, setOscuro] = useState(esOscuro);
  return (
    <button
      type="button"
      onClick={() => {
        cambiarTema(!oscuro);
        setOscuro(!oscuro);
      }}
      className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      <Icono nombre={oscuro ? 'sol' : 'luna'} />
    </button>
  );
}

export default function App() {
  const ruta = useRuta();
  const seccion = SECCIONES.some((s) => s.id === ruta.partes[0]) ? ruta.partes[0] : 'inicio';
  const ancho = seccion === 'codigo' && ruta.partes[1] && ruta.partes[1] !== 'ejercicios' ? 'max-w-5xl' : 'max-w-3xl';

  let pagina;
  switch (seccion) {
    case 'temario':
      pagina = <Temario key={ruta.query.toString()} ruta={ruta} />;
      break;
    case 'flashcards':
      pagina = <Flashcards />;
      break;
    case 'test':
      pagina = <Test key={ruta.query.toString()} ruta={ruta} />;
      break;
    case 'codigo':
      pagina = <Codigo key={ruta.query.toString()} ruta={ruta} />;
      break;
    case 'simulacro':
      pagina = <Simulacro key={ruta.query.toString()} ruta={ruta} />;
      break;
    default:
      pagina = <Inicio />;
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <a href="#/inicio" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              <Icono nombre="codigo" className="h-4 w-4" />
            </span>
            <span>Estudio Big Data</span>
          </a>
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Secciones">
            {SECCIONES.map((s) => (
              <a
                key={s.id}
                href={`#/${s.id}`}
                aria-current={seccion === s.id ? 'page' : undefined}
                className={clases(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  seccion === s.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                )}
              >
                {s.nombre}
              </a>
            ))}
          </nav>
          <div className="ml-auto md:ml-2">
            <BotonTema />
          </div>
        </div>
      </header>

      <main className={clases('mx-auto px-4 pt-5 pb-28 md:pb-12', ancho)}>{pagina}</main>

      {/* Barra inferior en móvil */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95"
        aria-label="Secciones"
      >
        <div className="grid grid-cols-6">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#/${s.id}`}
              aria-current={seccion === s.id ? 'page' : undefined}
              className={clases(
                'flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium',
                seccion === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <Icono nombre={s.icono} className="h-5 w-5" />
              {s.nombre}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
