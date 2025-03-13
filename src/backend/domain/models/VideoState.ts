export interface VideoState {
  id: string;
  videoId: string;
  state: string;
  duration?: string;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  rating?: number;
}
