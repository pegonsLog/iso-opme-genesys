import { Component } from '@angular/core';
import {
  DOCUMENTOS_CONTROLADOS,
  DOCUMENTOS_REGULATORIOS,
} from '../../core/services/seed-data';

@Component({
  selector: 'app-documentos',
  imports: [],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
})
export class Documentos {
  protected readonly regulatorios = DOCUMENTOS_REGULATORIOS;
  protected readonly controlados = DOCUMENTOS_CONTROLADOS;
}
