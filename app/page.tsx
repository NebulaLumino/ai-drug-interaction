"use client";

import { useState, useRef, useCallback } from "react";

const PROMPT_TEMPLATE = "You are a clinical pharmacist. Analyze the following list of medications for drug-drug interactions and clinical considerations. Include: 1) Drug-Drug Interaction Table (Drug A vs Drug B, severity: Major/Moderate/Minor, mechanism, recommendation), 2) Contraindications & Black Box Warnings, 3) Side Effect Amplification Risks, 4) Monitoring Parameters, 5) Alternative Medications to Consider, 6) Patient Counseling Points. Drug list:\n{input}";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const formattedPrompt = PROMPT_TEMPLATE.replace("{input}", input);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: formattedPrompt }),
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json();
      setOutput(data.result || "No output received.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">AI Pharmaceutical Drug Interaction Checker</h1>
          <p className="text-rose-400 text-sm max-w-xl mx-auto">
            Enter a list of medications to receive a structured drug interaction analysis, severity ratings, and clinical recommendations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="input" className="block text-sm font-medium text-gray-300 mb-2">
              Enter your data
            </label>
            <textarea
              id="input"
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste contract text, paper abstract, symptom description, incident report, or other data..."
              className={`w-full rounded-xl border border-gray-700 bg-gray-800/70 text-gray-100 placeholder-gray-500 px-4 py-3 text-sm resize-y min-h-48 focus:outline-none focus:ring-2 focus:ring-offset-0 ring-rose-500/50 transition-all`}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-500 shadow-lg shadow-black/20`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analyzing...
              </span>
            ) : "Analyze & Generate Report"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Generated Report</h2>
              <button
                onClick={copyOutput}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-6">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {output}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-600">
          Powered by DeepSeek AI via OpenAI-compatible API
        </div>
      </div>
    </div>
  );
}
