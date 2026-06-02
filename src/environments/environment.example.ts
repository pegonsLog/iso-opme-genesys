/**
 * Template de configuração de ambiente.
 *
 * NÃO contém credenciais reais e PODE ser versionado no git.
 *
 * Para rodar o projeto, copie este arquivo para:
 *   - src/environments/environment.ts             (produção)
 *   - src/environments/environment.development.ts (desenvolvimento)
 * e preencha os valores do seu projeto Firebase.
 *
 * Os arquivos environment.ts e environment.development.ts são ignorados
 * pelo git (ver .gitignore) para não expor as credenciais.
 *
 * Dica: com `firebaseEnabled: false` o app roda offline (localStorage),
 * sem necessidade de credenciais.
 */
export const environment = {
  production: false,
  firebaseEnabled: true,
  firebase: {
    apiKey: 'SUA_API_KEY',
    authDomain: 'SEU_PROJETO.firebaseapp.com',
    projectId: 'SEU_PROJETO',
    storageBucket: 'SEU_PROJETO.firebasestorage.app',
    messagingSenderId: 'SEU_MESSAGING_SENDER_ID',
    appId: 'SEU_APP_ID',
  },
};
