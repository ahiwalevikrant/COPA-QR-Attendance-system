import { AfterViewInit, Component } from '@angular/core';
import { createIcons } from 'lucide';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';
import { AttendanceRecord } from '../models';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements AfterViewInit {
  searchQuery = '';
  filterDate = this.dataService.getTodayDate();
  filterStatus = 'all';
  records: AttendanceRecord[] = [];

  constructor(private dataService: DataService, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    createIcons();
    this.refreshRecords();
  }

  refreshRecords(): void {
    this.records = this.dataService.getAttendanceRecords({ search: this.searchQuery, date: this.filterDate, status: this.filterStatus });
    createIcons();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterDate = this.dataService.getTodayDate();
    this.filterStatus = 'all';
    this.refreshRecords();
  }

  openManualAttendanceModal(): void {
    this.toastService.show('Manual attendance modal will be available in the next update.', 'info');
  }

  toggleAttendanceStatus(record: AttendanceRecord): void {
    this.dataService.toggleAttendanceStatus(record);
    this.toastService.show('Record attendance status inverted.', 'success');
    this.refreshRecords();
  }

  deleteAttendanceRecord(record: AttendanceRecord): void {
    if (confirm('Remove this attendance record permanently?')) {
      this.dataService.deleteAttendanceRecord(record.roll, record.date);
      this.toastService.show('Attendance log removed successfully.', 'success');
      this.refreshRecords();
    }
  }

  exportToExcel(): void {
    if (!this.records.length) {
      this.toastService.show('No attendance records available to export.', 'warning');
      return;
    }

    const dataToExport = this.records.map(record => ({
      'Roll Number': record.roll,
      'Student Name': record.name,
      Date: record.date,
      'Check-in Time': record.time,
      'Marking Type': record.type,
      Status: record.status
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Registry');
    XLSX.writeFile(wb, `COPA_ITI_Attendance_Master_${this.dataService.getTodayDate()}.xlsx`);
    this.toastService.show('Master attendance registry exported successfully as Excel.', 'success');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('Government ITI Portal', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Master Roster Database Sheet', 14, 26);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

    const columns = ['Roll Number', 'Student Name', 'Date', 'Check-in Time', 'Method', 'Status'];
    const rows = this.records.map(record => [record.roll, record.name, record.date, record.time, record.type, record.status]);

    (doc as any).autoTable({
      head: [columns],
      body: rows,
      startY: 38,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`COPA_ITI_Attendance_Master_${this.dataService.getTodayDate()}.pdf`);
    this.toastService.show('Master attendance registry exported successfully as PDF.', 'success');
  }
}
