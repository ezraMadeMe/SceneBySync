export interface Line {
  text: string;
  lineNum: number;
}

export interface Scene {
  sceneNum: string;
  header: string;
  location: string;
  content: Line[];
  startLine: number;
  hash?: string;
}

export interface Keyword {
  id: string;
  name: string;
  description: string;
  color: string;
  sceneNumbers: string[];
}

export interface Version {
  id: string;
  message: string;
  author: string;
  date: string;
  parent: string;
  branch: string;
  tags: string[];
  fullText: string;
}

export interface Comment {
  id: string;
  versionId: string;
  sceneNum: string;
  lineNum: number;
  author: string;
  text: string;
  date: string;
  resolved: boolean;
}

export type SceneComparisonType = 'unchanged' | 'added' | 'removed' | 'modified' | 'moved';

export interface SceneComparison {
  sceneNum: string;
  type: SceneComparisonType;
  scene1: Scene | null;
  scene2: Scene | null;
  newSceneNum?: string;
}

export interface WordDiff {
    type: 'unchanged' | 'added' | 'removed';
    word: string;
}

export interface LineDiff {
    type: 'unchanged' | 'added' | 'removed' | 'modified';
    content?: string;
    oldContent?: string;
    newContent?: string;
    oldLine: number | null;
    newLine: number | null;
    wordDiff?: WordDiff[];
}

export interface SelectedSceneDiff {
    type: 'added' | 'removed' | 'moved' | 'modified';
    lines: LineDiff[];
    oldSceneNum?: string;
    newSceneNum?: string;
}

export type Diff = {
  type: 'unchanged' | 'added' | 'deleted' | 'modified';
  text?: string;
  textB?: string;
  textC?: string;
  bIdx?: number;
  cIdx?: number;
};
