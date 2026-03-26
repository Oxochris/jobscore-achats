import { useState, useRef } from "react";

const SYSTEM_PROMPT = `Tu es un expert en recrutement achats industriels. Tu dois évaluer la pertinence d'une offre d'emploi pour Christophe Malgras.

PROFIL DE CHRISTOPHE MALGRAS :
- 30 ans d'expérience en achats, dont les 4 dernières années en management de transition
- Basé à Lille / Hauts-de-France
- Spécialiste : Achats CAPEX/OPEX industriels, management de crise, structuration de fonction achats
- Dernières missions : Responsable Achats site industriel Magnera (70M€), Chef de Groupe Achats Descours & Cabaud (306M€)
- Expertise : Maintenance MRO, appels d'offres techniques, ingénieurs process/production/maintenance
- RSE/Achats responsables Black Belt (SWOTT), certification Bilan Carbone Achats
- Double culture : industrie lourde + retail (Auchan, Castorama, La Redoute, Carrefour)
- Sourcing international Asie, anglais professionnel
- Management équipes achats jusqu'à 7 personnes, création de fonction achats ex-nihilo

RÔLES CIBLÉS : Acheteur industriel / CAPEX Buyer, Responsable Achats, Directeur Achats, Manager de Transition Achats, Chef de Groupe Achats, Consultant Achats

SECTEURS PRÉFÉRÉS (bonus) : Industrie, Distribution B2B industrielle, Énergie/décarbonation, Retail (tous types)

ZONE : Hauts-de-France prioritaire, National + télétravail acceptable

CRITÈRES ÉLIMINATOIRES : Postes juniors uniquement (< 3 ans exp requise)

CRITÈRES BONUS : CAPEX/OPEX, gestion de crise, management relais, RSE achats, structuration fonction achats, Hauts-de-France/télétravail

Retourne UNIQUEMENT un objet JSON valide sans markdown ni backticks :
{"score":<0-10>,"titre_detecte":"<titre>","entreprise_detectee":"<entreprise>","type_contrat":"<CDI|Mission|CDD|Freelance|Inconnu>","localisation":"<ville>","verdict":"<Excellent match|Bon match|Match partiel|Faible match|Hors cible>","points_forts":["<p1>","<p2>","<p3>"],"points_faibles":["<p1>","<p2>"],"recommandation":"<action>","mots_cles_manquants":["<m1>","<m2>"],"raison_score":"<2-3 phrases>"}`;

const scoreCfg = (s) => {
  if (s >= 8) return { color: "#22c55e", bg: "#052e16", ring: "#16a34a" };
  if (s >= 6) return { color: "#84cc16", bg: "#1a2e05", ring: "#65a30d" };
  if (s >= 4) return { color: "#f59e0b", bg: "#2d1f00", ring: "#d97706" };
  if (s >= 2) return { color: "#f97316", bg: "#2d1000", ring: "#ea580c" };
  return { color: "#ef4444", bg: "#2d0000", ring: "#dc2626" };
};

const Tag = ({ children, color = "#334155", bg = "#0f172a" }) => (
  <span style={{ background: bg, color, border: `1px solid ${color}30`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>{children}</span>
);

const ScoreRing = ({ score }) => {
  const c = scoreCfg(score), r = 54, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="#1a1a2a" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={c.ring} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 10) * circ}
          style={{ transition: "stroke-dashoffset 1s ease", strokeLinecap: "round" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: c.color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: c.color, opacity: 0.7, fontFamily: "'DM Mono',monospace" }}>/10</span>
      </div>
    </div>
  );
};

