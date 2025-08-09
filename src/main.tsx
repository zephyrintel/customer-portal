import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);

if (import.meta.env && import.meta.env.DEV) {
  // In development, enable StrictMode to surface side-effect issues
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // In production, render without StrictMode to avoid double-invocation
  root.render(<App />);
}
