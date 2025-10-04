import { useState, useCallback, useRef, useEffect } from 'react';
import EditorHeader from '@/components/editor/EditorHeader';
import SceneListSidebar from '@/components/editor/SceneListSidebar';
import SplitEditorView from '@/components/editor/SplitEditorView';
import SaveDialog from '@/components/editor/SaveDialog';
import type { Scene } from '@/types';
import { parseScenes, computeLineDiffWithWords } from '@/lib/diff';

// 데모 버전 데이터
const VERSION_B = {
  id: 'v2.1',
  content: `#1. 병원 복도 - 낮\n\n준호가 급하게 뛰어온다. 땀에 젖은 얼굴.\n복도 끝에서 의사가 걸어 나온다.\n\n#2. 중환자실 - 낮\n\n수진이 의식을 잃은 채 누워있다.\n심장 박동 모니터 소리만 울린다.\n준호가 손을 잡는다.\n\n#3. 카페 - 낮\n\n민수가 혼자 앉아있다.\n커피 잔을 만지작거린다.\n\n#16. 옥상 - 밤\n\n준호와 민수가 대치한다.\n둘 사이에 긴장감.`
};

const VERSION_C = {
  id: 'v3.0',
  content: `#1. 병원 복도 - 낮\n\n준호가 급하게 뛰어온다. 땀에 젖은 얼굴.\n복도 끝에서 의사가 걸어 나온다.\n\n#2. 중환자실 - 낮\n\n수진이 의식을 잃은 채 누워있다.\n심장 박동 모니터 소리만 울린다.\n준호가 울먹이며 손을 잡는다.\n\n준호\n    수진아... 제발... 눈 떠...\n\n#3. 카페 - 저녁\n\n민수가 혼자 커피를 마시며 창밖을 본다.\n비가 내린다. 민수의 눈빛이 흔들린다.\n\n민수\n    (중얼거리며) 내가 미안해...\n\n#15. 옥상 - 밤\n\n준호와 민수가 마주선다.\n긴장감이 흐른다.\n\n준호\n    너 때문에 수진이...\n\n준호가 주먹을 쥔다. 민수는 고개를 숙인다.\n\n#20. 병원 옥상 - 새벽\n\n수진의 수술이 끝났다.\n준호가 혼자 앉아 울고 있다.`
};

