import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DataProvider } from './components/context/data-context.jsx';
import { AuthProvider } from './components/registro/auth-context.jsx';
import { TemasProvider } from './components/context/temasContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        <TemasProvider>
          <App />
        </TemasProvider>
      </DataProvider>
    </AuthProvider>
  </StrictMode>,
);
