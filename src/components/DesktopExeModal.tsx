import React, { useState } from 'react';
import { 
  Monitor, 
  Download, 
  Check, 
  Copy, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  FolderDown, 
  ExternalLink,
  X,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';

interface DesktopExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopExeModal({ isOpen, onClose }: DesktopExeModalProps) {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const commandSteps = [
    { id: 'step1', title: '1. 克隆或解压项目源码', cmd: 'git clone <repo-url> && cd applet' },
    { id: 'step2', title: '2. 安装项目依赖', cmd: 'npm install' },
    { id: 'step3', title: '3. 一键编译并打包 Windows EXE', cmd: 'npm run build:exe' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold">Windows EXE 桌面版编译与安装</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v2.0
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  Otc, 2026
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Electron Ready
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                版本 v2.0 (Otc, 2026) • 离线运行 • 本地运算 • 支持 .docx / .txt 语料 • 批量统计与 CSV 导出
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
          {/* Quick Overview Card */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>已就绪的桌面独立版结构 (Stand-alone EXE)</span>
              </div>
              <p className="text-xs text-blue-800/80 leading-relaxed max-w-xl">
                本项目已完全配置 Electron 42 与 electron-builder 26 架构。可打包为免安装绿色版或 NSIS 安装向导版，内置 Chromium 和 Node 运行内核，双击即可无网络离线运行。
              </p>
            </div>
            <a
              href="/build-windows-exe.bat"
              download="build-windows-exe.bat"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>下载一键打包脚本 (.bat)</span>
            </a>
          </div>

          {/* Desktop App Advantages */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">桌面版核心优势</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>100% 数据离线与保密</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  学生作文、考试样本和敏感语料完全保留在本地硬盘，不经由任何第三方云端。
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs mb-1">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span>本地高速多核运算</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  直接利用本地 CPU 处理上千篇 .docx/.txt 文档的句法结构、从句切分与词汇多样性。
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs mb-1">
                  <FolderDown className="h-4 w-4 text-indigo-600" />
                  <span>本地文件拖拽与导出</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  原生支持批量文件拖拽、一键生成科研规范的指标统计汇总 CSV 及 Excel 表格。
                </p>
              </div>
            </div>
          </div>

          {/* Compilation Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Windows 本地打包 EXE 步骤</h4>
              <span className="text-[11px] text-gray-400">前提：安装 Node.js 18+ (nodejs.org)</span>
            </div>

            <div className="space-y-2.5">
              {commandSteps.map((step) => (
                <div key={step.id} className="p-3 bg-gray-900 text-gray-100 rounded-xl border border-gray-800 flex items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 truncate">
                    <span className="text-gray-400 font-sans text-xs">{step.title}:</span>
                    <span className="text-emerald-400 select-all truncate">{step.cmd}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(step.cmd, step.id)}
                    className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    title="复制命令"
                  >
                    {copiedCmd === step.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Executable Output Details */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-900 text-xs">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              <span>编译产物说明 (Output Files)</span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              运行 <code className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-mono text-[11px]">npm run build:exe</code> 成功后，可执行文件将输出至项目的 <code className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-mono text-[11px]">/release/</code> 目录下：
            </p>
            <ul className="text-xs text-amber-900/90 space-y-1 list-disc list-inside ml-1">
              <li>
                <strong>便携免安装版：</strong> <code className="font-mono text-[11px]">release/win-unpacked/Measuring Learners English Writing.exe</code>（直接拷贝该目录即可在任何 Windows 电脑运行）
              </li>
              <li>
                <strong>安装向导版：</strong> <code className="font-mono text-[11px]">release/Measuring Learners English Writing Setup 2.0.0.exe</code>（标准 Windows NSIS 安装包）
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500">
            支持 Windows 10 / 11 64位系统
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              关闭
            </button>
            <a
              href="/build-windows-exe.bat"
              download="build-windows-exe.bat"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>下载 .bat 打包脚本</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
