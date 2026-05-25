import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { applyShareState, decodeShareState } from './lib/shareState';
import './styles.css';

// Rehydrate the store from a #s=... hash if one is present on initial load.
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
const decoded = decodeShareState(initialHash);
if (decoded) applyShareState(decoded);

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
