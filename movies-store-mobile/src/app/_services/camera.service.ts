import { Injectable } from '@angular/core';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { FileService } from './file.service';
import { Photo } from '@app/_models/photo';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor(private camera: Camera, private actionSheetCtrl: ActionSheetController, private fileService: FileService) { }

  selectImage(): Promise<Photo> {
    return new Promise((resolve, reject) => {
      this.actionSheetCtrl.create({
        header: 'Seleccione',
        buttons: [{
          text: 'Galería',
          icon: 'images',
          handler: () => {
            this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY)
              .then(galleryImage => { resolve(galleryImage); });
          }
        },
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.pickImage(this.camera.PictureSourceType.CAMERA)
              .then(cameraImage => { resolve(cameraImage); });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
        ]
      }).then(actionSheet => {
        actionSheet.present();
      }).catch(error => {
        reject(error);
      });
    });
  }

  private async pickImage(sourceType: PictureSourceType) {
    try {
      const options: CameraOptions = {
        quality: 70,
        sourceType,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        allowEdit: false
      };

      const imageData = await this.camera.getPicture(options);
      const file = await this.fileService.getPhoto(imageData);

      return file;
    } catch (error) {
      console.log(JSON.stringify(error));
      throw new Error('No se pudo obtener la imagen');
    }
  }
}
