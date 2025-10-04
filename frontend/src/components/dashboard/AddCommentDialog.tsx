import React from 'react';
import { MessageSquare } from 'lucide-react';

interface AddCommentDialogProps {
  showCommentDialog: boolean;
  setShowCommentDialog: (show: boolean) => void;
  selectedScene: string | null;
  selectedLine: number | null;
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: () => void;
  setSelectedLine: (line: number | null) => void;
}

const AddCommentDialog: React.FC<AddCommentDialogProps> = ({ 
  showCommentDialog, 
  setShowCommentDialog, 
  selectedScene, 
  selectedLine, 
  newComment, 
  setNewComment, 
  handleAddComment, 
  setSelectedLine 
}) => {
  if (!showCommentDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          주석 추가
        </h3>
        
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">
            씬 #{selectedScene}, 줄 {selectedLine}
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="주석 내용을 입력하세요..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm h-24 resize-none"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCommentDialog(false);
              setNewComment('');
              setSelectedLine(null);
            }}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAddComment}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCommentDialog;
