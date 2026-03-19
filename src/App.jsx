import { useState } from "react";

// ═══════════════════════════════════════════════════
//  PATTERN 1：汎用 0.01% フロー
//  「この業務、1人抜けたら止まりますか？」
//  ── 業種・商材問わず使える構造設計型
// ═══════════════════════════════════════════════════
const FLOW_P1 = {
  START: {
    phase:"導入", pi:0, type:"hook",
    you:"少し変な聞き方をします。",
    tip:"売り込み感を消す。「整理屋として座る」姿勢。この一言の後に2秒の沈黙を作る。",
    q:"相手の反応は？",
    opts:[
      { l:"「どうぞ」「はい」と受け入れた", n:"", nx:"Q1" },
      { l:"少し警戒した顔をしている",        n:"", nx:"Q1" },
    ],
  },
  Q1: {
    phase:"停止リスク", pi:1, type:"question",
    you:"この業務——\n明日1人抜けたら\n止まりますか？",
    tip:"フラットに、事実確認するように聞く。責めない。相手の「反応温度」を見る。",
    q:"相手の反応温度は？",
    opts:[
      { l:"「大丈夫です」「問題ない」",             n:"防衛的・即答",  nx:"Q1_NO"  },
      { l:"「止まります」「困ります」",             n:"素直に認める",  nx:"Q2"     },
      { l:"「場合によります」「部署によります」",   n:"曖昧",          nx:"Q1_AMB" },
    ],
  },
  Q1_NO: {
    phase:"停止リスク", pi:1, type:"mirror",
    you:"大丈夫、というのは\n……？",
    tip:"語尾を上げて、沈黙で待つ。否定しない。相手に「大丈夫」を定義させる。",
    q:"相手が話し始めたら？",
    opts:[
      { l:"具体的に説明し始めた",           n:"扉が開いた", nx:"Q1_SHAKE" },
      { l:"「本当に大丈夫です」と繰り返す", n:"強い防衛",   nx:"Q1_SHAKE" },
    ],
  },
  Q1_AMB: {
    phase:"停止リスク", pi:1, type:"question",
    you:"一番リスクが高い「場合」は\nどういう時ですか？",
    tip:"「場合による」を具体化させる。焦らず。",
    q:"相手の返答は？",
    opts:[
      { l:"具体的なケースを話し始めた", n:"", nx:"Q2"      },
      { l:"まだ曖昧",                   n:"", nx:"Q1_SHAKE" },
    ],
  },
  Q1_SHAKE: {
    phase:"停止リスク", pi:1, type:"emotion",
    you:"その時、誰の仕事が\n一番増えますか？",
    tip:"人に焦点を当てる。数字より人間の話にする。",
    q:"相手が答えたら？",
    opts:[
      { l:"特定の人・役職が出た",       n:"リアリティが出た", nx:"Q2" },
      { l:"「みんなでカバーします」",   n:"",                 nx:"Q2" },
    ],
  },
  Q2: {
    phase:"崩壊ポイント", pi:2, type:"question",
    you:"具体的にどこから\n崩れていきますか？",
    tip:"相手に地図を描かせる感覚。どこが崩れるかを可視化させる。",
    q:"相手の答えは？",
    opts:[
      { l:"具体的な業務・工程を挙げた", n:"課題が明確に", nx:"Q3"      },
      { l:"「崩れないと思う」",         n:"まだ防衛中",   nx:"Q2_PUSH" },
    ],
  },
  Q2_PUSH: {
    phase:"崩壊ポイント", pi:2, type:"emotion",
    you:"引き継ぎ書がない業務は\n今、何件ありますか？",
    tip:"対立せず、未来の映像を見せる。",
    q:"相手の反応は？",
    opts:[
      { l:"思い当たる顔をした・数字が出た", n:"", nx:"Q3" },
      { l:"「しっかり管理できています」",   n:"", nx:"Q3" },
    ],
  },
  Q3: {
    phase:"コスト可視化", pi:3, type:"emotion",
    you:"引き継ぎが完了するまで\n何日かかりますか？\nその間の機会損失は？",
    tip:"感情に数字をつける。「日数×人」で損失を見せる。",
    q:"相手の反応温度は？",
    opts:[
      { l:"「1週間以上かかる」「考えたことなかった」", n:"強い課題認識", nx:"Q4_HOT"  },
      { l:"「数日で戻ります」",                       n:"軽い課題認識", nx:"Q4_MILD" },
    ],
  },
  Q4_HOT: {
    phase:"判断構造", pi:4, type:"question",
    you:"その状況で、あなたは\n何を基準に判断しますか？",
    tip:"相手がすでに動いている。判断軸を引き出す。",
    q:"相手の答えは？",
    opts:[
      { l:"明確な基準・数字・人名が出た", n:"", nx:"Q5"       },
      { l:"「その時考えます」",           n:"", nx:"Q4_VAGUE"  },
    ],
  },
  Q4_MILD: {
    phase:"判断構造", pi:4, type:"question",
    you:"それ、半年後も同じスピードで\n戻せる自信はありますか？",
    tip:"軽く見ている相手。未来に引っ張る。",
    q:"反応は？",
    opts:[
      { l:"少し不安そうになった", n:"", nx:"Q4_HOT" },
      { l:"「大丈夫です」",       n:"", nx:"Q4_HOT" },
    ],
  },
  Q4_VAGUE: {
    phase:"判断構造", pi:4, type:"question",
    you:"今、その判断に使える\n情報はどこにありますか？",
    tip:"判断の根拠がない状態を自覚させる。",
    q:"返答は？",
    opts:[
      { l:"「…整理されていない」「ない」", n:"", nx:"Q5" },
      { l:"「ここにあります」",             n:"", nx:"Q5" },
    ],
  },
  Q5: {
    phase:"仮説合意", pi:5, type:"mirror",
    you:"つまり——\n「担当者に依存した判断構造」\nになっている、ということですか？",
    tip:"断言しない。仮説として提示し、相手が自分で言うまで待つ。最後は沈黙。",
    q:"相手の反応は？",
    opts:[
      { l:"「そうです、まさに」「そうなりますね」", n:"合意成立", nx:"Q6"       },
      { l:"「少し違います」「そこまでは…」",       n:"ズレあり",  nx:"Q5_RETRY" },
    ],
  },
  Q5_RETRY: {
    phase:"仮説合意", pi:5, type:"question",
    you:"なるほど。\nどういう構造に近いと\n感じますか？",
    tip:"修正を求めない。相手に定義させる。",
    q:"相手が話したら？",
    opts:[
      { l:"構造を自分の言葉で話し始めた", n:"", nx:"Q6" },
    ],
  },
  Q6: {
    phase:"逆張り", pi:6, type:"danger",
    you:"正直に言うと——\nうちが必要ない会社も\n結構あります。",
    tip:"引くことで引力を生む。この一言の前に0.5秒の間を作る。相手の顔を見て待つ。",
    q:"相手の反応は？",
    opts:[
      { l:"「どういう会社が必要ないんですか？」", n:"引き寄せられた", nx:"Q7"        },
      { l:"「そうですか」（冷静）",               n:"まだ距離がある", nx:"Q6_BRIDGE" },
    ],
  },
  Q6_BRIDGE: {
    phase:"逆張り", pi:6, type:"question",
    you:"同じことが半年後に起きたとして\nその時、どこを見ますか？",
    tip:"距離がある時は未来の映像で引っ張る。",
    q:"返答は？",
    opts:[
      { l:"具体的な指標・名前が出た", n:"", nx:"Q7" },
      { l:"「考えてみます」",         n:"", nx:"Q7" },
    ],
  },
  Q7: {
    phase:"限界認識", pi:7, type:"question",
    you:"今の体制で\nそれを防ぎ切れそうですか？",
    tip:"攻めない。鏡を見せるだけ。",
    q:"答えは？",
    opts:[
      { l:"「正直難しいです」「厳しいですね」", n:"自覚あり",  nx:"Q8"        },
      { l:"「たぶん大丈夫です」",               n:"まだ防衛",  nx:"Q7_BLOCK"  },
    ],
  },
  Q7_BLOCK: {
    phase:"限界認識", pi:7, type:"question",
    you:"今の体制で\n一番の課題は何だと思いますか？",
    tip:"ボトルネックをポジティブな入り口から聞く。",
    q:"返答は？",
    opts:[
      { l:"人・時間・仕組みの話が出た", n:"", nx:"Q7_MIRROR" },
      { l:"「特にないです」",           n:"", nx:"Q8"         },
    ],
  },
  Q7_MIRROR: {
    phase:"限界認識", pi:7, type:"mirror",
    you:"それが解決すれば\n防げる、ということですね？",
    tip:"矛盾を指摘する。論破ではなく鏡を見せる。静かに。",
    q:"反応は？",
    opts:[
      { l:"「そうなりますね」と認めた", n:"", nx:"Q8" },
    ],
  },
  Q8: {
    phase:"自覚・言語化", pi:8, type:"emotion",
    you:"要するに、\n今一番の課題は何ですか？",
    tip:"相手の口から言わせる。絶対にこちらから答えを言わない。沈黙しても待つ。",
    q:"相手が話し始めたら？",
    opts:[
      { l:"課題を自分の言葉で言語化した", n:"最重要の瞬間", nx:"Q9" },
      { l:"「整理できていない」",         n:"",             nx:"Q9" },
    ],
  },
  Q9: {
    phase:"制約確認", pi:9, type:"question",
    you:"ちなみに——\n動く場合、誰が最後に判断しますか？",
    tip:"決裁者を特定する。責めず、確認するだけ。",
    q:"返答は？",
    opts:[
      { l:"「私です」「上司です」「会議が必要」", n:"", nx:"Q10" },
    ],
  },
  Q10: {
    phase:"料金提示", pi:10, type:"action",
    you:"では3パターンだけ\n見てもらえますか？\n御社の規模だと\nこのあたりです。",
    tip:"3パターン提示。説明しすぎない。真ん中を選ぶ心理を活かす。",
    q:"反応は？",
    opts:[
      { l:"「このプランで」と選んだ",     n:"",  nx:"CLOSE_P1"    },
      { l:"「高い」「予算が…」",         n:"",  nx:"Q10_BUDGET"  },
      { l:"「検討させてください」",       n:"",  nx:"CLOSE_P1"    },
    ],
  },
  Q10_BUDGET: {
    phase:"料金提示", pi:10, type:"danger",
    you:"正直、急ぐ必要はないです。\nただ——\n今確認した課題は\n来月も同じですよね？",
    tip:"退場テクニック。相手が引き止める状態を作る。",
    q:"反応は？",
    opts:[
      { l:"「確かに…」「もう少し聞かせて」", n:"引き止められた", nx:"CLOSE_P1" },
      { l:"「また連絡します」",              n:"",               nx:"CLOSE_P1" },
    ],
  },
  CLOSE_P1: {
    phase:"2次商談へ", pi:11, type:"goal",
    you:"では御社のケースで\n数字を出させてください。\n次回、30分いただけますか？",
    tip:"相手が引き止める状態で終わる。こちらから押さない。",
    q:null, opts:[],
  },
};

