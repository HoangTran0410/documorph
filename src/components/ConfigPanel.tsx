import React from "react";
import { DocumentConfig, StyleConfig, FONTS } from "../types";
import {
  Settings,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ConfigPanelProps {
  config: DocumentConfig;
  onChange: (newConfig: DocumentConfig) => void;
}

const StyleEditor: React.FC<{
  label: string;
  value: StyleConfig;
  onChange: (val: StyleConfig) => void;
  hideFields?: Array<'color' | 'bold' | 'italic' | 'alignment'>;
}> = ({ label, value, onChange, hideFields = [] }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const update = (key: keyof StyleConfig, val: any) => {
    onChange({ ...value, [key]: val });
  };

  const shouldHide = (field: string) => hideFields.includes(field as any);

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg mb-3 overflow-hidden bg-white dark:bg-slate-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="font-semibold text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Type size={14} /> {label}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Font & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Font Family
              </label>
              <select
                value={value.fontFamily}
                onChange={(e) => update("fontFamily", e.target.value)}
                className="w-full text-xs p-2 rounded border bg-white text-slate-900 border-gray-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Size (pt)
              </label>
              <input
                type="number"
                value={value.fontSize}
                onChange={(e) => update("fontSize", Number(e.target.value))}
                className="w-full text-xs p-2 rounded border bg-white text-slate-900 border-gray-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              />
            </div>
          </div>

          {/* Color & Styles */}
          {(!shouldHide('color') || !shouldHide('bold') || !shouldHide('italic')) && (
            <div className="flex items-end gap-3">
              {!shouldHide('color') && (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value.color}
                      onChange={(e) => update("color", e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-slate-400">
                      {value.color}
                    </span>
                  </div>
                </div>
              )}
              {(!shouldHide('bold') || !shouldHide('italic')) && (
                <div className="flex gap-1">
                  {!shouldHide('bold') && (
                    <button
                      onClick={() => update("bold", !value.bold)}
                      className={`p-2 rounded border ${
                        value.bold
                          ? "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      B
                    </button>
                  )}
                  {!shouldHide('italic') && (
                    <button
                      onClick={() => update("italic", !value.italic)}
                      className={`p-2 rounded border italic ${
                        value.italic
                          ? "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      I
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Alignment */}
          {!shouldHide('alignment') && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Alignment
              </label>
              <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-md">
                {["left", "center", "right", "justify"].map((align) => (
                  <button
                    key={align}
                    onClick={() => update("alignment", align)}
                    className={`flex-1 flex justify-center py-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ${
                      value.alignment === align
                        ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400"
                        : ""
                    }`}
                  >
                    {align === "left" && <AlignLeft size={14} />}
                    {align === "center" && <AlignCenter size={14} />}
                    {align === "right" && <AlignRight size={14} />}
                    {align === "justify" && <AlignJustify size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Margin Top (pt)
              </label>
              <input
                type="number"
                value={value.marginTop}
                onChange={(e) => update("marginTop", Number(e.target.value))}
                className="w-full text-xs p-2 rounded border bg-white text-slate-900 border-gray-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Margin Bottom (pt)
              </label>
              <input
                type="number"
                value={value.marginBottom}
                onChange={(e) => update("marginBottom", Number(e.target.value))}
                className="w-full text-xs p-2 rounded border bg-white text-slate-900 border-gray-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2">
        <Settings className="text-blue-600" size={20} />
        <h2 className="font-bold text-slate-800 dark:text-white">
          Styles Config
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <StyleEditor
          label="Heading 1"
          value={config.h1}
          onChange={(v) => onChange({ ...config, h1: v })}
        />
        <StyleEditor
          label="Heading 2"
          value={config.h2}
          onChange={(v) => onChange({ ...config, h2: v })}
        />
        <StyleEditor
          label="Heading 3"
          value={config.h3}
          onChange={(v) => onChange({ ...config, h3: v })}
        />
        <StyleEditor
          label="Paragraphs"
          value={config.p}
          onChange={(v) => onChange({ ...config, p: v })}
        />
        <StyleEditor
          label="Quotes"
          value={config.quote}
          onChange={(v) => onChange({ ...config, quote: v })}
        />
        <StyleEditor
          label="Code Blocks"
          value={config.code}
          onChange={(v) => onChange({ ...config, code: v })}
          hideFields={['color', 'bold', 'italic', 'alignment']}
        />
      </div>
    </div>
  );
};

export default ConfigPanel;
