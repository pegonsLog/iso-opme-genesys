import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { Periodicidade, TipoTreinamento, Treinamento } from '../../core/models';
import { gerarId } from '../../core/utils/id';
import { ConfirmDialogService } from '../../core/ui/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-treinamentos',
  imports: [ReactiveFormsModule],
  templateUrl: './treinamentos.html',
  styleUrl: './treinamentos.scss',
})
export class Treinamentos {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmDialogService);

  protected readonly treinamentos = this.store.treinamentos;
  protected readonly formAberto = signal(false);

  protected readonly tipos: TipoTreinamento[] = [
    'Integração',
    'SGQ',
    'Compliance',
    'Regulatório',
    'Operacional',
  ];
  protected readonly periodicidades: Periodicidade[] = [
    'Admissional',
    'Anual',
    'Semestral',
    'Mensal',
  ];

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    tipo: ['SGQ' as TipoTreinamento, Validators.required],
    periodicidade: ['Anual' as Periodicidade, Validators.required],
    responsavel: ['', Validators.required],
    evidencia: ['', Validators.required],
    criterioEficacia: ['', Validators.required],
  });

  protected abrirForm(): void {
    this.form.reset({
      nome: '',
      tipo: 'SGQ',
      periodicidade: 'Anual',
      responsavel: '',
      evidencia: '',
      criterioEficacia: '',
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
    const novo: Treinamento = {
      id: gerarId('trein'),
      nome: v.nome,
      tipo: v.tipo,
      periodicidade: v.periodicidade,
      responsavel: v.responsavel,
      evidencia: v.evidencia,
      criterioEficacia: v.criterioEficacia,
      cargosAplicaveis: [],
    };
    await this.store.addTreinamento(novo);
    this.fecharForm();
  }

  protected async remover(t: Treinamento): Promise<void> {
    const ok = await this.confirm.ask({
      titulo: 'Excluir treinamento',
      mensagem: `Excluir o treinamento "${t.nome}" da Matriz? Esta ação não pode ser desfeita.`,
      confirmarLabel: 'Excluir',
      perigo: true,
    });
    if (!ok) return;
    await this.store.removeTreinamento(t.id);
  }
}
