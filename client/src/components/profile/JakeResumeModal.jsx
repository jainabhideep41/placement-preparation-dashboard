import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  FileCode, 
  ExternalLink, 
  FileText, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { 
  getResumeStructuredData, 
  generateJakeResumeLatex, 
  downloadLatexFile 
} from '../../utils/jakeResumeGenerator';

export function JakeResumeModal({ isOpen, onClose, profile }) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'latex'
  const [copied, setCopied] = useState(false);
  const [includeEmail, setIncludeEmail] = useState(
    profile?.privacy?.showEmail !== false
  );
  const [includePhone, setIncludePhone] = useState(
    Boolean(profile?.privacy?.showPhone)
  );

  React.useEffect(() => {
    if (profile) {
      setIncludeEmail(profile.privacy?.showEmail !== false);
      setIncludePhone(Boolean(profile.privacy?.showPhone));
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const resumeOptions = { includeEmail, includePhone };
  const resumeData = getResumeStructuredData(profile, resumeOptions);
  const latexSource = generateJakeResumeLatex(profile, resumeOptions);

  const handleCopyLatex = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(latexSource).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTex = () => {
    downloadLatexFile(profile, null, resumeOptions);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container Card */}
      <div className="bg-[#F8F8F6] border-2 border-black rounded-3xl max-w-4xl w-full shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white">
        
        {/* Modal Top Action Toolbar (Hidden in Print) */}
        <div className="px-5 py-4 bg-white border-b-2 border-black flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight font-display text-black">
                  Jake&apos;s ATS Resume Generator
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                  Overleaf Standard
                </span>
              </div>
              <p className="text-[11px] font-mono text-black/60">
                Single-page, machine-readable LaTeX template optimized for Tier-1 Tech screening
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher */}
            <div className="bg-[#EFEFEF] p-1 rounded-xl border border-black/15 flex items-center gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'preview' 
                    ? 'bg-black text-white shadow-xs' 
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('latex')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'latex' 
                    ? 'bg-black text-white shadow-xs' 
                    : 'text-black/60 hover:text-black'
                }`}
              >
                LaTeX (.tex)
              </button>
            </div>

            {/* Download PDF Trigger */}
            <button
              type="button"
              onClick={handlePrint}
              title="Download or Print as PDF (Standard ATS Single Page)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF</span>
            </button>

            {/* Download .tex file */}
            <button
              type="button"
              onClick={handleDownloadTex}
              title="Download .tex source for Overleaf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .tex</span>
            </button>

            {/* Copy LaTeX source */}
            <button
              type="button"
              onClick={handleCopyLatex}
              title="Copy LaTeX source code"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl font-mono text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied LaTeX!' : 'Copy LaTeX'}</span>
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-black/50 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
          {activeTab === 'preview' ? (
            <div className="max-w-[780px] mx-auto space-y-4">
              {/* Overleaf Instructions & Contact Export Options Banner (Hidden in Print) */}
              <div className="p-3.5 rounded-2xl bg-white border border-black/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono print:hidden shadow-xs">
                <div className="flex items-center gap-2 text-black/70">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>ATS Formatting Tip:</strong> Set Margins to &ldquo;None / Minimum&rdquo; when saving PDF.
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                  <span className="font-bold text-black/50 uppercase text-[10px]">Export Contacts:</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeEmail}
                      onChange={(e) => setIncludeEmail(e.target.checked)}
                      className="rounded border-black text-black focus:ring-0 cursor-pointer"
                    />
                    <span className={includeEmail ? 'font-bold text-black' : 'text-black/40 line-through'}>
                      Email
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includePhone}
                      onChange={(e) => setIncludePhone(e.target.checked)}
                      className="rounded border-black text-black focus:ring-0 cursor-pointer"
                    />
                    <span className={includePhone ? 'font-bold text-black' : 'text-black/40 line-through'}>
                      Phone
                    </span>
                  </label>
                </div>
              </div>

              {/* JAKE RESUME SHEET (Pixel-Perfect Overleaf Replica) */}
              <div 
                id="jake-resume-print-area" 
                className="bg-white border-2 border-black/20 print:border-none p-6 sm:p-10 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.15)] print:shadow-none font-serif text-black leading-normal print:p-0 print:m-0"
                style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
              >
                {/* 1. Centered Header */}
                <div className="text-center pb-2 border-b-0">
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-black">
                    {resumeData.name}
                  </h1>
                  <div className="text-[11px] sm:text-xs text-black/85 mt-1.5 flex items-center justify-center gap-2 flex-wrap">
                    {(() => {
                      const items = [];
                      if (resumeData.phone) {
                        items.push(<span key="phone">{resumeData.phone}</span>);
                      }
                      if (resumeData.email) {
                        items.push(
                          <a key="email" href={`mailto:${resumeData.email}`} className="text-black hover:underline">
                            {resumeData.email}
                          </a>
                        );
                      }
                      if (resumeData.linkedinHandle) {
                        items.push(
                          <a 
                            key="linkedin"
                            href={`https://linkedin.com/in/${resumeData.linkedinHandle}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-black hover:underline"
                          >
                            linkedin.com/in/{resumeData.linkedinHandle}
                          </a>
                        );
                      }
                      if (resumeData.githubHandle) {
                        items.push(
                          <a 
                            key="github"
                            href={`https://github.com/${resumeData.githubHandle}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-black hover:underline"
                          >
                            github.com/{resumeData.githubHandle}
                          </a>
                        );
                      }
                      if (resumeData.leetcodeHandle) {
                        items.push(
                          <a 
                            key="leetcode"
                            href={`https://leetcode.com/u/${resumeData.leetcodeHandle}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-black hover:underline"
                          >
                            leetcode.com/u/{resumeData.leetcodeHandle}
                          </a>
                        );
                      }

                      return items.map((item, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="text-black/50 font-sans text-[10px] mx-0.5">|</span>}
                          {item}
                        </React.Fragment>
                      ));
                    })()}
                  </div>
                </div>

                {/* 2. Education Section */}
                <div className="mt-3">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1.5 text-black">
                    Education
                  </h2>
                  <div className="text-xs">
                    <div className="flex justify-between items-baseline font-bold text-black">
                      <span>{resumeData.college}</span>
                      <span className="font-normal italic text-[11px] text-black/80">{resumeData.location}</span>
                    </div>
                    <div className="flex justify-between items-baseline italic text-black/90 text-[11px] mt-0.5">
                      <span>{resumeData.degree} (CGPA: {resumeData.cgpa})</span>
                      <span className="font-normal text-[11px] text-black/80">{resumeData.year}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Technical Skills Section */}
                <div className="mt-3">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1.5 text-black">
                    Technical Skills
                  </h2>
                  <div className="text-xs space-y-1 text-black/90 leading-tight">
                    <div>
                      <strong className="text-black">Languages: </strong>
                      <span>{resumeData.technicalSkills.languages}</span>
                    </div>
                    <div>
                      <strong className="text-black">Frameworks &amp; Libraries: </strong>
                      <span>{resumeData.technicalSkills.frameworks}</span>
                    </div>
                    <div>
                      <strong className="text-black">Databases &amp; Caching: </strong>
                      <span>{resumeData.technicalSkills.databases}</span>
                    </div>
                    <div>
                      <strong className="text-black">Cloud &amp; Developer Tools: </strong>
                      <span>{resumeData.technicalSkills.developerTools}</span>
                    </div>
                    <div>
                      <strong className="text-black">Core Competencies: </strong>
                      <span>{resumeData.technicalSkills.coreConcepts}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Projects Section */}
                <div className="mt-3">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1.5 text-black">
                    Projects
                  </h2>
                  <div className="space-y-2.5 text-xs">
                    {resumeData.projects.map((proj, pIdx) => (
                      <div key={pIdx}>
                        <div className="flex justify-between items-baseline flex-wrap gap-1">
                          <div>
                            <strong className="text-black">{proj.title}</strong>
                            <span className="italic text-black/80"> | {proj.techStack}</span>
                          </div>
                          <div className="text-[11px] italic text-black/80 shrink-0">
                            <span>{proj.date}</span>
                            {proj.githubUrl && (
                              <>
                                <span> | </span>
                                <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="underline text-black">
                                  GitHub
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11.5px] text-black/90 leading-snug">
                          {proj.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Competitive Programming & Achievements */}
                <div className="mt-3">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1.5 text-black">
                    Competitive Programming &amp; Achievements
                  </h2>
                  <ul className="list-disc ml-4 space-y-1 text-xs text-black/90 leading-snug">
                    {resumeData.achievements.map((item, aIdx) => (
                      <li key={aIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* RAW LATEX CODE TAB */
            <div className="max-w-[780px] mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-black/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-mono text-black">
                    Jake Gutierrez&apos;s Overleaf LaTeX Source (resume.tex)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLatex}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg text-xs font-mono font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadTex}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-mono font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save .tex</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] font-mono text-black/60">
                  Ready to compile in Overleaf or with any LaTeX engine (pdflatex / xelatex). Includes Glyphs to Unicode for 100% ATS readability.
                </p>
              </div>

              {/* Code display */}
              <div className="rounded-2xl bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-xs overflow-x-auto border-2 border-black max-h-[550px] shadow-[4px_4px_0px_rgba(0,0,0,1)] selection:bg-blue-600 selection:text-white">
                <pre>{latexSource}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
