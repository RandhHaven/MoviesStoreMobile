export class ImagenPendiente {
  id: number;
  topId: number;
  topIdServidor?: number;
  imageName: string;

  constructor(id: number, topId: number, imageName: string, topIdServidor?: number) {
    this.id = id;
    this.topId = topId;
    this.imageName = imageName;
    this.topIdServidor = topIdServidor;
  }
}
