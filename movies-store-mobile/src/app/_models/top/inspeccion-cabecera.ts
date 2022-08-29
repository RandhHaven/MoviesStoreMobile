import { InspeccionDetalle } from './inspeccion-detalle';

export class InspeccionCabecera {
  id = 0;
  checkListCabeceraId: number;
  fecha: Date;
  latitude: string;
  longitude: string;
  origen = 0;
  // tslint:disable-next-line: variable-name
  COM_AccionesCorrectivasPrevenir: string;
  comentarios: string;
  politicaSuspensionTareas?: boolean;
  unidadNegocioId: number;
  areaDeTrabajoId: number;
  YacimientoID: number;
  lugarEspecificoId: number;
  GerenciaID: number;
  lugar: string;
  revisada = false;
  requiereAccion?: boolean = null;
  comentariosRevision?: string = null;
  numeroSIGA?: string = null;
  revision = false;
  irASiguiente = false;
  userName: string;
  archivosEliminar: string[] = null;
  inspeccionDetalles: InspeccionDetalle[];

  localId: number;
}
