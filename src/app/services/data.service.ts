import { Injectable } from '@angular/core';
import { AttendanceRecord, AttendanceStats, Student } from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly STUDENT_KEY = 'copa_students';
  private readonly ATTENDANCE_KEY = 'copa_attendance';

  private defaultStudents: Student[] = [
    { roll: 'COPA01', name: 'Vinit Bhise', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA02', name: 'Shivtej More', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA03', name: 'Shriram Nimbalkar', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA04', name: 'Rajpal Kadale', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA05', name: 'Tukaram Mote', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA06', name: 'Aniket Londhe', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA07', name: 'Ganesh Kumbhar', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA08', name: 'Sangram Virkar', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA09', name: 'Ram Funde', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA10', name: 'Jaykumar Mane', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA11', name: 'Abhay Waghmare', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA12', name: 'Pranav Navale', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA13', name: 'Aniket Jadhav', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA14', name: 'Omkar Jagtap', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA15', name: 'Samarth Pandekar', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA16', name: 'Chaitanya Pawar', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA17', name: 'Vinit Ahiwale', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA18', name: 'Shreyash Tengale', trade: 'COPA-A', session: '2025-2026' },
    { roll: 'COPA19', name: 'Ganesh Waghmode', trade: 'COPA-A', session: '2025-2026' }
  ];

  private seedDates = ['2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22', '2026-05-23', '2026-05-24'];

  students: Student[] = [];
  attendance: AttendanceRecord[] = [];

  constructor() {
    this.loadState();
  }

  private getLocalDateString(offset = 0): string {
    const d = new Date();
    if (offset !== 0) {
      d.setDate(d.getDate() + offset);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generateSeedAttendance(): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];

    this.seedDates.forEach(date => {
      this.defaultStudents.forEach(student => {
        const isPresent = Math.random() < 0.88;
        if (isPresent) {
          const hour = 9 + Math.floor(Math.random() * 2);
          const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
          const sec = String(Math.floor(Math.random() * 60)).padStart(2, '0');
          records.push({
            roll: student.roll,
            name: student.name,
            date,
            time: `${hour}:${min}:${sec}`,
            type: 'QR Badge',
            status: 'Present'
          });
        } else {
          records.push({
            roll: student.roll,
            name: student.name,
            date,
            time: '--:--:--',
            type: 'Auto Register',
            status: 'Absent'
          });
        }
      });
    });

    return records;
  }

  private loadState(): void {
    const storedStudents = localStorage.getItem(this.STUDENT_KEY);
    const storedAttendance = localStorage.getItem(this.ATTENDANCE_KEY);

    if (storedStudents && storedAttendance) {
      try {
        const studentData = JSON.parse(storedStudents) as Student[];
        const attendanceData = JSON.parse(storedAttendance) as AttendanceRecord[];

        if (Array.isArray(studentData) && studentData.length) {
          this.students = studentData;
        } else {
          this.students = [...this.defaultStudents];
        }

        if (Array.isArray(attendanceData)) {
          this.attendance = attendanceData;
        } else {
          this.attendance = this.generateSeedAttendance();
        }
      } catch {
        this.students = [...this.defaultStudents];
        this.attendance = this.generateSeedAttendance();
      }
    } else {
      this.students = [...this.defaultStudents];
      this.attendance = this.generateSeedAttendance();
    }

    this.saveState();
  }

  saveState(): void {
    localStorage.setItem(this.STUDENT_KEY, JSON.stringify(this.students));
    localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(this.attendance));
  }

  getTodayDate(): string {
    return this.getLocalDateString();
  }

  getDashboardStats(): AttendanceStats {
    const today = this.getTodayDate();
    const totalStudents = this.students.length;
    const todayAttendance = this.attendance.filter(record => record.date === today && record.status === 'Present');

    const presentToday = todayAttendance.length;
    const absentToday = totalStudents - presentToday;
    const presentRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
    const absentRate = 100 - presentRate;
    const allPresents = this.attendance.filter(record => record.status === 'Present').length;
    const monthlyRate = totalStudents ? ((allPresents / this.attendance.length) * 100).toFixed(1) : '0';

    return {
      totalStudents,
      presentToday,
      absentToday,
      presentRate,
      absentRate,
      monthlyRate: `${monthlyRate}%`
    };
  }

  getRecentCheckins(): AttendanceRecord[] {
    const today = this.getTodayDate();
    return this.attendance
      .filter(record => record.date === today && record.status === 'Present')
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 5);
  }

  getAttendanceTrend(): { labels: string[]; present: number[]; absent: number[] } {
    const labels = this.seedDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${day}/${month}`;
    });

    const present: number[] = [];
    const absent: number[] = [];

    this.seedDates.forEach(date => {
      const recordsForDay = this.attendance.filter(record => record.date === date);
      const presentCount = recordsForDay.filter(record => record.status === 'Present').length;
      present.push(presentCount);
      absent.push(Math.max(0, this.students.length - presentCount));
    });

    return { labels, present, absent };
  }

  getAttendanceRecords(filter: { search?: string; date?: string; status?: string }): AttendanceRecord[] {
    let records = [...this.attendance];

    if (filter.date) {
      records = records.filter(record => record.date === filter.date);
    }
    if (filter.status && filter.status !== 'all') {
      records = records.filter(record => record.status === filter.status);
    }
    if (filter.search) {
      const query = filter.search.toLowerCase();
      records = records.filter(record => record.name.toLowerCase().includes(query) || record.roll.toLowerCase().includes(query));
    }

    return records.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'Present' ? -1 : 1;
      }
      return b.time.localeCompare(a.time);
    });
  }

  toggleAttendanceStatus(record: AttendanceRecord): void {
    const idx = this.attendance.findIndex(r => r.roll === record.roll && r.date === record.date);
    if (idx !== -1) {
      const existing = this.attendance[idx];
      if (existing.status === 'Present') {
        existing.status = 'Absent';
        existing.time = '--:--:--';
        existing.type = 'Manual Override';
      } else {
        existing.status = 'Present';
        existing.time = new Date().toTimeString().split(' ')[0];
        existing.type = 'Manual Override';
      }
      this.saveState();
    }
  }

  deleteAttendanceRecord(roll: string, date: string): void {
    this.attendance = this.attendance.filter(record => !(record.roll === roll && record.date === date));
    this.saveState();
  }

  searchStudents(query: string): Student[] {
    const value = query.trim().toLowerCase();
    if (!value) {
      return [...this.students];
    }
    return this.students.filter(student => student.name.toLowerCase().includes(value) || student.roll.toLowerCase().includes(value));
  }

  addStudent(student: Student): void {
    this.students.push(student);
    const today = this.getTodayDate();
    this.attendance.push({
      roll: student.roll,
      name: student.name,
      date: today,
      time: '--:--:--',
      type: 'Auto Register',
      status: 'Absent'
    });
    this.saveState();
  }

  deleteStudent(roll: string): void {
    this.students = this.students.filter(student => student.roll !== roll);
    this.attendance = this.attendance.filter(record => record.roll !== roll);
    this.saveState();
  }

  getStudentByRoll(roll: string): Student | undefined {
    return this.students.find(student => student.roll === roll);
  }

  recordAttendance(roll: string, status: 'Present' | 'Absent', date: string, type: string): void {
    const student = this.getStudentByRoll(roll);
    if (!student) {
      return;
    }

    const existingIndex = this.attendance.findIndex(record => record.roll === roll && record.date === date);
    const updated: AttendanceRecord = {
      roll,
      name: student.name,
      date,
      time: status === 'Present' ? new Date().toTimeString().split(' ')[0] : '--:--:--',
      type,
      status
    };

    if (existingIndex !== -1) {
      this.attendance[existingIndex] = updated;
    } else {
      this.attendance.push(updated);
    }
    this.saveState();
  }

  getDailyReport(date: string): { rows: AttendanceRecord[]; presentCount: number; absentCount: number } {
    const rows: AttendanceRecord[] = this.students.map(student => {
      const record = this.attendance.find(item => item.roll === student.roll && item.date === date);
      if (record) {
        return record;
      }
      return {
        roll: student.roll,
        name: student.name,
        date,
        time: '--:--:--',
        type: 'Auto Register',
        status: 'Absent'
      };
    });
    const presentCount = rows.filter(row => row.status === 'Present').length;
    return { rows, presentCount, absentCount: rows.length - presentCount };
  }

  getMonthlyReport(month: string, workingDays: number): { rows: { student: Student; attendedDays: number; absentDays: number; percent: number; status: string }[]; averagePercent: number } {
    const rows = this.students.map(student => {
      const monthlyRecords = this.attendance.filter(record => record.roll === student.roll && record.date.startsWith(`2026-${month}`));
      const attendedDays = monthlyRecords.filter(record => record.status === 'Present').length;
      const absentDays = Math.max(0, workingDays - attendedDays);
      const percent = workingDays > 0 ? Math.round((attendedDays / workingDays) * 100) : 0;
      let status = 'Short Attendance';
      if (percent >= 85) {
        status = 'Excellent';
      } else if (percent >= 75) {
        status = 'Satisfactory';
      }
      return { student, attendedDays, absentDays, percent, status };
    });
    const averagePercent = rows.reduce((acc, row) => acc + row.percent, 0) / rows.length;
    return { rows, averagePercent: Math.round(averagePercent) };
  }
}
