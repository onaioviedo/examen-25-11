import { Icono, type NombreIcono } from '../components/Icono';
import { BarraProgreso, Boton, Tarjeta } from '../components/ui';
import { BLOQUES } from '../data/bloques';
import { dominioBloque, ejerciciosFallados, preguntasFalladas } from '../lib/dominio';
import { borrarProgreso, useProgreso } from '../lib/progreso';
import { ir } from '../lib/ruta';
import { clases, fmt } from '../lib/util';

const NUMEROS_CLAVE: { valor: string; que: string }[] = [
  { valor: '56.0', que: 'Media de minutos (560 / 10)' },
  { valor: '5.5', que: 'Mediana de horas ((5 + 6) / 2)' },
  { valor: '78 ×3', que: 'Moda de puntos' },
  { valor: '72', que: 'Promedio de puntos (720 / 10)' },
  { valor: '2040', que: 'Suma de cuadrados' },
  { valor: '204', que: 'Varianza (÷ n)' },
  { valor: '≈ 14,28', que: 'Desviación estándar (204 ** 0.5)' },
  { valor: '45 / 13', que: 'Comparaciones / intercambios Bubble Sort' },
  { valor: '23', que: 'Imputar V103: mediana (no 31,7)' },
  { valor: 'Ordinario', que: 'Imputar tipo V105: moda' },
  { valor: '12 · 9 · 6', que: 'Esperas: media · mediana · moda' },
  { valor: '6 · 13 · 7', que: 'Esperas: Q1 · Q3 · IQR' },
  { valor: '23,5', que: 'Límite superior (13 + 1,5·7)' },
  { valor: '14', que: 'Fin del bigote superior' },
];

const HERRAMIENTAS: { nombre: string; desc: string; ruta: string; icono: NombreIcono }[] = [
  { nombre: 'Bubble Sort paso a paso', desc: 'i, j, comparación y auxiliar', ruta: '/codigo/bubble', icono: 'grafico' },
  { nombre: 'Estadística a mano', desc: 'Media, mediana, moda, varianza', ruta: '/codigo/estadistica', icono: 'bombilla' },
  { nombre: 'Probador de Regex', desc: 'search, match, findall, sub…', ruta: '/codigo/regex', icono: 'buscar' },
  { nombre: 'Ejercicios de código', desc: 'Qué imprime, huecos, ordenar', ruta: '/codigo', icono: 'codigo' },
];

export default function Inicio() {
  const p = useProgreso();
  const fallosTest = preguntasFalladas(p).length;
  const fallosCodigo = ejerciciosFallados(p).length;
  const ultimo = p.simulacros[0];
  const dominios = BLOQUES.map((b) => ({ b, d: dominioBloque(p, b.id) }));
  const global = Math.round(dominios.reduce((s, x) => s + x.d.pct, 0) / dominios.length);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Preparación del examen escrito</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Python básico · EDA · POO · Regex. Practica como en el examen: a mano, sin calculadora.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Boton
          onClick={() => ir('/test?modo=fallos')}
          variante={fallosTest + fallosCodigo > 0 ? 'peligro' : 'secundario'}
          icono="reiniciar"
          className="min-h-14 text-base"
        >
          Repasar mis fallos
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">{fallosTest + fallosCodigo}</span>
        </Boton>
        <Boton onClick={() => ir('/simulacro?rapido=1')} icono="rayo" className="min-h-14 text-base">
          Simulacro rápido
        </Boton>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Dominio por bloque</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">Global {global} %</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dominios.map(({ b, d }) => (
            <Tarjeta key={b.id} className={clases('border-l-4', b.borde)}>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold">{b.nombre}</h3>
                <span className={clases('text-2xl font-bold tabular-nums', b.texto)}>{d.pct} %</span>
              </div>
              <BarraProgreso valor={d.pct} color={b.barra} className="mt-2" />
              <dl className="mt-3 grid grid-cols-3 gap-1 text-center text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <dt>Test</dt>
                  <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {d.test.ok}/{d.test.total}
                  </dd>
                </div>
                <div>
                  <dt>Flashcards</dt>
                  <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {d.flash.ok}/{d.flash.total}
                  </dd>
                </div>
                <div>
                  <dt>Código</dt>
                  <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {d.codigo.total ? `${d.codigo.ok}/${d.codigo.total}` : '—'}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex gap-2">
                <a href={`#/test?bloque=${b.id}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Test
                </a>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <a href={`#/temario?bloque=${b.id}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Temario
                </a>
              </div>
            </Tarjeta>
          ))}
        </div>
      </section>

      {ultimo && (
        <Tarjeta className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Último simulacro</p>
            <p className="text-sm">
              {new Date(ultimo.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} ·{' '}
              {ultimo.aciertos}/{ultimo.total} aciertos
            </p>
          </div>
          <span
            className={clases(
              'text-3xl font-bold tabular-nums',
              ultimo.nota >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
            )}
          >
            {fmt(ultimo.nota, 1)}
          </span>
        </Tarjeta>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Herramientas</h2>
        <div className="grid grid-cols-2 gap-3">
          {HERRAMIENTAS.map((h) => (
            <a
              key={h.ruta}
              href={`#${h.ruta}`}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50"
            >
              <Icono nombre={h.icono} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <p className="mt-1.5 text-sm font-semibold leading-tight">{h.nombre}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{h.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Números que debes saber</h2>
        <Tarjeta className="p-0">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {NUMEROS_CLAVE.map((n) => (
              <li key={n.que} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                <span className="text-slate-600 dark:text-slate-400">{n.que}</span>
                <span className="font-mono font-semibold whitespace-nowrap">{n.valor}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </section>

      <section className="pt-2 text-center">
        <Boton
          variante="fantasma"
          icono="papelera"
          onClick={() => {
            if (window.confirm('¿Borrar todo el progreso guardado en este navegador? No se puede deshacer.')) borrarProgreso();
          }}
        >
          Borrar progreso
        </Boton>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">El progreso se guarda solo en este navegador.</p>
      </section>
    </div>
  );
}
