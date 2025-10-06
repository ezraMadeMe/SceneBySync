import React, { useState } from 'react';
import { Upload, GitBranch, MessageSquare, X } from 'lucide-react';
import type { Version } from '@/types';

interface AddScenarioDialogProps {
  show: boolean;
  onClose: () => void;
  onAddVersion: (data: { message: string; parentId: string | null; }) => void;
  versions: Version[];
}

const AddScenarioDialog: React.FC<AddScenarioDialogProps> = ({ show, onClose, onAddVersion, versions }) => {
  if (!show) return null;

  const [message, setMessage] = useState('');
  const [parentId, setParentId] = useState<string | null>(versions.length > 0 ? versions[0].id : null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    if (!message || !fileName) {
      alert('시나리오 파일과 버전 메시지를 모두 입력해주세요.');
      return;
    }
    onAddVersion({ message, parentId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 max-w-2xl w-full mx-4 flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">새 시나리오 버전 추가</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-white" />
          </button>
        </div>
        
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> 부모 버전 (어떤 버전에서 파생되었나요?)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 px-3 py-2 text-sm"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>{v.id} - {v.message}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <Upload className="w-4 h-4" /> 시나리오 파일
            </label>
            <div className="relative">
              <input 
                type="file" 
                id="scenario-upload" 
                className="absolute w-0 h-0 opacity-0"
                onChange={handleFileChange}
                accept=".txt,.fountain,.pdf"
              />
              <label 
                htmlFor="scenario-upload" 
                className="w-full bg-gray-700 border border-dashed border-gray-600 p-4 text-center cursor-pointer hover:bg-gray-600"
              >
                {fileName ? `선택된 파일: ${fileName}` : '클릭하여 파일 선택'}
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> 버전 메시지
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="이 버전의 변경사항을 요약해주세요..."
              className="w-full bg-gray-700 border border-gray-600 px-3 py-2 text-sm h-24 resize-none"
            />
          </div>
        </div>
        
        <div className="flex-shrink-0 pt-4 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-sm font-semibold transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition-colors"
          >
            버전 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddScenarioDialog;
