"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Zap,
  BarChart3,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Database,
  Cpu,
  Activity,
  Layers,
  FileText,
  Search,
  BookOpen,
  Info
} from "lucide-react";
import confetti from "canvas-confetti";

interface PredictionResult {
  prediction: "Fake News" | "Real News";
  label: number;
  confidence: number;
  status: string;
}

const SAMPLE_PRESETS = {
  real1: {
    name: "Real News: Senate Bill",
    title: "US Senate passes bipartisan funding bill to prevent government shutdown",
    text: "WASHINGTON (Reuters) - The United States Senate overwhelmingly approved a bipartisan funding package on Thursday, sending the legislation to the president for signing into law. The measure funds key government agencies through the remainder of the fiscal year, avoiding a disruptive partial shutdown of federal operations."
  },
  real2: {
    name: "Real News: NASA Science",
    title: "NASA James Webb Space Telescope confirms atmosphere details on exoplanet",
    text: "HOUSTON (AP) - Astronomers analyzing transmission spectroscopy data from the James Webb Space Telescope have identified molecular signatures including carbon dioxide and water vapor in the upper atmosphere of a distant gas giant, marking a major milestone in exoplanetary characterization."
  },
  fake1: {
    name: "Fake News: Alien Plot",
    title: "SHOCKING SECRET: Alien DNA Found in Water Supplies Across the World!",
    text: "Undercover whistleblowers reveal that global elites have introduced secret alien bio-technology into city water networks to hypnotize the general population and control human thoughts via satellite frequency towers! Share before this gets taken down!"
  },
  fake2: {
    name: "Fake News: Miracle Cure",
    title: "Doctors STUNNED: Backyard weed completely cures all diseases in 48 hours",
    text: "Big pharma executives are in a panic after a rogue botanist uncovered an ancient herbal plant growing in suburban gardens that eradicates all human illness instantly. The medical establishment is scrambling to ban this miracle cure immediately."
  }
};