const ResultCard = ({ result, onSave }) => {
  const c = scoreCfg(result.score);
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ background: "linear-gradient(135deg,#0d0d1a,#0a0f1e)", border: `1px solid ${c.ring}40`, borderRadius: 16, padding: "28px 32px", marginTop: 24, boxShadow: `0 0 40px ${c.ring}15`, animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 24 }}>
        <ScoreRing score={result.score} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <Tag color={c.color} bg={c.bg}>{result.verdict}</Tag>
            {result.type_contrat !== "Inconnu" && <Tag color="#94a3b8">{result.type_contrat}</Tag>}
            {result.localisation && <Tag color="#64748b">📍 {result.localisation}</Tag>}
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{result.titre_detecte || "Poste détecté"}</h2>
          {result.entreprise_detectee && <div style={{ color: "#64748b", fontSize: 13, fontFamily: "'DM Mono',monospace" }}>{result.entreprise_detectee}</div>}
          <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 13, lineHeight: 1.6, fontStyle: "italic" }}>{result.raison_score}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#052e1620", border: "1px solid #16a34a30", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ color: "#22c55e", fontSize: 11, fontFamily: "'DM Mono',monospace", marginBottom: 10, letterSpacing: "0.1em" }}>✓ POINTS FORTS</div>
          {result.points_forts?.map((p, i) => <div key={i} style={{ color: "#86efac", fontSize: 13, marginBottom: 6, display: "flex", gap: 8 }}><span style={{ color: "#16a34a", flexShrink: 0 }}>→</span>{p}</div>)}
        </div>
        <div style={{ background: "#2d000020", border: "1px solid #ef444430", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ color: "#ef4444", fontSize: 11, fontFamily: "'DM Mono',monospace", marginBottom: 10, letterSpacing: "0.1em" }}>✗ POINTS FAIBLES</div>
          {result.points_faibles?.length > 0
            ? result.points_faibles.map((p, i) => <div key={i} style={{ color: "#fca5a5", fontSize: 13, marginBottom: 6, display: "flex", gap: 8 }}><span style={{ color: "#ef4444", flexShrink: 0 }}>→</span>{p}</div>)
            : <div style={{ color: "#475569", fontSize: 13 }}>Aucun point bloquant</div>}
        </div>
      </div>
      {result.mots_cles_manquants?.length > 0 && (
        <div style={{ background: "#1a0f0020", border: "1px solid #f59e0b30", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ color: "#f59e0b", fontSize: 11, fontFamily: "'DM Mono',monospace", marginBottom: 10, letterSpacing: "0.1em" }}>⚡ MOTS-CLÉS À INTÉGRER DANS LE CV</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{result.mots_cles_manquants.map((m, i) => <Tag key={i} color="#fcd34d" bg="#2d1f00">{m}</Tag>)}</div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 16px", flex: 1 }}>
          <span style={{ color: "#38bdf8", fontSize: 12 }}>💡 </span>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>{result.recommandation}</span>
        </div>
        <button onClick={() => { onSave(result); setSaved(true); }} disabled={saved} style={{ background: saved ? "#1a2e05" : "linear-gradient(135deg,#16a34a,#15803d)", color: saved ? "#22c55e" : "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: saved ? "default" : "pointer", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>
          {saved ? "✓ Sauvegardé" : "💾 Sauvegarder"}
        </button>
      </div>
    </div>
  );
};

const HistoryCard = ({ item, onDelete }) => {
  const c = scoreCfg(item.score);
  return (
    <div style={{ background: "#0a0f1e", border: `1px solid ${c.ring}30`, borderRadius: 10, padding: "14px 18px", marginBottom: 8, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: c.bg, border: `2px solid ${c.ring}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: c.color, fontWeight: 800, fontSize: 16, fontFamily: "'Syne',sans-serif" }}>{item.score}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.titre_detecte}</div>
        <div style={{ color: "#475569", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>{item.entreprise_detectee || "Entreprise non précisée"} · {item.type_contrat} · {new Date(item.date).toLocaleDateString("fr-FR")}</div>
      </div>
      <Tag color={c.color} bg={c.bg}>{item.verdict}</Tag>
      <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 18, padding: "4px 8px" }}>×</button>
    </div>
  );
};

export default function JobScorer() {
  const [mode, setMode] = useState("paste"); // "paste" | "upload"
  const [text, setText] = useState("");
  const [fileData, setFileData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("scorer");
  const fileRef = useRef(null);

  const extractPdfText = async (arrayBuffer) => {
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = resolve; script.onerror = reject;
        document.head.appendChild(script);
      });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item) => item.str).join(" ") + "
";
    }
    return fullText;
  };

  const readFile = async (file) => {
    if (!file) return;
    setResult(null); setError(null);
    if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractPdfText(arrayBuffer);
        setFileData({ name: file.name, isPdf: false, text });
      } catch {
        setError("Impossible de lire ce PDF. Essayez de le convertir en TXT.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setFileData({ name: file.name, isPdf: false, text: e.target.result });
      reader.readAsText(file, "utf-8");
    }
  };

  const reset = () => { setFileData(null); setResult(null); setError(null); if (fileRef.current) fileRef.current.value = ""; };

  const hasContent = mode === "paste" ? text.trim().length > 0 : fileData !== null;

  const analyser = async () => {
    if (!hasContent) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const content = mode === "paste" ? text : fileData?.text || "";
      const messages = [{ role: "user", content: `Analyse cette offre d'emploi :\n\n${content}` }];
      const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages };
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      setResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setError("Erreur d'analyse. Vérifiez que le contenu est une offre d'emploi lisible."); }
    finally { setLoading(false); }
  };

  const saveResult = (r) => setHistory(prev => [{ ...r, id: Date.now(), date: new Date().toISOString() }, ...prev]);
  const deleteHistory = (id) => setHistory(prev => prev.filter(h => h.id !== id));
  const avgScore = history.length > 0 ? (history.reduce((a, b) => a + b.score, 0) / history.length).toFixed(1) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#060812", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        button:hover { opacity:0.88; }
        textarea:focus { outline:none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#060812} ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg,#0d0f20,#060812)", borderBottom: "1px solid #1e293b", padding: "24px 32px 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎯</div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.02em" }}>JobScore Achats</h1>
              <div style={{ fontSize: 11, color: "#334155", fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>CHRISTOPHE MALGRAS · PROFIL ACHATS INDUSTRIELS</div>
            </div>
            {history.length > 0 && (
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8", fontFamily: "'Syne',sans-serif" }}>{avgScore}</div>
                <div style={{ fontSize: 10, color: "#475569", fontFamily: "'DM Mono',monospace" }}>MOY. / 10</div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", marginTop: 20 }}>
            {[{ id: "scorer", label: "Analyser une annonce" }, { id: "history", label: `Historique (${history.length})` }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: "none", border: "none", borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent", color: activeTab === tab.id ? "#e2e8f0" : "#475569", padding: "10px 20px", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: -1, transition: "all 0.15s" }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 32px 60px" }}>

        {activeTab === "scorer" && (
          <>
            {/* MODE SELECTOR */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[{ id: "paste", icon: "📋", label: "Coller le texte" }, { id: "upload", icon: "📂", label: "Importer un fichier" }].map(m => (
                <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setError(null); }} style={{
                  background: mode === m.id ? "#0d1f35" : "#0a0f1e",
                  border: `1px solid ${mode === m.id ? "#3b82f6" : "#1e293b"}`,
                  borderRadius: 8, padding: "9px 18px", color: mode === m.id ? "#e2e8f0" : "#475569",
                  cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                  display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s"
                }}>
                  <span>{m.icon}</span><span>{m.label}</span>
                </button>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#1e3a5f", fontFamily: "'DM Mono',monospace", alignSelf: "center" }}>
                {mode === "upload" ? "PDF, TXT, DOCX, MD" : "Depuis LinkedIn, Indeed, HelloWork..."}
              </div>
            </div>

            {/* ZONE COLLER */}
            {mode === "paste" && (
              <div style={{ marginBottom: 16 }}>
                <textarea
                  value={text}
                  onChange={e => { setText(e.target.value); setResult(null); }}
                  placeholder={"Collez ici le texte complet de l'offre d'emploi...\n\nTitre du poste, description, entreprise, localisation, compétences requises..."}
                  rows={10}
                  style={{ width: "100%", background: "#0d0f20", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 18px", color: "#e2e8f0", fontSize: 14, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "#1e293b"}
                />
                {text && (
                  <div style={{ textAlign: "right", marginTop: 6, fontSize: 11, color: "#334155", fontFamily: "'DM Mono',monospace" }}>{text.length} caractères</div>
                )}
              </div>
            )}

            {/* ZONE UPLOAD */}
            {mode === "upload" && (
              <div style={{ marginBottom: 16 }}>
                {!fileData ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current?.click()}
                    style={{ border: `2px dashed ${dragOver ? "#3b82f6" : "#1e293b"}`, borderRadius: 12, padding: "52px 24px", textAlign: "center", cursor: "pointer", background: dragOver ? "#0d1f3c" : "#0d0f20", transition: "all 0.2s" }}
                  >
                    <div style={{ fontSize: 44, marginBottom: 14 }}>📂</div>
                    <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Déposez votre fichier ici</div>
                    <div style={{ color: "#475569", fontSize: 13, marginBottom: 18 }}>ou cliquez pour parcourir</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {["PDF", "TXT", "DOCX", "MD"].map(f => <Tag key={f} color="#334155" bg="#0f172a">{f}</Tag>)}
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf,.txt,.docx,.html,.md" onChange={(e) => readFile(e.target.files[0])} style={{ display: "none" }} />
                  </div>
                ) : (
                  <div style={{ background: "#0d1f35", border: "1px solid #1e4a80", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ fontSize: 30 }}>{fileData.name?.endsWith(".pdf") ? "📕" : "📄"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{fileData.name}</div>
                      <div style={{ color: "#38bdf8", fontSize: 12, fontFamily: "'DM Mono',monospace", marginTop: 3 }}>✓ Fichier chargé — prêt pour l'analyse</div>
                    </div>
                    <button onClick={reset} style={{ background: "none", border: "1px solid #1e3a5f", borderRadius: 8, color: "#475569", cursor: "pointer", padding: "6px 14px", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>Changer</button>
                  </div>
                )}
              </div>
            )}

            {/* BOUTON */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 0 }}>
              <button onClick={analyser} disabled={loading || !hasContent} style={{ background: loading || !hasContent ? "#1e293b" : "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: loading || !hasContent ? "#475569" : "#fff", border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 600, cursor: loading || !hasContent ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
                {loading ? (<><div style={{ width: 16, height: 16, border: "2px solid #475569", borderTop: "2px solid #94a3b8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Analyse en cours...</>) : "🎯 Analyser l'annonce"}
              </button>
              {(text || fileData) && !loading && (
                <button onClick={() => { setText(""); reset(); }} style={{ background: "none", border: "1px solid #1e293b", borderRadius: 10, padding: "13px 16px", color: "#475569", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>Effacer</button>
              )}
            </div>

            {error && <div style={{ marginTop: 16, background: "#2d000030", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 13 }}>⚠️ {error}</div>}
            {result && <ResultCard result={result} onSave={saveResult} />}

            {!result && !loading && !hasContent && (
              <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { icon: "📋", title: "Coller", desc: "Copiez le texte depuis LinkedIn, Indeed, HelloWork et collez-le ici" },
                  { icon: "📂", title: "Importer", desc: "Ou déposez directement le fichier PDF / Word de l'annonce" },
                  { icon: "🎯", title: "Score /10", desc: "Claude analyse vs votre profil et détaille les points forts, faibles et mots-clés" },
                ].map((c, i) => (
                  <div key={i} style={{ background: "#0d0f20", border: "1px solid #1e293b", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                    <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.5 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "history" && (
          history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13 }}>Aucune annonce sauvegardée — analysez et sauvegardez depuis l'onglet Analyser</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Annonces", val: history.length, color: "#38bdf8" },
                  { label: "Score moyen", val: `${avgScore}/10`, color: "#22c55e" },
                  { label: "Excellent (≥8)", val: history.filter(h => h.score >= 8).length, color: "#84cc16" },
                  { label: "À éviter (<4)", val: history.filter(h => h.score < 4).length, color: "#ef4444" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#0d0f20", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {[...history].sort((a, b) => b.score - a.score).map(item => <HistoryCard key={item.id} item={item} onDelete={deleteHistory} />)}
            </>
          )
        )}
      </div>
    </div>
  );
}
