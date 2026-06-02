import { Component, computed, signal } from '@angular/core';
import { ItemAuditoria, StatusConformidade } from '../../core/models';
import { CHECKLIST_AUDITORIA_PADRAO } from '../../core/services/seed-data';

@Component({
  selector: 'app-auditoria',
  imports: [],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria {
  protected readonly statusOpcoes: StatusConformidade[] = [
    'Conforme',
    'Pendente',
    'Não conforme',
  ];

  protected readonly itens = signal<ItemAuditoria[]>(
    CHECKLIST_AUDITORIA_PADRAO.map((i) => ({ ...i })),
  );

  protected readonly resumo = computed(() => {
    const itens = this.itens();
    return {
      conformes: itens.filter((i) => i.status === 'Conforme').length,
      pendentes: itens.filter((i) => i.status === 'Pendente').length,
      naoConformes: itens.filter((i) => i.status === 'Não conforme').length,
      total: itens.length,
    };
  });

  protected definirStatus(indice: number, status: StatusConformidade): void {
    this.itens.update((lista) =>
      lista.map((item, i) => (i === indice ? { ...item, status } : item)),
    );
  }

  protected definirObservacao(indice: number, observacao: string): void {
    this.itens.update((lista) =>
      lista.map((item, i) => (i === indice ? { ...item, observacao } : item)),
    );
  }
}