// ═══════════════════════════════════════════════════
//  PATTERN 2：AGERUケア 専用フロー
//  「パフォーマンス測定されてますか？」
//  ── プレゼンティーズム・損失可視化・月次診断
// ═══════════════════════════════════════════════════
const FLOW_P2 = {
  START: {
    phase:"導入", pi:0, type:"hook",
    you:"御社の社員のパフォーマンスは\n今、何%か把握されていますか？",
    tip:"数字を聞いているのではなく「測っていない」事実を引き出す問い。笑顔でフラットに。",
    q:"相手の反応は？",
    opts:[
      { l:"「把握していません」「測ったことがない」", n:"最多パターン", nx:"A1"    },
      { l:"「だいたいわかっています」",               n:"",             nx:"A2"    },
      { l:"「何%というのはどういう意味？」",          n:"概念未知",     nx:"A3"    },
    ],
  },
  A1: {
    phase:"課題認識", pi:1, type:"question",
    you:"実は94%の企業が\n測っていないんです。\nでも——測っていない間も\n損失は毎月出ています。",
    tip:"「御社だけではない」と安心させてから損失の存在に着地させる。",
    q:"反応は？",
    opts:[
      { l:"「損失というのは？」と前のめり",   n:"",         nx:"B_LOSS"  },
      { l:"「そうですね…」と少し流している", n:"温度が低い", nx:"A1_WARM" },
    ],
  },
  A1_WARM: {
    phase:"課題認識", pi:1, type:"emotion",
    you:"例えば100名・年収500万円の会社で——\n年間7,500万円の\nパフォーマンス損失です。\n50名なら3,750万円。",
    tip:"相手の規模に即座に置き換える。50名なら3,750万円。数字が抽象を「リスク」に変える。",
    q:"反応は？",
    opts:[
      { l:"「え、そんなに？」と驚いた",     n:"", nx:"B_LOSS"  },
      { l:"「うちはそこまでないと思う」",   n:"", nx:"A1_PUSH" },
    ],
  },
  A1_PUSH: {
    phase:"課題認識", pi:1, type:"question",
    you:"仮に発揮率90%でも\n50名なら年1,250万円です。\n測ったことがないなら\nこの数字、否定できますか？",
    tip:"攻めない。「証明できないなら損失は存在する」という論理を静かに置く。",
    q:"返答は？",
    opts:[
      { l:"「確かに否定できない」",         n:"", nx:"B_LOSS" },
      { l:"「うちの社員は元気です（笑）」", n:"", nx:"B_LOSS" },
    ],
  },
  A2: {
    phase:"課題認識", pi:1, type:"mirror",
    you:"把握されているんですね。\nどんな指標で測っていますか？",
    tip:"否定しない。「どう測っているか」を聞くと、ほぼ必ず「感覚」か「欠勤率」が出る。",
    q:"答えは？",
    opts:[
      { l:"「面談・アンケートしている」",       n:"", nx:"A2_DIG"  },
      { l:"「離職率・欠勤率で見ている」",       n:"", nx:"A2_GAP"  },
      { l:"「…感覚です」「特に指標はない」",   n:"", nx:"A1"       },
    ],
  },
  A2_DIG: {
    phase:"課題認識", pi:1, type:"question",
    you:"そのアンケート——\n発揮率を数値化できていますか？\n損失額まで出ていますか？",
    tip:"「測っている」と「数値化できている」は別物。差を際立たせる。",
    q:"返答は？",
    opts:[
      { l:"「数値化まではできていない」", n:"", nx:"B_LOSS" },
      { l:"「損失額は出していない」",     n:"", nx:"B_LOSS" },
    ],
  },
  A2_GAP: {
    phase:"課題認識", pi:1, type:"emotion",
    you:"欠勤率は「すでに倒れた人」の数字です。\nプレゼンティーズムは——\n出勤しているのに\nパフォーマンスが出ていない状態。\nこちらは見えていますか？",
    tip:"欠勤管理と発揮率管理は別次元。知識格差を丁寧に埋める。",
    q:"反応は？",
    opts:[
      { l:"「そういう概念は知らなかった」",       n:"", nx:"A3"    },
      { l:"「プレゼンティーズムは知っている」",   n:"", nx:"B_LOSS" },
    ],
  },
  A3: {
    phase:"概念説明", pi:1, type:"explain",
    you:"出勤はしている。\nでも本来の力の85%しか発揮できていない——\nこの15%の損失、\n今どこにも見えていないんです。",
    tip:"85%/15%という元資料の数字を使う。視覚的イメージを相手の頭に作る。",
    q:"理解度は？",
    opts:[
      { l:"「なるほど、そういうことか」", n:"", nx:"B_LOSS" },
      { l:"「それは測れるんですか？」",   n:"", nx:"B_LOSS" },
    ],
  },
  B_LOSS: {
    phase:"損失深掘り", pi:2, type:"question",
    you:"御社、今何名規模ですか？\n平均年収はざっくりどのくらいですか？",
    tip:"[人数×年収×15%]をその場で計算して即提示。電卓より頭で出す方が信頼を生む。",
    q:"数字を教えてくれたら？",
    opts:[
      { l:"人数と年収を教えてくれた",     n:"", nx:"B_CALC"  },
      { l:"「非公開です」「言えない」",   n:"", nx:"B_MODEL" },
    ],
  },
  B_CALC: {
    phase:"損失深掘り", pi:2, type:"emotion",
    you:"（人数）×（年収）× 15%で\n年間____万円の損失試算です。\n今まで見えていなかった数字です。",
    tip:"空欄に計算結果を入れて言う。相手の数字で出すことで「他社の話」でなくなる。",
    q:"反応は？",
    opts:[
      { l:"「それは大きい」「知らなかった」",    n:"課題認識あり", nx:"C_MEASURE" },
      { l:"「本当にそんなに？」と疑問",         n:"",             nx:"B_WHO"     },
    ],
  },
  B_MODEL: {
    phase:"損失深掘り", pi:2, type:"emotion",
    you:"では50名・年収500万円モデルで——\n年間3,750万円。\n100名なら7,500万円。\n御社はこの間のどこかに入ります。",
    tip:"「間のどこか」という言い方で相手に当てはめさせる。",
    q:"反応は？",
    opts:[
      { l:"「うちはそのくらいかも」", n:"", nx:"C_MEASURE" },
      { l:"「損失の根拠は？」",       n:"", nx:"B_WHO"     },
    ],
  },
  B_WHO: {
    phase:"損失深掘り", pi:2, type:"explain",
    you:"WHO（世界保健機関）の\nHPQという指標をベースにしています。\n7問のアンケートで発揮率を数値化できる\n国際的に検証された手法です。",
    tip:"WHO-HPQは信頼の核心。「感覚」ではなく「国際基準」が差別化になる。",
    q:"納得度は？",
    opts:[
      { l:"「WHOの基準なら信頼できそう」", n:"", nx:"C_MEASURE" },
      { l:"「もう少し詳しく知りたい」",    n:"", nx:"C_MEASURE" },
    ],
  },
  C_MEASURE: {
    phase:"測定提案", pi:3, type:"question",
    you:"まず測ってみませんか？\n7問・スマホで3〜5分で終わります。\n結果を見てから\n最適なプランを一緒に設計しましょう。",
    tip:"「導入」ではなく「まず測る」という入口。ハードルを徹底的に下げる。",
    q:"反応は？",
    opts:[
      { l:"「試せますか？」「見てみたい」",   n:"前向き",         nx:"D_PRICE"  },
      { l:"「今は忙しい時期で…」",           n:"タイミング抵抗", nx:"C_TIMING" },
      { l:"「費用はどのくらいですか？」",     n:"",               nx:"D_PRICE"  },
    ],
  },
  C_TIMING: {
    phase:"測定提案", pi:3, type:"danger",
    you:"忙しい時期こそ\nパフォーマンスが落ちている時期です。\n急がなくていいです。\nただ——損失はその間も続いています。",
    tip:"責めない。でも「待つコスト」を静かに置く。",
    q:"反応は？",
    opts:[
      { l:"「確かにそうだな」", n:"", nx:"D_PRICE" },
      { l:"「来月以降に…」",   n:"", nx:"D_PRICE" },
    ],
  },
  D_PRICE: {
    phase:"料金提示", pi:4, type:"action",
    you:"プランは3つです。\n\n　コンパクト（〜50名）　5万円/月\n　ビジネス（〜100名）　8万円/月\n　エンタープライズ（〜200名）　12万円/月\n\n最低契約6ヶ月です。",
    tip:"説明しすぎない。「御社の規模だとこのあたりです」と一言添えて選ばせる。",
    q:"反応は？",
    opts:[
      { l:"「ビジネスプランかな」と自発的に選んだ", n:"", nx:"D_ROI"    },
      { l:"「高い」「予算が厳しい」",               n:"", nx:"D_BUDGET" },
      { l:"「検討させてください」",                 n:"", nx:"CLOSE_P2" },
    ],
  },
  D_BUDGET: {
    phase:"料金提示", pi:4, type:"danger",
    you:"コンパクトプランで月5万・年60万円です。\nさっきの損失試算と比べてみてください。\n投資対効果として見るといかがでしょうか？",
    tip:"「高い」には数字で返す。損失額を出した後にコストを見せると印象が逆転する。",
    q:"反応は？",
    opts:[
      { l:"「損失と比べれば安いですね」", n:"", nx:"D_ROI"    },
      { l:"「それでも予算が…」",         n:"", nx:"CLOSE_P2" },
    ],
  },
  D_ROI: {
    phase:"ROI確認", pi:5, type:"emotion",
    you:"仮に発揮率が5%改善するだけで\n御社の規模だと年間____万円の回収です。\n月々の投資額より大きいですよね。",
    tip:"5%改善×人数×年収=回収額を即計算。「投資」という言葉で経営判断に枠組みを変える。",
    q:"反応は？",
    opts:[
      { l:"「数字で見るとそうですね」",   n:"", nx:"CLOSE_P2" },
      { l:"「改善の保証はできますか？」", n:"", nx:"D_GUAR"   },
    ],
  },
  D_GUAR: {
    phase:"ROI確認", pi:5, type:"mirror",
    you:"改善の保証はできません。\nただ——\n「何が問題か見えない状態」と\n「どこが低くて原因がわかる状態」、\nどちらが経営判断しやすいですか？",
    tip:"保証を求める相手には「可視化の価値」で答える。情報を得ることの価値を問う。",
    q:"反応は？",
    opts:[
      { l:"「見えるほうがいいですね」", n:"", nx:"CLOSE_P2" },
      { l:"「それはそうだ」",           n:"", nx:"CLOSE_P2" },
    ],
  },
  CLOSE_P2: {
    phase:"クロージング", pi:6, type:"goal",
    you:"では御社の規模で試算をまとめて\n次回お持ちします。\n30分いただけますか？\nできれば代表の方も\n同席いただけると助かります。",
    tip:"決裁者同席を自然にリクエスト。「資料」ではなく「試算」という言葉で具体性を演出する。",
    q:null, opts:[],
  },
};

