import axios from 'axios';

export const baseURL = 'http://localhost:8000';

const api = axios.create({
  baseURL,
});

// --- NUEVO: Interceptor para inyectar el token de Clerk en cada petición ---
export const setupAxiosInterceptors = (getToken: () => Promise<string | null>) => {
  api.interceptors.request.clear(); // Limpiamos interceptores previos
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

// Types from Backend
export interface ClienteResponse {
  id: string;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface VehiculoResponse {
  id: string;
  codigo_vehiculo: string;
  cliente_id: string;
  tipo_id: string;
  marca_id: string;
  tipo_nombre: string;
  marca_nombre: string;
  no_llantas: number;
  created_at: string;
  updated_at: string;
}

export interface InspeccionResumenResponse {
  id: string;
  nombre: string | null;
  fecha_revision: string;
  estado: string;
  created_at: string;
  cantidad_vehiculos: number;
  cantidad_llantas: number;
}

export interface InspeccionLlantaDetalle {
  vehiculo_codigo: string;
  vehiculo_marca: string | null;
  vehiculo_tipo: string | null;
  posicion: number;
  codigo_llanta: string;
  marca_llanta: string;
  diseno_llanta: string;
  dimension_llanta: string;
  tipo_llanta: string;
  fecha_montaje: string | null;
  medida_ext: number | null;
  medida_cent: number | null;
  medida_int: number | null;
  presion: number | null;
  observacion: string | null;
}

export interface InspeccionDetalleResponse {
  id: string;
  nombre: string | null;
  fecha_revision: string;
  cliente_id: string;
  vehiculos_inspeccionados: string[];
  mediciones: InspeccionLlantaDetalle[];
}

export const getClients = async (): Promise<ClienteResponse[]> => {
  const { data } = await api.get('/client/');
  return data;
};

export const createClient = async (nombre: string): Promise<ClienteResponse> => {
  const { data } = await api.post('/client/', { nombre });
  return data;
};

export const getClient = async (id: string): Promise<ClienteResponse> => {
  const { data } = await api.get(`/client/${id}`);
  return data;
};

export const getVehicles = async (clientId: string): Promise<VehiculoResponse[]> => {
  const { data } = await api.get(`/client/${clientId}/vehiculos`);
  return data;
};

export const getInspections = async (clientId: string): Promise<InspeccionResumenResponse[]> => {
  const { data } = await api.get(`/inspection/client/${clientId}`);
  return data;
};

export const getInspectionDetail = async (id: string): Promise<InspeccionDetalleResponse> => {
  const { data } = await api.get(`/inspection/${id}`);
  return data;
};

export const uploadInspection = async (clientId: string, nombre: string, fecha: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('cliente_id', clientId);
  formData.append('nombre', nombre);
  formData.append('fecha_revision', fecha);
  formData.append('file', file);

  const { data } = await api.post('/inspection/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export interface ClienteVariableResponse {
  id: string;
  nombre: string;
  tipo: string;
}

export const getVariablesVehiculo = async (clientId: string): Promise<Record<string, ClienteVariableResponse[]>> => {
  const { data } = await api.get(`/client/${clientId}/variables/vehicle-form`);
  return data;
};

export default api;