import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WorkoutSession } from '../types';

export interface ExportData {
  date: string;
  sessionName: string;
  exerciseName: string;
  muscleGroup: string;
  setNumber: number;
  weight: string;
  reps: string;
}

const prepareData = (sessions: WorkoutSession[]): ExportData[] => {
  const data: ExportData[] = [];
  sessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      const exerciseSets = session.workoutSets.filter(s => s.exerciseId === exercise.id);
      exerciseSets.forEach((set, index) => {
        data.push({
          date: session.sessionDate,
          sessionName: session.sessionName,
          exerciseName: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup || 'N/A',
          setNumber: index + 1,
          weight: set.weight,
          reps: set.reps,
        });
      });
    });
  });
  return data;
};

export const exportToExcel = (sessions: WorkoutSession[], filename: string = 'workout_history.xlsx') => {
  const data = prepareData(sessions);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Workouts');
  XLSX.writeFile(workbook, filename);
};

export const exportToPDF = (sessions: WorkoutSession[], filename: string = 'workout_history.pdf') => {
  const data = prepareData(sessions);
  const doc = new jsPDF();
  
  doc.text('Workout History', 14, 15);
  
  const tableColumn = ['Date', 'Session', 'Exercise', 'Muscle', 'Set', 'Weight (kg)', 'Reps'];
  const tableRows = data.map(item => [
    item.date,
    item.sessionName,
    item.exerciseName,
    item.muscleGroup,
    item.setNumber,
    item.weight,
    item.reps
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(filename);
};

export const filterSessions = (sessions: WorkoutSession[], period: 'day' | 'week' | 'month' | 'year' | 'all') => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return sessions.filter(session => {
    const sDate = new Date(session.sessionDate);
    const sessionDate = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());

    switch (period) {
      case 'day':
        return sessionDate.getTime() === today.getTime();
      case 'week': {
        // Calculate start of current week (Monday)
        const day = now.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return sessionDate >= monday && sessionDate <= today;
      }
      case 'month':
        return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
      case 'year':
        return sessionDate.getFullYear() === now.getFullYear();
      case 'all':
      default:
        return true;
    }
  });
};
