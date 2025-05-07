// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './AppContext.tsx'; // Import AppProvider

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppProvider> {/* Wrap App with AppProvider */}
            <App />
        </AppProvider>
    </StrictMode>,
)