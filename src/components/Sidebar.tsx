import { useState } from "react";
// 1. Agregamos el icono Loader2
import { Users, Plus, Search, Loader2 } from "lucide-react"; 
import type { ClienteResponse } from "../services/api";
import { CreateClientModal } from "./CreateClientModal";

interface SidebarProps {
  clients: ClienteResponse[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  onRefreshClients: () => void;
  // 2. Nueva propiedad opcional para saber si está cargando
  isLoading?: boolean; 
}

export function Sidebar({ 
  clients, 
  selectedClientId, 
  onSelectClient, 
  onRefreshClients, 
  isLoading = false // Valor por defecto en falso
}: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  const filteredClients = clients.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="glass sidebar">
      <div className="sidebar-header">
        <Users className="inline mr-2" size={20} />
        Clientes
      </div>
      
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
              padding: '0.5rem 0.5rem 0.5rem 2.2rem',
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
        {/* 3. Lógica de renderizado condicional */}
        {isLoading ? (
          // Vista de carga
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: 'var(--text-muted, #888)' }}>
            {/* Si usas Tailwind, usa la clase "animate-spin". Si no, asegúrate de tener una clase CSS que haga girar el icono */}
            <Loader2 className="animate-spin" size={32} style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.9rem' }}>Cargando clientes...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          // Vista sin resultados / vacío
          <p className="text-muted" style={{ padding: '1rem', opacity: 0.5, textAlign: 'center' }}>
            {clients.length === 0 
              ? "No hay clientes registrados." 
              : "No se encontraron resultados."}
          </p>
        ) : (
          // Vista normal con lista
          filteredClients.map((c) => (
            <div 
              key={c.id} 
              className={`client-item ${selectedClientId === c.id ? 'active' : ''}`}
              onClick={() => onSelectClient(c.id)}
            >
              <h3>{c.nombre}</h3>
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