import { Injectable } from '@angular/core';
import {
  Registration,
  Notification,
  EventType,
} from '@app/_models/notifications-events';
import { environment } from '@environments/environment';
import { Platform } from '@ionic/angular';

declare let PushNotification;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // make an empty array of registrations and notifications
  pushEvents: (Registration | Notification)[] = [];
  pushNotifications: any = null;
  constructor(private platform: Platform) {}

  registerPushNotifications(username: string) {
    if (this.platform.is('cordova') && PushNotification) {
      this.pushNotifications = PushNotification.init({
        // Pass in our configuration values
        notificationHubPath: environment.notifications.hubName,
        connectionString: environment.notifications.hubConnectionString,
        tags: username,

        android: {
          sound: true,
          forceShow: true,
          icon: 'icon_pp',
          iconColor: '#007ea4',
        },
        ios: {
          alert: 'true',
          badge: true,
          sound: 'false',
        },
      });

      this.pushNotifications.on('registration', (data: any) => {
        console.log('Received Registration event');
        // Copy the event data into a Registration object
        const registration: Registration = JSON.parse(JSON.stringify(data));
        // Populate the object type
        registration.type = EventType.registration;
        this.saveData(registration);
      });

      this.pushNotifications.on('notification', (data: any) => {
        console.log('Received Notification event');
        // Copy the event data into a Notification object
        const notification: Notification = JSON.parse(JSON.stringify(data));
        notification.type = EventType.notification;
        this.saveData(notification);
      });
    }
  }

  unregisterPushNotifications() {
    if (this.platform.is('cordova')) {
      if (this.pushNotifications) {
        this.pushNotifications.unregister(
          () => {
            console.log('success unregister');
          },
          () => {
            console.log('error unregister');
          }
        );
      }
    }
  }

  private saveData(data: Registration | Notification) {
    this.pushEvents.push(data);
    console.dir(this.pushEvents);
  }
}
