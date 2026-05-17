import { useState } from "react";
import type { InspeccionPreviewResponse, InspeccionResumenResponse } from "../services/api";
import { Download } from "lucide-react";
import api from "../services/api";

interface InspectionPreviewModalProps {
  inspectionSummary: InspeccionResumenResponse;
  onClose: () => void;
  onDownload: () => void;
}

export function InspectionPreviewModal({ inspectionSummary, onClose, onDownload }: InspectionPreviewModalProps) {
  const [previewData, setPreviewData] = useState<InspeccionPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Función que llama a la nueva API
  const cargarPrevisualizacionCompleta = async () => {
    setLoadingPreview(true);
    try {
      const response = await api.get(`/inspection/${inspectionSummary.id}/preview`);
      setPreviewData(response.data);
    } catch (error) {
      console.error("Error al cargar la previsualización", error);
    } finally {
      setLoadingPreview(false);
    }
  };

return (
    <div className="preview-modal-overlay">
      <div className={`glass preview-modal-container ${previewData ? 'expanded' : ''}`}>
        
        {/* Cabecera */}
        <div className="preview-modal-header">
          <h3>Detalle de Inspección: {inspectionSummary.nombre || 'N/A'}</h3>
          <button onClick={onClose} className="preview-modal-close-btn">
          </button>
        </div>

        {/* Cuerpo Dinámico */}
        <div className="preview-modal-body">
          
          {!previewData ? (
            <>
              <table className="preview-summary-table">
                <tbody>
                  <tr>
                    <td>Fecha de Ejecución</td>
                    <td>{new Date(inspectionSummary.fecha_revision).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Vehículos en el Lote</td>
                    <td>{inspectionSummary.cantidad_vehiculos} Unidades</td>
                  </tr>
                  <tr>
                    <td>Total Llantas Medidas</td>
                    <td>{inspectionSummary.cantidad_llantas} Llantas</td>
                  </tr>
                </tbody>
              </table>

              <div className="preview-action-center">
                <button 
                  className="btn-primary preview-btn-inline" 
                  onClick={cargarPrevisualizacionCompleta}
                  disabled={loadingPreview}
                >
                  {loadingPreview ? 'Cargando datos...' : 'Previsualizar Tabla Completa'}
                </button>
              </div>
            </>
          ) : (
            /* --- RENDER DE LA TABLA COMPLETA ESTRUCTURADA --- */
            <div className="preview-data-grid">
              {previewData.vehiculos.map((veh) => {
                const llantasVehiculo = previewData.llantas.filter(ll => ll.vehiculo_id === veh.id);

                return (
                  <div key={veh.id} className="preview-vehicle-card">
                    {/* Encabezado del Vehículo */}
                    <div className="preview-vehicle-header">
                      <span className="preview-vehicle-title">
                        🚗 Vehículo: {veh.codigo_vehiculo}
                      </span>
                      <div className="preview-vehicle-metrics">
                        <span><strong>KM:</strong> {veh.metricas?.kilometraje ?? 'N/A'}</span>
                        <span><strong>Horómetro:</strong> {veh.metricas?.horometro ?? 'N/A'}</span>
                      </div>
                    </div>

                    {/* Tabla de Llantas del Vehículo */}
                    {llantasVehiculo.length === 0 ? (
                      <p className="preview-empty-text">No se registraron llantas para este vehículo en esta inspección.</p>
                    ) : (
                      <div className="preview-table-responsive">
                        <table className="preview-details-table">
                          <thead>
                            <tr>
                              <th>Posición</th>
                              <th>Cód. Llanta</th>
                              <th>Presión (PSI)</th>
                              <th>Milimetraje (Int/Cent/Ext)</th>
                              <th style={{ textAlign: 'left' }}>Observaciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {llantasVehiculo.map((ll) => (
                              <tr key={ll.id}>
                                <td className="posicion-col">{ll.posicion}</td>
                                <td className="code-col">{ll.codigo_llanta}</td>
                                <td>{ll.presion}</td>
                                <td>{ll.medida_int}mm / {ll.medida_cent}mm / {ll.medida_ext}mm</td>
                                <td className={`obs-col ${!ll.observacion ? 'empty' : ''}`}>
                                  {ll.observacion || "Sin novedades"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer del Modal */}
        <div className="preview-modal-footer">
          <button className="btn-terciary" onClick={onClose}>Cerrar</button>
          <button className="btn-secondary preview-btn-download" onClick={onDownload}>
            <Download size={16} /> Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
}