import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { createIcons } from 'lucide';
import { AttendanceRecord, AttendanceStats } from '../models';
import { DataService } from '../services/data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  stats: AttendanceStats = {
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    presentRate: 0,
    absentRate: 0,
    monthlyRate: '0%'
  };
  recentCheckins: AttendanceRecord[] = [];
  @ViewChild('attendanceTrendChart') attendanceTrendChart?: ElementRef<HTMLCanvasElement>;
  private chartInstance?: Chart;

  constructor(private dataService: DataService) {}

  ngAfterViewInit(): void {
    createIcons();
    this.refreshData();
    this.renderChart();
  }

  scrollToShell(): void {
    window.document.querySelector('app-shell')?.scrollIntoView({ behavior: 'smooth' });
  }

  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  refreshData(): void {
    this.stats = this.dataService.getDashboardStats();
    this.recentCheckins = this.dataService.getRecentCheckins();
    this.updateBadges();
  }

  private updateBadges(): void {
    const presentBar = document.getElementById('progress-present-rate');
    const absentBar = document.getElementById('progress-absent-rate');
    if (presentBar) {
      presentBar.style.width = `${this.stats.presentRate}%`;
    }
    if (absentBar) {
      absentBar.style.width = `${this.stats.absentRate}%`;
    }
  }

  private renderChart(): void {
    if (!this.attendanceTrendChart) {
      return;
    }

    const context = this.attendanceTrendChart.nativeElement.getContext('2d');
    if (!context) {
      return;
    }

    const trend = this.dataService.getAttendanceTrend();
    this.chartInstance?.destroy();
    this.chartInstance = new Chart(context, {
      type: 'bar',
      data: {
        labels: trend.labels,
        datasets: [
          {
            label: 'Present Students',
            data: trend.present,
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: 'Absent Students',
            data: trend.absent,
            backgroundColor: 'rgba(239, 68, 68, 0.45)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', weight: 600 }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
          }
        }
      }
    });
  }
}
