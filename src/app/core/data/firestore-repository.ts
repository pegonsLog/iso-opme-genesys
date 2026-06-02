import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {
  Cargo,
  Colaborador,
  ItemCronograma,
  RegistroTreinamento,
  Treinamento,
} from '../models';
import { DataRepository } from './data-repository';

/**
 * Repositório baseado no Cloud Firestore.
 *
 * Cada coleção é exposta como um signal reativo via `collectionData` +
 * `toSignal`. As operações de escrita usam o id do próprio modelo como
 * id do documento, mantendo a mesma semântica do repositório em memória.
 */
@Injectable()
export class FirestoreRepository extends DataRepository {
  private readonly db = inject(Firestore);

  private readonly cargosCol = collection(this.db, 'cargos');
  private readonly treinamentosCol = collection(this.db, 'treinamentos');
  private readonly colaboradoresCol = collection(this.db, 'colaboradores');
  private readonly registrosCol = collection(this.db, 'registros');
  private readonly cronogramaCol = collection(this.db, 'cronograma');

  readonly cargos: Signal<Cargo[]> = toSignal(
    collectionData(this.cargosCol, { idField: 'id' }) as Observable<Cargo[]>,
    { initialValue: [] as Cargo[] },
  );

  readonly treinamentos: Signal<Treinamento[]> = toSignal(
    collectionData(this.treinamentosCol, { idField: 'id' }) as Observable<Treinamento[]>,
    { initialValue: [] as Treinamento[] },
  );

  readonly colaboradores: Signal<Colaborador[]> = toSignal(
    collectionData(this.colaboradoresCol, { idField: 'id' }) as Observable<Colaborador[]>,
    { initialValue: [] as Colaborador[] },
  );

  readonly registros: Signal<RegistroTreinamento[]> = toSignal(
    collectionData(this.registrosCol, { idField: 'id' }) as Observable<RegistroTreinamento[]>,
    { initialValue: [] as RegistroTreinamento[] },
  );

  /** Cronograma anual de treinamentos (collection no Firestore). */
  readonly cronograma: Signal<ItemCronograma[]> = toSignal(
    collectionData(this.cronogramaCol, { idField: 'id' }) as Observable<ItemCronograma[]>,
    { initialValue: [] as ItemCronograma[] },
  );

  // ----- Colaboradores -----
  addColaborador(colaborador: Colaborador): Promise<void> {
    return setDoc(doc(this.colaboradoresCol, colaborador.id), colaborador);
  }

  updateColaborador(id: string, patch: Partial<Colaborador>): Promise<void> {
    return updateDoc(doc(this.colaboradoresCol, id), patch);
  }

  removeColaborador(id: string): Promise<void> {
    return deleteDoc(doc(this.colaboradoresCol, id));
  }

  // ----- Cargos -----
  addCargo(cargo: Cargo): Promise<void> {
    return setDoc(doc(this.cargosCol, cargo.id), cargo);
  }

  updateCargo(id: string, patch: Partial<Cargo>): Promise<void> {
    return updateDoc(doc(this.cargosCol, id), patch);
  }

  removeCargo(id: string): Promise<void> {
    return deleteDoc(doc(this.cargosCol, id));
  }

  // ----- Treinamentos -----
  addTreinamento(treinamento: Treinamento): Promise<void> {
    return setDoc(doc(this.treinamentosCol, treinamento.id), treinamento);
  }

  updateTreinamento(id: string, patch: Partial<Treinamento>): Promise<void> {
    return updateDoc(doc(this.treinamentosCol, id), patch);
  }

  removeTreinamento(id: string): Promise<void> {
    return deleteDoc(doc(this.treinamentosCol, id));
  }

  // ----- Registros -----
  addRegistro(registro: RegistroTreinamento): Promise<void> {
    return setDoc(doc(this.registrosCol, registro.id), registro);
  }

  updateRegistro(id: string, patch: Partial<RegistroTreinamento>): Promise<void> {
    return updateDoc(doc(this.registrosCol, id), patch);
  }

  // ----- Cronograma -----
  addCronograma(item: ItemCronograma): Promise<void> {
    return setDoc(doc(this.cronogramaCol, item.id), item);
  }

  updateCronograma(id: string, patch: Partial<ItemCronograma>): Promise<void> {
    return updateDoc(doc(this.cronogramaCol, id), patch);
  }

  removeCronograma(id: string): Promise<void> {
    return deleteDoc(doc(this.cronogramaCol, id));
  }
}
