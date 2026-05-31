import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { RegistroTreinamento, ResultadoAvaliacao } from '../../core/models';
import { gerarId } from '../../core/utils/id';

const CRITERIOS_PRATICOS_PADRAO = [
  'Compreendeu o procedimento',
  'Executa corretamente',
  'Conhece riscos',
  'Aplica rastreabilidade',
  'Segue SGQ',
];

@Component({
  selector: 'app-avaliacoes',
  imports: [ReactiveFormsModule],
  templateUrl: './avaliacoes.html',
  styleUrl: './avaliacoes.scss',
})
export class Avaliacoes {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);

  protected readonly registros = this.store.registros;
  protected readonly colaboradores = this.store.colaboradores;
  protected readonly treinamentos = this.store.treinamentos;
  protected readonly formAberto = signal(false);

  /** Estado dos critérios práticos (atende/não atende) no formulário. */
  protected readonly criteriosPraticos = signal(
    CRITERIOS_PRATICOS_PADRAO.map((criterio) => ({ criterio, atende: false })),
  );

  protected readonly podeAvaliar = computed(
    () => this.colaboradores().length > 0 && this.treinamentos().length > 0,
  );

  protected readonly form = this.fb.nonNullable.group({
    colaboradorId: ['', Validators.required],
    treinamentoId: ['', Validators.required],
    dataRealizacao: ['', Validators.required],
    notaTeorica: [0, [Validators.min(0), Validators.max(100)]],
    evidencia: [''],
    avaliador: [''],
    observacoes: [''],
  });

  protected nomeColaborador(id: string): string {
    return this.store.getColaborador(id)?.nome ?? id;
  }

  protected nomeTreinamento(id: string): string {
    return this.store.getTreinamento(id)?.nome ?? id;
  }

  protected resultadoRegistro(r: RegistroTreinamento): ResultadoAvaliacao {
    return r.avaliacao?.resultado ?? 'Pendente';
  }

  protected abrirForm(): void {
    this.form.reset({
      colaboradorId: this.colaboradores()[0]?.id ?? '',
      treinamentoId: this.treinamentos()[0]?.id ?? '',
      dataRealizacao: new Date().toISOString().slice(0, 10),
      notaTeorica: 0,
      evidencia: '',
      avaliador: '',
      observacoes: '',
    });
    this.criteriosPraticos.set(
      CRITERIOS_PRATICOS_PADRAO.map((criterio) => ({ criterio, atende: false })),
    );
    this.formAberto.set(true);
  }

  protected fecharForm(): void {
    this.formAberto.set(false);
  }

  protected alternarCriterio(indice: number): void {
    this.criteriosPraticos.update((lista) =>
      lista.map((c, i) => (i === indice ? { ...c, atende: !c.atende } : c)),
    );
  }

  /** Critério mínimo do kit: nota ≥70 E todos os critérios práticos atendidos. */
  private calcularResultado(nota: number): ResultadoAvaliacao {
    const todosAtendem = this.criteriosPraticos().every((c) => c.atende);
    return nota >= 70 && todosAtendem ? 'Apto' : 'Reprovado';
  }

  /** Vencimento conforme periodicidade do treinamento. */
  private calcularVencimento(treinamentoId: string, dataRealizacao: string): string | undefined {
    const treino = this.store.getTreinamento(treinamentoId);
    if (!treino) return undefined;
    const base = new Date(dataRealizacao);
    switch (treino.periodicidade) {
      case 'Mensal':
        base.setMonth(base.getMonth() + 1);
        break;
      case 'Semestral':
        base.setMonth(base.getMonth() + 6);
        break;
      case 'Anual':
        base.setFullYear(base.getFullYear() + 1);
        break;
      case 'Admissional':
        return undefined; // não vence
    }
    return base.toISOString().slice(0, 10);
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const resultado = this.calcularResultado(v.notaTeorica);
    const registro: RegistroTreinamento = {
      id: gerarId('reg'),
      colaboradorId: v.colaboradorId,
      treinamentoId: v.treinamentoId,
      dataRealizacao: v.dataRealizacao,
      dataVencimento: this.calcularVencimento(v.treinamentoId, v.dataRealizacao),
      evidencia: v.evidencia,
      avaliacao: {
        notaTeorica: v.notaTeorica,
        resultado,
        criteriosPraticos: this.criteriosPraticos(),
        avaliador: v.avaliador,
        observacoes: v.observacoes,
      },
    };
    await this.store.addRegistro(registro);
    this.fecharForm();
  }
}
