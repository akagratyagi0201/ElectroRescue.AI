export interface ComponentStat {
  category: string;
  count: number;
}

export interface AnalysisResult {
  markdownReport: string;
  componentStats: ComponentStat[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
