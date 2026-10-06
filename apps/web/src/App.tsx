import { useEffect, useState } from 'react';
import { POSITIONS } from '@playbook/shared';

type ApiStatus = 'checking' | 'ok' | 'down';

/** Pantalla provisional del bloque 0: comprueba que web, api y shared están conectados. */
export function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => setApiStatus(response.ok ? 'ok' : 'down'))
      .catch(() => setApiStatus('down'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-green-800 p-6 text-white">
      <h1 className="text-4xl font-bold">PlayBook Pro</h1>
      <p className="text-lg">
        API:{' '}
        <span className="font-mono">
          {apiStatus === 'checking'
            ? 'comprobando…'
            : apiStatus === 'ok'
              ? 'conectada'
              : 'sin conexión'}
        </span>
      </p>
      <ul className="flex flex-wrap justify-center gap-2" aria-label="Posiciones">
        {POSITIONS.map((position) => (
          <li
            key={position}
            className="rounded-full bg-white px-3 py-1 font-semibold text-green-900"
          >
            {position}
          </li>
        ))}
      </ul>
    </main>
  );
}
