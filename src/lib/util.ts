/** Mezcla Fisher–Yates (devuelve una copia) */
export function barajar<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Normaliza para buscar: minúsculas y sin tildes */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Número en formato español: coma decimal y como mucho `dec` decimales */
export function fmt(n: number, dec = 2): string {
  if (!Number.isFinite(n)) return String(n);
  const r = Math.round(n * 10 ** dec) / 10 ** dec;
  return r.toLocaleString('es-ES', { maximumFractionDigits: dec, useGrouping: false });
}

/** Representación de un float como lo imprime Python (56.0, 5.5, 14.2828568570857) */
export function pyFloat(n: number): string {
  if (Number.isInteger(n)) return `${n}.0`;
  return String(n);
}

/** Lee un número escrito por el usuario (acepta coma o punto) */
export function leerNumero(s: string): number | null {
  const t = s.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function clases(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ');
}

/** Formatea segundos como mm:ss */
export function mmss(seg: number): string {
  const s = Math.max(0, Math.floor(seg));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Compara la salida escrita con la esperada: exacta, ignorando espacios o distinta */
export function compararSalida(escrita: string, esperada: string): 'exacta' | 'espacios' | 'distinta' {
  const limpiar = (s: string) =>
    s
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((l) => l.trimEnd())
      .join('\n')
      .replace(/^\n+|\n+$/g, '');
  const a = limpiar(escrita);
  const b = limpiar(esperada);
  if (a === b) return 'exacta';
  const sinEsp = (s: string) => s.replace(/\s+/g, '').replace(/"/g, "'");
  if (sinEsp(a) === sinEsp(b)) return 'espacios';
  return 'distinta';
}
