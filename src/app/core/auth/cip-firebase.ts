import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

/**
 * Instância Firebase dedicada ao CIP (Centro de Inteligência de Pessoas),
 * usada SOMENTE para autenticação (coleção `usuarios`).
 *
 * É inicializada como um app nomeado e separado do app padrão gerenciado
 * pelo AngularFire (que aponta para o projeto do ISO). Assim os dados de
 * domínio continuam no projeto do ISO, e apenas o login é compartilhado
 * com o projeto do CIP.
 */
const CIP_APP_NAME = 'cip-auth';

let cipFirestore: Firestore | null = null;

/** Retorna o Firestore do projeto do CIP, ou null se o auth do CIP estiver desativado. */
export function getCipFirestore(): Firestore | null {
  if (!environment.cipAuth?.enabled) return null;
  if (cipFirestore) return cipFirestore;

  const existente = getApps().find((a) => a.name === CIP_APP_NAME);
  const app: FirebaseApp = existente ?? initializeApp(environment.cipAuth.firebase, CIP_APP_NAME);
  cipFirestore = getFirestore(app);
  return cipFirestore;
}
