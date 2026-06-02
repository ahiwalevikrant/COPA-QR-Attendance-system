import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ShellComponent } from './shell/shell.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ScannerComponent } from './scanner/scanner.component';
import { RecordsComponent } from './records/records.component';
import { StudentsComponent } from './students/students.component';
import { ReportsComponent } from './reports/reports.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ShellComponent,
    DashboardComponent,
    ScannerComponent,
    RecordsComponent,
    StudentsComponent,
    ReportsComponent
  ],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
