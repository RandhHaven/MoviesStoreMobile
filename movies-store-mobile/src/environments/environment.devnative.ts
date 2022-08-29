export const environment = {
  baseUrl: 'http://10.0.2.2:5001/',
  baseApi: 'http://10.0.2.2:5001/api/',
  baseWeb: 'https://pluspetrolwebtest.azurewebsites.net/',
  dbName: 'pluspetrol-devnative',
  azureAD: {
    clientId: '0e717a28-5f1d-4189-a586-098c1ebab142',
    tenantId: 'ff730b25-9a1c-40a0-859d-d2624f23d4cb',
    redirectURI: 'http://localhost/testing',
  },
  notifications: {
    hubName: 'pluspetroltest',
    hubConnectionString:
      'Endpoint=sb://pluspetroltest.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=YwhXp8bvdrEwESd7SsDS22d8GeOktYyGNZIM4GuWWfo=',
  },
  native: true,
  development: true,
  testing: false,
  preprod: false,
  production: false,
};
