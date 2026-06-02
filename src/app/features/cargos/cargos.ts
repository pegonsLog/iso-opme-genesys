import { Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataStoreService } from '../../core/services/data-store.service';
import { Cargo, Periodicidade, TreinamentoObrigatorioCargo } from '../../core/models';
import { gerarId } from '../../core/utils/id';
import { ConfirmDialogService } from '../../core/ui/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-cargos',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cargos.html',
  styleUrl: './cargos.scss',
})
export class Cargos {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmDialogService);

  protected readonly cargos = this.store.cargos;
  protected readonly treinamentos = this.store.treinamentos;
  protected readonly formAberto = signal(false);
  protected readonly editandoId = signal<string | null>(null);
  protected readonly expandido = signal<string | null>(null);
  protected readonly filtro = signal('');

  /** Cargos filtrados por nome, área, departamento, setor, código ou CBO. */
  protected readonly cargosFiltrados = computed<Cargo[]>(() => {
    const termo = this.filtro().trim().toLowerCase();
    const lista = this.cargos();
    if (!termo) return lista;
    return lista.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        (c.area ?? '').toLowerCase().includes(termo) ||
        (c.departamento ?? '').toLowerCase().includes(termo) ||
        (c.setor ?? '').toLowerCase().includes(termo) ||
        (c.codigo ?? '').toLowerCase().includes(termo) ||
        (c.cbo ?? '').toLowerCase().includes(termo),
    );
  });

  protected atualizarFiltro(valor: string): void {
    this.filtro.set(valor);
  }

  protected readonly periodicidades: Periodicidade[] = [
    'Admissional',
    'Anual',
    'Semestral',
    'Mensal',
  ];

  protected readonly form = this.fb.nonNullable.group({
    // Cabeçalho documental
    codigo: [''],
    dataDocumento: [''],
    revisao: [''],
    // Identificação
    nome: ['', Validators.required],
    cbo: [''],
    departamento: [''],
    setor: [''],
    superiorImediato: [''],
    area: ['', Validators.required],
    // Atividades
    objetivo: [''],
    detalhamento: [''],
    autoridades: [''],
    // Requisitos
    escolaridade: [''],
    experiencia: [''],
    competenciasTecnicas: [''],
    competenciasComportamentais: [''],
    // Treinamentos obrigatórios (array dinâmico)
    treinamentosObrigatorios: this.fb.array<
      ReturnType<Cargos['novoGrupoTreinamento']>
    >([]),
    // Conduta
    responsabilidades: [''],
    episCondicoes: [''],
  });

  get treinamentosArray(): FormArray {
    return this.form.controls.treinamentosObrigatorios;
  }

  protected novoGrupoTreinamento(
    nome = '',
    periodicidade: Periodicidade = 'Anual',
    treinamentoId = '',
  ) {
    return this.fb.nonNullable.group({
      nome: [nome, Validators.required],
      periodicidade: [periodicidade as Periodicidade],
      treinamentoId: [treinamentoId],
    });
  }

  protected adicionarTreinamento(): void {
    this.treinamentosArray.push(this.novoGrupoTreinamento());
  }

  protected removerTreinamento(indice: number): void {
    this.treinamentosArray.removeAt(indice);
  }

  protected nomeTreinamento(id?: string): string {
    return id ? this.store.getTreinamento(id)?.nome ?? id : '';
  }

  protected alternarExpandido(id: string): void {
    this.expandido.update((atual) => (atual === id ? null : id));
  }

  protected abrirForm(): void {
    this.editandoId.set(null);
    this.resetForm();
    this.formAberto.set(true);
  }

  protected editar(cargo: Cargo): void {
    this.editandoId.set(cargo.id);
    this.treinamentosArray.clear();
    for (const t of cargo.treinamentosObrigatorios) {
      this.treinamentosArray.push(
        this.novoGrupoTreinamento(t.nome, t.periodicidade, t.treinamentoId ?? ''),
      );
    }
    this.form.patchValue({
      codigo: cargo.codigo ?? '',
      dataDocumento: cargo.dataDocumento ?? '',
      revisao: cargo.revisao ?? '',
      nome: cargo.nome,
      cbo: cargo.cbo ?? '',
      departamento: cargo.departamento ?? '',
      setor: cargo.setor ?? '',
      superiorImediato: cargo.superiorImediato ?? '',
      area: cargo.area,
      objetivo: cargo.objetivo,
      detalhamento: cargo.detalhamento.join('\n'),
      autoridades: cargo.autoridades.join('\n'),
      escolaridade: cargo.escolaridade,
      experiencia: cargo.experiencia,
      competenciasTecnicas: cargo.competenciasTecnicas.join('\n'),
      competenciasComportamentais: cargo.competenciasComportamentais.join('\n'),
      responsabilidades: cargo.responsabilidades.join('\n'),
      episCondicoes: cargo.episCondicoes ?? '',
    });
    this.formAberto.set(true);
  }

  protected fecharForm(): void {
    this.formAberto.set(false);
  }

  private resetForm(): void {
    this.treinamentosArray.clear();
    this.form.reset({
      codigo: '',
      dataDocumento: '',
      revisao: '',
      nome: '',
      cbo: '',
      departamento: '',
      setor: '',
      superiorImediato: '',
      area: '',
      objetivo: '',
      detalhamento: '',
      autoridades: '',
      escolaridade: '',
      experiencia: '',
      competenciasTecnicas: '',
      competenciasComportamentais: '',
      responsabilidades: '',
      episCondicoes: '',
    });
  }

  private linhas(texto: string): string[] {
    return texto
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const treinos: TreinamentoObrigatorioCargo[] = this.treinamentosArray.controls.map((g) => {
      const val = g.getRawValue() as {
        nome: string;
        periodicidade: Periodicidade;
        treinamentoId: string;
      };
      return {
        nome: val.nome,
        periodicidade: val.periodicidade,
        ...(val.treinamentoId ? { treinamentoId: val.treinamentoId } : {}),
      };
    });

    const id = this.editandoId();
    const dados: Omit<Cargo, 'id' | 'historico'> = {
      codigo: v.codigo || undefined,
      dataDocumento: v.dataDocumento || undefined,
      revisao: v.revisao || undefined,
      nome: v.nome,
      cbo: v.cbo || undefined,
      departamento: v.departamento || undefined,
      setor: v.setor || undefined,
      superiorImediato: v.superiorImediato || undefined,
      area: v.area,
      objetivo: v.objetivo,
      detalhamento: this.linhas(v.detalhamento),
      autoridades: this.linhas(v.autoridades),
      escolaridade: v.escolaridade,
      experiencia: v.experiencia,
      competenciasTecnicas: this.linhas(v.competenciasTecnicas),
      competenciasComportamentais: this.linhas(v.competenciasComportamentais),
      treinamentosObrigatorios: treinos,
      responsabilidades: this.linhas(v.responsabilidades),
      episCondicoes: v.episCondicoes || undefined,
    };

    if (id) {
      await this.store.updateCargo(id, dados);
    } else {
      await this.store.addCargo({ id: gerarId('cargo'), historico: [], ...dados });
    }
    this.fecharForm();
  }

  protected async remover(cargo: Cargo): Promise<void> {
    const ok = await this.confirm.ask({
      titulo: 'Excluir cargo',
      mensagem: `Excluir o cargo "${cargo.nome}"? Esta ação não pode ser desfeita.`,
      confirmarLabel: 'Excluir',
      perigo: true,
    });
    if (!ok) return;
    await this.store.removeCargo(cargo.id);
  }
}