// ═══════════════════════════════════════════════════
//  PATTERN 3：コスト・予算優先型
//  「いくらかかるの？」「予算がない」から始まる顧客
// ═══════════════════════════════════════════════════
const FLOW_P3 = {
  START: {
    phase:"導入", pi:0, type:"hook",
    you:"御社の社員のパフォーマンスは\n今、何%か把握されていますか？",
    tip:"入口は同じ。コスト重視型でも最初の問いは同じ。相手の反応で分岐する。",
    q:"相手の反応は？",
    opts:[
      { l:"「費用はいくらですか？」と即座に聞いてきた",   n:"コスト最優先型",   nx:"P3_COST_FIRST" },
      { l:"「それより予算がないんですよね」",              n:"予算制約を先出し", nx:"P3_NO_BUDGET"  },
      { l:"「把握していません」（→ 通常フローへ）",       n:"",                 nx:"P3_NORMAL"     },
    ],
  },
  P3_COST_FIRST: {
    phase:"前置き", pi:1, type:"mirror",
    you:"お伝えする前に——\nひとつだけ聞かせてください。\n今、社員が本来の力の何%を\n発揮していると思いますか？",
    tip:"コストの話を一度保留にして損失の話に引き込む。「料金を言う前に損失を見せる」が鉄則。",
    q:"相手の答えは？",
    opts:[
      { l:"「80〜90%くらいは出てると思う」",   n:"", nx:"P3_LOSS_FRAME" },
      { l:"「測ったことがない」「わからない」", n:"", nx:"P3_LOSS_FRAME" },
    ],
  },
  P3_NO_BUDGET: {
    phase:"前置き", pi:1, type:"danger",
    you:"予算がない——というのは\n「今の施策にお金を使いたくない」\nということですか？\nそれとも「費用対効果が見えない」\nということですか？",
    tip:"「予算がない」は2種類ある。「不要」か「不透明」かを分ける。後者なら突破できる。",
    q:"返答は？",
    opts:[
      { l:"「費用対効果が見えないんです」", n:"突破できる", nx:"P3_ROI_FIRST" },
      { l:"「単純に使えるお金がない」",     n:"",           nx:"P3_MINIMUM"   },
    ],
  },
  P3_NORMAL: {
    phase:"課題認識", pi:1, type:"question",
    you:"実は94%の企業が\n測っていないんです。\n損失は毎月出ています。\n御社、今何名規模ですか？",
    tip:"通常フローへ合流。損失試算で数字化してからコストの話に進む。",
    q:"相手が規模を教えてくれたら？",
    opts:[
      { l:"規模を教えてくれた", n:"", nx:"P3_CALC" },
    ],
  },
  P3_CALC: {
    phase:"課題認識", pi:1, type:"emotion",
    you:"（人数）×（年収）× 15%で\n年間____万円の損失試算です。\nこの数字を見てから\nコストの話をしましょう。",
    tip:"損失額を出してからコストを提示すると「高い」という感覚が変わる。順序が全て。",
    q:"反応は？",
    opts:[
      { l:"「そんなに損失が…」と驚いた", n:"", nx:"P3_PRICE" },
      { l:"「それで費用はいくら？」",     n:"", nx:"P3_PRICE" },
    ],
  },
  P3_LOSS_FRAME: {
    phase:"損失の再定義", pi:2, type:"emotion",
    you:"では試算してみましょう。\n御社、何名規模ですか？\n\n（人数）×（年収）× 15%——\n年間____万円の損失が\nすでに発生している試算です。\nAGERUケアのコストと比べてみてください。",
    tip:"コストの話の前に損失の規模を先に見せる。「支出」ではなく「損失回収」の構図に変える。",
    q:"反応は？",
    opts:[
      { l:"「それで費用は？」と聞いてきた",   n:"損失を認識した上でのコスト質問", nx:"P3_PRICE" },
      { l:"「損失の根拠がよくわからない」",   n:"",                               nx:"P3_WHO"   },
    ],
  },
  P3_WHO: {
    phase:"根拠説明", pi:2, type:"explain",
    you:"WHO（世界保健機関）のHPQという\n国際基準に基づいています。\n発揮率85%というのは実測値の平均値です。\n御社が85%以上なら——\n測定すれば証明できます。",
    tip:"根拠を問われたらWHO-HPQを出す。「測って反証できる」と伝えることで透明性を示す。",
    q:"反応は？",
    opts:[
      { l:"「わかりました」「なるほど」", n:"", nx:"P3_PRICE" },
    ],
  },
  P3_ROI_FIRST: {
    phase:"ROI先出し", pi:2, type:"emotion",
    you:"では費用対効果を先にお見せします。\n御社の規模で試算すると——\n損失____万円に対して\nAGERUケアのコストは年間60〜144万円。\n発揮率5%改善で____万円回収できます。",
    tip:"「費用対効果が見えない」タイプにはROIを先に出す。数字が揃えば決断できる。",
    q:"反応は？",
    opts:[
      { l:"「数字で見ると投資対効果はありそう」", n:"", nx:"P3_PRICE" },
      { l:"「5%改善の根拠は？」",                 n:"", nx:"P3_5PCT"  },
    ],
  },
  P3_5PCT: {
    phase:"ROI先出し", pi:2, type:"question",
    you:"5%は保証できません。\nただ——今パフォーマンスが\nどの部署でなぜ落ちているか\n見えていますか？\n見えてから判断できることが\nあると思いませんか？",
    tip:"数値の保証を求める相手には「可視化の価値」で返す。",
    q:"反応は？",
    opts:[
      { l:"「見えるほうが判断しやすいですね」", n:"", nx:"P3_PRICE" },
    ],
  },
  P3_MINIMUM: {
    phase:"最小提案", pi:2, type:"action",
    you:"一番小さい入り口で言うと——\nコンパクトプランで月5万円・50名まで。\nまず1回だけ全社測定して\n損失額を可視化する。\nそこから判断していただいて構いません。",
    tip:"予算本当にない場合は最小プランの「1回測定」に絞る。「継続」より「まず測る」を先にする。",
    q:"反応は？",
    opts:[
      { l:"「月5万円なら検討できる」", n:"", nx:"P3_PRICE" },
      { l:"「それでも厳しい」",         n:"", nx:"P3_DEFER" },
    ],
  },
  P3_DEFER: {
    phase:"退場", pi:3, type:"danger",
    you:"わかりました。急ぎません。\nただひとつだけ——\n今この瞬間も損失は続いています。\n半年後に同じ話をする時、\n損失は累積しています。\nその判断、いつ頃できそうですか？",
    tip:"退場テクニック。急かさず、でも「待つコスト」を静かに置いて時期を聞く。",
    q:"反応は？",
    opts:[
      { l:"「3ヶ月後に予算が確保できるかも」", n:"", nx:"CLOSE_P3" },
      { l:"「来期の予算申請に入れてみます」",   n:"", nx:"CLOSE_P3" },
    ],
  },
  P3_PRICE: {
    phase:"料金提示", pi:4, type:"action",
    you:"改めてプランです。\n\n　コンパクト（〜50名）　5万円/月\n　ビジネス（〜100名）　8万円/月\n　エンタープライズ（〜200名）　12万円/月\n\n御社の損失試算____万円に対して\n年間コストは____万円です。",
    tip:"損失額を出した後に料金を提示する。「損失 vs コスト」を並べて見せる。",
    q:"反応は？",
    opts:[
      { l:"「損失と比べると納得感がある」",         n:"",  nx:"CLOSE_P3"       },
      { l:"「稟議を通す必要がある」",               n:"",  nx:"P3_NEMAWASHI"   },
      { l:"「やはり高い」「もっと安くならない？」", n:"",  nx:"P3_NEGO"         },
    ],
  },
  P3_NEMAWASHI: {
    phase:"稟議支援", pi:5, type:"action",
    you:"稟議資料をお手伝いします。\n御社の損失試算・ROI・競合比較を\n1枚にまとめてお渡しします。\n決裁者に刺さる数字の見せ方で作ります。",
    tip:"稟議サポートは強力な差別化。「書類を作る手間を減らす」ことで障壁を下げる。",
    q:"反応は？",
    opts:[
      { l:"「それは助かります」", n:"", nx:"CLOSE_P3" },
    ],
  },
  P3_NEGO: {
    phase:"価格交渉", pi:5, type:"mirror",
    you:"価格の調整は難しいんですが——\n今ご懸念なのは\n「金額そのもの」ですか？\nそれとも「効果が出るかどうか」ですか？",
    tip:"値引きの前に懸念の本質を確認する。「高い」は価格問題ではなく不信問題のことが多い。",
    q:"返答は？",
    opts:[
      { l:"「効果が出るかどうかが不安」", n:"→ 保証問題", nx:"P3_GUAR"  },
      { l:"「単純に予算が合わない」",     n:"",            nx:"P3_SCALE" },
    ],
  },
  P3_GUAR: {
    phase:"価格交渉", pi:5, type:"explain",
    you:"まず1回測定してみてください。\n「今の状態が見える」だけで\n経営判断の質が変わります。\n効果が出なければ継続しなくていいです。",
    tip:"効果不安には「1回試す」を提案。「見える化だけで価値がある」と伝える。",
    q:"反応は？",
    opts:[
      { l:"「1回試す感覚ならいいかも」", n:"", nx:"CLOSE_P3" },
    ],
  },
  P3_SCALE: {
    phase:"価格交渉", pi:5, type:"action",
    you:"一番小さいコンパクトプランで\n月5万円からスタートして——\n測定データが経営に使えると判断したら\nプランを上げてください。\n無理に大きく始めなくていいです。",
    tip:"スモールスタートを提案。「大きく始めなくていい」と言うことで返って信頼を生む。",
    q:"反応は？",
    opts:[
      { l:"「最小から始めるのはありです」", n:"", nx:"CLOSE_P3" },
      { l:"「それなら検討してみます」",     n:"", nx:"CLOSE_P3" },
    ],
  },
  CLOSE_P3: {
    phase:"クロージング", pi:6, type:"goal",
    you:"では御社の規模で損失試算と\nROIをまとめた提案資料を作ります。\n稟議にそのまま使えるフォーマットで。\n次回30分いただけますか？",
    tip:"コスト重視型には「稟議資料を作る」約束が刺さる。決裁者が見る資料を一緒に作る姿勢を見せる。",
    q:null, opts:[],
  },
};

