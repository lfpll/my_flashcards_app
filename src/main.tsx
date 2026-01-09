import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { FlashcardProvider } from './context/FlashcardContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { GamificationProvider } from './context/GamificationContext';
import ErrorBoundary from './components/ui/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <FlashcardProvider>
            <GamificationProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </GamificationProvider>
          </FlashcardProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
