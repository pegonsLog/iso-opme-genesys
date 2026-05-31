/**
 * Configuração de desenvolvimento.
 *
 * Enquanto `firebaseEnabled` for `false`, a aplicação usa o repositório
 * em memória (DataStoreService com dados seed). Após preencher as
 * credenciais abaixo e mudar a flag para `true`, a aplicação passa a
 * ler/gravar no Firestore.
 */
export const environment = {
  production: false,
  firebaseEnabled: false, // mude para true após preencher as credenciais
  firebase: {
    apiKey: 'SUA_API_KEY',
    authDomain: 'SEU_PROJETO.firebaseapp.com',
    projectId: 'SEU_PROJETO',
    storageBucket: 'SEU_PROJETO.appspot.com',
    messagingSenderId: 'SEU_SENDER_ID',
    appId: 'SEU_APP_ID',
  },
};
