export interface AndroidApp {
  id: string;
  titulo: string;
  descripcion_corta: string;
  descripcion_larga: string;
  package_name: string;
  icono_url: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  icono_local: string;
}
