import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (root) {
  const { config } = JSON.parse(new URL(window.location.href).searchParams.get('data') as string);
  createRoot(root).render(<App config={config} />);
}
