import { useState } from "react";
import { Users, Plus, Search, Loader2, MapPin } from "lucide-react";
import type { ClienteResponse } from "../services/api";
import { CreateClientModal } from "./CreateClientModal";

interface SidebarProps {
  clients: ClienteResponse[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  onRefreshClients: () => void;
  isLoading?: boolean; 
}

export function Sidebar({ 
  clients, 
  selectedClientId, 
  onSelectClient, 
  onRefreshClients, 
  isLoading = false 
}: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  // 1. Nuevo estado para el filtro de sede
  const [sedeFilter, setSedeFilter] = useState(""); 

  // 2. Lógica de filtrado combinada (Buscador + Selector de Sede)
  const filteredClients = clients.filter((c) => {
    // Verifica si coincide con el texto del buscador
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    // Verifica si coincide con la sede seleccionada (si sedeFilter está vacío, devuelve true para todos)
    const matchesSede = sedeFilter === "" || c.nombre.includes(sedeFilter);
    
    // Retorna el cliente solo si cumple AMBAS condiciones
    return matchesSearch && matchesSede;
  });

  return (
    <aside className="glass sidebar">
      <div className="sidebar-header">
        <Users className="inline mr-2" size={20} />
        Clientes
      </div>
      
      {/* 3. Contenedor de filtros actualizado */}
      <div style={{ padding: '0 1rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {/* Barra de búsqueda */}
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

        {/* 4. Nuevo selector de sede permanente */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <MapPin 
            size={16} 
            style={{ position: 'absolute', left: '10px', color: 'var(--text-muted, #888)' }} 
          />
          <select
            value={sedeFilter}
            onChange={(e) => setSedeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.5rem 0.5rem 2.2rem', // Mismo padding que el buscador para alinear textos
              borderRadius: '8px',
              border: '1px solid var(--border-color, #ccc)',
              background: 'transparent',
              color: 'var(--text-muted)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none' // Quita la flecha nativa fea en algunos navegadores
            }}
          >
            <option value="">Todas las sedes</option>
            <option value="Valle">Valle</option>
            <option value="Bogotá">Bogotá</option>
            <option value="Medellín">Medellín</option>
          </select>
        </div>
      </div>

      <div className="client-list">
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: 'var(--text-muted, #888)' }}>
            <Loader2 className="animate-spin" size={32} style={{ marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.9rem' }}>Cargando clientes...</span>
          </div>
        ) : filteredClients.length === 0 ? (
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