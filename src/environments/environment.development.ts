/**
 * Configuração de desenvolvimento.
 *
 * Com `firebaseEnabled: true`, a aplicação lê/grava no Firestore do
 * projeto iso-opme-genesys. Para voltar a rodar offline (localStorage),
 * basta mudar a flag para `false`.
 */
export const environment = {
  production: false,
  firebaseEnabled: true,
  firebase: {
    apiKey: 'AIzaSyDT_ZCKzSAyH3t66qL4K0GTXJmEh4eKtMc',
    authDomain: 'iso-opme-genesys.firebaseapp.com',
    projectId: 'iso-opme-genesys',
    storageBucket: 'iso-opme-genesys.firebasestorage.app',
    messagingSenderId: '226306293483',
    appId: '1:226306293483:web:487f151c9b051b825a88ae',
  },
};
