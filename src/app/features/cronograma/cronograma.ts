import { Component, inject } from '@angular/core';
import { DataStoreService } from '../../core/services/data-store.service';

@Component({
  selector: 'app-cronograma',
  imports: [],
  templateUrl: './cronograma.html',
  styleUrl: './cronograma.scss',
})
export class Cronograma {
  private readonly store = inject(DataStoreService);
  protected readonly cronograma = this.store.cronograma;
}
