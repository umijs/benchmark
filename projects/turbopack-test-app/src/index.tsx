import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
const container = document.querySelector('#root')!;

if (!container) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  createRoot(root).render(<App />);
} else {
  createRoot(container).render(<App />);
}
