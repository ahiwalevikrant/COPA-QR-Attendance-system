import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  show(message: string, type: ToastMessage['type'] = 'info'): void {
    this.toastSubject.next({ id: `${Date.now()}-${Math.random()}`, text: message, type });
  }
}