// ─────────────────────────────────────────
//  パターン定義
// ─────────────────────────────────────────
const PATTERNS = [
  {
    id:1, label:"Pattern 1", color:"#38bdf8",
    sub:"業務が止まりますか？",
    desc:"業種・商材問わず使える\n汎用 0.01% 構造設計フロー",
    flow: FLOW_P1,
    closeNote:"相手が引き止める状態で終わる",
  },
  {
    id:2, label:"Pattern 2", color:"#34d399",
    sub:"パフォーマンス測定されてますか？",
    desc:"AGERUケア専用\nプレゼンティーズム・損失可視化フロー",
    flow: FLOW_P2,
    closeNote:"決裁者同席・御社試算資料を持参",
  },
  {
    id:3, label:"Pattern 3", color:"#f87171",
    sub:"コスト・予算優先型",
    desc:"「いくら？」「予算ない」から始まる顧客\n損失→ROI先出し・稟議サポート",
    flow: FLOW_P3,
    closeNote:"稟議用ROI資料を作成して持参",
  },
];

const TYPE_CFG = {
  hook:    { color:"#f59e0b", bg:"rgba(245,158,11,0.09)",  label:"HOOK",     icon:"🎯" },
  question:{ color:"#38bdf8", bg:"rgba(56,189,248,0.09)",  label:"QUESTION", icon:"❓" },
  mirror:  { color:"#fb923c", bg:"rgba(251,146,60,0.09)",  label:"MIRROR",   icon:"🪞" },
  emotion: { color:"#fbbf24", bg:"rgba(251,191,36,0.09)",  label:"EMOTION",  icon:"⚡" },
  explain: { color:"#a78bfa", bg:"rgba(167,139,250,0.09)", label:"EXPLAIN",  icon:"📊" },
  danger:  { color:"#f87171", bg:"rgba(248,113,113,0.09)", label:"REFRAME",  icon:"↩" },
  action:  { color:"#34d399", bg:"rgba(52,211,153,0.09)",  label:"ACTION",   icon:"▶" },
  goal:    { color:"#34d399", bg:"rgba(52,211,153,0.12)",  label:"CLOSE",    icon:"✅" },
};