const BranchEditor = () => {
  // 편집 중인 내용 (B 버전을 기반으로 시작)
  const [editingContent, setEditingContent] = useState(VERSION_B.content);
  const [hasChanges, setHasChanges] = useState(false);
  
  // UI 상태
  const [showReference, setShowReference] = useState(true);
  const [selectedSceneNum, setSelectedSceneNum] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSceneList, setShowSceneList] = useState(false);
  const [newVersionInfo, setNewVersionInfo] = useState({
    versionNumber: 'v2.2',
    commitMessage: '',
    branchName: 'main'
  });
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sceneRefsC = useRef<Record<string, HTMLDivElement | null>>({});
  
  // 씬 파싱
  const scenesB = parseScenes(VERSION_B.content);
  const [scenesEditing, setScenesEditing] = useState<Scene[]>([]);
  const scenesC = parseScenes(VERSION_C.content);

  useEffect(() => {
    setScenesEditing(parseScenes(editingContent));
  }, [editingContent]);

  // 검색 필터링
  const filteredScenes = scenesEditing.filter(scene => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return scene.sceneNum.includes(query) || 
           scene.location.toLowerCase().includes(query);
  });

  // 텍스트 변경
  const handleTextChange = useCallback((newText: string) => {
    setEditingContent(newText);
    setHasChanges(true);
  }, []);

  // 씬으로 스크롤
  const scrollToScene = useCallback((sceneNumber: string) => {
    const scene = scenesEditing.find(s => s.sceneNum === sceneNumber);
    if (!scene || !textareaRef.current) return;

    const lineHeight = 20; // 대략적인 줄 높이
    const scrollTop = scene.startLine * lineHeight;
    textareaRef.current.scrollTop = scrollTop;
    
    setSelectedSceneNum(sceneNumber);
  }, [scenesEditing]);

  // C 버전의 씬을 편집 중인 버전에 추가
  const copySceneFromC = useCallback((sceneNumber: string) => {
    const sceneC = scenesC.find(s => s.sceneNum === sceneNumber);
    if (!sceneC) return;

    const sceneContent = [sceneC.header, ...sceneC.content.map(l => l.text)].join('\n');
    
    const newContent = editingContent + '\n\n' + sceneContent;
    setEditingContent(newContent);
    setHasChanges(true);
  }, [scenesC, editingContent]);

  // C 버전의 특정 줄을 복사
  const copyLineFromC = useCallback((lineText: string) => {
    const newContent = editingContent + '\n' + lineText;
    setEditingContent(newContent);
    setHasChanges(true);
  }, [editingContent]);

  // 저장
  const handleSave = useCallback(() => {
    if (!newVersionInfo.commitMessage.trim()) {
      alert('커밋 메시지를 입력해주세요.');
      return;
    }

    alert(`✅ 새 버전 ${newVersionInfo.versionNumber} 생성 완료!\n\n부모 버전: v2.1 (B)\n참고 버전: v3.0 (C)\n커밋 메시지: ${newVersionInfo.commitMessage}\n브랜치: ${newVersionInfo.branchName}\n\n씬 개수: ${scenesEditing.length}개`);

    setHasChanges(false);
    setShowSaveDialog(false);
  }, [newVersionInfo, scenesEditing]);

  // 씬 차이 정보
  const getSceneDiffInfo = (sceneNum: string) => {
    const sceneB = scenesB.find(s => s.sceneNum === sceneNum);
    const sceneC = scenesC.find(s => s.sceneNum === sceneNum);

    return {
      inB: !!sceneB,
      inC: !!sceneC,
      isNewInC: !sceneB && !!sceneC,
      isModifiedInC: !!sceneB && !!sceneC && 
        sceneB.content.length !== sceneC.content.length
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100">
      <EditorHeader
        newVersionInfo={newVersionInfo}
        showReference={showReference}
        setShowReference={setShowReference}
        hasChanges={hasChanges}
        setShowSaveDialog={setShowSaveDialog}
        showSceneList={showSceneList}
        setShowSceneList={setShowSceneList}
      />

      <div className="max-w-full mx-auto p-1 sm:p-2 h-[calc(100vh-100px)] sm:h-[calc(100vh-110px)] lg:h-[calc(100vh-90px)] overflow-hidden">
        <SceneListSidebar
          scenesEditing={scenesEditing}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredScenes={filteredScenes}
          getSceneDiffInfo={getSceneDiffInfo}
          selectedSceneNum={selectedSceneNum}
          scrollToScene={scrollToScene}
          showSceneList={showSceneList}
          setShowSceneList={setShowSceneList}
        />

        <SplitEditorView
          textareaRef={textareaRef}
          editingContent={editingContent}
          handleTextChange={handleTextChange}
          newVersionInfo={newVersionInfo}
          showReference={showReference}
          scenesC={scenesC}
          scenesB={scenesB}
          getSceneDiffInfo={getSceneDiffInfo}
          selectedSceneNum={selectedSceneNum}
          computeSceneDiff={(sceneB, sceneC) => {
            if (!sceneB || !sceneC) return null;
            return computeLineDiffWithWords(sceneB.content, sceneC.content);
          }}
          copySceneFromC={copySceneFromC}
          copyLineFromC={copyLineFromC}
          sceneRefsC={sceneRefsC}
        />
      </div>

      <SaveDialog
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        newVersionInfo={newVersionInfo}
        setNewVersionInfo={setNewVersionInfo}
        handleSave={handleSave}
      />
    </div>
  );
};

export default BranchEditor;
