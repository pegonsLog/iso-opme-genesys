import { Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DataRepository } from './data-repository';
import { FirestoreRepository } from './firestore-repository';
import { InMemoryRepository } from './in-memory-repository';

/**
 * Escolhe a implementação do repositório de dados conforme a flag de
 * ambiente. Com Firebase desabilitado, usa o repositório em memória
 * (localStorage); habilitado, usa o Firestore.
 */
export function provideDataRepository(): Provider {
  return {
    provide: DataRepository,
    useClass: environment.firebaseEnabled ? FirestoreRepository : InMemoryRepository,
  };
}
