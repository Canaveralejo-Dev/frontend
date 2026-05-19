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
        <div 
          style={{ 
            display: 'flex', 
            height: '100vh', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'var(--bg-color)' // Aplicamos tu fondo gris sutil
          }}
        >
          <SignIn 
            routing="hash" 
            appearance={{
              // 1. Variables globales de Clerk (Mapeadas a tus colores)
              variables: {
                colorPrimary: '#1E2E6E', // Usamos el hex directo para el color principal
                colorBackground: '#FFFFFF', // --surface-color
                colorText: '#0A0B0D', // --text-main
                colorTextSecondary: '#40444D', // --grey-dark
                colorDanger: '#B00020', // --error
                colorSuccess: '#2E7D32', // --success
                borderRadius: '8px', // --radius-md
                fontFamily: 'var(--font-family)',
              },
              // 2. Sobrescribir elementos específicos de la tarjeta
              elements: {
                card: {
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--surface-border)',
                  padding: '2rem',
                },
                headerTitle: {
                  color: 'var(--primary-color)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                },
                headerSubtitle: {
                  color: 'var(--grey)',
                },
                formButtonPrimary: {
                  backgroundColor: 'var(--primary-color)',
                  transition: 'background-color 0.2s ease',
                  '&:hover, &:focus, &:active': {
                    backgroundColor: 'var(--primary-light)',
                  },
                },
                formFieldInput: {
                  borderColor: 'var(--grey-light)',
                  '&:focus': {
                    borderColor: 'var(--secondary-color)', // El azul brillante al hacer focus
                    boxShadow: '0 0 0 1px var(--secondary-color)',
                  }
                },
                dividerLine: {
                  backgroundColor: 'var(--grey-light)',
                },
                dividerText: {
                  color: 'var(--grey)',
                },
                socialButtonsBlockButton: {
                  borderColor: 'var(--grey-light)',
                  color: 'var(--text-main)',
                  '&:hover': {
                    backgroundColor: 'var(--grey-extra-light)',
                  }
                },
                footerActionLink: {
                  color: 'var(--secondary-color)',
                  '&:hover': {
                    color: 'var(--primary-color)',
                  }
                }
              }
            }}
          />
        </div>
      </SignedOut>

      {/* Aplicación principal liberada si hay sesión */}
      <SignedIn>
        <App />
      </SignedIn>

    </ClerkProvider>
  </StrictMode>,
)