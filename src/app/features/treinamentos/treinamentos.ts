import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { Periodicidade, TipoTreinamento, Treinamento } from '../../core/models';
import { gerarId } from '../../core/utils/id';
import { DialogService } from '../../services/dialog.service';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NgIcon } from '@ng-icons/core';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';

@Component({
  selector: 'app-treinamentos',
  imports: [ReactiveFormsModule, PageHeaderComponent, NgIcon, TooltipDirective],
  templateUrl: './treinamentos.html',
  styleUrl: './treinamentos.scss',
})
export class Treinamentos {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(DialogService);

  protected readonly treinamentos = this.store.treinamentos;
  protected readonly formAberto = signal(false);
  protected readonly filtro = signal('');

  /** Treinamentos filtrados por nome, tipo, periodicidade ou responsável. */
  protected readonly treinamentosFiltrados = computed<Treinamento[]>(() => {
    const termo = this.filtro().trim().toLowerCase();
    const lista = this.treinamentos();
    if (!termo) return lista;
    return lista.filter(
      (t) =>
        t.nome.toLowerCase().includes(termo) ||
        t.tipo.toLowerCase().includes(termo) ||
        t.periodicidade.toLowerCase().includes(termo) ||
        (t.responsavel ?? '').toLowerCase().includes(termo),
    );
  });

  protected atualizarFiltro(valor: string): void {
    this.filtro.set(valor);
  }

  protected readonly tipos: TipoTreinamento[] = [
    'Integração',
    'SGQ',
    'Compliance',
    'Regulatório',
    'Operacional',
  ];
  /** Cor do badge de cada tipo de treinamento (classes do design system). */
  protected readonly badgeTipo: Record<TipoTreinamento, string> = {
    Integração: 'badge-primary',
    SGQ: 'badge-green',
    Compliance: 'badge-amber',
    Regulatório: 'badge-teal',
    Operacional: 'badge-red',
  };

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
    const ok = await this.confirm.confirm({
      titulo: 'Excluir treinamento',
      mensagem: `Excluir o treinamento "${t.nome}" da Matriz? Esta ação não pode ser desfeita.`,
      confirmarTexto: 'Excluir',
      tom: 'danger',
    });
    if (!ok) return;
    await this.store.removeTreinamento(t.id);
  }
}
