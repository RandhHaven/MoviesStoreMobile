export class WsRegisterAdfs {
  nombre: string;
  apellido: string;
  usuario: string;
  email: string;
  cargo: string;
  unidadNegocioId: number;
  areaDeTrabajoId: number;
  yacimientoId: number;
  gerenciaId: number;

  constructor(nombre: string, apellido: string, usuario: string, email: string, cargo: string, unidadNegocioId: number, areaDeTrabajoId: number, yacimientoId: number, gerenciaId: number) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.usuario = usuario;
    this.email = email;
    this.cargo = cargo;
    this.unidadNegocioId = unidadNegocioId;
    this.areaDeTrabajoId = areaDeTrabajoId;
    this.yacimientoId = yacimientoId;
    this.gerenciaId = gerenciaId;
  }
}
