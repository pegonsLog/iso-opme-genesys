import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { Colaborador } from '../../core/models';
import { gerarId } from '../../core/utils/id';

@Component({
  selector: 'app-colaboradores',
  imports: [ReactiveFormsModule],
  templateUrl: './colaboradores.html',
  styleUrl: './colaboradores.scss',
})
export class Colaboradores {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);

  protected readonly colaboradores = this.store.colaboradores;
  protected readonly cargos = this.store.cargos;
  protected readonly formAberto = signal(false);

  protected readonly temCargos = computed(() => this.cargos().length > 0);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    cargoId: ['', Validators.required],
    dataAdmissao: ['', Validators.required],
    email: ['', Validators.email],
    integracaoConcluida: [false],
  });

  protected nomeCargo(id: string): string {
    return this.store.getCargo(id)?.nome ?? '—';
  }

  protected abrirForm(): void {
    this.form.reset({
      nome: '',
      cargoId: this.cargos()[0]?.id ?? '',
      dataAdmissao: new Date().toISOString().slice(0, 10),
      email: '',
      integracaoConcluida: false,
    });
    this.formAberto.set(true);
  }

  protected fecharForm(): void {
    this.formAberto.set(false);
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const novo: Colaborador = {
      id: gerarId('colab'),
      nome: v.nome,
      cargoId: v.cargoId,
      dataAdmissao: v.dataAdmissao,
      email: v.email,
      integracaoConcluida: v.integracaoConcluida,
      ativo: true,
    };
    await this.store.addColaborador(novo);
    this.fecharForm();
  }

  protected async alternarIntegracao(c: Colaborador): Promise<void> {
    await this.store.updateColaborador(c.id, { integracaoConcluida: !c.integracaoConcluida });
  }

  protected async alternarAtivo(c: Colaborador): Promise<void> {
    await this.store.updateColaborador(c.id, { ativo: !c.ativo });
  }
}
