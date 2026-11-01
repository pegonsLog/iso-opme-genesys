import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const NOME_APLICACAO = 'Gestão de RH ISO 13485 · Grupo GenesysMed';

/** Título da aba: "<Página> · Gestão de RH ISO 13485". */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pagina = this.buildTitle(snapshot);
    this.title.setTitle(pagina ? `${pagina} · Gestão de RH ISO 13485` : NOME_APLICACAO);
  }
}
