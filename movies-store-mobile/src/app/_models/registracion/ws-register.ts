export class WsRegister {
  nombre: string;
  apellido: string;
  usuario: string;
  dni: string;
  cargoContratistaId?: number;
  unidadNegocioId: number;
  areaDeTrabajoId: number;
  empresaId: number;
  password: string;
  confirmPassword: string;

  constructor(nombre: string, apellido: string, usuario: string, dni: string, empresaId: number, password: string, confirmPassword: string, cargoContratistaId?: number, unidadNegocioId?: number, areaDeTrabajoId?: number) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.usuario = usuario;
    this.dni = dni;
    this.cargoContratistaId = cargoContratistaId;
    this.unidadNegocioId = unidadNegocioId;
    this.areaDeTrabajoId = areaDeTrabajoId;
    this.empresaId = empresaId;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}
