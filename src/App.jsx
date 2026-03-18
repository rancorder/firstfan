import { useState } from "react";

// ─────────────────────────────────────────────
// FLOW DATA: question → responses → next node
// ─────────────────────────────────────────────
const FLOW = {
  START: {
    phase: "導入",
    phaseIdx: 0,
    type: "action",
    coach: "売り込み感を消す。整理屋として座る。",
    script: "『少し変な聞き方をします。』",
    sub: "── 2秒、沈黙 ──",
    question: null,
    responses: [{ label: "→ 次へ", sub: "", next: "Q1" }],
  },
  Q1: {
    phase: "停止リスク",
    phaseIdx: 1,
    type: "question",
    coach: "フラットに、事実確認するように聞く。責めない。",
    script: "この業務、明日1人抜けたら\nどうなりますか？",
    sub: null,
    question: "相手の反応は？",
    responses: [
      { label: "「大丈夫です」「問題ない」", sub: "防衛的・即答", next: "Q1_NO" },
      { label: "「困ります」「止まります」", sub: "素直に認める", next: "Q2" },
      { label: "「場合によります」", sub: "曖昧・逃げ", next: "Q1_AMB" },
    ],
  },
  Q1_NO: {
    phase: "停止リスク",
    phaseIdx: 1,
    type: "mirror",
    coach: "否定しない。そのまま言葉を返して定義させる。間を恐れない。",
    script: "大丈夫、というのは\n……？",
    sub: "── 語尾を上げて、沈黙で待つ ──",
    question: "相手が話し始めたら？",
    responses: [
      { label: "具体的に説明し始めた", sub: "扉が開いた", next: "Q1_SHAKE" },
      { label: "「本当に大丈夫です」と繰り返す", sub: "強い防衛", next: "Q1_SHAKE" },
    ],
  },
  Q1_AMB: {
    phase: "停止リスク",
    phaseIdx: 1,
    type: "question",
    coach: "「場合による」を具体化させる。焦らず。",
    script: "一番リスクが高い「場合」は\nどういう時ですか？",
    sub: null,
    question: "相手の返答は？",
    responses: [
      { label: "具体的なケースを話し始めた", sub: "", next: "Q2" },
      { label: "まだ曖昧", sub: "", next: "Q1_SHAKE" },
    ],
  },
  Q1_SHAKE: {
    phase: "停止リスク",
    phaseIdx: 1,
    type: "emotion",
    coach: "人に焦点を当てる。数字より人間の話にする。",
    script: "その時、誰の仕事が\n一番増えますか？",
    sub: null,
    question: "相手が答えたら？",
    responses: [
      { label: "特定の人・役職が出た", sub: "リアリティが出た", next: "Q2" },
      { label: "「みんなでカバー」", sub: "", next: "Q2" },
    ],
  },
  Q2: {
    phase: "崩壊ポイント",
    phaseIdx: 2,
    type: "question",
    coach: "どこが崩れるかを可視化させる。相手に地図を描かせる感覚。",
    script: "具体的にどこから\n崩れていきますか？",
    sub: null,
    question: "相手の答えは？",
    responses: [
      { label: "具体的な業務・工程を挙げた", sub: "課題が明確に", next: "Q3" },
      { label: "「崩れないと思う」", sub: "まだ防衛中", next: "Q2_PUSH" },
    ],
  },
  Q2_PUSH: {
    phase: "崩壊ポイント",
    phaseIdx: 2,
    type: "emotion",
    coach: "対立せず、未来の映像を見せる。",
    script: "例えば引き継ぎ書がない業務は\n今、何件ありますか？",
    sub: null,
    question: "相手の反応は？",
    responses: [
      { label: "思い当たる顔をした・数字が出た", sub: "", next: "Q3" },
      { label: "「しっかり管理できている」", sub: "", next: "Q3" },
    ],
  },
  Q3: {
    phase: "コスト可視化",
    phaseIdx: 3,
    type: "emotion",
    coach: "感情に数字をつける。「日数×人」で損失を見せる。",
    script: "引き継ぎが完了するまで\n何日かかりますか？\nその間の機会損失は？",
    sub: null,
    question: "相手の反応温度は？",
    responses: [
      { label: "「1週間以上かかる」「考えたことなかった」", sub: "強い課題認識", next: "Q4_HOT" },
      { label: "「数日で戻ります」", sub: "軽い課題認識", next: "Q4_MILD" },
    ],
  },
  Q4_HOT: {
    phase: "判断構造",
    phaseIdx: 4,
    type: "question",
    coach: "相手がすでに動いている。判断軸を引き出す。",
    script: "その状況で、あなたは\n何を基準に判断しますか？",
    sub: null,
    question: "相手の答えは？",
    responses: [
      { label: "明確な基準・数字・人名が出た", sub: "", next: "Q5" },
      { label: "「その時考えます」", sub: "", next: "Q4_VAGUE" },
    ],
  },
  Q4_MILD: {
    phase: "判断構造",
    phaseIdx: 4,
    type: "question",
    coach: "軽く見ている。未来に引っ張る。",
    script: "それ、半年後も同じスピードで\n戻せる自信はありますか？",
    sub: null,
    question: "相手の反応は？",
    responses: [
      { label: "少し不安そうになった", sub: "", next: "Q4_HOT" },
      { label: "「大丈夫です」", sub: "", next: "Q4_HOT" },
    ],
  },
  Q4_VAGUE: {
    phase: "判断構造",
    phaseIdx: 4,
    type: "question",
    coach: "判断の根拠がない状態を自覚させる。",
    script: "今、その判断に使える\n情報はどこにありますか？",
    sub: null,
    question: "相手の返答は？",
    responses: [
      { label: "「…整理されていない」「ない」", sub: "", next: "Q5" },
      { label: "「ここにあります」", sub: "", next: "Q5" },
    ],
  },
  Q5: {
    phase: "仮説合意",
    phaseIdx: 5,
    type: "silence",
    coach: "断言しない。仮説として提示し、相手に言わせる。最後は沈黙。",
    script: "つまり ──\n「担当者に依存した判断構造」\nになっている、ということですか？",
    sub: "── 相手が自分で言うまで待つ ──",
    question: "相手の返応は？",
    responses: [
      { label: "「そうです、まさに」「そうなりますね」", sub: "合意成立", next: "Q6" },
      { label: "「少し違います」「そこまでは…」", sub: "ズレあり", next: "Q5_RETRY" },
    ],
  },
  Q5_RETRY: {
    phase: "仮説合意",
    phaseIdx: 5,
    type: "question",
    coach: "修正を求めない。相手に定義させる。",
    script: "なるほど。どういう構造に\n近いと感じますか？",
    sub: null,
    question: "相手が話したら？",
    responses: [
      { label: "構造を自分の言葉で話し始めた", sub: "", next: "Q6" },
    ],
  },
  Q6: {
    phase: "逆張り",
    phaseIdx: 6,
    type: "danger",
    coach: "引くことで引力を生む。急がせない。この一言の前に0.5秒の間を作る。",
    script: "正直に言うと ──\nうちが必要ない会社も\n結構あります。",
    sub: "── 相手の顔を見て待つ ──",
    question: "相手の反応は？",
    responses: [
      { label: "「どういう会社が必要ないんですか？」", sub: "引き寄せられた", next: "Q7" },
      { label: "「そうですか」（冷静）", sub: "まだ距離がある", next: "Q6_BRIDGE" },
    ],
  },
  Q6_BRIDGE: {
    phase: "逆張り",
    phaseIdx: 6,
    type: "question",
    coach: "距離がある時は未来の映像で引っ張る。",
    script: "同じことが半年後に起きたとして\nその時、どこを見ますか？",
    sub: null,
    question: "相手の返答は？",
    responses: [
      { label: "具体的な指標・名前が出た", sub: "", next: "Q7" },
      { label: "「考えてみます」", sub: "", next: "Q7" },
    ],
  },
  Q7: {
    phase: "限界認識",
    phaseIdx: 7,
    type: "question",
    coach: "攻めない。鏡を見せるだけ。",
    script: "今の体制で\nそれを防ぎ切れそうですか？",
    sub: null,
    question: "相手の答えは？",
    responses: [
      { label: "「正直難しいです」「厳しいですね」", sub: "自覚あり", next: "Q8_AWARE" },
      { label: "「たぶん大丈夫です」", sub: "まだ防衛", next: "Q7_BLOCK" },
    ],
  },
  Q7_BLOCK: {
    phase: "限界認識",
    phaseIdx: 7,
    type: "question",
    coach: "ボトルネックを聞く。ポジティブな入り口から。",
    script: "今の体制で\n一番の課題は何だと思いますか？",
    sub: null,
    question: "相手の返答は？",
    responses: [
      { label: "人・時間・仕組みの話が出た", sub: "", next: "Q7_MIRROR" },
      { label: "「特にないです」", sub: "", next: "Q8_AWARE" },
    ],
  },
  Q7_MIRROR: {
    phase: "限界認識",
    phaseIdx: 7,
    type: "silence",
    coach: "矛盾を指摘する。しかし論破しない。静かに鏡を向ける。",
    script: "それが解決すれば\n防げる、ということですね？",
    sub: "── 相手が自分で答えるのを待つ ──",
    question: "相手の反応は？",
    responses: [
      { label: "「そうなりますね」と認めた", sub: "", next: "Q8_AWARE" },
    ],
  },
  Q8_AWARE: {
    phase: "自覚・言語化",
    phaseIdx: 8,
    type: "emotion",
    coach: "相手の口から言わせる。絶対にこちらから答えを言わない。",
    script: "要するに、\n今一番の課題は何ですか？",
    sub: "── 沈黙しても待つ ──",
    question: "相手が話し始めたら？",
    responses: [
      { label: "課題を自分の言葉で言語化した", sub: "最重要の瞬間", next: "Q9" },
      { label: "「整理できていない」", sub: "", next: "Q9" },
    ],
  },
  Q9: {
    phase: "制約確認",
    phaseIdx: 9,
    type: "question",
    coach: "体制・予算・決裁者を確認。責めず、確認するだけ。",
    script: "ちなみに──\n動く場合、誰が最後に\n判断しますか？",
    sub: null,
    question: "相手の返答は？",
    responses: [
      { label: "「私です」「上司です」「会議が必要」", sub: "", next: "Q10" },
    ],
  },
  Q10: {
    phase: "料金提示",
    phaseIdx: 10,
    type: "action",
    coach: "3パターン提示。説明しすぎない。真ん中を選ばせる設計。",
    script: "では3パターンだけ\n見てもらえますか？\n御社の規模だとこのあたりです。",
    sub: null,
    question: "相手の反応は？",
    responses: [
      { label: "「検討したい」「数字を持ち帰る」", sub: "", next: "CLOSE" },
      { label: "「高い」「予算が…」", sub: "", next: "Q10_BUDGET" },
    ],
  },
  Q10_BUDGET: {
    phase: "料金提示",
    phaseIdx: 10,
    type: "danger",
    coach: "退場テクニック。急がせない姿勢を見せることで引力を生む。",
    script: "正直、急ぐ必要はないです。\nただ ──\n今確認した課題は\n来月も同じですよね？",
    sub: "── 相手が引き止める状態を作る ──",
    question: "相手の反応は？",
    responses: [
      { label: "「確かに…」「もう少し聞かせて」", sub: "引き止められた", next: "CLOSE" },
      { label: "「また連絡します」", sub: "", next: "CLOSE" },
    ],
  },
  CLOSE: {
    phase: "2次商談へ",
    phaseIdx: 11,
    type: "goal",
    coach: "相手が引き止める状態で終わる。こちらから押さない。",
    script: "では御社のケースで\n数字を出させてください。\n次回、30分いただけますか？",
    sub: null,
    question: null,
    responses: [],
  },
};

