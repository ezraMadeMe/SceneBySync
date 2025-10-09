import { useState, useMemo, useCallback } from 'react';
import { DEMO_KEYWORDS, DEMO_VERSIONS, DEMO_COMMENTS } from '@/data/demo';
import type { Keyword, Comment, SelectedSceneDiff } from '@/types';
import { parseScenes, compareScenes, computeLineDiffWithWords } from '@/lib/diff';
import VersionComparator from '@/components/dashboard/VersionComparator';

import KeywordManager from '@/components/dashboard/KeywordManager';
import SceneComparisonComponent from '@/components/dashboard/SceneComparison';
import DetailDiff from '@/components/dashboard/DetailDiff';
import AddCommentDialog from '@/components/dashboard/AddCommentDialog';
import KeywordDialog from '@/components/dashboard/KeywordDialog';
import SceneSelectorDialog from '@/components/dashboard/SceneSelectorDialog';

const Dashboard = () => {
  const [baseVersion, setBaseVersion] = useState('v2.1');
  const [targetVersion, setTargetVersion] = useState('v3.0');
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [showUnchangedScenes, setShowUnchangedScenes] = useState(false);
  // Removed unused state for showUnchangedLines
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState({ header: true, content: false });
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [filterByType, setFilterByType] = useState('all');
  
  const [keywords, setKeywords] = useState<Keyword[]>(DEMO_KEYWORDS);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [showKeywordDialog, setShowKeywordDialog] = useState(false);
  const [newKeyword, setNewKeyword] = useState({ name: '', description: '', color: '#8B5CF6' });
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const [keywordToEdit, setKeywordToEdit] = useState<string | null>(null);

  const vBase = DEMO_VERSIONS.find(v => v.id === baseVersion);
  const vTarget = DEMO_VERSIONS.find(v => v.id === targetVersion);

  const sceneComparison = useMemo(() => {
    if (!vBase || !vTarget) return [];
    const scenes1 = parseScenes(vBase.fullText);
    const scenes2 = parseScenes(vTarget.fullText);
    return compareScenes(scenes1, scenes2);
  }, [vBase, vTarget]);

  const filteredScenes = useMemo(() => {
    let filtered = sceneComparison;
    if (selectedKeyword) {
      const keyword = keywords.find(k => k.id === selectedKeyword);
      if (keyword) {
        filtered = filtered.filter(s => keyword.sceneNumbers.includes(s.sceneNum));
      }
    }
    if (!showUnchangedScenes) {
      filtered = filtered.filter(s => s.type !== 'unchanged');
    }
    if (filterByType !== 'all') {
      filtered = filtered.filter(s => s.type === filterByType);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => {
        const inHeader = searchOptions.header && (
          (s.scene1?.header.toLowerCase().includes(query)) ||
          (s.scene2?.header.toLowerCase().includes(query))
        );
        
        const scene1Content = s.scene1?.content.map(line => line ? line.text : '').join(' ').toLowerCase() || '';
        const scene2Content = s.scene2?.content.map(line => line ? line.text : '').join(' ').toLowerCase() || '';
        const inContent = searchOptions.content && (
          scene1Content.includes(query) || scene2Content.includes(query)
        );

        return inHeader || inContent;
      });
    }
    return filtered;
  }, [sceneComparison, showUnchangedScenes, filterByType, searchQuery, searchOptions, selectedKeyword, keywords]);

  const selectedSceneDiff = useMemo((): SelectedSceneDiff | null => {
    if (!selectedScene) return null;
    const comparison = sceneComparison.find(s => s.sceneNum === selectedScene);
    if (!comparison) return null;
    if (comparison.type === 'added' && comparison.scene2) {
      return {
        type: 'added',
        lines: comparison.scene2.content.map(line => ({ type: 'added', content: line.text, oldLine: null, newLine: line.lineNum }))
      };
    } else if (comparison.type === 'removed' && comparison.scene1) {
      return {
        type: 'removed',
        lines: comparison.scene1.content.map(line => ({ type: 'removed', content: line.text, oldLine: line.lineNum, newLine: null }))
      };
    } else if (comparison.type === 'moved') {
      return { type: 'moved', oldSceneNum: comparison.sceneNum, newSceneNum: comparison.newSceneNum, lines: [] };
    } else if (comparison.scene1 && comparison.scene2) {
      return { type: 'modified', lines: computeLineDiffWithWords(comparison.scene1.content, comparison.scene2.content) };
    }
    return null;
  }, [selectedScene, sceneComparison]);

  const sceneStats = useMemo(() => {
    const added = sceneComparison.filter(s => s.type === 'added').length;
    const removed = sceneComparison.filter(s => s.type === 'removed').length;
    const modified = sceneComparison.filter(s => s.type === 'modified').length;
    const moved = sceneComparison.filter(s => s.type === 'moved').length;
    const unchanged = sceneComparison.filter(s => s.type === 'unchanged').length;
    return { added, removed, modified, moved, unchanged, total: sceneComparison.length };
  }, [sceneComparison]);

  const lineStats = useMemo(() => {
    if (!selectedSceneDiff) return { added: 0, removed: 0, modified: 0, unchanged: 0 };
    const added = selectedSceneDiff.lines.filter(l => l.type === 'added').length;
    const removed = selectedSceneDiff.lines.filter(l => l.type === 'removed').length;
    const modified = selectedSceneDiff.lines.filter(l => l.type === 'modified').length;
    const unchanged = selectedSceneDiff.lines.filter(l => l.type === 'unchanged').length;
    return { added, removed, modified, unchanged };
  }, [selectedSceneDiff]);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim() || !selectedLine || !selectedScene) return;
    const comment: Comment = {
      id: `c${Date.now()}`,
      versionId: targetVersion,
      sceneNum: selectedScene,
      lineNum: selectedLine,
      author: '현재 사용자',
      text: newComment,
      date: new Date().toLocaleString('ko-KR'),
      resolved: false
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
    setShowCommentDialog(false);
    setSelectedLine(null);
  }, [newComment, selectedLine, selectedScene, targetVersion]);

  const handleAddKeyword = useCallback(() => {
    if (!newKeyword.name.trim()) return;
    const keyword: Keyword = {
      id: `k${Date.now()}`,
      ...newKeyword,
      sceneNumbers: []
    };
    setKeywords(prev => [...prev, keyword]);
    setNewKeyword({ name: '', description: '', color: '#8B5CF6' });
    setShowKeywordDialog(false);
  }, [newKeyword]);

  const handleDeleteKeyword = useCallback((keywordId: string) => {
    if (confirm('이 키워드를 삭제하시겠습니까?')) {
      setKeywords(prev => prev.filter(k => k.id !== keywordId));
      if (selectedKeyword === keywordId) {
        setSelectedKeyword(null);
      }
    }
  }, [selectedKeyword]);

  const toggleSceneInKeyword = useCallback((keywordId: string, sceneNum: string) => {
    setKeywords(prev => prev.map(k => {
      if (k.id === keywordId) {
        const sceneNumbers = k.sceneNumbers.includes(sceneNum)
          ? k.sceneNumbers.filter(s => s !== sceneNum)
          : [...k.sceneNumbers, sceneNum];
        return { ...k, sceneNumbers };
      }
      return k;
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="sticky top-0 w-full z-30 bg-gray-900">
        <VersionComparator 
          baseVersion={baseVersion}
          setBaseVersion={setBaseVersion}
          targetVersion={targetVersion}
          setTargetVersion={setTargetVersion}
          versions={DEMO_VERSIONS}
          sceneStats={sceneStats}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </header>

      <main className="p-6 flex-grow flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <KeywordManager
            keywords={keywords}
            selectedKeyword={selectedKeyword}
            setSelectedKeyword={setSelectedKeyword}
            setShowKeywordDialog={setShowKeywordDialog}
            setKeywordToEdit={setKeywordToEdit}
            setShowSceneSelector={setShowSceneSelector}
            handleDeleteKeyword={handleDeleteKeyword}
            sceneComparison={sceneComparison}
            setSelectedScene={setSelectedScene}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 h-full">
              <SceneComparisonComponent
                filteredScenes={filteredScenes}
                selectedScene={selectedScene}
                setSelectedScene={setSelectedScene}
                filterByType={filterByType}
                setFilterByType={setFilterByType}
                showUnchangedScenes={showUnchangedScenes}
                setShowUnchangedScenes={setShowUnchangedScenes}
              />
            </div>
            <div className="lg:col-span-2">
              <DetailDiff
                selectedSceneDiff={selectedSceneDiff}
                selectedScene={selectedScene}
                lineStats={lineStats}
                showUnchangedLines={showUnchangedScenes}
                comments={comments}
                setSelectedLine={setSelectedLine}
                setShowCommentDialog={setShowCommentDialog}
                setComments={setComments}
              />
            </div>
          </div>
        </div>
      </main>

      <AddCommentDialog 
        showCommentDialog={showCommentDialog}
        setShowCommentDialog={setShowCommentDialog}
        selectedScene={selectedScene}
        selectedLine={selectedLine}
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddComment={handleAddComment}
        setSelectedLine={setSelectedLine}
      />

      <KeywordDialog 
        showKeywordDialog={showKeywordDialog}
        setShowKeywordDialog={setShowKeywordDialog}
        newKeyword={newKeyword}
        setNewKeyword={setNewKeyword}
        handleAddKeyword={handleAddKeyword}
      />

      <SceneSelectorDialog 
        showSceneSelector={showSceneSelector}
        setShowSceneSelector={setShowSceneSelector}
        keywordToEdit={keywordToEdit}
        setKeywordToEdit={setKeywordToEdit}
        keywords={keywords}
        sceneComparison={sceneComparison}
        toggleSceneInKeyword={toggleSceneInKeyword}
      />
    </div>
  );
};

export default Dashboard;