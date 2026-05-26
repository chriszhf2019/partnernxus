import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { suppressKnownErrors } from './lib/errorSuppress';

suppressKnownErrors();
createRoot(document.getElementById('root')!).render(<App />);