const TYPE_CONFIG = {
  question: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", label: "QUESTION", emoji: "❓" },
  mirror:   { color: "#fb923c", bg: "rgba(251,146,60,0.08)",  label: "SILENCE",  emoji: "🪞" },
  emotion:  { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  label: "EMOTION",  emoji: "⚡" },
  silence:  { color: "#fb923c", bg: "rgba(251,146,60,0.08)",  label: "SILENCE",  emoji: "🤫" },
  danger:   { color: "#f87171", bg: "rgba(248,113,113,0.08)", label: "PULL BACK",emoji: "↩" },
  action:   { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", label: "ACTION",   emoji: "▶" },
  goal:     { color: "#34d399", bg: "rgba(52,211,153,0.08)",  label: "GOAL",     emoji: "✅" },
};

const PHASES = ["導入","停止リスク","崩壊ポイント","コスト可視化","判断構造","仮説合意","逆張り","限界認識","自覚・言語化","制約確認","料金提示","2次商談へ"];

const HISTORY_LABELS = {
  START:"導入フック", Q1:"停止リスク質問", Q1_NO:"鏡テク", Q1_AMB:"曖昧深掘り", Q1_SHAKE:"揺さぶり",
  Q2:"崩壊ポイント", Q2_PUSH:"引き継ぎ確認", Q3:"コスト可視化", Q4_HOT:"判断基準", Q4_MILD:"未来引っ張り",
  Q4_VAGUE:"判断根拠", Q5:"仮説提示", Q5_RETRY:"再定義", Q6:"先制自己否定", Q6_BRIDGE:"未来視点",
  Q7:"限界認識", Q7_BLOCK:"ボトルネック", Q7_MIRROR:"自己矛盾", Q8_AWARE:"必要性言語化",
  Q9:"制約確認", Q10:"料金提示", Q10_BUDGET:"退場テク", CLOSE:"2次商談へ",
};

export default function SalesNavigator() {
  const [current, setCurrent] = useState("START");
  const [history, setHistory] = useState(["START"]);
  const [view, setView] = useState("live"); // "live" | "map"
  const [animKey, setAnimKey] = useState(0);

  const node = FLOW[current];
  const tc = TYPE_CONFIG[node.type];

  const go = (next) => {
    setHistory(h => [...h, next]);
    setCurrent(next);
    setAnimKey(k => k + 1);
  };

  const back = () => {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setHistory(h => h.slice(0, -1));
    setCurrent(prev);
    setAnimKey(k => k + 1);
  };

  const reset = () => {
    setCurrent("START");
    setHistory(["START"]);
    setAnimKey(k => k + 1);
  };

  const progress = Math.round((node.phaseIdx / (PHASES.length - 1)) * 100);

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#0a0a0f", minHeight: "100vh", color: "#e2e8f0" }}>

      {/* ── Top Bar ── */}
      <div style={{ background: "#111118", borderBottom: "1px solid #1e1e2e", padding: "12px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: "#4a4a6a", letterSpacing: "0.15em", textTransform: "uppercase" }}>0.01% Sales Navigator</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>商談ナビゲーター</div>
            </div>
            {/* View toggle */}
            <div style={{ display: "flex", gap: 4, background: "#1a1a2e", borderRadius: 8, padding: 3 }}>
              {["live","map"].map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                    background: view === v ? "#2a2a4e" : "transparent",
                    color: view === v ? "#a78bfa" : "#4a4a6a", transition: "all 0.15s" }}>
                  {v === "live" ? "🔴 LIVE" : "📋 MAP"}
                </button>
              ))}
            </div>
          </div>

          {/* Phase progress */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {PHASES.map((p, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                background: i < node.phaseIdx ? "#a78bfa" : i === node.phaseIdx ? tc.color : "#1e1e2e",
                transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: tc.color, fontWeight: 700 }}>{node.phase}</span>
            <span style={{ fontSize: 10, color: "#4a4a6a" }}>{node.phaseIdx + 1} / {PHASES.length}</span>
          </div>
        </div>
      </div>

      {/* ── LIVE VIEW ── */}
      {view === "live" && (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 120px" }}>

          {/* Type badge */}
          <div key={`badge-${animKey}`} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
            animation: "fadeSlide 0.25s ease" }}>
            <div style={{ background: tc.bg, border: `1px solid ${tc.color}`, borderRadius: 6,
              padding: "3px 10px", fontSize: 11, fontWeight: 700, color: tc.color, letterSpacing: "0.1em" }}>
              {tc.emoji} {tc.label}
            </div>
            <div style={{ fontSize: 11, color: "#3a3a5a" }}>{current}</div>
          </div>

          {/* Coach tip */}
          <div key={`coach-${animKey}`} style={{ background: "#111118", border: "1px solid #1e1e2e",
            borderLeft: `3px solid #4a4a6a`, borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            fontSize: 12, color: "#6a6a8a", lineHeight: 1.6, animation: "fadeSlide 0.3s ease" }}>
            💡 {node.coach}
          </div>

          {/* Main script card */}
          <div key={`script-${animKey}`} style={{ background: tc.bg, border: `1.5px solid ${tc.color}33`,
            borderRadius: 16, padding: "24px 20px", marginBottom: 8, animation: "fadeSlide 0.3s ease",
            boxShadow: `0 0 30px ${tc.color}11` }}>
            <div style={{ fontSize: 11, color: `${tc.color}99`, letterSpacing: "0.1em", marginBottom: 12,
              textTransform: "uppercase" }}>あなたが言う言葉</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.6,
              whiteSpace: "pre-line", letterSpacing: "0.02em" }}>
              {node.script}
            </div>
            {node.sub && (
              <div style={{ marginTop: 12, fontSize: 13, color: "#fb923c", fontStyle: "italic" }}>{node.sub}</div>
            )}
          </div>

          {/* Question label */}
          {node.question && (
            <div key={`q-${animKey}`} style={{ textAlign: "center", fontSize: 13, color: "#6a6a8a",
              margin: "20px 0 12px", animation: "fadeSlide 0.35s ease" }}>
              ▼ {node.question}
            </div>
          )}

          {/* Response buttons */}
          <div key={`resp-${animKey}`} style={{ display: "flex", flexDirection: "column", gap: 10,
            animation: "fadeSlide 0.4s ease" }}>
            {node.responses.map((r, i) => (
              <button key={i} onClick={() => go(r.next)}
                style={{ width: "100%", textAlign: "left", padding: "16px 18px",
                  background: "#111118", border: "1.5px solid #1e1e2e", borderRadius: 12, cursor: "pointer",
                  transition: "all 0.15s", color: "#e2e8f0" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = tc.color; e.currentTarget.style.background = tc.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e2e"; e.currentTarget.style.background = "#111118"; }}
                onTouchStart={e => { e.currentTarget.style.borderColor = tc.color; e.currentTarget.style.background = tc.bg; }}
                onTouchEnd={e => { e.currentTarget.style.borderColor = "#1e1e2e"; e.currentTarget.style.background = "#111118"; }}>
                <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>{r.label}</div>
                {r.sub && <div style={{ fontSize: 11, color: "#4a4a6a", marginTop: 3 }}>{r.sub}</div>}
                <div style={{ float: "right", fontSize: 16, color: "#3a3a5a", marginTop: -20 }}>›</div>
              </button>
            ))}

            {/* Goal end state */}
            {node.type === "goal" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                <div style={{ fontSize: 16, color: "#34d399", fontWeight: 700, marginBottom: 4 }}>商談完了</div>
                <div style={{ fontSize: 13, color: "#4a4a6a" }}>相手が引き止める状態で終わる</div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0,
            background: "#0a0a0f", borderTop: "1px solid #1e1e2e", padding: "12px 16px",
            display: "flex", gap: 10, maxWidth: 640, margin: "0 auto" }}>
            <button onClick={back} disabled={history.length <= 1}
              style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #1e1e2e",
                background: "transparent", color: history.length > 1 ? "#a0a0c0" : "#2a2a3a",
                cursor: history.length > 1 ? "pointer" : "default", fontSize: 14, fontWeight: 600 }}>
              ← 戻る
            </button>
            <button onClick={reset}
              style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #1e1e2e",
                background: "transparent", color: "#a0a0c0", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              ↺ リセット
            </button>
          </div>
        </div>
      )}

      {/* ── MAP VIEW ── */}
      {view === "map" && (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
          <div style={{ fontSize: 12, color: "#4a4a6a", marginBottom: 16 }}>
            全パターン一覧 ── タップで詳細
          </div>

          {/* History trail */}
          {history.length > 1 && (
            <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 10,
              padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#4a4a6a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                今回のルート
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {history.map((h, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4,
                    background: h === current ? "#a78bfa22" : "#1e1e2e",
                    color: h === current ? "#a78bfa" : "#6a6a8a",
                    border: h === current ? "1px solid #a78bfa" : "1px solid transparent" }}>
                    {HISTORY_LABELS[h] || h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All nodes grouped by phase */}
          {PHASES.map((phase, pi) => {
            const phaseNodes = Object.entries(FLOW).filter(([, n]) => n.phaseIdx === pi);
            if (!phaseNodes.length) return null;
            return (
              <div key={phase} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#6a6a8a", textTransform: "uppercase",
                  letterSpacing: "0.12em", marginBottom: 6, paddingLeft: 4 }}>
                  {`PHASE ${pi + 1} — ${phase}`}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {phaseNodes.map(([id, n]) => {
                    const t = TYPE_CONFIG[n.type];
                    const isVisited = history.includes(id);
                    const isCurrent = id === current;
                    return (
                      <button key={id} onClick={() => { setCurrent(id); setView("live"); }}
                        style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10,
                          border: isCurrent ? `1.5px solid ${t.color}` : isVisited ? "1px solid #2a2a4a" : "1px solid #1e1e2e",
                          background: isCurrent ? t.bg : isVisited ? "#111118" : "#0d0d18",
                          cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4,
                            background: `${t.color}22`, color: t.color, fontWeight: 700,
                            letterSpacing: "0.08em", flexShrink: 0 }}>
                            {t.emoji} {t.label}
                          </span>
                          <span style={{ fontSize: 13, color: isCurrent ? "#fff" : isVisited ? "#a0a0c0" : "#6a6a8a",
                            fontWeight: isCurrent ? 700 : 400 }}>
                            {HISTORY_LABELS[id] || id}
                          </span>
                          {isCurrent && <span style={{ marginLeft: "auto", fontSize: 10, color: t.color, flexShrink: 0 }}>● 現在地</span>}
                          {isVisited && !isCurrent && <span style={{ marginLeft: "auto", fontSize: 10, color: "#3a3a6a", flexShrink: 0 }}>✓</span>}
                        </div>
                        {n.script && (
                          <div style={{ fontSize: 11, color: "#4a4a6a", marginTop: 4, lineHeight: 1.4,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {n.script.replace(/\n/g, " ")}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}
