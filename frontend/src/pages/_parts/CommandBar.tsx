import { useState } from 'react';
import { ragQuery, draft410A } from '../../lib/api';
import { Sparkles, Search, FileSignature } from 'lucide-react';

export default function CommandBar() {
  const [q, setQ] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [loanFor410A, setLoanFor410A] = useState('');

  async function go() {
    const res = await ragQuery(q);
    setAnswers(res.answers || []);
  }

  async function draft() {
    if (!loanFor410A) return;
    const res = await draft410A(loanFor410A);
    alert(`410A draft ready (skeleton): confidence ${res.confidence}. Review fields in console.`);
    console.log(res);
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2" size={16}/>
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter') go(); }} 
            placeholder="Ask: e.g., show references to escrow advances in bankruptcy filings" 
            className="w-full pl-8 pr-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm"
          />
        </div>
        <button onClick={go} className="px-3 py-2 bg-slate-800 rounded-md text-sm flex items-center gap-2">
          <Sparkles size={16}/> Ask
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <input 
          value={loanFor410A} 
          onChange={e => setLoanFor410A(e.target.value)} 
          placeholder="Loan ID for 410A draft…" 
          className="pl-3 pr-3 py-2 rounded-md bg-slate-900 border border-slate-800 text-sm"
        />
        <button onClick={draft} className="px-3 py-2 bg-slate-800 rounded-md text-sm flex items-center gap-2">
          <FileSignature size={16}/> Draft 410A
        </button>
      </div>
      
      {answers.length > 0 && (
        <div className="rounded-xl border border-slate-800 p-3 bg-slate-900/40">
          <div className="text-xs text-slate-400 mb-2">Answers</div>
          <ul className="grid gap-3">
            {answers.map((a, i) => (
              <li key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-500 mb-1">
                  doc: {a.doc_id} {a.loan_id ? `(loan ${a.loan_id})` : ''} • similarity: {a.similarity}
                </div>
                <div className="text-sm whitespace-pre-wrap">{a.text}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}