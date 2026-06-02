import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { ItemCronograma } from '../../core/models';
import { gerarId } from '../../core/utils/id';
import { ConfirmDialogService } from '../../core/ui/confirm-dialog/confirm-dialog.service';
import { DateMaskDirective } from '../../core/ui/date-mask.directive';

/** Valida data no formato dd/mm/yyyy (campo opcional aceita vazio). */
function dataBrValidator(control: { value: string }) {
  const v = (control.value ?? '').trim();
  if (!v) return null;
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return { dataInvalida: true };
  const dia = +m[1];
  const mes = +m[2];
  const ano = +m[3];
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 1900) {
    return { dataInvalida: true };
  }
  return null;
}

/** Agrupamento de itens de um mês dentro de um ano. */
interface GrupoMes {
  mes: string;
  indiceMes: number;
  itens: ItemCronograma[];
}

/** Agrupamento de meses dentro de um ano. */
interface GrupoAno {
  ano: number;
  meses: GrupoMes[];
}

@Component({
  selector: 'app-cronograma',
  imports: [ReactiveFormsModule, DateMaskDirective],
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

  protected readonly anoAtual = new Date().getFullYear();

  /**
   * Cronograma agrupado por ano (decrescente). Cada ano exibe sempre os
   * 12 meses na ordem do calendário, mesmo que sem itens. O ano atual é
   * sempre incluído, ainda que vazio.
   */
  protected readonly cronogramaAgrupado = computed<GrupoAno[]>(() => {
    const ordemMes = new Map(this.meses.map((m, i) => [m.toLowerCase(), i]));
    const porAno = new Map<number, ItemCronograma[]>();
    porAno.set(this.anoAtual, []);

    for (const item of this.store.cronograma()) {
      const ano = item.ano ?? this.anoAtual;
      const lista = porAno.get(ano) ?? [];
      lista.push(item);
      porAno.set(ano, lista);
    }

    return [...porAno.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([ano, itens]) => {
        const porMes = new Map<number, ItemCronograma[]>();
        for (const item of itens) {
          const idx = ordemMes.get(item.mes.toLowerCase()) ?? 99;
          const lista = porMes.get(idx) ?? [];
          lista.push(item);
          porMes.set(idx, lista);
        }
        const meses: GrupoMes[] = this.meses.map((mes, indiceMes) => ({
          mes,
          indiceMes,
          itens: (porMes.get(indiceMes) ?? []).sort((x, y) =>
            x.treinamento.localeCompare(y.treinamento),
          ),
        }));
        return { ano, meses };
      });
  });

  protected readonly formAberto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    ano: [this.anoAtual, [Validators.required, Validators.min(2000), Validators.max(2100)]],
    mes: ['Janeiro', Validators.required],
    treinamento: ['', Validators.required],
    publico: ['', Validators.required],
    inicio: ['', dataBrValidator],
    fim: ['', dataBrValidator],
  });

  protected abrirForm(mes?: string, ano?: number): void {
    this.editandoId.set(null);
    this.form.reset({
      ano: ano ?? this.anoAtual,
      mes: mes ?? 'Janeiro',
      treinamento: '',
      publico: '',
      inicio: '',
      fim: '',
    });
    this.formAberto.set(true);
    this.rolarAteForm();
  }

  protected editar(item: ItemCronograma): void {
    this.editandoId.set(item.id);
    this.form.reset({
      ano: item.ano ?? this.anoAtual,
      mes: item.mes,
      treinamento: item.treinamento,
      publico: item.publico,
      inicio: item.inicio ?? '',
      fim: item.fim ?? '',
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
    const dados = {
      ano: v.ano,
      mes: v.mes,
      treinamento: v.treinamento,
      publico: v.publico,
      inicio: v.inicio.trim() || undefined,
      fim: v.fim.trim() || undefined,
    };
    const id = this.editandoId();
    if (id) {
      await this.store.updateCronograma(id, dados);
    } else {
      await this.store.addCronograma({ id: gerarId('cron'), ...dados });
    }
    this.fecharForm();
  }

  protected async remover(item: ItemCronograma): Promise<void> {
    const ok = await this.confirm.ask({
      titulo: 'Remover do cronograma',
      mensagem: `Remover "${item.treinamento}" (${item.mes}/${item.ano ?? this.anoAtual}) do cronograma?`,
      confirmarLabel: 'Remover',
      perigo: true,
    });
    if (!ok) return;
    await this.store.removeCronograma(item.id);
  }
}
