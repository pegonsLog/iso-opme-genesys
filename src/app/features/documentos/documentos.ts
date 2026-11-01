import { Component } from '@angular/core';
import {
  DOCUMENTOS_CONTROLADOS,
  DOCUMENTOS_REGULATORIOS,
} from '../../core/services/seed-data';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-documentos',
  imports: [PageHeaderComponent, NgIcon],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
})
export class Documentos {
  protected readonly regulatorios = DOCUMENTOS_REGULATORIOS;
  protected readonly controlados = DOCUMENTOS_CONTROLADOS;
}
