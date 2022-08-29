export const environment = {
  baseUrl: 'https://top-pluspetrolapi.azurewebsites.net/',
  baseApi: 'https://top-pluspetrolapi.azurewebsites.net/api/',
  baseWeb: 'https://top-pluspetrol.azurewebsites.net/',
  dbName: 'pluspetrol',
  azureAD: {
    clientId: 'fc1d2ff1-c2c9-4c78-aba9-3bd992cc5200',
    tenantId: 'ff730b25-9a1c-40a0-859d-d2624f23d4cb',
    redirectURI: 'http://localhost/produccion'
  },
  notifications: {
    hubName: 'pluspetrol',
    hubConnectionString: 'Endpoint=sb://pluspetrol.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=MA9WVn3xVK0PEPEDc7pPLiTiPjvxHgbPQFmmibEL+AQ='
  },
  native: true,
  development: false,
  testing: false,
  preprod: false,
  production: true
};
