export interface Student {
  roll: string;
  name: string;
  trade: string;
  session: string;
}

export interface AttendanceRecord {
  roll: string;
  name: string;
  date: string;
  time: string;
  type: string;
  status: 'Present' | 'Absent';
}

export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  presentRate: number;
  absentRate: number;
  monthlyRate: string;
}
