import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ClientDashboard } from "./components/ClientDashboard";
import { getClients, setupAxiosInterceptors } from "./services/api";
import type { ClienteResponse } from "./services/api";

function App() {
  const { getToken } = useAuth(); // Extraemos el token de la sesión actual de Clerk
  const [clients, setClients] = useState<ClienteResponse[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isApiReady, setIsApiReady] = useState(false); // Estado para evitar peticiones sin token
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadClients = async () => {
    // 2. Activamos el círculo de progreso antes de la petición
    setIsLoading(true); 
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      // 3. El bloque 'finally' se ejecuta SIEMPRE (si sale bien o si hay error)
      // Así nos aseguramos de apagar el cargador pase lo que pase.
      setIsLoading(false);
    }
  };

  // 1. Configuramos Axios para que inyecte el token de Clerk
  useEffect(() => {
    setupAxiosInterceptors(() => getToken());
    setIsApiReady(true);
  }, [getToken]);

  // 2. Cargamos los datos SOLO cuando Axios ya está configurado
  useEffect(() => {
    if (isApiReady) {
      loadClients();
    }
  }, [isApiReady]);

  return (
    <>
      <Navbar />
      <main className="layout-main">
        <Sidebar 
          clients={clients} 
          isLoading={isLoading} // <-- Le pasas el booleano aquí
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          onRefreshClients={loadClients}
        />
        
        {selectedClientId ? (
          <ClientDashboard clientId={selectedClientId} />
        ) : (
          <div className="glass dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.8 }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Welcome to AgroApp Dashboard</h2>
              <p style={{ color: 'var(--text-muted)' }}>Select a client from the left sidebar to view their details.</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;