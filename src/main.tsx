import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import './index.css'
import App from './App.tsx'



// Reemplaza esto con tu clave pública de Clerk (empieza con pk_test_...)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} telemetry={false}>
      
      {/* Pantalla de bloqueo si no hay sesión iniciada */}
      <SignedOut>
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>

      {/* Aplicación principal liberada si hay sesión */}
      <SignedIn>
        <App />
      </SignedIn>

    </ClerkProvider>
  </StrictMode>,
)