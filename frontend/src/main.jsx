import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DataProvider } from './context/data-context.jsx';
import { AuthProvider } from './registro/auth-context.jsx';
import { TemasProvider } from './context/temasContext.jsx';
import { UserPlanProvider } from './context/userPlanContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        <TemasProvider>
          <UserPlanProvider>
            <App />
          </UserPlanProvider>
        </TemasProvider>
      </DataProvider>
    </AuthProvider>
  </StrictMode>,
);