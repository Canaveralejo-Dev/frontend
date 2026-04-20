import { useEffect, useState, useCallback } from "react";
import { Plus, Car, FileCheck, Download } from "lucide-react";
import api, { getClient, getVehicles, getInspections } from "../services/api";
import { UploadInspectionModal } from "./UploadInspectionModal";
import type { ClienteResponse, VehiculoResponse, InspeccionResumenResponse } from "../services/api";

interface ClientDashboardProps {
  clientId: string;
}

export function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [client, setClient] = useState<ClienteResponse | null>(null);
  const [vehicles, setVehicles] = useState<VehiculoResponse[]>([]);
  const [inspections, setInspections] = useState<InspeccionResumenResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

  // Se eliminó handleViewInspection. Ahora la descarga es la acción principal.
  const handleDownloadExcel = async (id: string) => {
    setLoading(true); // Añadido para dar feedback de carga mientras descarga
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

      <div className="lists-container">
        {/* Vehicles Section */}
        <div className="glass list-panel">
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

        {/* Inspections Section */}
        <div className="glass list-panel">
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
                  onClick={() => handleDownloadExcel(insp.id)} 
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  title="Descargar Excel"
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
                  
                  {/* Icono de descarga añadido para la UI */}
                  <div style={{ padding: '0.5rem', color: 'var(--primary-color)' }}>
                    <Download size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="panel-footer">
            <button className="btn-secondary" onClick={() => setIsUploadModalOpen(true)}>
              <Plus size={18} />
              Subir Inspección
            </button>
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <UploadInspectionModal 
          clientId={clientId}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}