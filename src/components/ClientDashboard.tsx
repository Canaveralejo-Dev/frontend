import { useEffect, useState, useCallback } from "react";
import { Plus, Car, FileCheck, Eye } from "lucide-react";
import api, { getClient, getVehicles, getInspections } from "../services/api";
import type { ClienteResponse, VehiculoResponse, InspeccionResumenResponse } from "../services/api";
import { InspectionPreviewModal } from "./PreviewInspection";

interface ClientDashboardProps {
  clientId: string;
}

export function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [client, setClient] = useState<ClienteResponse | null>(null);
  const [vehicles, setVehicles] = useState<VehiculoResponse[]>([]);
  const [inspections, setInspections] = useState<InspeccionResumenResponse[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- NUEVO ESTADO: Para controlar la inspección seleccionada ---
  const [selectedInspection, setSelectedInspection] = useState<InspeccionResumenResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientData, vehiclesData, inspectionsData] = await Promise.all([
        getClient(clientId),
        getVehicles(clientId),
        getInspections(clientId)
      ]);
      setClient(clientData);
      setVehicles(vehiclesData);
      setInspections(inspectionsData);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadExcel = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/inspection/${id}/excel`, {
        responseType: 'blob',
      });
      const contentDisposition = response.headers['content-disposition'];
      let filename = `inspeccion_${id}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading excel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !client) {
    return <div className="glass dashboard-content" style={{ justifyContent: 'center', alignItems: 'center' }}>Cargando...</div>;
  }

  if (!client) {
    return <div className="glass dashboard-content" style={{ justifyContent: 'center', alignItems: 'center' }}>Selecciona un cliente para ver los detalles.</div>;
  }

  return (
    <div className="dashboard-content">
      {/* Client Section */}
      <div className="glass client-details-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h2>{client.nombre}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              UUID: {client.id}
            </p>
          </div>
        </div>
        
        <div className="client-stats">
          <div className="stat-item">
            <span className="stat-label">Última Inspección</span>
            <span className="stat-value">
              {inspections.length > 0 
                ? new Date(inspections[0].fecha_revision).toLocaleDateString() 
                : "N/A"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vehículos</span>
            <span className="stat-value">{vehicles.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Inspecciones</span>
            <span className="stat-value">{inspections.length}</span>
          </div>
        </div>
      </div>

      {/* CAMBIO 1: Ajuste de proporciones mediante estilos inline en los paneles */}
      <div className="lists-container" style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
        
        {/* Vehicles Section (Proporción 1) */}
        <div className="glass list-panel" style={{ flex: 1 }}>
          <div className="list-header">
            <span><Car className="inline mr-2" size={18} style={{ marginRight: '0.5rem' }}/> Vehículos</span>
          </div>
          <div className="items-list">
            {vehicles.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem', opacity: 0.5 }}>No se encontraron vehículos.</p>
            ) : (
              vehicles.map((v) => (
                <div key={v.id} className="data-item">
                  <div className="data-item-row">
                    <span className="data-label">Código:</span>
                    <span className="data-value">{v.codigo_vehiculo}</span>
                  </div>
                  <div className="data-item-row">
                    <span className="data-label">Tipo:</span>
                    <span className="data-value" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {v.tipo_nombre || v.tipo_id}
                    </span>
                  </div>
                  <div className="data-item-row">
                    <span className="data-label">Marca:</span>
                    <span className="data-value" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {v.marca_nombre || v.marca_id}
                    </span>
                  </div>
                  <div className="data-item-row">
                    <span className="data-label">Llantas:</span>
                    <span className="data-value">{v.no_llantas}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inspections Section (Proporción 2) */}
        <div className="glass list-panel" style={{ flex: 2 }}>
          <div className="list-header">
            <span><FileCheck className="inline mr-2" size={18} style={{ marginRight: '0.5rem' }}/> Inspecciones</span>
          </div>
          <div className="items-list">
            {inspections.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem', opacity: 0.5 }}>No se encontraron inspecciones.</p>
            ) : (
              inspections.map((insp) => (
                <div 
                  key={insp.id} 
                  className="data-item" 
                  onClick={() => setSelectedInspection(insp)} // CAMBIO 2: Ahora abre la previsualización
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  title="Ver detalles de la inspección"
                >
                  <div style={{ flex: 1 }}>
                    <div className="data-item-row">
                      <span className="data-label">Nombre:</span>
                      <span className="data-value">{insp.nombre || "N/A"}</span>
                    </div>
                    <div className="data-item-row">
                      <span className="data-label">Fecha:</span>
                      <span className="data-value">{new Date(insp.fecha_revision).toLocaleDateString()}</span>
                    </div>
                    <div className="data-item-row" style={{ marginTop: '0.25rem' }}>
                      <span className="status-badge" style={{ fontSize: '0.7rem' }}>
                        {insp.cantidad_vehiculos} veh / {insp.cantidad_llantas} llantas
                      </span>
                    </div>
                  </div>
                  
                  {/* Cambiado el ícono a "Eye" para indicar visualización */}
                  <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                    <Eye size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="panel-footer">
            <button className="btn-secondary" >
              <Plus size={18} />
              Subir Inspección
            </button>
          </div>
        </div>
      </div>

      {/* --- CAMBIO 3: MODAL DE VISUALIZACIÓN DE DATOS E INSPECCIÓN --- */}
      {selectedInspection && (
        <InspectionPreviewModal 
          inspectionSummary={selectedInspection}
          onClose={() => setSelectedInspection(null)}
          onDownload={() => handleDownloadExcel(selectedInspection.id)}
        />
      )}
    </div>
  );
}