export default function FakeNewsDetectorPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check Backend Health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/health", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setApiOnline(data.status === "healthy");
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Handle Analysis
  const handleAnalyze = async () => {
    const combined = `${title} ${text}`.trim();
    if (!combined) {
      setErrorMsg("Please enter an article title or body text to analyze.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const startTime = performance.now();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: HTTP ${response.status}`);
      }

      const data: PredictionResult = await response.json();
      setResult(data);

      // Trigger subtle celebration when genuine article passes with high confidence
      if (data.label === 0 && data.confidence > 90) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#10b981", "#3b82f6", "#06b6d4"]
        });
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to connect to the FastAPI prediction service on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  // Shortcut key handler (Ctrl+Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleAnalyze();
    }
  };

  const loadPreset = (presetKey: keyof typeof SAMPLE_PRESETS) => {
    const sample = SAMPLE_PRESETS[presetKey];
    setTitle(sample.title);
    setText(sample.text);
    setErrorMsg(null);
    setResult(null);
  };

  const copyResult = () => {
    if (!result) return;
    const textToCopy = `[AI News Analysis]\nTitle: "${title || "Untitled"}"\nVerdict: ${result.prediction} (${result.confidence}% confidence)\nLabel: ${result.label}\nProcessed by Fake News NLP Engine.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (title + " " + text).trim().split(/\s+/).filter(Boolean).length;
  const charCount = (title + " " + text).length;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Gradients & Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/20 via-violet-900/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-40 right-10 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-60 -left-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />

      {/* Top Header / Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  AI Fake News Detector
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  Capstone ML
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                PassiveAggressive Classifier &amp; TF-IDF NLP Architecture
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                apiOnline === true
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-950"
                  : apiOnline === false
                  ? "bg-rose-950/60 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-950"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOnline === true
                    ? "bg-emerald-400 animate-pulse"
                    : apiOnline === false
                    ? "bg-rose-400"
                    : "bg-amber-400 animate-ping"
                }`}
              />
              <span>
                {apiOnline === true
                  ? "API Live (96.87% Acc)"
                  : apiOnline === false
                  ? "API Disconnected"
                  : "Connecting..."}
              </span>
            </div>

            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Swagger API Docs</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Badges Banner */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Model Accuracy</div>
              <div className="text-lg font-bold text-white tracking-tight">96.87%</div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">WELFake Dataset</div>
              <div className="text-lg font-bold text-white tracking-tight">72,134 Articles</div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">TF-IDF Vocabulary</div>
              <div className="text-lg font-bold text-white tracking-tight">50,000 N-Grams</div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Inference Latency</div>
              <div className="text-lg font-bold text-white tracking-tight">
                {latency ? `${latency} ms` : "< 25 ms"}
              </div>
            </div>
          </div>
        </section>

        {/* Error / Offline Alert */}
        {apiOnline === false && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-4 text-rose-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-sm">
                <strong>Backend Unavailable:</strong> Could not reach the FastAPI server at{" "}
                <code className="bg-rose-900/40 px-1.5 py-0.5 rounded text-xs font-mono">
                  http://127.0.0.1:8000
                </code>
                . Ensure Uvicorn is active.
              </div>
            </div>
            <button
              onClick={checkHealth}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Input & Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form & Quick Presets (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-slate-950/50 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h2 className="font-semibold text-base text-white">Article Details</h2>
                </div>

                {/* Quick Presets Dropdown/Chips */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Presets:</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => loadPreset("real1")}
                      className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer font-medium"
                    >
                      Sample Real
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset("fake1")}
                      className="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all cursor-pointer font-medium"
                    >
                      Sample Fake
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset("real2")}
                      className="px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all cursor-pointer font-medium hidden sm:inline-block"
                    >
                      NASA Real
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset("fake2")}
                      className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all cursor-pointer font-medium hidden sm:inline-block"
                    >
                      Cure Fake
                    </button>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Headline / Title</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">optional if body provided</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Breaking: White House unveils new climate policy framework..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              {/* Body Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Article Body Text
                  </label>
                  <span className="text-xs text-slate-500">
                    {wordCount} words &bull; {charCount} chars
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste the full article content or paragraph to evaluate for misinformation markers..."
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm leading-relaxed resize-y font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                    Ctrl
                  </kbd>{" "}
                  +{" "}
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                    Enter
                  </kbd>{" "}
                  <span>to run prediction</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {(title || text) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTitle("");
                        setText("");
                        setResult(null);
                        setErrorMsg(null);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading || (!title.trim() && !text.trim())}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Text...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Article</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Quick Architecture Info Note */}
            <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/60 text-xs text-slate-400 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-300">How Inference Works:</strong> Text is passed through our cached NLTK tokenization &amp; lemmatization pipeline, converted to a 50,000-feature TF-IDF sparse matrix, and evaluated by the high-margin PassiveAggressiveClassifier.
              </div>
            </div>
          </div>

          {/* Right Column: Results & Metrics Dashboard (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {result ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Hero Prediction Card */}
                <div
                  className={`p-6 rounded-3xl border backdrop-blur-xl shadow-2xl relative overflow-hidden ${
                    result.label === 0
                      ? "bg-gradient-to-b from-emerald-950/60 via-slate-900/80 to-slate-950/90 border-emerald-500/40 shadow-emerald-950/40"
                      : "bg-gradient-to-b from-rose-950/60 via-slate-900/80 to-slate-950/90 border-rose-500/40 shadow-rose-950/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Classification Verdict
                      </span>
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-2xl font-extrabold tracking-tight ${
                            result.label === 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {result.prediction.toUpperCase()}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-2xl ${
                        result.label === 0
                          ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                          : "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40"
                      }`}
                    >
                      {result.label === 0 ? (
                        <ShieldCheck className="w-8 h-8" />
                      ) : (
                        <AlertTriangle className="w-8 h-8" />
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {result.label === 0
                      ? "The article aligns with linguistic patterns, syntax, and neutral vocabulary typical of verified news journalism."
                      : "The article exhibits high-frequency markers of sensationalism, hyperpartisan rhetoric, or synthetic misdirection."}
                  </p>

                  {/* Confidence Score Gauge */}
                  <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Model Confidence Score</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          result.label === 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {result.confidence.toFixed(2)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          result.label === 0
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : "bg-gradient-to-r from-amber-500 via-rose-500 to-red-500"
                        }`}
                        style={{ width: `${Math.min(Math.max(result.confidence, 10), 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Threshold: 50%</span>
                      <span>
                        {result.confidence >= 90
                          ? "★ Highly Confident"
                          : result.confidence >= 75
                          ? "Moderate Confidence"
                          : "Borderline"}
                      </span>
                      <span>Max: 100%</span>
                    </div>
                  </div>

                  {/* Action Copy */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Class Label: {result.label}</span>
                    <button
                      onClick={copyResult}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Copy Verdict</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* NLP & Pipeline Process Breakdown */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    <h4 className="font-semibold text-sm text-white">Inference Diagnostics</h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">Response Latency</span>
                      <span className="font-mono text-emerald-400 font-semibold">{latency} ms</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">Model Algorithm</span>
                      <span className="text-slate-200 font-medium">PassiveAggressive (Loss: Hinge)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">Feature Extractor</span>
                      <span className="text-slate-200 font-medium">TF-IDF (1, 2-grams, 50k max)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">NLP Stages</span>
                      <span className="text-indigo-400 font-medium">Lower &bull; Stopwords &bull; Lemmatized</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State / Ready to Analyze Card */
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[360px]">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-semibold text-base text-white">Ready for Analysis</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste an article or click any of the <strong>Sample Presets</strong> on the left to evaluate text authenticity in real-time.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => loadPreset("real1")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Try Sample Real News
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset("fake1")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Try Sample Fake News
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Built with <strong>Next.js 15</strong>, <strong>Tailwind CSS</strong>, <strong>FastAPI</strong>, and <strong>Scikit-Learn</strong>.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Model 96.87% Accuracy
            </span>
            <span>&bull;</span>
            <span>WELFake Corpus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
