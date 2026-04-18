import React, { useState } from 'react';
import { X, FileUp, Loader2, AlertCircle } from 'lucide-react';
import { uploadInspection } from '../services/api';

interface UploadInspectionModalProps {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadInspectionModal({ clientId, onClose, onSuccess }: UploadInspectionModalProps) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fecha) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await uploadInspection(clientId, nombre, fecha, file);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error uploading inspection:', err);
      setError(err.response?.data?.detail || 'Hubo un error al subir la inspección. Verifica el formato del archivo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileUp size={24} className="text-primary" />
            <h2>Subir Inspección (CSV)</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombreInsp">Nombre de la Inspección (Opcional)</label>
            <input
              id="nombreInsp"
              type="text"
              className="form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Revisión Semestral Flota A"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaInsp">Fecha de Revisión</label>
            <input
              id="fechaInsp"
              type="date"
              className="form-input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="csvFile">Archivo CSV</label>
            <div 
              style={{
                border: '2px dashed var(--surface-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                background: file ? 'rgba(46, 125, 50, 0.05)' : 'var(--grey-extra-light)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => document.getElementById('csvFile')?.click()}
            >
              <FileUp size={32} style={{ color: file ? 'var(--success)' : 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem', color: file ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {file ? file.name : 'Haz clic para seleccionar el archivo CSV'}
              </p>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              color: 'var(--error)', 
              fontSize: '0.875rem', 
              marginBottom: '1.5rem',
              padding: '0.75rem',
              background: 'rgba(176, 0, 32, 0.1)',
              borderRadius: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !file}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Procesando...
                </>
              ) : (
                'Subir y Procesar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
