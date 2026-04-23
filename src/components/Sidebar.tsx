import { useState } from "react";
import { Users, Plus, Search } from "lucide-react"; // <-- Agregamos el icono Search
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
  // <-- 1. Nuevo estado para el buscador
  const [searchTerm, setSearchTerm] = useState(""); 

  // <-- 2. Filtramos los clientes en tiempo real ignorando mayúsculas y minúsculas
  const filteredClients = clients.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="glass sidebar">
      <div className="sidebar-header">
        <Users className="inline mr-2" size={20} />
        Clientes
      </div>
      
      {/* <-- 3. Agregamos la barra de búsqueda justo debajo del header */}
      <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search 
            size={16} 
            style={{ position: 'absolute', left: '10px', color: 'var(--text-muted, #888)' }} 
          />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.5rem 0.5rem 2.2rem', // padding a la izquierda para dejarle espacio al icono
              borderRadius: '8px',
              border: '1px solid var(--border-color, #ccc)',
              background: 'transparent',
              color: 'inherit',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div className="client-list">
        {/* Usamos filteredClients en lugar de clients para dibujar la lista */}
        {filteredClients.length === 0 ? (
          <p className="text-muted" style={{ padding: '1rem', opacity: 0.5, textAlign: 'center' }}>
            {clients.length === 0 
              ? "No hay clientes registrados." 
              : "No se encontraron resultados."}
          </p>
        ) : (
          filteredClients.map((c) => (
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