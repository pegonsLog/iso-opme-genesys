import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataStoreService } from '../../core/services/data-store.service';
import { Colaborador } from '../../core/models';
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

@Component({
  selector: 'app-colaboradores',
  imports: [ReactiveFormsModule, DateMaskDirective],
  templateUrl: './colaboradores.html',
  styleUrl: './colaboradores.scss',
})
export class Colaboradores {
  private readonly store = inject(DataStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmDialogService);

  /** Referência ao card do formulário, para rolar até ele ao abrir. */
  private readonly formCard = viewChild<ElementRef<HTMLElement>>('formCard');

  protected readonly colaboradores = this.store.colaboradores;
  protected readonly cargos = this.store.cargos;
  protected readonly formAberto = signal(false);
  protected readonly editandoId = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly temCargos = computed(() => this.cargos().length > 0);

  /** Colaboradores filtrados por nome, cargo, centro de custo ou setor. */
  protected readonly colaboradoresFiltrados = computed<Colaborador[]>(() => {
    const termo = this.filtro().trim().toLowerCase();
    const lista = this.colaboradores();
    if (!termo) return lista;
    return lista.filter((c) => {
      const cargo = this.nomeCargo(c).toLowerCase();
      return (
        c.nome.toLowerCase().includes(termo) ||
        cargo.includes(termo) ||
        (c.centroCusto ?? '').toLowerCase().includes(termo) ||
        (c.setor ?? '').toLowerCase().includes(termo)
      );
    });
  });

  protected atualizarFiltro(valor: string): void {
    this.filtro.set(valor);
  }

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    cargoId: ['', Validators.required],
    centroCusto: [''],
    setor: [''],
    dataNascimento: ['', dataBrValidator],
    dataAdmissao: ['', [Validators.required, dataBrValidator]],
    email: ['', Validators.email],
    integracaoConcluida: [false],
  });

  protected nomeCargo(c: Colaborador): string {
    if (c.cargoId) return this.store.getCargo(c.cargoId)?.nome ?? c.cargoNome ?? '—';
    return c.cargoNome || '—';
  }

  protected abrirForm(): void {
    this.editandoId.set(null);
    this.form.reset({
      nome: '',
      cargoId: this.cargos()[0]?.id ?? '',
      centroCusto: '',
      setor: '',
      dataNascimento: '',
      dataAdmissao: this.hojeBr(),
      email: '',
      integracaoConcluida: false,
    });
    this.formAberto.set(true);
    this.rolarAteForm();
  }

  /** Data de hoje no formato dd/mm/yyyy. */
  private hojeBr(): string {
    const d = new Date();
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${d.getFullYear()}`;
  }

  protected editar(c: Colaborador): void {
    this.editandoId.set(c.id);
    this.form.reset({
      nome: c.nome,
      cargoId: c.cargoId,
      centroCusto: c.centroCusto ?? '',
      setor: c.setor ?? '',
      dataNascimento: c.dataNascimento ?? '',
      dataAdmissao: c.dataAdmissao,
      email: c.email ?? '',
      integracaoConcluida: c.integracaoConcluida,
    });
    this.formAberto.set(true);
    this.rolarAteForm();
  }

  /** Rola a página até o formulário após ele ser renderizado. */
  private rolarAteForm(): void {
    setTimeout(() => {
      this.formCard()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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
        centroCusto: v.centroCusto || undefined,
        setor: v.setor || undefined,
        dataNascimento: v.dataNascimento || undefined,
        dataAdmissao: v.dataAdmissao,
        email: v.email || undefined,
        integracaoConcluida: v.integracaoConcluida,
      });
    } else {
      const novo: Colaborador = {
        id: gerarId('colab'),
        nome: v.nome,
        cargoId: v.cargoId,
        centroCusto: v.centroCusto || undefined,
        setor: v.setor || undefined,
        dataNascimento: v.dataNascimento || undefined,
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
