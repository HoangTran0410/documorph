import React, { useRef, useEffect } from 'react';
import { Code2, RotateCcw } from 'lucide-react';
import OverType from 'overtype';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  isDark: boolean;
}

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  onReset,
  isDark,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && !instanceRef.current) {
      const [instance] = new OverType(editorRef.current, {
        value: value,
        placeholder: '# Start typing your document...',
        fontSize: '14px',
        lineHeight: 1.6,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        padding: '16px',
        theme: isDark ? 'cave' : 'solar',
        toolbar: true,
        showStats: true,
        smartLists: true,
        onChange: (newValue: string) => {
          onChange(newValue);
        },
      });

      instanceRef.current = instance;
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (instanceRef.current && value !== instanceRef.current.getValue()) {
      instanceRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setTheme(isDark ? 'cave' : 'solar');
    }
  }, [isDark]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="p-2 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="text-blue-600" size={20} />
          <h2 className="font-bold text-slate-800 dark:text-white">
            Markdown Input
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
            title="Reset to default styles"
          >
            <RotateCcw size={14} />
            RESET
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="flex-1 w-full h-full overflow-auto"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default Editor;
