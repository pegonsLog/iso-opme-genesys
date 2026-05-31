import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataStoreService } from '../../core/services/data-store.service';
import { Cargo } from '../../core/models';
import { gerarId } from '../../core/utils/id';
import {
  CargoParcial,
  dividirDocumentos,
  parseDescritivoCargo,
} from '../../core/utils/cargo-parser';

interface CargoPreview {
  dados: CargoParcial;
  incluir: boolean;
  treinosVinculados: number;
  treinosTotal: number;
}

@Component({
  selector: 'app-importar-cargos',
  imports: [FormsModule],
  templateUrl: './importar-cargos.html',
  styleUrl: './importar-cargos.scss',
})
export class ImportarCargos {
  private readonly store = inject(DataStoreService);
  private readonly router = inject(Router);

  protected texto = '';
  protected readonly previews = signal<CargoPreview[]>([]);
  protected readonly analisado = signal(false);

  protected readonly selecionados = computed(
    () => this.previews().filter((p) => p.incluir).length,
  );

  protected analisar(): void {
    const blocos = dividirDocumentos(this.texto);
    const previews: CargoPreview[] = blocos.map((bloco) => {
      const dados = parseDescritivoCargo(bloco);
      // Auto-vínculo dos treinamentos com a Matriz por nome.
      const treinos = dados.treinamentosObrigatorios.map((t) => {
        const match = this.store.getTreinamentoPorNome(t.nome);
        return match ? { ...t, treinamentoId: match.id } : t;
      });
      dados.treinamentosObrigatorios = treinos;
      return {
        dados,
        incluir: !!dados.nome,
        treinosVinculados: treinos.filter((t) => t.treinamentoId).length,
        treinosTotal: treinos.length,
      };
    });
    this.previews.set(previews);
    this.analisado.set(true);
  }

  protected alternarInclusao(indice: number): void {
    this.previews.update((lista) =>
      lista.map((p, i) => (i === indice ? { ...p, incluir: !p.incluir } : p)),
    );
  }

  protected atualizarNome(indice: number, nome: string): void {
    this.previews.update((lista) =>
      lista.map((p, i) => (i === indice ? { ...p, dados: { ...p.dados, nome } } : p)),
    );
  }

  protected atualizarArea(indice: number, area: string): void {
    this.previews.update((lista) =>
      lista.map((p, i) => (i === indice ? { ...p, dados: { ...p.dados, area } } : p)),
    );
  }

  protected limpar(): void {
    this.texto = '';
    this.previews.set([]);
    this.analisado.set(false);
  }

  protected async importar(): Promise<void> {
    const aImportar = this.previews().filter((p) => p.incluir);
    for (const p of aImportar) {
      const cargo: Cargo = { id: gerarId('cargo'), historico: [], ...p.dados };
      await this.store.addCargo(cargo);
    }
    this.router.navigate(['/cargos']);
  }
}
