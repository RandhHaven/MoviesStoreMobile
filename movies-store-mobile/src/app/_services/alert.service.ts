import { Injectable } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private toasts: HTMLIonToastElement[] = [];
  constructor(private toastController: ToastController, private alertController: AlertController, private loadingController: LoadingController) { }

  async presentToast(message: string, type: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: type,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    toast.onDidDismiss().then(() => {
      this.toasts.shift();
      if (this.toasts.length > 0) {
        this.showToast();

      }
    });

    this.toasts.push(toast);

    if (this.toasts.length === 1) {
      this.showToast();
    }
  }

  private addToPendingToasts(toast: HTMLIonToastElement) {
    this.toasts.push(toast);

    if (this.toasts.length === 1) {
      this.showToast();
    }
  }

  private showToast() {
    this.toasts[0].present();
  }

  async presentToastSinConexion() {
    const toast = await this.toastController.create({
      message: 'No tiene conexión a internet',
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    this.addToPendingToasts(toast);
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message,
      spinner: 'bubbles'
    });
    await loading.present();
    return loading;
  }
}
