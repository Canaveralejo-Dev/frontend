import { useState } from "react";
import { Users, Plus } from "lucide-react";
import type { ClienteResponse } from "../services/api";
import { CreateClientModal } from "./CreateClientModal";

interface SidebarProps {
  clients: ClienteResponse[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  onRefreshClients: () => void;
}

export function Sidebar({ clients, selectedClientId, onSelectClient, onRefreshClients }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <aside className="glass sidebar">
      <div className="sidebar-header">
        <Users className="inline mr-2" size={20} />
        Clientes
      </div>
      
      <div className="client-list">
        {clients.length === 0 ? (
          <p className="text-muted" style={{ padding: '1rem', opacity: 0.5 }}>No se encontraron clientes.</p>
        ) : (
          clients.map((c) => (
            <div 
              key={c.id} 
              className={`client-item ${selectedClientId === c.id ? 'active' : ''}`}
              onClick={() => onSelectClient(c.id)}
            >
              <h3>{c.nombre}</h3>
              {/* MOCKED DATA as requested */}
              <p>Última Insp: {new Date().toLocaleDateString()}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span className="status-badge">Activo</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {c.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Crear Cliente
        </button>
      </div>

      {isModalOpen && (
        <CreateClientModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            onRefreshClients();
            setIsModalOpen(false);
          }} 
        />
      )}
    </aside>
  );
}
