import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { Platform } from '@ionic/angular';
import { AlertService } from './alert.service';
import { ConnectionStatus } from '@app/_helpers/enums/connection-status.enum';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Online);

  constructor(private network: Network, private alertService: AlertService, private plt: Platform) {
    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
      const status = this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }

  public initializeNetworkEvents() {
    if (this.plt.is('desktop')) {
      fromEvent(window, 'offline').subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Online) {
          console.log('WE ARE OFFLINE');
          this.updateNetworkStatus(ConnectionStatus.Offline);
        }
      });

      fromEvent(window, 'online').subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Offline) {
          console.log('WE ARE ONLINE');
          this.updateNetworkStatus(ConnectionStatus.Online);
        }
      });
    } else {
      this.network.onDisconnect().subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Online) {
          console.log('WE ARE OFFLINE');
          this.updateNetworkStatus(ConnectionStatus.Offline);
        }
      });

      this.network.onConnect().subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Offline) {
          console.log('WE ARE ONLINE');
          this.updateNetworkStatus(ConnectionStatus.Online);
        }
      });
    }
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);

    const connection = status === ConnectionStatus.Offline ? 'Offline' : 'Online';
    this.alertService.presentToast(`Ahora está ${connection}`, 'dark');
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }

  public isOnline() {
    return this.getCurrentNetworkStatus() === ConnectionStatus.Online;
  }
}
