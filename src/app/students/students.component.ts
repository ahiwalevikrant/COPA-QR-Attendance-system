import { AfterViewInit, Component } from '@angular/core';
import { createIcons } from 'lucide';
import QRCode from 'qrcode';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';
import { Student } from '../models';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements AfterViewInit {
  students: Student[] = [];
  searchQuery = '';
  addStudentModalVisible = false;
  qrModalVisible = false;
  qrModalStudent?: Student;
  qrDataUrl = '';
  newStudentName = '';
  newStudentRoll = '';
  newStudentTrade = 'ITI COPA';
  newStudentSession = '2025-2026';

  constructor(private dataService: DataService, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    createIcons();
    this.refreshStudents();
  }

  getStudentInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  refreshStudents(): void {
    this.students = this.dataService.searchStudents(this.searchQuery);
    setTimeout(() => createIcons(), 0);
  }

  openAddStudentModal(): void {
    const nextNumber = this.dataService.students.length + 1;
    this.newStudentRoll = `COPA-2026-${String(nextNumber).padStart(3, '0')}`;
    this.newStudentName = '';
    this.newStudentTrade = 'ITI COPA';
    this.newStudentSession = '2025-2026';
    this.addStudentModalVisible = true;
  }

  closeAddStudentModal(): void {
    this.addStudentModalVisible = false;
  }

  async handleAddStudent(): Promise<void> {
    if (!this.newStudentName.trim() || !this.newStudentRoll.trim()) {
      return;
    }

    if (this.dataService.getStudentByRoll(this.newStudentRoll)) {
      this.toastService.show('A student with this Roll ID is already enrolled.', 'warning');
      return;
    }

    this.dataService.addStudent({
      name: this.newStudentName.trim(),
      roll: this.newStudentRoll.trim(),
      trade: this.newStudentTrade,
      session: this.newStudentSession
    });

    this.toastService.show(`Student [${this.newStudentName}] enrolled successfully!`, 'success');
    this.closeAddStudentModal();
    this.refreshStudents();
  }

  async openQRModal(student: Student): Promise<void> {
    this.qrModalStudent = student;
    this.qrDataUrl = await QRCode.toDataURL(student.roll, { margin: 1, width: 180, color: { dark: '#090a16', light: '#ffffff' } });
    this.qrModalVisible = true;
    setTimeout(() => createIcons(), 0);
  }

  closeQRModal(): void {
    this.qrModalVisible = false;
  }

  printQRCodeBadge(): void {
    if (!this.qrModalStudent || !this.qrDataUrl) {
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID QR Badge - ${this.qrModalStudent.name}</title>
          <style>
            body { font-family: 'Outfit', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; }
            .badge { border: 3px solid #6366f1; border-radius: 20px; padding: 30px; text-align: center; max-width: 320px; background: white; }
            .logo { font-size: 1.25rem; font-weight: 800; color: #6366f1; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em; }
            .title { font-size: 1rem; color: #64748b; margin-bottom: 25px; }
            .qr-box { margin: 0 auto 25px; display: inline-block; padding: 10px; border: 1px solid #cbd5e1; border-radius: 12px; }
            h2 { font-size: 1.4rem; margin: 0 0 5px; color: #0f172a; }
            p { margin: 0; font-weight: 700; color: #a855f7; font-size: 1rem; }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="logo">GOVT ITI COPA</div>
            <div class="title">Student Attendance Identity Badge</div>
            <div class="qr-box"><img src="${this.qrDataUrl}" width="180" height="180" /></div>
            <h2>${this.qrModalStudent.name}</h2>
            <p>${this.qrModalStudent.roll}</p>
          </div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 400);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  deleteStudent(roll: string): void {
    if (confirm(`Warning: Deleting student [${roll}] will purge all matching attendance records! Proceed?`)) {
      this.dataService.deleteStudent(roll);
      this.toastService.show('Student purged from administrative rosters.', 'success');
      this.refreshStudents();
    }
  }
}
