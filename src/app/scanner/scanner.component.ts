import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { createIcons } from 'lucide';
import { Html5Qrcode } from 'html5-qrcode';
import { DataService } from '../services/data.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements AfterViewInit {
  @ViewChild('qrScannerElement', { static: false }) qrScannerElement?: ElementRef<HTMLDivElement>;
  scannerStatusClass = 'ready';
  statusIcon = 'aperture';
  statusTitle = 'Camera System Standby';
  statusText = 'Click "Start Camera" to initiate attendance scanning mode.';
  showLastScanned = false;
  lastScannedName = '';
  lastScannedRoll = '';
  lastScannedTime = '';
  lastScannedInitials = '';
  isScanning = false;
  cameraFacingMode: 'environment' | 'user' = 'environment';
  private scanner?: Html5Qrcode;

  constructor(private dataService: DataService, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    createIcons();
  }

  async startQRScanner(): Promise<void> {
    if (!this.qrScannerElement) {
      return;
    }
    if (this.scanner) {
      await this.stopQRScanner(false);
    }

    this.scannerStatusClass = 'ready';
    this.statusIcon = 'loader';
    this.statusTitle = 'Camera Streaming Engaged';
    this.statusText = 'Position student QR identity badge in front of camera lens.';
    this.isScanning = true;
    this.showLastScanned = false;
    this.updateIcons();

    this.scanner = new Html5Qrcode(this.qrScannerElement.nativeElement.id || 'qr-scanner-element');

    try {
      await this.scanner.start(
        { facingMode: this.cameraFacingMode },
        this.getScannerConfig(),
        decodedText => this.onQRScanSuccess(decodedText),
        _ => {}
      );
    } catch (error) {
      this.toastService.show(`Camera activation error: ${error}`, 'danger');
      this.stopQRScanner();
    }
  }

  async stopQRScanner(updateUI = true): Promise<void> {
    if (this.scanner) {
      try {
        await this.scanner.stop();
        await this.scanner.clear();
      } catch {
        // ignore cleanup problems
      }
      this.scanner = undefined;
    }
    this.isScanning = false;
    if (updateUI) {
      this.applyIdleState();
    }
  }

  toggleCameraFacing(): void {
    this.cameraFacingMode = this.cameraFacingMode === 'user' ? 'environment' : 'user';
    this.toastService.show('Switched active lens direction.', 'info');
    if (this.isScanning) {
      this.stopQRScanner(false).then(() => this.startQRScanner());
    }
  }

  private getScannerConfig() {
    const width = this.qrScannerElement?.nativeElement.clientWidth ?? 380;
    const height = this.qrScannerElement?.nativeElement.clientHeight ?? 320;
    const scanSize = Math.floor(Math.min(width, height) * (window.innerWidth <= 600 ? 0.82 : 0.7));
    return {
      fps: window.innerWidth <= 600 ? 10 : 15,
      qrbox: { width: Math.max(180, Math.min(scanSize, 280)), height: Math.max(180, Math.min(scanSize, 280)) },
      rememberLastUsedCamera: true
    };
  }

  private applyIdleState(): void {
    this.scannerStatusClass = 'ready';
    this.statusIcon = 'aperture';
    this.statusTitle = 'Camera System Standby';
    this.statusText = 'Click "Start Camera" to initiate attendance scanning mode.';
    this.updateIcons();
  }

  private updateIcons(): void {
    setTimeout(() => createIcons(), 0);
  }

  private onQRScanSuccess(decodedText: string): void {
    const rollNumber = decodedText.trim();
    const student = this.dataService.getStudentByRoll(rollNumber);
    if (!student) {
      return;
    }

    const today = this.dataService.getTodayDate();
    const existing = this.dataService.getAttendanceRecords({ search: student.roll, date: today }).find(item => item.roll === student.roll);
    if (existing && existing.status === 'Present') {
      this.showScanResultCard(student);
      this.stopQRScanner();
      return;
    }

    this.dataService.recordAttendance(student.roll, 'Present', today, 'QR Badge');
    this.showScanResultCard(student);
    this.toastService.show(`Check-in recorded for ${student.name}`, 'success');
    this.stopQRScanner();
  }

  private showScanResultCard(student: { name: string; roll: string }): void {
    this.showLastScanned = true;
    this.lastScannedName = student.name;
    this.lastScannedRoll = student.roll;
    this.lastScannedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.lastScannedInitials = student.name.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    this.scannerStatusClass = 'success';
    this.statusIcon = 'check';
    this.statusTitle = 'Match Decoded';
    this.statusText = `Check-in recorded for student: ${student.name}`;
    this.updateIcons();
  }
}
