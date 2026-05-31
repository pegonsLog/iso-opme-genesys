/**
 * Configuração de produção.
 *
 * Substitua os valores de `firebaseConfig` pelas credenciais do seu
 * projeto Firebase (Console do Firebase → Configurações do projeto →
 * Seus apps → Configuração do SDK).
 */
export const environment = {
  production: true,
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
