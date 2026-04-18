import { useEffect, useState, useCallback } from "react";
import { Plus, Car, FileCheck, ArrowLeft, Download } from "lucide-react";
import api, { getClient, getVehicles, getInspections, getInspectionDetail } from "../services/api";
import { UploadInspectionModal } from "./UploadInspectionModal";
import type { ClienteResponse, VehiculoResponse, InspeccionResumenResponse, InspeccionDetalleResponse } from "../services/api";

interface ClientDashboardProps {
  clientId: string;
}

export function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [client, setClient] = useState<ClienteResponse | null>(null);
  const [vehicles, setVehicles] = useState<VehiculoResponse[]>([]);
  const [inspections, setInspections] = useState<InspeccionResumenResponse[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<InspeccionDetalleResponse | null>(null);
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
      setSelectedInspection(null); // Reset detail when changing client
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewInspection = async (id: string) => {
    setLoading(true);
    try {
      const detail = await getInspectionDetail(id);
      setSelectedInspection(detail);
    } catch (error) {
      console.error("Error fetching inspection detail", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async (id: string) => {
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
    }
  };

  if (loading && !client && !selectedInspection) {
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
          {selectedInspection && (
            <button className="btn-ghost" onClick={() => setSelectedInspection(null)} style={{ padding: '0.5rem' }}>
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2>{selectedInspection ? selectedInspection.nombre || `Inspección ${selectedInspection.fecha_revision}` : client.nombre}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {selectedInspection ? `ID: ${selectedInspection.id}` : `UUID: ${client.id}`}
            </p>
          </div>
        </div>
        
        {!selectedInspection && (
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
        )}

        {selectedInspection && (
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn-ghost" onClick={() => handleDownloadExcel(selectedInspection.id)}>
                <Download size={18} style={{ marginRight: '0.5rem' }} />
                Exportar Excel
             </button>
          </div>
        )}
      </div>

      {!selectedInspection ? (
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
                  <div key={insp.id} className="data-item" onClick={() => handleViewInspection(insp.id)} style={{ cursor: 'pointer' }}>
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
      ) : (
        /* Detailed Inspection Report View */
        <div className="glass list-panel" style={{ width: '100%', maxWidth: 'none' }}>
          <div className="list-header" style={{ justifyContent: 'space-between' }}>
            <span><FileCheck className="inline mr-2" size={18} style={{ marginRight: '0.5rem' }}/> Reporte de Inspección - {selectedInspection.fecha_revision}</span>
            <span className="status-badge">{selectedInspection.mediciones.length} Mediciones</span>
          </div>
          <div style={{ overflowX: 'auto', padding: '1rem' }}>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Marca Veh.</th>
                  <th>Tipo Veh.</th>
                  <th>Pos</th>
                  <th>Cód Llanta</th>
                  <th>Marca / Diseño</th>
                  <th>Dimensión</th>
                  <th>PSI</th>
                  <th>Ext</th>
                  <th>Cen</th>
                  <th>Int</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {selectedInspection.mediciones.map((m, idx) => (
                  <tr key={`${m.vehiculo_codigo}-${m.posicion}-${idx}`}>
                    <td style={{ fontWeight: '600' }}>{m.vehiculo_codigo}</td>
                    <td>{m.vehiculo_marca || '-'}</td>
                    <td>{m.vehiculo_tipo || '-'}</td>
                    <td><span className="badge-pos">{m.posicion}</span></td>
                    <td><code style={{ fontSize: '0.8rem' }}>{m.codigo_llanta}</code></td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{m.marca_llanta}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.diseno_llanta}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{m.dimension_llanta}</td>
                    <td style={{ textAlign: 'center', color: 'var(--primary-color)', fontWeight: '600' }}>{m.presion ?? '-'}</td>
                    <td style={{ textAlign: 'center' }}>{m.medida_ext ?? '-'}</td>
                    <td style={{ textAlign: 'center' }}>{m.medida_cent ?? '-'}</td>
                    <td style={{ textAlign: 'center' }}>{m.medida_int ?? '-'}</td>
                    <td style={{ fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.observacion || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
