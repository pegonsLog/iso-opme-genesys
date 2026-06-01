import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { ItemCronograma } from '../../core/models';
import { gerarId } from '../../core/utils/id';
import { ConfirmDialogService } from '../../core/ui/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-cronograma',
  imports: [ReactiveFormsModule],
  templateUrl: './cronograma.html',
  styleUrl: './cronograma.scss',
})
export class Cronograma {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmDialogService);

  private readonly formCard = viewChild<ElementRef<HTMLElement>>('formCard');

  protected readonly meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  /** Cronograma ordenado por mês (ordem do calendário). */
  protected readonly cronograma = computed(() => {
    const ordem = new Map(this.meses.map((m, i) => [m.toLowerCase(), i]));
    return [...this.store.cronograma()].sort(
      (a, b) => (ordem.get(a.mes.toLowerCase()) ?? 99) - (ordem.get(b.mes.toLowerCase()) ?? 99),
    );
  });

  protected readonly formAberto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    mes: ['Janeiro', Validators.required],
    treinamento: ['', Validators.required],
    publico: ['', Validators.required],
  });

  protected abrirForm(): void {
    this.editandoId.set(null);
    this.form.reset({ mes: 'Janeiro', treinamento: '', publico: '' });
    this.formAberto.set(true);
    this.rolarAteForm();
  }

  protected editar(item: ItemCronograma): void {
    this.editandoId.set(item.id);
    this.form.reset({
      mes: item.mes,
      treinamento: item.treinamento,
      publico: item.publico,
    });
    this.formAberto.set(true);
    this.rolarAteForm();
  }

  protected fecharForm(): void {
    this.formAberto.set(false);
    this.editandoId.set(null);
  }

  private rolarAteForm(): void {
    setTimeout(() => {
      this.formCard()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.editandoId();
    if (id) {
      await this.store.updateCronograma(id, v);
    } else {
      await this.store.addCronograma({ id: gerarId('cron'), ...v });
    }
    this.fecharForm();
  }

  protected async remover(item: ItemCronograma): Promise<void> {
    const ok = await this.confirm.ask({
      titulo: 'Remover do cronograma',
      mensagem: `Remover "${item.treinamento}" (${item.mes}) do cronograma?`,
      confirmarLabel: 'Remover',
      perigo: true,
    });
    if (!ok) return;
    await this.store.removeCronograma(item.id);
  }
}
