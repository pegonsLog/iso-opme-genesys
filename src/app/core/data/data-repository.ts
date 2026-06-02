import { Signal } from '@angular/core';
import {
  Cargo,
  Colaborador,
  ItemCronograma,
  RegistroTreinamento,
  Treinamento,
} from '../models';

/**
 * Contrato de acesso a dados da aplicação.
 *
 * Expõe os dados brutos como signals (somente leitura) e operações CRUD.
 * Implementações: in-memory (seed) e Firestore. Os componentes e a lógica
 * derivada (indicadores, não conformidades) dependem apenas deste contrato,
 * de forma que a troca de backend não os afete.
 */
export abstract class DataRepository {
  abstract readonly cargos: Signal<Cargo[]>;
  abstract readonly treinamentos: Signal<Treinamento[]>;
  abstract readonly colaboradores: Signal<Colaborador[]>;
  abstract readonly registros: Signal<RegistroTreinamento[]>;
  abstract readonly cronograma: Signal<ItemCronograma[]>;

  // ----- Colaboradores -----
  abstract addColaborador(colaborador: Colaborador): Promise<void>;
  abstract updateColaborador(id: string, patch: Partial<Colaborador>): Promise<void>;
  abstract removeColaborador(id: string): Promise<void>;

  // ----- Cargos -----
  abstract addCargo(cargo: Cargo): Promise<void>;
  abstract updateCargo(id: string, patch: Partial<Cargo>): Promise<void>;
  abstract removeCargo(id: string): Promise<void>;

  // ----- Treinamentos -----
  abstract addTreinamento(treinamento: Treinamento): Promise<void>;
  abstract updateTreinamento(id: string, patch: Partial<Treinamento>): Promise<void>;
  abstract removeTreinamento(id: string): Promise<void>;

  // ----- Registros de treinamento -----
  abstract addRegistro(registro: RegistroTreinamento): Promise<void>;
  abstract updateRegistro(id: string, patch: Partial<RegistroTreinamento>): Promise<void>;

  // ----- Cronograma -----
  abstract addCronograma(item: ItemCronograma): Promise<void>;
  abstract updateCronograma(id: string, patch: Partial<ItemCronograma>): Promise<void>;
  abstract removeCronograma(id: string): Promise<void>;
}
