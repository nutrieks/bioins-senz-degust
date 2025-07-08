import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable React Query DevTools in development
if (import.meta.env.DEV) {
  console.log('🚀 Development mode: React Query DevTools enabled');
}

createRoot(document.getElementById("root")!).render(<App />);
