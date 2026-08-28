export type ReviewResult = 'remembered' | 'revisit' | 'acted';

export interface Review {
  date: string;
  result: ReviewResult;
}

export interface SourceInfo {
  kind: 'link' | 'file' | 'manual';
  title: string;
  reference: string;
}

export interface Marker {
  id: string;
  createdAt: string;
  updatedAt: string;
  source: SourceInfo;
  seconds: number;
  takeaway: string;
  cue: string;
  actionDate: string;
  reviews: Review[];
  voice?: Blob;
}

export interface BackupMarker extends Omit<Marker, 'voice'> {
  voice?: { type: string; data: string };
}

export interface Backup {
  product: 'audio-reflection-markers';
  version: 1;
  exportedAt: string;
  markers: BackupMarker[];
}
