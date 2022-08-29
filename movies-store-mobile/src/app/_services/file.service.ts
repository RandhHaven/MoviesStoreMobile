import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Photo } from '@app/_models/photo';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private file: File) { }

  async getDataURL(imageData: any) {
    const file = this.getFilenamePath(imageData);
    const dataURL = await this.file.readAsDataURL(file.path, file.filename);

    return dataURL;
  }

  private getFilenamePath(imageData: any) {
    const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
    const path = imageData.substring(0, imageData.lastIndexOf('/') + 1);

    return { filename, path };
  }

  async getPhoto(imageData: any): Promise<Photo> {
    if (imageData.indexOf('jpg?') >= 0) {
      imageData = imageData.split('.jpg?')[0] + '.jpg';
    }
    const entry = await this.file.resolveLocalFilesystemUrl(imageData);
    const { name, nativeURL } = entry;
    const path = nativeURL.substring(0, nativeURL.lastIndexOf('/'));
    const dataURL = await this.getDataURL(imageData);

    return { file: entry, filename: name, directory: path, filepath: imageData, base64: dataURL };
  }

  async fileToBlob(directory: string, filename: string, type: string) {
    const buffer = await this.file.readAsArrayBuffer(directory, filename);
    const blob = new Blob([buffer], { type });
    console.log(blob.type, blob.size);

    return blob;
  }

  public blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result as string;
        // const base64 = dataUrl.split(',')[1];
        resolve(dataUrl);
      };
      reader.readAsDataURL(blob);
    });
  }

  async savePicture(photo: Photo, inspeccionId: number) {
    const newFilename = new Date().getTime() + '.jpeg';
    const newPath = this.file.dataDirectory + inspeccionId;
    const existeDir = await this.checkDirExists(this.file.dataDirectory, inspeccionId.toString());
    if (!existeDir) {
      const dirEntry = await this.file.createDir(this.file.dataDirectory, inspeccionId.toString(), true);
    }
    const savedFile = await this.file.copyFile(photo.directory, photo.filename, newPath, newFilename);
    photo.filename = newFilename;
    photo.directory = newPath;
    photo.filepath = newPath + newFilename;
    photo.file = savedFile;

    return photo;
  }

  private checkDirExists(dirPath: string, folder: string) {
    return new Promise((resolve, reject) => {
      this.file.checkDir(dirPath, folder)
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          resolve(false);
        });

    });
  }

  async getPhotoFromFileSystem(inspeccionId: number, filename: string) {
    const filePath = this.file.dataDirectory + inspeccionId + '/' + filename;
    const photo = this.getPhoto(filePath);
    return photo;
  }
}
