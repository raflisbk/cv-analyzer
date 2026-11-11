export interface VersionData {
  id: string;
  label: string;
  at: string;
  score: number;
  delta: number | null;
  summary: string;
  current: boolean;
}

export interface VersionDiff {
  before: string;
  after: string;
}
