export interface SkillFileMeta {
  sizeBytes: number;
  lineCount: number;
  ext: string;
  tabKey: string;
}

export interface SkillTokenEstimate {
  heuristic?: number;
  cl100k?: number;
}

export interface SkillDependencyMeta {
  skills: string[];
  libraries: string[];
  runtimeTools: string[];
  source: 'structured';
}

export interface SkillManifestEntry {
  category: string;
  files: string[];
  fileMeta?: Record<string, SkillFileMeta>;
  tokenEstimate?: SkillTokenEstimate;
  dependencies?: SkillDependencyMeta;
}

export interface SkillsManifest {
  [skillSource: string]: SkillManifestEntry;
}
