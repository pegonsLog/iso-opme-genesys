import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { Cargo } from '../../core/models';
import { gerarId } from '../../core/utils/id';

@Component({
  selector: 'app-cargos',
  imports: [ReactiveFormsModule],
  templateUrl: './cargos.html',
  styleUrl: './cargos.scss',
})
export class Cargos {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);

  protected readonly cargos = this.store.cargos;
  protected readonly treinamentos = this.store.treinamentos;
  protected readonly formAberto = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    area: ['', Validators.required],
    objetivo: [''],
    escolaridade: [''],
    experiencia: [''],
    /** Listas digitadas com uma linha por item. */
    responsabilidades: [''],
    competenciasTecnicas: [''],
    /** Ids selecionados de treinamentos obrigatórios. */
    treinamentosObrigatorios: [[] as string[]],
  });

  protected nomeTreinamento(id: string): string {
    return this.store.getTreinamento(id)?.nome ?? id;
  }

  protected abrirForm(): void {
    this.form.reset({
      nome: '',
      area: '',
      objetivo: '',
      escolaridade: '',
      experiencia: '',
      responsabilidades: '',
      competenciasTecnicas: '',
      treinamentosObrigatorios: [],
    });
    this.formAberto.set(true);
  }

  protected fecharForm(): void {
    this.formAberto.set(false);
  }

  protected toggleTreinamento(id: string, marcado: boolean): void {
    const atuais = this.form.controls.treinamentosObrigatorios.value;
    const novos = marcado ? [...atuais, id] : atuais.filter((t) => t !== id);
    this.form.controls.treinamentosObrigatorios.setValue(novos);
  }

  protected estaSelecionado(id: string): boolean {
    return this.form.controls.treinamentosObrigatorios.value.includes(id);
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const linhas = (texto: string) =>
      texto
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const novo: Cargo = {
      id: gerarId('cargo'),
      nome: v.nome,
      area: v.area,
      objetivo: v.objetivo,
      escolaridade: v.escolaridade,
      experiencia: v.experiencia,
      responsabilidades: linhas(v.responsabilidades),
      competenciasTecnicas: linhas(v.competenciasTecnicas),
      treinamentosObrigatorios: v.treinamentosObrigatorios,
    };
    await this.store.addCargo(novo);
    this.fecharForm();
  }

  protected async remover(id: string): Promise<void> {
    await this.store.removeCargo(id);
  }
}
