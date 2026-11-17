// Navegación desde cualquier componente (p. ej. el plan de estudio):
// App escucha y salta al bloque/sección.
const listeners = new Set();
export function goTo(block, idx) {
  listeners.forEach((fn) => fn(block, idx));
}
export function onGoTo(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
