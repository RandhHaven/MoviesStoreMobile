export class ChecklistItem {
  Id: number;
  CheckListGrupoID: number;
  Titulo: string;
  Texto: string;
  Orden: number;
  Numerado: boolean;
  Icono?: string;
  InspeccionDetalles?: any;
  // se usa en la vista
  imagenBase64?: string = null;
  respuesta = false;
}
