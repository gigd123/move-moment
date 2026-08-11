export interface HourlyScore {
  time: string;
  outdoorScore: number;
  indoorScore: number;
}

export interface BestWindow {
  start: string;
  end: string;
  averageScore: number;
}

export type ExerciseType = 'running' | 'walking' | 'cycling' | 'outdoor' | 'indoor';
