export const environment = {
  baseUrl: 'https://topapipp.azurewebsites.net/',
  baseApi: 'https://topapipp.azurewebsites.net/api/',
  baseWeb: 'https://topwebpp.azurewebsites.net/',
  dbName: 'pluspetrol-preprod',
  azureAD: {
    clientId: '3a99fae8-b852-4d21-99a5-388e32b5745b',
    tenantId: 'ff730b25-9a1c-40a0-859d-d2624f23d4cb',
    redirectURI: 'http://localhost/preproduccion'
  },
  notifications: {
    hubName: 'pluspetrolpp',
    hubConnectionString:
      'Endpoint=sb://pluspetrolpp.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=GhKua5dE870gN5BEONwtoLSkcIPp+Y0LoXM+5zz21VY=',
  },
  native: true,
  development: false,
  testing: false,
  preprod: true,
  production: false,
};
