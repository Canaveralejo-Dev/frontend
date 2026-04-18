import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ClientDashboard } from "./components/ClientDashboard";
import { getClients } from "./services/api";
import type { ClienteResponse } from "./services/api";

function App() {
  const [clients, setClients] = useState<ClienteResponse[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <>
      <Navbar />
      <main className="layout-main">
        <Sidebar 
          clients={clients} 
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
