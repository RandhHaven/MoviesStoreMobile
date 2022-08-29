export const environment = {
  baseUrl: 'https://pluspetrolapitest.azurewebsites.net/',
  baseApi: 'https://pluspetrolapitest.azurewebsites.net/api/',
  baseWeb: 'https://pluspetrolwebtest.azurewebsites.net/',
  dbName: 'pluspetrol-test',
  azureAD: {
    clientId: '3a99fae8-b852-4d21-99a5-388e32b5745b',
    tenantId: 'ff730b25-9a1c-40a0-859d-d2624f23d4cb',
    redirectURI: 'http://localhost/testing',
  },
  notifications: {
    hubName: 'pluspetroltest',
    hubConnectionString:
      'Endpoint=sb://pluspetroltest.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=YwhXp8bvdrEwESd7SsDS22d8GeOktYyGNZIM4GuWWfo=',
  },
  native: false,
  development: false,
  testing: true,
  preprod: false,
  production: false,
};
