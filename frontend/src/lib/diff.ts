import type { Scene, Line, WordDiff, LineDiff, SceneComparison } from '@/types.ts';

// 씬 해싱 함수 (내용 기반 이동 감지)
function hashScene(scene: Partial<Scene>): string {
  if (!scene || !scene.content) return '';
  const content = scene.content
    .map(line => line ? line.text : '')
    .join('\n')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// 씬 파싱 개선
export function parseScenes(text: string): Scene[] {
  if (!text) return [];
  
  const lines = text.split('\n');
  const scenes: Scene[] = [];
  let currentScene: Partial<Scene> | null = null;
  let lineNumber = 0;
  
  lines.forEach(line => {
    lineNumber++;
    const sceneMatch = line.match(/^#(\d+)\.\s*(.+)/);
    
    if (sceneMatch) {
      if (currentScene) {
        currentScene.hash = hashScene(currentScene);
        scenes.push(currentScene as Scene);
      }
      currentScene = {
        sceneNum: sceneMatch[1],
        header: line,
        location: sceneMatch[2],
        content: [],
        startLine: lineNumber
      };
    } else if (currentScene?.content) {
      currentScene.content.push({ text: line, lineNum: lineNumber });
    }
  });
  
  if (currentScene) {
    currentScene.hash = hashScene(currentScene);
    scenes.push(currentScene as Scene);
  }
  
  return scenes;
}

// 단어 단위 diff
function computeWordDiff(oldText: string, newText: string): WordDiff[] {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  
  const m = oldWords.length;
  const n = newWords.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const diff: WordDiff[] = [];
  let i = m, j = n;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      diff.unshift({ type: 'unchanged', word: oldWords[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', word: newWords[j - 1] });
      j--;
    } else if (i > 0) {
      diff.unshift({ type: 'removed', word: oldWords[i - 1] });
      i--;
    }
  }
  
  return diff;
}

// 씬 비교 개선 (이동 감지 포함)
export function compareScenes(scenes1: Scene[], scenes2: Scene[]): SceneComparison[] {
  const sceneMap1 = new Map<string, Scene>();
  const sceneMap2 = new Map<string, Scene>();
  const hashMap1 = new Map<string, Scene>();
  const hashMap2 = new Map<string, Scene>();
  
  scenes1.forEach(scene => {
    sceneMap1.set(scene.sceneNum, scene);
    hashMap1.set(scene.hash, scene);
  });
  
  scenes2.forEach(scene => {
    sceneMap2.set(scene.sceneNum, scene);
    hashMap2.set(scene.hash, scene);
  });
  
  const allSceneNums = new Set([...sceneMap1.keys(), ...sceneMap2.keys()]);
  const compared: SceneComparison[] = [];
  const processedScenes = new Set<string>();
  
  allSceneNums.forEach(num => {
    if (processedScenes.has(num)) return;
    
    const scene1 = sceneMap1.get(num);
    const scene2 = sceneMap2.get(num);
    
    if (scene1 && scene2) {
      if (scene1.hash === scene2.hash) {
        compared.push({
          sceneNum: num,
          type: 'unchanged',
          scene1,
          scene2
        });
      } else {
        // 내용 변경
        compared.push({
          sceneNum: num,
          type: 'modified',
          scene1,
          scene2
        });
      }
      processedScenes.add(num);
    } else if (scene1) {
      // 이동 또는 삭제 확인
      const movedScene = hashMap2.get(scene1.hash);
      if (movedScene && !processedScenes.has(movedScene.sceneNum)) {
        compared.push({
          sceneNum: num,
          type: 'moved',
          scene1,
          scene2: movedScene,
          newSceneNum: movedScene.sceneNum
        });
        processedScenes.add(num);
        processedScenes.add(movedScene.sceneNum);
      } else {
        compared.push({
          sceneNum: num,
          type: 'removed',
          scene1,
          scene2: null
        });
        processedScenes.add(num);
      }
    } else if (scene2) {
      // 추가 확인
      const movedScene = hashMap1.get(scene2.hash);
      if (!movedScene || processedScenes.has(movedScene.sceneNum)) {
        compared.push({
          sceneNum: num,
          type: 'added',
          scene1: null,
          scene2
        });
        processedScenes.add(num);
      }
    }
  });
  
  return compared.sort((a, b) => {
    const numA = parseInt(a.sceneNum);
    const numB = parseInt(b.sceneNum);
    return numA - numB;
  });
}

// 줄 단위 diff (단어 하이라이트 포함)
export function computeLineDiffWithWords(oldLines: Line[], newLines: Line[]): LineDiff[] {
  const m = oldLines.length;
  const n = newLines.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1].text === newLines[j - 1].text) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const diff: LineDiff[] = [];
  let i = m, j = n;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1].text === newLines[j - 1].text) {
      diff.unshift({
        type: 'unchanged',
        content: oldLines[i - 1].text,
        oldLine: oldLines[i - 1].lineNum,
        newLine: newLines[j - 1].lineNum
      });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: 'added',
        content: newLines[j - 1].text,
        oldLine: null,
        newLine: newLines[j - 1].lineNum
      });
      j--;
    } else if (i > 0) {
      diff.unshift({
        type: 'removed',
        content: oldLines[i - 1].text,
        oldLine: oldLines[i - 1].lineNum,
        newLine: null
      });
      i--;
    }
  }
  
  // 수정된 줄 감지 및 단어 diff 추가
  const enhancedDiff: LineDiff[] = [];
  for (let k = 0; k < diff.length; k++) {
    const current = diff[k];
    const next = diff[k + 1];
    
    if (current.type === 'removed' && next?.type === 'added') {
      // 같은 위치의 삭제+추가는 수정으로 처리
      enhancedDiff.push({
        type: 'modified',
        oldContent: current.content,
        newContent: next.content,
        oldLine: current.oldLine,
        newLine: next.newLine,
        wordDiff: computeWordDiff(current.content!, next.content!)
      });
      k++; // 다음 항목 스킵
    } else {
      enhancedDiff.push(current);
    }
  }
  
  return enhancedDiff;
}
