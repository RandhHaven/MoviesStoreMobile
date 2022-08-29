export const environment = {
  baseUrl: 'https://pluspetrolapitest.azurewebsites.net/',
  baseApi: 'https://pluspetrolapitest.azurewebsites.net/api/',
  baseWeb: 'https://pluspetrolwebtest.azurewebsites.net/',
  dbName: 'pluspetrol-testnative',
  azureAD: {
    clientId: '0e717a28-5f1d-4189-a586-098c1ebab142',
    tenantId: 'ff730b25-9a1c-40a0-859d-d2624f23d4cb',
    redirectURI: 'http://localhost/desarrollo'
  },
  notifications: {
    hubName: 'pluspetroltest',
    hubConnectionString: 'Endpoint=sb://pluspetroltest.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=YwhXp8bvdrEwESd7SsDS22d8GeOktYyGNZIM4GuWWfo='
  },
  native: true,
  development: false,
  testing: true,
  preprod: false,
  production: false
};
