import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { Colaborador } from '../../core/models';
import { gerarId } from '../../core/utils/id';
import { ConfirmDialogService } from '../../core/ui/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-colaboradores',
  imports: [ReactiveFormsModule],
  templateUrl: './colaboradores.html',
  styleUrl: './colaboradores.scss',
})
export class Colaboradores {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmDialogService);

  protected readonly colaboradores = this.store.colaboradores;
  protected readonly cargos = this.store.cargos;
  protected readonly formAberto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

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
    this.editandoId.set(null);
    this.form.reset({
      nome: '',
      cargoId: this.cargos()[0]?.id ?? '',
      dataAdmissao: new Date().toISOString().slice(0, 10),
      email: '',
      integracaoConcluida: false,
    });
    this.formAberto.set(true);
  }

  protected editar(c: Colaborador): void {
    this.editandoId.set(c.id);
    this.form.reset({
      nome: c.nome,
      cargoId: c.cargoId,
      dataAdmissao: c.dataAdmissao,
      email: c.email ?? '',
      integracaoConcluida: c.integracaoConcluida,
    });
    this.formAberto.set(true);
  }

  protected fecharForm(): void {
    this.formAberto.set(false);
    this.editandoId.set(null);
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.editandoId();
    if (id) {
      await this.store.updateColaborador(id, {
        nome: v.nome,
        cargoId: v.cargoId,
        dataAdmissao: v.dataAdmissao,
        email: v.email || undefined,
        integracaoConcluida: v.integracaoConcluida,
      });
    } else {
      const novo: Colaborador = {
        id: gerarId('colab'),
        nome: v.nome,
        cargoId: v.cargoId,
        dataAdmissao: v.dataAdmissao,
        email: v.email || undefined,
        integracaoConcluida: v.integracaoConcluida,
        ativo: true,
      };
      await this.store.addColaborador(novo);
    }
    this.fecharForm();
  }

  protected async alternarIntegracao(c: Colaborador): Promise<void> {
    await this.store.updateColaborador(c.id, { integracaoConcluida: !c.integracaoConcluida });
  }

  protected async alternarAtivo(c: Colaborador): Promise<void> {
    await this.store.updateColaborador(c.id, { ativo: !c.ativo });
  }

  protected async excluir(c: Colaborador): Promise<void> {
    const ok = await this.confirm.ask({
      titulo: 'Excluir colaborador',
      mensagem: `Excluir definitivamente o colaborador "${c.nome}"? Esta ação não pode ser desfeita.`,
      confirmarLabel: 'Excluir',
      perigo: true,
    });
    if (!ok) return;
    await this.store.removeColaborador(c.id);
  }
}
