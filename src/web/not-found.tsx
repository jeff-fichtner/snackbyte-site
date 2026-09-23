import { hydrateRoot, createRoot } from 'react-dom/client';
import '@snackbyte/brand/tokens.css';
import '@snackbyte/brand/base.css';
import './app.css';
import { NotFound } from './NotFound';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

// Hydrate the prerendered markup when it is there; mount fresh in dev, where the
// prerender step has not run.
if (container.firstElementChild) {
  hydrateRoot(container, <NotFound />);
} else {
  createRoot(container).render(<NotFound />);
}
