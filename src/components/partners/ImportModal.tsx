import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseExcelFile, ImportResult } from '../../lib/excelImport';
import { Partner } from '../../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (partners: Partner[], mode: 'replace' | 'merge') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'replace' | 'merge'>('merge');

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const res = await parseExcelFile(file);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (result) onImport(result.partners, mode);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">导入合作伙伴数据</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Import from Excel (.xlsx)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f7] rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!result && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-colors ${
                dragOver ? 'border-emerald-400 bg-emerald-50/50' : 'border-black/5 dark:border-white/5 bg-slate-50/50'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-black dark:text-white animate-spin" />
                  <span className="text-sm font-bold text-slate-500">解析中...</span>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 dark:border-white/5 flex items-center justify-center mb-4 shadow-sm">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">拖拽 Excel 文件到此处</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">或点击选择文件</p>
                  <label className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                    选择文件 (.xlsx)
                    <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }} />
                  </label>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">导入失败</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
              <button onClick={handleReset} className="ml-auto text-xs font-bold text-red-500 hover:underline">重试</button>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl border border-black/5 dark:border-white/5 text-center">
                  <p className="text-2xl font-black text-slate-900">{result.totalRows}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">总行数</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-emerald-600">{result.partners.length}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">导入公司</p>
                </div>
                <div className="p-4 bg-[#f5f5f7] rounded-2xl border border-blue-100 text-center">
                  <p className="text-2xl font-black text-blue-600">{result.partners.reduce((sum, p) => sum + p.contacts.length, 0)}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">联系人</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                  <p className="text-2xl font-black text-amber-600">{result.skippedRows}</p>
                  <p className="text-[10px] font-bold text-amber-500 uppercase">已跳过</p>
                </div>
              </div>

              {result.partners.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">预览 (前 5 条)</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-black/5 dark:border-white/5 divide-y divide-slate-50">
                    {result.partners.slice(0, 5).map((p) => (
                      <div key={p.id} className="px-4 py-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <span className="text-slate-400 ml-2">{p.location}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-[#f5f5f7] text-blue-600 rounded text-[10px] font-black">{p.tier}</span>
                          <span className="px-2 py-0.5 bg-[#f5f5f7] text-slate-500 rounded text-[10px] font-bold">{p.region}</span>
                        </div>
                      </div>
                    ))}
                    {result.partners.length > 5 && (
                      <div className="px-4 py-2 text-center text-[10px] text-slate-400 font-bold">
                        ... 还有 {result.partners.length - 5} 条
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-700">{result.errors.length} 条错误</p>
                </div>
              )}

              <div className="flex items-center gap-4 p-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">导入模式:</span>
                <div className="flex gap-1.5">
                  {([
                    { value: 'merge', label: '合并 (保留现有)' },
                    { value: 'replace', label: '替换 (清空旧数据)' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        mode === opt.value ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-black/5 dark:border-white/5 bg-slate-50/50 flex items-center justify-between">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-black dark:text-white transition-colors">
            取消
          </button>
          {result && result.partners.length > 0 && (
            <button
              onClick={handleImport}
              className="px-8 py-2.5 bg-black text-white text-sm font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              导入 {result.partners.length} 条数据 ({mode === 'replace' ? '替换' : '合并'})
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
