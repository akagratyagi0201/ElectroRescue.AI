import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { ComponentChart } from './components/ComponentChart';
import { analyzePCBImage } from './services/geminiService';
import { AppState, AnalysisResult } from './types';
import { Cpu, AlertCircle, Loader2, ScanEye } from 'lucide-react';

const ElectroLogo = () => (
  <svg 
    width="42" 
    height="42" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="shrink-0"
  >
    {/* PCB Board Outline */}
    <path 
      d="M20 12 H80 A12 12 0 0 1 92 24 V76 A12 12 0 0 1 80 88 H45" 
      stroke="#2dd4bf" 
      strokeWidth="7" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M20 12 A12 12 0 0 0 8 24 V60" 
      stroke="#2dd4bf" 
      strokeWidth="7" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />

    {/* Circuit Traces */}
    <circle cx="32" cy="32" r="6" stroke="#2dd4bf" strokeWidth="5" />
    <circle cx="68" cy="32" r="6" stroke="#2dd4bf" strokeWidth="5" />
    
    <path d="M32 38 L50 56 L50 72" stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M68 38 L50 56" stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    
    <circle cx="72" cy="70" r="5" fill="#2dd4bf" />

    {/* Lightning Bolt Badge */}
    <circle cx="28" cy="78" r="20" fill="#115e59" stroke="#0f172a" strokeWidth="4" />
    <path d="M30 68 L20 78 H28 L24 88 L36 76 H28 L30 68 Z" fill="#ffffff" />
  </svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (dataUrl: string) => {
    // Set image for preview immediately using the full data URL
    setImage(dataUrl);
    setState(AppState.ANALYZING);
    setError(null);

    try {
      // Parse the data URL to extract mime type and base64 data
      // format: data:[<mediatype>][;base64],<data>
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      
      if (!matches) {
        throw new Error("Invalid image format.");
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      const data = await analyzePCBImage(base64Data, mimeType);
      setResult(data);
      setState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze the PCB image.");
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <ElectroLogo />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              ElectroRescue.ai
            </span>
          </div>
          {state === AppState.SUCCESS && (
            <ImageUploader onImageSelect={handleImageSelect} isCompact />
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Idle State */}
        {state === AppState.IDLE && (
          <div className="max-w-3xl mx-auto mt-12 animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 tracking-tight">
                Don't Throw - Re-Grow
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Upload a photo of any Printed Circuit Board (PCB). Our ELECTRORESCUE.AI will identify components, explain their functions, and decode markings in seconds.
              </p>
            </div>
            
            <ImageUploader onImageSelect={handleImageSelect} />

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ScanEye size={24} />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">Component ID</h3>
                <p className="text-sm text-slate-500">Instantly detects ICs, resistors, capacitors, and connectors.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu size={24} />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">Datasheet Logic</h3>
                <p className="text-sm text-slate-500">Reads text markings and estimates component function.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">Safety Notes</h3>
                <p className="text-sm text-slate-500">Provides voltage warnings and handling usage suggestions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {state === AppState.ANALYZING && (
          <div className="max-w-4xl mx-auto mt-12 flex flex-col items-center">
             <div className="relative w-full max-w-md aspect-video bg-slate-800 rounded-xl overflow-hidden mb-8 shadow-2xl border border-slate-700">
                {image && (
                  <>
                    <img src={image} alt="Analyzing" className="w-full h-full object-contain opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-full h-1 bg-blue-500/20 absolute top-1/2 -translate-y-1/2">
                          <div className="h-full bg-blue-400 animate-scan-line w-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                       </div>
                    </div>
                  </>
                )}
             </div>
             <div className="flex items-center gap-3 text-blue-400">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-lg font-medium">Analyzing Circuit Topography...</span>
             </div>
             <p className="text-slate-500 mt-2">Identifying components and reading silkscreen text.</p>
          </div>
        )}

        {/* Results State */}
        {(state === AppState.SUCCESS || state === AppState.ERROR) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            
            {/* Left Column: Image & Stats */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                <div className="p-3 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">Source Image</span>
                </div>
                <div className="relative aspect-video bg-black/50">
                   {image && <img src={image} alt="PCB Source" className="w-full h-full object-contain" />}
                </div>
              </div>

              {state === AppState.SUCCESS && result && (
                <ComponentChart data={result.componentStats} />
              )}
            </div>

            {/* Right Column: Analysis */}
            <div className="lg:col-span-8">
              {state === AppState.ERROR ? (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-200 flex items-start gap-4">
                  <AlertCircle className="shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Analysis Failed</h3>
                    <p>{error}</p>
                    <button 
                      onClick={() => setState(AppState.IDLE)}
                      className="mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded border border-red-500/30 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                result && (
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 shadow-sm">
                    <MarkdownRenderer content={result.markdownReport} />
                  </div>
                )
              )}
            </div>

          </div>
        )}

      </main>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;