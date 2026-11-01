import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ToastService, ToastTipo } from '../../../services/toast.service';

const ICONES: Record<ToastTipo, string> = {
  success: 'heroCheckCircle',
  error: 'heroExclamationCircle',
  warning: 'heroExclamationTriangle',
  info: 'heroInformationCircle'
};

@Component({
  selector: 'app-toast-container',
  imports: [NgIcon],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly icones = ICONES;
}
