export interface Weight {
  id: number;
  weightBefore: number;
  weightAfter: number;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  age: number;
  height: number;
}

export interface UserWeight {
  weightBefore: number;
  weightAfter: number;
}

export interface UserWithWeight {
  username: string;
  age: number;
  weightBefore: number;
  weightAfter: number;
  height: number;
}

export const MuscleGroup = {
  CHEST: 'CHEST',
  SHOULDER: 'SHOULDER',
  TRICEPS: 'TRICEPS',
  BICEPS: 'BICEPS',
  BACK: 'BACK',
  LATS: 'LATS',
  GLUTES: 'GLUTES',
  QUADS: 'QUADS',
  HAMSTRINGS: 'HAMSTRINGS',
  CALVES: 'CALVES',
  INNER_THIGHS: 'INNER_THIGHS',
  OUTER_THIGHS: 'OUTER_THIGHS',
  ERECTOR: 'ERECTOR'
} as const;

export type MuscleGroup = typeof MuscleGroup[keyof typeof MuscleGroup];

export interface MuscleGroupOption {
  id: number;
  muscleGroup: MuscleGroup;
}

export interface WorkoutSet {
  id: number;
  exerciseId: number;
  exerciseName: string;
  workoutSessionId: number;
  reps: string;
  weight: string;
}

export interface WorkoutSetRequest {
  exerciseId: number;
  workoutSessionId: number;
  reps: string;
  weight: string;
}

export interface Exercise {
  id: number;
  exerciseName: string;
  muscleGroup: string;
  workoutSets: WorkoutSet[];
}

export interface WorkoutSession {
  id: number;
  sessionName: string;
  splitId: number;
  sessionDate: string;
  exercises: Exercise[];
  workoutSets: WorkoutSet[];
}

export interface SplitSession {
  id: number;
  sessionName: string;
  exercises: Exercise[];
}

export interface Split {
  id: number;
  splitName: string;
  sessions: SplitSession[];
  workoutSessions: WorkoutSession[];
}
