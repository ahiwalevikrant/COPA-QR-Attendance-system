import { AfterViewInit, Component } from '@angular/core';
import { createIcons } from 'lucide';
import * as XLSX from 'xlsx';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements AfterViewInit {
  reportType: 'daily' | 'monthly' = 'daily';
  reportDate = this.dataService.getTodayDate();
  reportMonth = '05';
  workingDays = 24;
  reportRows: any[] = [];
  reportTitle = 'Daily Attendance Report';
  reportSubtitle = '';
  badge1 = '';
  badge2 = '';
  badge3 = '';
  showBadge3 = true;

  constructor(private dataService: DataService, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    createIcons();
    this.generateReport();
  }

  toggleReportType(): void {
    this.reportType = this.reportType === 'daily' ? 'monthly' : 'daily';
    this.generateReport();
  }

  generateReport(): void {
    if (this.reportType === 'daily') {
      const result = this.dataService.getDailyReport(this.reportDate);
      this.reportTitle = 'Daily Attendance Breakdown';
      this.reportSubtitle = `Batch Status roster for date: ${this.reportDate.split('-').reverse().join('/')}`;
      this.reportRows = result.rows.map(row => ({
        ...row,
        badgeClass: row.status === 'Present' ? 'present' : 'absent',
        badgeIcon: row.status === 'Present' ? 'check' : 'x'
      }));
      this.badge1 = `Strength: ${this.dataService.students.length}`;
      this.badge2 = `Present: ${result.presentCount}`;
      this.badge3 = `Absent: ${result.absentCount}`;
      this.showBadge3 = true;
    } else {
      const result = this.dataService.getMonthlyReport(this.reportMonth, this.workingDays);
      this.reportTitle = 'Monthly Attendance Percent Matrix';
      this.reportSubtitle = `Period: Month of May 2026 | Working days calculated: ${this.workingDays}`;
      this.reportRows = result.rows.map(item => ({
        student: item.student,
        attendedDays: item.attendedDays,
        absentDays: item.absentDays,
        percent: item.percent,
        statusLabel: item.status,
        badgeStyle: item.status === 'Excellent' ? 'present' : item.status === 'Satisfactory' ? 'info' : 'absent'
      }));
      this.badge1 = `Total Strength: ${this.dataService.students.length}`;
      this.badge2 = `Average Attendance: ${result.averagePercent}%`;
      this.badge3 = '';
      this.showBadge3 = false;
    }
    setTimeout(() => createIcons(), 0);
  }

  exportReportExcel(): void {
    const data: any[] = [];
    if (this.reportType === 'daily') {
      data.push(...this.reportRows.map(row => ({
        'Roll Number': row.roll,
        'Student Name': row.name,
        Status: row.status,
        'Marking Time': row.time,
        'Check-in Type': row.type
      })));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, `Daily_Report_${this.reportDate}`);
      XLSX.writeFile(wb, `Daily_Report_${this.reportDate}.xlsx`);
    } else {
      data.push(...this.reportRows.map(row => ({
        'Roll Number': row.student.roll,
        'Student Name': row.student.name,
        'Days Attended': row.attendedDays,
        'Days Absent': row.absentDays,
        'Attendance Percentage': `${row.percent}%`,
        'Administrative Status': row.statusLabel
      })));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, `Monthly_Report_${this.reportMonth}`);
      XLSX.writeFile(wb, `Monthly_Summary_Report_05_2026.xlsx`);
    }
    this.toastService.show('Report exported successfully as Excel.', 'success');
  }

  exportReportPDF(): void {
    window.print();
  }
}