// ─────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────
export default function App() {
  const [pIdx, setPIdx] = useState(null); // null = top screen
  const [cur,  setCur]  = useState("START");
  const [hist, setHist] = useState(["START"]);
  const [tab,  setTab]  = useState("live");
  const [akey, setAkey] = useState(0);

  const pat  = pIdx !== null ? PATTERNS[pIdx] : null;
  const flow = pat ? pat.flow : null;
  const node = flow ? (flow[cur] || flow["START"]) : null;
  const tc   = node ? TYPE_CFG[node.type] : null;

  const switchPattern = (i) => {
    setPIdx(i);
    setCur("START");
    setHist(["START"]);
    setTab("live");
    setAkey(k => k + 1);
  };

  const go = (nx) => {
    if (!flow || !flow[nx]) return;
    setHist(h => [...h, nx]);
    setCur(nx);
    setAkey(k => k + 1);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const back = () => {
    if (hist.length <= 1) return;
    const prev = hist[hist.length - 2];
    setHist(h => h.slice(0, -1));
    setCur(prev);
    setAkey(k => k + 1);
  };

  const reset = () => { setCur("START"); setHist(["START"]); setAkey(k => k + 1); };
  const goTop = () => { setPIdx(null); setCur("START"); setHist(["START"]); setTab("live"); };

  const phaseMax = flow ? Math.max(...Object.values(flow).map(n => n.pi)) : 0;
  const pct      = node ? Math.round((node.pi / phaseMax) * 100) : 0;

  // ── TOP SCREEN ──
  if (pIdx === null) {
    return (
      <div style={{ fontFamily:"'Hiragino Kaku Gothic Pro','Noto Sans JP',sans-serif",
        background:"#08080f", minHeight:"100vh", color:"#e2e8f0",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"24px 16px" }}>
        <div style={{ width:"100%", maxWidth:520 }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:10, letterSpacing:"0.2em", color:"#3a3a5a",
              textTransform:"uppercase", marginBottom:8 }}>AGERUケア 商談ナビゲーター</div>
            <div style={{ fontSize:26, fontWeight:800, color:"#fff", lineHeight:1.2 }}>
              顧客タイプを選んでください
            </div>
            <div style={{ fontSize:13, color:"#4a4a6a", marginTop:8 }}>
              商談相手の反応・状況に合わせてパターンを選択
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {PATTERNS.map((p, i) => (
              <button key={p.id} onClick={() => switchPattern(i)}
                style={{ width:"100%", textAlign:"left", padding:"20px 20px",
                  background:"#0f0f1a", border:`1.5px solid ${p.color}33`,
                  borderRadius:16, cursor:"pointer", fontFamily:"inherit",
                  transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=p.color; e.currentTarget.style.background=`${p.color}0d`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=`${p.color}33`; e.currentTarget.style.background="#0f0f1a"; }}
                onTouchStart={e => { e.currentTarget.style.borderColor=p.color; e.currentTarget.style.background=`${p.color}0d`; }}
                onTouchEnd={e => { e.currentTarget.style.borderColor=`${p.color}33`; e.currentTarget.style.background="#0f0f1a"; }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${p.color}18`,
                    border:`1px solid ${p.color}44`, display:"flex", alignItems:"center",
                    justifyContent:"center", flexShrink:0, fontSize:13, fontWeight:800, color:p.color }}>
                    {p.id}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:p.color, fontWeight:700, letterSpacing:"0.08em",
                      textTransform:"uppercase", marginBottom:3 }}>{p.label}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:4 }}>
                      {p.sub}
                    </div>
                    <div style={{ fontSize:12, color:"#5a5a7a", lineHeight:1.6, whiteSpace:"pre-line" }}>
                      {p.desc}
                    </div>
                  </div>
                  <div style={{ color:`${p.color}66`, fontSize:20, flexShrink:0, paddingTop:6 }}>›</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <style>{`* { box-sizing:border-box; -webkit-tap-highlight-color:transparent; } button { font-family:inherit; }`}</style>
      </div>
    );
  }

  // ── NAVIGATOR SCREEN ──
  return (
    <div style={{ fontFamily:"'Hiragino Kaku Gothic Pro','Noto Sans JP',sans-serif",
      background:"#08080f", minHeight:"100vh", color:"#e2e8f0" }}>

      {/* Header */}
      <div style={{ background:"#0f0f1a", borderBottom:"1px solid #1a1a2e",
        padding:"10px 14px", position:"sticky", top:0, zIndex:30 }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>

          {/* Pattern tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:8 }}>
            <button onClick={goTop}
              style={{ padding:"7px 10px", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:11, background:"#111120", color:"#3a3a5a",
                fontWeight:700 }}>←</button>
            {PATTERNS.map((p, i) => (
              <button key={p.id} onClick={() => switchPattern(i)}
                style={{ flex:1, padding:"6px 4px", borderRadius:8, border:"none",
                  cursor:"pointer", fontFamily:"inherit", fontSize:10, fontWeight:700,
                  lineHeight:1.3, transition:"all 0.15s",
                  background: pIdx === i ? `${p.color}1a` : "#111120",
                  color:       pIdx === i ? p.color : "#3a3a5a",
                  borderBottom: pIdx === i ? `2px solid ${p.color}` : "2px solid transparent" }}>
                <div>{p.label}</div>
                <div style={{ fontSize:8, fontWeight:400, marginTop:1, opacity:0.8,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {p.sub}
                </div>
              </button>
            ))}
            <button onClick={() => setTab(tab === "live" ? "map" : "live")}
              style={{ padding:"7px 10px", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:11, fontWeight:700,
                background: "#111120",
                color: tab === "map" ? pat.color : "#3a3a5a" }}>
              {tab === "live" ? "🗺" : "🔴"}
            </button>
          </div>

          {/* Phase + progress */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#fff" }}>{node.phase}</div>
            <div style={{ fontSize:10, color:"#3a3a5a" }}>Phase {node.pi + 1}/{phaseMax + 1}</div>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            {Array.from({length: phaseMax + 1}).map((_, i) => (
              <div key={i} style={{ flex:1, height:3, borderRadius:2, transition:"background 0.3s",
                background: i < node.pi ? pat.color : i === node.pi ? tc.color : "#1a1a2e" }} />
            ))}
          </div>
          <div style={{ marginTop:3 }}>
            <span style={{ fontSize:10, color:tc.color, fontWeight:700 }}>{pct}% 進行</span>
          </div>
        </div>
      </div>

      {/* LIVE */}
      {tab === "live" && (
        <div style={{ maxWidth:600, margin:"0 auto", padding:"14px 14px 110px" }}>

          <div key={`tag-${akey}`} style={{ display:"flex", gap:6, alignItems:"center",
            marginBottom:10, animation:"up 0.2s ease" }}>
            <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20,
              background:tc.bg, border:`1px solid ${tc.color}44`,
              color:tc.color, fontWeight:800, letterSpacing:"0.08em" }}>
              {tc.icon} {tc.label}
            </span>
            <span style={{ fontSize:10, color:"#2a2a3a", fontFamily:"monospace" }}>{cur}</span>
          </div>

          <div key={`tip-${akey}`} style={{ background:"#0f0f1a", borderLeft:"3px solid #252540",
            borderRadius:"0 8px 8px 0", padding:"9px 14px", marginBottom:14,
            fontSize:12, color:"#5a5a7a", lineHeight:1.7, animation:"up 0.25s ease" }}>
            💡 {node.tip}
          </div>

          <div key={`sc-${akey}`} style={{ background:tc.bg, border:`1.5px solid ${tc.color}33`,
            borderRadius:16, padding:"20px 18px 18px", marginBottom:6,
            boxShadow:`0 0 24px ${tc.color}0d`, animation:"up 0.3s ease" }}>
            <div style={{ fontSize:10, color:`${tc.color}88`, letterSpacing:"0.1em",
              marginBottom:10, textTransform:"uppercase" }}>あなたが言う言葉</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#fff", lineHeight:1.75,
              whiteSpace:"pre-line" }}>
              {node.you}
            </div>
          </div>

          {node.q && (
            <div key={`q-${akey}`} style={{ textAlign:"center", fontSize:13, color:"#4a4a6a",
              margin:"18px 0 10px", animation:"up 0.35s ease" }}>
              ▼ {node.q}
            </div>
          )}

          <div key={`opts-${akey}`} style={{ display:"flex", flexDirection:"column", gap:8,
            animation:"up 0.4s ease" }}>
            {node.opts.map((o, i) => (
              <button key={i} onClick={() => go(o.nx)}
                style={{ width:"100%", textAlign:"left", padding:"14px 16px",
                  background:"#0f0f1a", border:"1.5px solid #1a1a2e",
                  borderRadius:12, cursor:"pointer", color:"#e2e8f0",
                  transition:"all 0.15s", fontFamily:"inherit" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=tc.color; e.currentTarget.style.background=tc.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#1a1a2e"; e.currentTarget.style.background="#0f0f1a"; }}
                onTouchStart={e => { e.currentTarget.style.borderColor=tc.color; e.currentTarget.style.background=tc.bg; }}
                onTouchEnd={e => { e.currentTarget.style.borderColor="#1a1a2e"; e.currentTarget.style.background="#0f0f1a"; }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, lineHeight:1.5 }}>{o.l}</div>
                    {o.n && <div style={{ fontSize:11, color:"#3a3a5a", marginTop:2 }}>{o.n}</div>}
                  </div>
                  <div style={{ color:"#2a2a4a", fontSize:18, flexShrink:0 }}>›</div>
                </div>
              </button>
            ))}
            {node.type === "goal" && (
              <div style={{ textAlign:"center", padding:"24px 0 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🎯</div>
                <div style={{ fontSize:18, color:"#34d399", fontWeight:800 }}>次回アポ取得へ</div>
                <div style={{ fontSize:13, color:"#3a3a5a", marginTop:4 }}>{pat.closeNote}</div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:20,
            background:"#08080f", borderTop:"1px solid #1a1a2e", padding:"10px 14px 14px" }}>
            <div style={{ maxWidth:600, margin:"0 auto", display:"flex", gap:8 }}>
              <button onClick={back} disabled={hist.length <= 1}
                style={{ flex:1, padding:"11px 0", borderRadius:10,
                  border:"1px solid #1a1a2e", background:"transparent",
                  color: hist.length > 1 ? "#8888aa" : "#2a2a3a",
                  cursor: hist.length > 1 ? "pointer" : "default",
                  fontSize:14, fontWeight:700, fontFamily:"inherit" }}>← 前へ</button>
              <button onClick={reset}
                style={{ flex:1, padding:"11px 0", borderRadius:10,
                  border:"1px solid #1a1a2e", background:"transparent",
                  color:"#8888aa", cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"inherit" }}>
                ↺ リセット
              </button>
              <button onClick={goTop}
                style={{ flex:1, padding:"11px 0", borderRadius:10,
                  border:`1px solid ${pat.color}44`, background:`${pat.color}11`,
                  color:pat.color, cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"inherit" }}>
                ≡ TOP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP */}
      {tab === "map" && (
        <div style={{ maxWidth:600, margin:"0 auto", padding:"14px 14px 40px" }}>
          {hist.length > 1 && (
            <div style={{ background:"#0f0f1a", border:"1px solid #1a1a2e",
              borderRadius:10, padding:"10px 12px", marginBottom:14 }}>
              <div style={{ fontSize:10, color:"#3a3a5a", marginBottom:6,
                textTransform:"uppercase", letterSpacing:"0.1em" }}>今回のルート</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {hist.map((h, i) => {
                  const hn = flow[h]; if (!hn) return null;
                  const ht = TYPE_CFG[hn.type];
                  return (
                    <span key={i} style={{ fontSize:11, padding:"2px 8px", borderRadius:4,
                      background: h === cur ? `${ht.color}22` : "#1a1a2e",
                      color: h === cur ? ht.color : "#5a5a7a",
                      border: h === cur ? `1px solid ${ht.color}` : "1px solid transparent" }}>
                      {h}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {Array.from(new Set(Object.values(flow).map(n => n.pi))).sort((a,b)=>a-b).map(pi => {
            const items = Object.entries(flow).filter(([,n]) => n.pi === pi);
            return (
              <div key={pi} style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, color:"#4a4a6a", textTransform:"uppercase",
                  letterSpacing:"0.12em", marginBottom:6, paddingLeft:2 }}>
                  Phase {pi + 1}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {items.map(([id, n]) => {
                    const t   = TYPE_CFG[n.type];
                    const vis = hist.includes(id);
                    const isc = id === cur;
                    return (
                      <button key={id} onClick={() => { setCur(id); setTab("live"); setAkey(k=>k+1); }}
                        style={{ textAlign:"left", padding:"10px 12px", borderRadius:10, cursor:"pointer",
                          border: isc ? `1.5px solid ${t.color}` : vis ? "1px solid #252535" : "1px solid #1a1a2e",
                          background: isc ? t.bg : "#0f0f1a", fontFamily:"inherit" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4,
                            background:`${t.color}18`, color:t.color, fontWeight:700, flexShrink:0 }}>
                            {t.icon}
                          </span>
                          <span style={{ fontSize:12, fontWeight: isc ? 700 : 400,
                            color: isc ? "#fff" : vis ? "#8888aa" : "#4a4a6a" }}>{id}</span>
                          {isc  && <span style={{ marginLeft:"auto", fontSize:10, color:t.color, flexShrink:0 }}>● 現在地</span>}
                          {vis && !isc && <span style={{ marginLeft:"auto", fontSize:10, color:"#2a2a4a" }}>✓</span>}
                        </div>
                        <div style={{ fontSize:11, color:"#3a3a5a", marginTop:3, paddingLeft:28,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {n.you.replace(/\n/g," ").slice(0,42)}…
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <button onClick={() => setTab("live")}
            style={{ width:"100%", padding:"12px", borderRadius:10,
              border:`1px solid ${pat.color}44`, background:`${pat.color}11`,
              color:pat.color, cursor:"pointer", fontSize:14, fontWeight:700, fontFamily:"inherit" }}>
            ← LIVEに戻る
          </button>
        </div>
      )}

      <style>{`
        @keyframes up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        button { font-family:inherit; }
      `}</style>
    </div>
  );
}
