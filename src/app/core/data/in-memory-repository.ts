import { Injectable, signal } from '@angular/core';
import {
  Cargo,
  Colaborador,
  ItemCronograma,
  RegistroTreinamento,
  Treinamento,
} from '../models';
import {
  CARGOS_SEED,
  COLABORADORES_SEED,
  CRONOGRAMA_SEED,
  REGISTROS_SEED,
  TREINAMENTOS_SEED,
} from '../services/seed-data';
import { DataRepository } from './data-repository';

const STORAGE_KEY = 'iso-opme-data';

interface PersistedState {
  cargos: Cargo[];
  treinamentos: Treinamento[];
  colaboradores: Colaborador[];
  registros: RegistroTreinamento[];
  cronograma: ItemCronograma[];
}

/**
 * Repositório em memória com persistência em localStorage.
 * Usado enquanto o Firebase não está habilitado.
 */
@Injectable()
export class InMemoryRepository extends DataRepository {
  private readonly _cargos = signal<Cargo[]>([]);
  private readonly _treinamentos = signal<Treinamento[]>([]);
  private readonly _colaboradores = signal<Colaborador[]>([]);
  private readonly _registros = signal<RegistroTreinamento[]>([]);
  private readonly _cronograma = signal<ItemCronograma[]>(CRONOGRAMA_SEED);

  readonly cargos = this._cargos.asReadonly();
  readonly treinamentos = this._treinamentos.asReadonly();
  readonly colaboradores = this._colaboradores.asReadonly();
  readonly registros = this._registros.asReadonly();
  readonly cronograma = this._cronograma.asReadonly();

  constructor() {
    super();
    this.carregar();
  }

  // ----- Persistência -----
  private carregar(): void {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const state = JSON.parse(raw) as PersistedState;
        this._cargos.set(state.cargos ?? CARGOS_SEED);
        this._treinamentos.set(state.treinamentos ?? TREINAMENTOS_SEED);
        this._colaboradores.set(state.colaboradores ?? COLABORADORES_SEED);
        this._registros.set(state.registros ?? REGISTROS_SEED);
        this._cronograma.set(state.cronograma ?? CRONOGRAMA_SEED);
        return;
      } catch {
        // estado corrompido — recai no seed
      }
    }
    this._cargos.set(CARGOS_SEED);
    this._treinamentos.set(TREINAMENTOS_SEED);
    this._colaboradores.set(COLABORADORES_SEED);
    this._registros.set(REGISTROS_SEED);
    this._cronograma.set(CRONOGRAMA_SEED);
  }

  private salvar(): void {
    if (typeof localStorage === 'undefined') return;
    const state: PersistedState = {
      cargos: this._cargos(),
      treinamentos: this._treinamentos(),
      colaboradores: this._colaboradores(),
      registros: this._registros(),
      cronograma: this._cronograma(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ----- Colaboradores -----
  async addColaborador(colaborador: Colaborador): Promise<void> {
    this._colaboradores.update((list) => [...list, colaborador]);
    this.salvar();
  }

  async updateColaborador(id: string, patch: Partial<Colaborador>): Promise<void> {
    this._colaboradores.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
    this.salvar();
  }

  async removeColaborador(id: string): Promise<void> {
    this._colaboradores.update((list) => list.filter((c) => c.id !== id));
    this.salvar();
  }

  // ----- Cargos -----
  async addCargo(cargo: Cargo): Promise<void> {
    this._cargos.update((list) => [...list, cargo]);
    this.salvar();
  }

  async updateCargo(id: string, patch: Partial<Cargo>): Promise<void> {
    this._cargos.update((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    this.salvar();
  }

  async removeCargo(id: string): Promise<void> {
    this._cargos.update((list) => list.filter((c) => c.id !== id));
    this.salvar();
  }

  // ----- Treinamentos -----
  async addTreinamento(treinamento: Treinamento): Promise<void> {
    this._treinamentos.update((list) => [...list, treinamento]);
    this.salvar();
  }

  async updateTreinamento(id: string, patch: Partial<Treinamento>): Promise<void> {
    this._treinamentos.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
    this.salvar();
  }

  async removeTreinamento(id: string): Promise<void> {
    this._treinamentos.update((list) => list.filter((t) => t.id !== id));
    this.salvar();
  }

  // ----- Registros -----
  async addRegistro(registro: RegistroTreinamento): Promise<void> {
    this._registros.update((list) => [...list, registro]);
    this.salvar();
  }

  async updateRegistro(id: string, patch: Partial<RegistroTreinamento>): Promise<void> {
    this._registros.update((list) =>
      list.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
    this.salvar();
  }

  // ----- Cronograma -----
  async addCronograma(item: ItemCronograma): Promise<void> {
    this._cronograma.update((list) => [...list, item]);
    this.salvar();
  }

  async updateCronograma(id: string, patch: Partial<ItemCronograma>): Promise<void> {
    this._cronograma.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
    this.salvar();
  }

  async removeCronograma(id: string): Promise<void> {
    this._cronograma.update((list) => list.filter((c) => c.id !== id));
    this.salvar();
  }
}
