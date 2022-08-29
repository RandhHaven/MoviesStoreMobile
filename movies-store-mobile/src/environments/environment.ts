// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  baseUrl: 'https://localhost:44312/',
  baseApi: 'https://localhost:44312/api/',
  baseWeb: 'https://pluspetrolwebtest.azurewebsites.net/',
  dbName: 'pluspetrol-dev',
  azureAD: {
    clientId: '9787c8e4-5e4a-4a4d-993b-d01af6f7b927',
    tenantId: '98ce5ac9-d1ad-4ad0-98f2-fc1c8f30c066',
    redirectURI: 'http://localhost:8100/account/login',
  },
  notifications: {
    hubName: 'pluspetroltest',
    hubConnectionString:
      'Endpoint=sb://pluspetroltest.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=YwhXp8bvdrEwESd7SsDS22d8GeOktYyGNZIM4GuWWfo=',
  },
  native: false,
  development: true,
  testing: false,
  preprod: false,
  production: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
