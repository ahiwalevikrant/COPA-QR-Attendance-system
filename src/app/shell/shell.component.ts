import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { createIcons } from 'lucide';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService, ToastMessage } from '../services/toast.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements AfterViewInit, OnDestroy {
  activeTab: 'dashboard' | 'scanner' | 'records' | 'students' | 'reports' = 'dashboard';
  theme: 'dark' | 'light' = 'dark';
  toasts: ToastMessage[] = [];
  private toastSubscription?: Subscription;

  constructor(private auth: AuthService, private toastService: ToastService) {
    const stored = localStorage.getItem('qrAttendanceTheme');
    if (stored === 'light') {
      this.theme = 'light';
    }
  }

  ngAfterViewInit(): void {
    this.applyTheme();
    createIcons();
    this.toastSubscription = this.toastService.toast$.subscribe(message => {
      this.toasts.push(message);
      setTimeout(() => this.removeToast(message.id), 4200);
      setTimeout(() => createIcons(), 0);
    });
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('qrAttendanceTheme', this.theme);
    this.applyTheme();
    setTimeout(() => createIcons(), 0);
    this.toastService.show(`Switched to ${this.theme === 'dark' ? 'Dark' : 'Light'} Mode.`, 'info');
  }

  private applyTheme(): void {
    document.body.classList.toggle('theme-light', this.theme === 'light');
    document.body.classList.toggle('theme-dark', this.theme === 'dark');
  }

  ngOnDestroy(): void {
    this.toastSubscription?.unsubscribe();
  }

  setTab(tab: ShellComponent['activeTab']): void {
    this.activeTab = tab;
    setTimeout(() => createIcons(), 0);
  }

  logout(): void {
    this.auth.logout();
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(item => item.id !== id);
  }

  showHelp(): void {
    alert('COPA QR Attendance App - Premium Admin Edition 2.0');
  }

  showLicense(): void {
    alert('Design standard built utilizing vanilla HTML, JS and premium styling guidelines.');
  }
}
