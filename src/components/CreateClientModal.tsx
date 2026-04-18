import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { createClient } from '../services/api';

interface CreateClientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateClientModal({ onClose, onSuccess }: CreateClientModalProps) {
  const [nombre, setNombre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createClient(nombre);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Hubo un error al crear el cliente. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserPlus size={24} className="text-primary" />
            <h2>Nuevo Cliente</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre Comercial / Razón Social</label>
            <input
              id="nombre"
              type="text"
              className="form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Agroindustria San José"
              autoFocus
              required
            />
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !nombre.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creando...
                </>
              ) : (
                'Crear Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
