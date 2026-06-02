import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  login(username: string, password: string): boolean {
    const valid = username === 'admin' && password === 'copa2026';
    this.loggedIn.next(valid);
    return valid;
  }

  logout(): void {
    this.loggedIn.next(false);
  }
}
