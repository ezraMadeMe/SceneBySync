import React from 'react';
import { Eye, ArrowRight, MessageSquare, User, Check } from 'lucide-react';
import type { SelectedSceneDiff, Comment } from '@/types';

interface DetailDiffProps {
  selectedSceneDiff: SelectedSceneDiff | null;
  selectedScene: string | null;
  lineStats: { added: number; removed: number; modified: number };
  showUnchangedLines: boolean;
  comments: Comment[];
  setSelectedLine: (line: number | null) => void;
  setShowCommentDialog: (show: boolean) => void;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

const DetailDiff: React.FC<DetailDiffProps> = ({ 
  selectedSceneDiff, 
  selectedScene, 
  lineStats, 
  showUnchangedLines, 
  comments, 
  setSelectedLine, 
  setShowCommentDialog, 
  setComments 
}) => {
  if (!selectedSceneDiff) return null;

  const handleCommentClick = (line: SelectedSceneDiff['lines'][0]) => {
    setSelectedLine(line.newLine ?? line.oldLine);
    setShowCommentDialog(true);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700/50 bg-gray-900/30 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-blue-300">
            씬 #{selectedScene} 상세 비교
          </h2>
        </div>
        <div className="flex gap-2 text-xs">
          {lineStats.added > 0 && (
            <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">+{lineStats.added}</div>
          )}
          {lineStats.removed > 0 && (
            <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">-{lineStats.removed}</div>
          )}
          {lineStats.modified > 0 && (
            <div className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full">~{lineStats.modified}</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedSceneDiff.type === 'moved' ? (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-6 text-center flex flex-col items-center justify-center h-full">
            <ArrowRight className="w-10 h-10 mx-auto mb-4 text-purple-400" />
            <p className="text-lg text-purple-300">
              이 씬은 #{selectedSceneDiff.oldSceneNum}에서 #{selectedSceneDiff.newSceneNum}으로 이동되었습니다.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              씬의 내용은 동일하며 번호만 변경되었습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-1 text-sm leading-relaxed" style={{ fontFamily: "'Noto Serif KR', 'Batang', serif" }}>
            {selectedSceneDiff.lines.map((line, idx) => {
              if (!showUnchangedLines && line.type === 'unchanged') {
                const prevLine = selectedSceneDiff.lines[idx - 1];
                const nextLine = selectedSceneDiff.lines[idx + 1];
                const isNearChange = prevLine?.type !== 'unchanged' || nextLine?.type !== 'unchanged';
                if (!isNearChange && selectedSceneDiff.lines[idx - 2]?.type === 'unchanged') {
                    if (selectedSceneDiff.lines[idx-1]?.type === 'unchanged') {
                        return <div key={`skip-${idx}`} className="text-center text-gray-600 select-none">...</div>;
                    }
                }
                if (!isNearChange) return null;
              }

              const CommentButton = () => (
                <button
                  onClick={() => handleCommentClick(line)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-600/20 rounded transition-all flex-shrink-0"
                  title="코멘트 추가"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                </button>
              );

              if (line.type === 'modified' && line.wordDiff) {
                const oldContent = line.wordDiff.filter(w => w.type !== 'added').map(w => w.word).join('');
                const newContent = line.wordDiff.filter(w => w.type !== 'removed').map(w => w.word).join('');
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex text-xs text-gray-500 select-none pt-1.5 w-20">
                      <span className="w-1/2 text-right">{line.oldLine}</span>
                      <span className="w-1/2 text-right">{line.newLine}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-red-300/70 bg-red-500/5 px-3 py-1.5 rounded line-through">
                        {oldContent}
                      </div>
                      <div className="group flex items-start gap-2 text-yellow-300 bg-yellow-500/10 px-3 py-1.5 rounded hover:bg-yellow-500/15 transition-colors">
                        <span className="flex-1">{newContent}</span>
                        <CommentButton />
                      </div>
                    </div>
                  </div>
                );
              }

              const lineClasses: Record<string, string> = {
                added: 'text-green-300 bg-green-500/10 hover:bg-green-500/15',
                removed: 'text-red-300/70 bg-red-500/5 line-through',
                unchanged: 'text-gray-400/80 hover:bg-gray-800/50'
              };

              return (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 flex text-xs text-gray-500 select-none pt-1.5 w-20">
                    <span className="w-1/2 text-right">{line.oldLine || ''}</span>
                    <span className="w-1/2 text-right">{line.newLine || ''}</span>
                  </div>
                  <div className={`flex-1 flex items-start justify-between gap-2 px-3 py-1.5 rounded transition-colors ${lineClasses[line.type]}`}>
                    <span>{line.content}</span>
                    {line.type !== 'removed' && <CommentButton />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comments Section */}
      {comments.filter(c => c.sceneNum === selectedScene).length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-700/50 p-4 space-y-2 overflow-y-auto max-h-48">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-300">
            <MessageSquare className="w-4 h-4" />
            주석 ({comments.filter(c => c.sceneNum === selectedScene).length})
          </h3>
          {comments.filter(c => c.sceneNum === selectedScene).map(comment => (
            <div
              key={comment.id}
              className={`bg-gray-900/50 border rounded-lg p-3 ${
                comment.resolved ? 'border-green-700/30 opacity-60' : 'border-yellow-700/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{comment.author}</span>
                  <span className="text-xs text-gray-400">줄 {comment.lineNum}</span>
                </div>
                <div className="flex items-center gap-2">
                  {comment.resolved && (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-xs text-gray-400">{comment.date}</span>
                </div>
              </div>
              <p className="text-sm text-gray-200">{comment.text}</p>
              {!comment.resolved && (
                <button
                  onClick={() => {
                    setComments(prev => prev.map(c =>
                      c.id === comment.id ? { ...c, resolved: true } : c
                    ));
                  }}
                  className="mt-2 text-xs text-green-400 hover:text-green-300"
                >
                  해결됨으로 표시
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailDiff;