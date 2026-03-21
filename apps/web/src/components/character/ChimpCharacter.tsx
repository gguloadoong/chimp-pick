"use client";

type ChimpMood = "idle" | "thinking" | "up" | "down" | "win" | "lose";

interface ChimpCharacterProps {
  mood?: ChimpMood;
  size?: number;
  level?: number;
  className?: string;
}

export default function ChimpCharacter({
  mood = "idle",
  size = 120,
  level = 1,
  className = "",
}: ChimpCharacterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`침팬지 캐릭터 - ${moodLabel(mood)}`}
    >
      {mood === "win" && <Confetti />}
      <g transform="translate(100,105)">
        <Body mood={mood} />
        <Head mood={mood} />
        <Arms mood={mood} />
        <Banana mood={mood} />
        {mood === "win" && <Crown />}
        {mood === "up" && <Rocket />}
        {mood === "lose" && <SweatDrops />}
        <LevelAccessory level={level} />
      </g>
    </svg>
  );
}

function moodLabel(mood: ChimpMood): string {
  const labels: Record<ChimpMood, string> = {
    idle: "기본",
    thinking: "생각 중",
    up: "상승 예측",
    down: "하락 예측",
    win: "승리",
    lose: "패배",
  };
  return labels[mood];
}

/* ── Body ── */
function Body({ mood }: { mood: ChimpMood }) {
  const bodyColor = mood === "win" ? "#D4A574" : "#C4956A";
  return (
    <g>
      {/* Body */}
      <ellipse cx={0} cy={30} rx={28} ry={32} fill={bodyColor} />
      {/* Belly */}
      <ellipse cx={0} cy={34} rx={18} ry={20} fill="#F5DEB3" />
    </g>
  );
}

/* ── Head ── */
function Head({ mood }: { mood: ChimpMood }) {
  const furColor = "#8B6914";
  const faceColor = "#F5DEB3";
  const isShaking = mood === "lose";

  return (
    <g className={isShaking ? "animate-wiggle" : ""}>
      {/* Fur / head shape */}
      <circle cx={0} cy={-18} r={42} fill={furColor} />

      {/* Left ear */}
      <circle cx={-40} cy={-22} r={16} fill={furColor} />
      <circle cx={-40} cy={-22} r={10} fill="#D4A574" />

      {/* Right ear */}
      <circle cx={40} cy={-22} r={16} fill={furColor} />
      <circle cx={40} cy={-22} r={10} fill="#D4A574" />

      {/* Face */}
      <ellipse cx={0} cy={-10} rx={30} ry={28} fill={faceColor} />

      {/* Eyes */}
      <Eyes mood={mood} />

      {/* Nose */}
      <ellipse cx={0} cy={-2} rx={6} ry={4} fill="#6B4226" />

      {/* Mouth */}
      <Mouth mood={mood} />

      {/* Cheeks / blush */}
      {(mood === "idle" || mood === "win") && (
        <>
          <circle cx={-20} cy={4} r={6} fill="#FFB8B8" opacity={0.5} />
          <circle cx={20} cy={4} r={6} fill="#FFB8B8" opacity={0.5} />
        </>
      )}
    </g>
  );
}

