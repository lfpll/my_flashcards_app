import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { FlashcardProvider } from './context/FlashcardContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { GamificationProvider } from './context/GamificationContext';
import ErrorBoundary from './components/ui/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <FlashcardProvider>
          <GamificationProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </GamificationProvider>
        </FlashcardProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
