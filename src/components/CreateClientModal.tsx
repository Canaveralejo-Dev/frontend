import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { createClient } from '../services/api';

interface CreateClientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateClientModal({ onClose, onSuccess }: CreateClientModalProps) {
  const [nombre, setNombre] = useState('');
  const [sede, setSede] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para manejar errores específicos de cada campo y errores generales de la API
  const [erroresValidacion, setErroresValidacion] = useState({ nombre: '', sede: '' });
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Reiniciamos errores previos
    setErrorApi(null);
    setErroresValidacion({ nombre: '', sede: '' });

    let hayErrores = false;
    const nuevosErrores = { nombre: '', sede: '' };

    // 2. Validaciones al momento de hacer clic en enviar
    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del cliente no puede estar vacío.';
      hayErrores = true;
    }

    if (!sede) {
      nuevosErrores.sede = 'Debes seleccionar una sede operativa.';
      hayErrores = true;
    }

    if (hayErrores) {
      setErroresValidacion(nuevosErrores);
      return; // Detenemos la ejecución para que no llame a la API
    }

    setIsSubmitting(true);
    const nombreConcatenado = `${nombre.trim()} - ${sede}`;

    try {
      await createClient(nombreConcatenado);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating client:', err);
      setErrorApi('Hubo un error al crear el cliente. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función auxiliar para limpiar el error de un campo cuando el usuario empieza a escribir/seleccionar
  const manejarCambioNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNombre(e.target.value);
    if (erroresValidacion.nombre) setErroresValidacion(prev => ({ ...prev, nombre: '' }));
  };

  const manejarCambioSede = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSede(e.target.value);
    if (erroresValidacion.sede) setErroresValidacion(prev => ({ ...prev, sede: '' }));
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

        {/* Quitamos la validación nativa (required) para manejarla nosotros con mensajes personalizados */}
        <form onSubmit={handleSubmit} noValidate>
          
          {/* Campo Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre Comercial / Razón Social</label>
            <input
              id="nombre"
              type="text"
              className={`form-input ${erroresValidacion.nombre ? 'input-error' : ''}`}
              value={nombre}
              onChange={manejarCambioNombre}
              placeholder="Ej: Agroindustria San José"
              autoFocus
              style={{ borderColor: erroresValidacion.nombre ? 'var(--error)' : undefined }}
            />
            {erroresValidacion.nombre && (
              <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {erroresValidacion.nombre}
              </span>
            )}
          </div>

          {/* Campo Sede */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="sede" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              Sede Operativa
              {/* Nota previa de obligatoriedad */}
              <span style={{ fontSize: '0.7rem', color: 'var(--secondary-color, #1976D2)', fontWeight: 'normal' }}>
                * Campo obligatorio
              </span>
            </label>
            <select
              id="sede"
              className={`form-input ${erroresValidacion.sede ? 'input-error' : ''}`}
              value={sede}
              onChange={manejarCambioSede}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                borderRadius: '0.375rem',
                borderColor: erroresValidacion.sede ? 'var(--error)' : undefined 
              }}
            >
              <option value="" disabled>Selecciona una sede...</option>
              <option value="Valle">Valle</option>
              <option value="Bogotá">Bogotá</option>
              <option value="Medellín">Medellín</option>
            </select>
            
            {/* Mensaje de error de la sede */}
            {erroresValidacion.sede ? (
              <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {erroresValidacion.sede}
              </span>
            ) : (
              // Nota descriptiva adicional
              <span style={{ color: 'var(--text-muted, #7D838F)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Requerido para la segmentación de datos en la aplicación.
              </span>
            )}
          </div>

          {/* Error general de la API */}
          {errorApi && (
            <p style={{ 
              backgroundColor: '#ffebee', 
              color: 'var(--error)', 
              padding: '0.5rem', 
              borderRadius: '0.375rem',
              fontSize: '0.875rem', 
              marginTop: '1rem',
              border: '1px solid #ffcdd2'
            }}>
              {errorApi}
            </p>
          )}

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            {/* El botón ya no se deshabilita por campos vacíos para permitir que el usuario vea los errores */}
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
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