/* ── Eyes ── */
function Eyes({ mood }: { mood: ChimpMood }) {
  if (mood === "lose") {
    // X eyes
    return (
      <g stroke="#6B4226" strokeWidth={3} strokeLinecap="round">
        <line x1={-18} y1={-20} x2={-10} y2={-12} />
        <line x1={-10} y1={-20} x2={-18} y2={-12} />
        <line x1={10} y1={-20} x2={18} y2={-12} />
        <line x1={18} y1={-20} x2={10} y2={-12} />
      </g>
    );
  }

  if (mood === "win") {
    // Happy closed eyes (^_^)
    return (
      <g stroke="#6B4226" strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M-18,-16 Q-14,-20 -10,-16" />
        <path d="M10,-16 Q14,-20 18,-16" />
      </g>
    );
  }

  if (mood === "thinking") {
    // One eye open, one squinting
    return (
      <g>
        <circle cx={-14} cy={-16} r={6} fill="white" />
        <circle cx={-14} cy={-15} r={3.5} fill="#2D2006" />
        <circle cx={-12.5} cy={-16.5} r={1.2} fill="white" />
        {/* Squinting eye */}
        <path d="M8,-16 Q14,-20 20,-16" stroke="#6B4226" strokeWidth={3} strokeLinecap="round" fill="none" />
      </g>
    );
  }

  // Default big round eyes
  const lookY = mood === "up" ? -18 : mood === "down" ? -13 : -15;
  const sparkle = mood === "up" || mood === "idle";

  return (
    <g>
      {/* Left eye */}
      <circle cx={-14} cy={-16} r={8} fill="white" />
      <circle cx={-14} cy={lookY} r={4.5} fill="#2D2006" />
      {sparkle && <circle cx={-12} cy={-18} r={1.8} fill="white" />}

      {/* Right eye */}
      <circle cx={14} cy={-16} r={8} fill="white" />
      <circle cx={14} cy={lookY} r={4.5} fill="#2D2006" />
      {sparkle && <circle cx={16} cy={-18} r={1.8} fill="white" />}

      {/* Eyebrows for moods */}
      {mood === "up" && (
        <g stroke="#6B4226" strokeWidth={2.5} strokeLinecap="round">
          <line x1={-20} y1={-28} x2={-8} y2={-26} />
          <line x1={8} y1={-26} x2={20} y2={-28} />
        </g>
      )}
      {mood === "down" && (
        <g stroke="#6B4226" strokeWidth={2.5} strokeLinecap="round">
          <line x1={-20} y1={-25} x2={-8} y2={-27} />
          <line x1={8} y1={-27} x2={20} y2={-25} />
        </g>
      )}
    </g>
  );
}

/* ── Mouth ── */
function Mouth({ mood }: { mood: ChimpMood }) {
  if (mood === "win") {
    // Big happy grin
    return (
      <g>
        <path d="M-14,6 Q0,20 14,6" fill="#6B4226" />
        <path d="M-10,6 Q0,14 10,6" fill="#FF8C8C" />
      </g>
    );
  }
  if (mood === "lose") {
    // Wobbly frown
    return <path d="M-10,10 Q0,2 10,10" stroke="#6B4226" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
  }
  if (mood === "up") {
    // Excited open mouth
    return (
      <g>
        <ellipse cx={0} cy={8} rx={8} ry={6} fill="#6B4226" />
        <ellipse cx={0} cy={6} rx={5} ry={3} fill="#FF8C8C" />
      </g>
    );
  }
  if (mood === "down") {
    // Worried
    return <path d="M-8,8 Q0,4 8,8" stroke="#6B4226" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
  }
  if (mood === "thinking") {
    // "Hmm" mouth
    return <path d="M-4,8 L8,6" stroke="#6B4226" strokeWidth={2.5} strokeLinecap="round" />;
  }
  // Idle smile
  return <path d="M-10,6 Q0,14 10,6" stroke="#6B4226" strokeWidth={2.5} fill="none" strokeLinecap="round" />;
}

/* ── Arms ── */
function Arms({ mood }: { mood: ChimpMood }) {
  const armColor = "#C4956A";

  if (mood === "win") {
    // Both arms raised
    return (
      <g>
        <path d="M-28,20 Q-45,-5 -35,-20" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={-35} cy={-22} r={7} fill={armColor} />
        <path d="M28,20 Q45,-5 35,-20" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={35} cy={-22} r={7} fill={armColor} />
      </g>
    );
  }

  if (mood === "up") {
    // Right arm up pointing
    return (
      <g>
        <path d="M-28,22 Q-42,30 -38,42" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={-38} cy={44} r={7} fill={armColor} />
        <path d="M28,20 Q45,0 40,-15" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={40} cy={-17} r={7} fill={armColor} />
      </g>
    );
  }

  if (mood === "lose") {
    // Arms down, droopy
    return (
      <g>
        <path d="M-28,25 Q-40,40 -32,55" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={-32} cy={57} r={7} fill={armColor} />
        <path d="M28,25 Q40,40 32,55" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={32} cy={57} r={7} fill={armColor} />
      </g>
    );
  }

  // Default / thinking / down — relaxed
  return (
    <g>
      <path d="M-28,22 Q-42,30 -38,42" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
      <circle cx={-38} cy={44} r={7} fill={armColor} />
      <path d="M28,22 Q42,30 38,42" stroke={armColor} strokeWidth={12} strokeLinecap="round" fill="none" />
      <circle cx={38} cy={44} r={7} fill={armColor} />
    </g>
  );
}

