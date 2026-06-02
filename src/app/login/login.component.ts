import { AfterViewInit, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { createIcons } from 'lucide';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  username = 'admin';
  password = 'copa2026';

  constructor(private auth: AuthService, private toast: ToastService) {}

  ngAfterViewInit(): void {
    createIcons();
  }

  login(form: NgForm): void {
    if (!form.valid) {
      return;
    }
    if (this.auth.login(this.username.trim(), this.password)) {
      this.toast.show('Access Granted! Welcome to COPA Portal.', 'success');
    } else {
      this.toast.show('Invalid administrative credentials.', 'danger');
    }
  }
}
