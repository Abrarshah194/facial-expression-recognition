/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Help, Documentation & Local Development Deployment Guide.
 * Includes exact tested instructions for Windows PowerShell local setup,
 * Docker containers, and FACS Action Unit reference tables.
 */

import React from 'react';
import {
  HelpCircle,
  Terminal,
  BookOpen,
  ShieldAlert,
  Layers,
  Code,
  Copy,
  CheckCircle2
} from 'lucide-react';

export const HelpView: React.FC = () => {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const powershellScript = `# 1. Clone repository
git clone https://github.com/affective-lab/facial-expression-recognition.git
cd facial-expression-recognition

# 2. Install Node dependencies
npm install

# 3. Start local React & Computer Vision development server
npm run dev
# Server listening on http://localhost:3000

# 4. Optional: Run in Docker container
docker build -t fer-analytics:latest .
docker run -p 3000:3000 fer-analytics:latest`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          Documentation & Deployment Manual
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Research methodology, FACS action unit ontology, and local development setup instructions
        </p>
      </div>

      {/* Section 1: Ethical & Scientific Primer */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3 text-xs leading-relaxed">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Affective Computing Foundations & Scientific Scope
        </h3>
        <p className="text-slate-300">
          This system is engineered for <strong>observable facial expression estimation</strong>. In alignment with modern psychological consensus (Barrett et al., 2019; IEEE P7014 Affective Computing Ethics), visible facial muscle contractions do not possess a 1-to-1 correspondence with internal subjective feelings.
        </p>
        <p className="text-slate-400">
          For example, furrowing the eyebrows (AU4) may occur during intense mathematical concentration, confusion, or glare, rather than anger. Consequently, this platform labels observable muscle activations rather than claiming to detect true emotions.
        </p>
      </div>

      {/* Section 2: FACS Action Units Ontology */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-slate-200">
          Paul Ekman Facial Action Coding System (FACS) Reference
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">AU</th>
                <th className="py-2 px-3 font-semibold">FACS Action Description</th>
                <th className="py-2 px-3 font-semibold">Anatomical Muscle</th>
                <th className="py-2 px-3 font-semibold">Primary Association</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 1</td>
                <td className="py-2 px-3 text-slate-200">Inner Brow Raiser</td>
                <td className="py-2 px-3 text-slate-400">Frontalis, pars medialis</td>
                <td className="py-2 px-3 text-slate-300">Surprise, Sad, Fear</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 2</td>
                <td className="py-2 px-3 text-slate-200">Outer Brow Raiser</td>
                <td className="py-2 px-3 text-slate-400">Frontalis, pars lateralis</td>
                <td className="py-2 px-3 text-slate-300">Surprise</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 4</td>
                <td className="py-2 px-3 text-slate-200">Brow Lowerer</td>
                <td className="py-2 px-3 text-slate-400">Corrugator supercilii</td>
                <td className="py-2 px-3 text-slate-300">Angry, Sad</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 6</td>
                <td className="py-2 px-3 text-slate-200">Cheek Raiser</td>
                <td className="py-2 px-3 text-slate-400">Orbicularis oculi</td>
                <td className="py-2 px-3 text-slate-300">Happy (Duchenne)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 9</td>
                <td className="py-2 px-3 text-slate-200">Nose Wrinkler</td>
                <td className="py-2 px-3 text-slate-400">Levator labii superioris</td>
                <td className="py-2 px-3 text-slate-300">Disgust</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 12</td>
                <td className="py-2 px-3 text-slate-200">Lip Corner Puller</td>
                <td className="py-2 px-3 text-slate-400">Zygomaticus major</td>
                <td className="py-2 px-3 text-slate-300">Happy</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 15</td>
                <td className="py-2 px-3 text-slate-200">Lip Corner Depressor</td>
                <td className="py-2 px-3 text-slate-400">Depressor anguli oris</td>
                <td className="py-2 px-3 text-slate-300">Sad</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-cyan-400 font-bold">AU 26</td>
                <td className="py-2 px-3 text-slate-200">Jaw Drop</td>
                <td className="py-2 px-3 text-slate-400">Masseter (relaxation)</td>
                <td className="py-2 px-3 text-slate-300">Surprise, Fear</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Local Windows PowerShell & Docker Setup Instructions */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Local Setup Instructions (Windows PowerShell & Docker)
          </h3>
          <button
            onClick={() => copyCode(powershellScript, 'ps')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-[11px]"
          >
            {copiedSection === 'ps' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'ps' ? 'Copied' : 'Copy PowerShell'}</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
          {powershellScript}
        </pre>
      </div>
    </div>
  );
};