/* ── Banana ── */
function Banana({ mood }: { mood: ChimpMood }) {
  if (mood === "win" || mood === "lose") return null;

  // Banana in right hand
  const bx = mood === "up" ? 42 : 40;
  const by = mood === "up" ? -16 : 44;

  return (
    <g transform={`translate(${bx},${by}) rotate(${mood === "up" ? -30 : 15})`}>
      <path
        d="M-4,8 Q-6,-4 0,-10 Q6,-4 4,8 Q0,12 -4,8Z"
        fill="#FFD93D"
        stroke="#E6B800"
        strokeWidth={1.5}
      />
      <path d="M0,-10 Q2,-14 0,-16" stroke="#8B6914" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

/* ── Crown (win) ── */
function Crown() {
  return (
    <g transform="translate(0,-64)">
      <path
        d="M-18,6 L-22,-8 L-10,-2 L0,-12 L10,-2 L22,-8 L18,6Z"
        fill="#FFB800"
        stroke="#E6A200"
        strokeWidth={1.5}
      />
      <circle cx={-10} cy={-1} r={2} fill="#FF6B35" />
      <circle cx={0} cy={-5} r={2.5} fill="#F43F5E" />
      <circle cx={10} cy={-1} r={2} fill="#10B981" />
    </g>
  );
}

/* ── Rocket (up mood) ── */
function Rocket() {
  return (
    <g transform="translate(48,-30) rotate(30) scale(0.6)">
      <ellipse cx={0} cy={0} rx={6} ry={14} fill="#E0E0E0" stroke="#BDBDBD" strokeWidth={1.5} />
      <path d="M0,-14 Q0,-22 0,-14" fill="#F43F5E" />
      <circle cx={0} cy={-4} r={3} fill="#64B5F6" />
      <path d="M-5,10 Q-8,18 -2,14" fill="#FF6B35" opacity={0.8} />
      <path d="M5,10 Q8,18 2,14" fill="#FFB800" opacity={0.8} />
      <path d="M0,12 Q0,20 0,14" fill="#F43F5E" opacity={0.6} />
    </g>
  );
}

/* ── Sweat drops (lose) ── */
function SweatDrops() {
  return (
    <g>
      <path d="M-30,-30 Q-32,-38 -28,-38 Q-24,-38 -26,-30Z" fill="#64B5F6" opacity={0.7}>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.5s" repeatCount="indefinite" />
      </path>
      <path d="M32,-25 Q30,-33 34,-33 Q38,-33 36,-25Z" fill="#64B5F6" opacity={0.5}>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,10;0,0" dur="1.8s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

/* ── Level Accessory ── */
function LevelAccessory({ level }: { level: number }) {
  if (level <= 1) return null;

  return (
    <g>
      {/* Lv.2 침팬지: 빨간 반다나 */}
      {level === 2 && (
        <g transform="translate(0,-58)">
          <path d="M-30,0 Q-25,-8 0,-10 Q25,-8 30,0 Q25,2 0,1 Q-25,2 -30,0Z" fill="#F43F5E" />
          <path d="M26,-2 Q35,-12 42,-8 Q38,-2 30,0Z" fill="#F43F5E" />
          <path d="M28,-3 Q34,-10 38,-7" stroke="#DC2626" strokeWidth={1.5} fill="none" />
        </g>
      )}

      {/* Lv.3 고릴라: 선글라스 */}
      {level === 3 && (
        <g transform="translate(0,-16)">
          <rect x={-26} y={-8} width={20} height={12} rx={3} fill="#1E293B" opacity={0.9} />
          <rect x={6} y={-8} width={20} height={12} rx={3} fill="#1E293B" opacity={0.9} />
          <line x1={-6} y1={-2} x2={6} y2={-2} stroke="#1E293B" strokeWidth={2.5} />
          <line x1={-26} y1={-2} x2={-38} y2={-6} stroke="#1E293B" strokeWidth={2.5} />
          <line x1={26} y1={-2} x2={38} y2={-6} stroke="#1E293B" strokeWidth={2.5} />
          {/* Lens glare */}
          <rect x={-22} y={-6} width={4} height={3} rx={1} fill="white" opacity={0.3} />
          <rect x={10} y={-6} width={4} height={3} rx={1} fill="white" opacity={0.3} />
        </g>
      )}

      {/* Lv.4 킹콩: 금 목걸이 */}
      {level === 4 && (
        <g transform="translate(0,10)">
          <path d="M-20,12 Q0,22 20,12" stroke="#FFB800" strokeWidth={3} fill="none" />
          <circle cx={0} cy={22} r={6} fill="#FFB800" stroke="#E6A200" strokeWidth={1.5} />
          <text x={0} y={25} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#8B6914">$</text>
        </g>
      )}

      {/* Lv.5 전설의침팬지: 왕관 + 망토 */}
      {level >= 5 && (
        <g>
          {/* 왕관 (더 화려하게) */}
          <g transform="translate(0,-64)">
            <path
              d="M-22,8 L-26,-10 L-12,-3 L0,-16 L12,-3 L26,-10 L22,8Z"
              fill="#FFB800"
              stroke="#E6A200"
              strokeWidth={1.5}
            />
            <circle cx={-12} cy={-1} r={2.5} fill="#F43F5E" />
            <circle cx={0} cy={-8} r={3} fill="#A78BFA" />
            <circle cx={12} cy={-1} r={2.5} fill="#10B981" />
            {/* 보석 빛남 */}
            <circle cx={0} cy={-8} r={5} fill="#A78BFA" opacity={0.2}>
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
          {/* 망토 */}
          <path
            d="M-28,20 Q-35,40 -30,65 Q-15,58 0,62 Q15,58 30,65 Q35,40 28,20"
            fill="#7C3AED"
            opacity={0.7}
          />
          <path
            d="M-28,20 Q-35,40 -30,65 Q-15,58 0,62 Q15,58 30,65 Q35,40 28,20"
            fill="none"
            stroke="#6D28D9"
            strokeWidth={1.5}
          />
        </g>
      )}
    </g>
  );
}

/* ── Confetti (win) ── */
function Confetti() {
  const colors = ["#FFB800", "#10B981", "#F43F5E", "#FF6B35", "#64B5F6", "#A78BFA"];
  const particles = Array.from({ length: 16 }, (_, i) => ({
    x: 20 + Math.sin(i * 1.2) * 80,
    y: 15 + Math.cos(i * 0.9) * 70,
    color: colors[i % colors.length],
    size: 3 + (i % 3) * 2,
    delay: (i * 0.15).toFixed(2),
    shape: i % 3,
  }));

  return (
    <g>
      {particles.map((p, i) => (
        <g key={i}>
          {p.shape === 0 && (
            <circle cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={0.8}>
              <animateTransform attributeName="transform" type="translate" values="0,-20;0,20;0,-20" dur="2s" begin={`${p.delay}s`} repeatCount="indefinite" />
            </circle>
          )}
          {p.shape === 1 && (
            <rect x={p.x - p.size / 2} y={p.y - p.size / 2} width={p.size} height={p.size} fill={p.color} opacity={0.8} transform={`rotate(${i * 30}, ${p.x}, ${p.y})`}>
              <animateTransform attributeName="transform" type="translate" values="0,-15;0,25;0,-15" dur="2.2s" begin={`${p.delay}s`} repeatCount="indefinite" />
            </rect>
          )}
          {p.shape === 2 && (
            <polygon points={`${p.x},${p.y - p.size} ${p.x + p.size},${p.y + p.size} ${p.x - p.size},${p.y + p.size}`} fill={p.color} opacity={0.8}>
              <animateTransform attributeName="transform" type="translate" values="0,-10;0,30;0,-10" dur="1.8s" begin={`${p.delay}s`} repeatCount="indefinite" />
            </polygon>
          )}
        </g>
      ))}
    </g>
  );
}
