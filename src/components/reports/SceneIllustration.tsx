import { hash } from '../../lib/cn'
import type { IncidentCategory } from '../../types/report'

/**
 * Illustrative road scene used in place of photographs for DEMO reports.
 * Deliberately stylised so it can't be mistaken for a real photo.
 */
export function SceneIllustration({ category, seed = '' }: { category: IncidentCategory; seed?: string }) {
  const v = hash(seed + category)
  const rainy = category === 'flooding' || category === 'landslide'
  const dusk = category === 'other' || v % 5 === 0
  const sky = dusk ? ['#1E293B', '#475569'] : rainy ? ['#94A3B8', '#CBD5E1'] : ['#BFE3CF', '#EAF6EE']
  const hill = dusk ? '#334155' : rainy ? '#6B8F71' : '#86C29A'
  const hill2 = dusk ? '#1F2937' : rainy ? '#4D7356' : '#5FAF7A'
  const id = `g${v}`
  const curve = (v % 3) - 1 // -1, 0, 1 lean of the road

  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Illustrative sample image">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6B7280" />
          <stop offset="1" stopColor="#374151" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}s)`} />
      <path d={`M0 128 Q ${90 + curve * 20} 92 190 118 T 400 104 V 240 H0Z`} fill={hill} />
      <path d={`M0 146 Q 120 120 230 140 T 400 132 V240 H0Z`} fill={hill2} />
      {/* road */}
      <path d={`M${170 + curve * 18} 132 L${230 + curve * 18} 132 L360 240 L40 240Z`} fill={`url(#${id}r)`} />
      <path
        d={`M${200 + curve * 18} 136 L200 240`}
        stroke="#F8FAFC"
        strokeWidth="4"
        strokeDasharray="14 14"
        opacity="0.85"
      />
      {/* streetlights / poles */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={0.75}>
          <rect x={84 - i * 24} y={110 + i * 22} width="3" height={34 + i * 14} fill="#475569" />
          <circle cx={86 - i * 24} cy={110 + i * 22} r="3.4" fill={dusk && category === 'other' && i !== 1 ? '#475569' : '#FDE68A'} />
        </g>
      ))}
      {category === 'pothole' && (
        <g>
          <ellipse cx="208" cy="200" rx="46" ry="13" fill="#1F2937" />
          <ellipse cx="208" cy="197" rx="38" ry="9" fill="#111827" />
          <path d="M150 192 l18 4 M260 206 l22 -6 M176 214 l14 8" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {category === 'flooding' && (
        <g>
          <path d="M0 176 Q 50 168 100 176 T 200 176 T 300 176 T 400 176 V240 H0Z" fill="#60A5FA" opacity="0.75" />
          <path d="M20 196 q 20 -6 40 0 M140 210 q 24 -6 48 0 M270 198 q 22 -6 44 0" stroke="#DBEAFE" strokeWidth="3" fill="none" strokeLinecap="round" />
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1={(i * 37 + v) % 400} y1={(i * 23) % 120} x2={((i * 37 + v) % 400) - 6} y2={((i * 23) % 120) + 14} stroke="#F1F5F9" strokeWidth="1.5" opacity="0.7" />
          ))}
        </g>
      )}
      {category === 'accident' && (
        <g>
          <rect x="150" y="170" width="60" height="30" rx="8" fill="#F8FAFC" />
          <rect x="160" y="160" width="40" height="16" rx="5" fill="#CBD5E1" />
          <rect x="214" y="178" width="58" height="28" rx="8" fill="#DC2626" transform="rotate(-12 243 192)" />
          <circle cx="190" cy="156" r="6" fill="#F59E0B" />
          <path d="M120 222 l10 -18 l10 18Z M300 226 l10 -18 l10 18Z" fill="#F97316" />
        </g>
      )}
      {category === 'obstruction' && (
        <g>
          <rect x="196" y="150" width="96" height="52" rx="6" fill="#E2E8F0" />
          <rect x="270" y="164" width="34" height="38" rx="5" fill="#16A34A" />
          <circle cx="216" cy="206" r="9" fill="#111827" />
          <circle cx="282" cy="206" r="9" fill="#111827" />
          <path d="M150 220 l12 -22 l12 22Z" fill="#F97316" />
          <rect x="155" y="210" width="14" height="3" fill="#fff" />
        </g>
      )}
      {category === 'debris' && (
        <g>
          <path d="M90 196 C150 170 220 186 300 174" stroke="#78350F" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M150 182 l-20 -24 M210 180 l14 -26 M250 178 l26 -14 M120 190 l-30 -10" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          {[[130, 156], [222, 150], [280, 160], [90, 176], [176, 168]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={14 - (i % 3) * 2} fill={i % 2 ? '#15803D' : '#166534'} />
          ))}
        </g>
      )}
      {category === 'construction' && (
        <g>
          {[130, 170, 230, 270].map((x, i) => (
            <g key={x}>
              <path d={`M${x} ${212 - i * 4} l10 -24 l10 24Z`} fill="#F97316" />
              <rect x={x + 4} y={200 - i * 4} width="12" height="3" fill="#fff" />
            </g>
          ))}
          <rect x="180" y="170" width="64" height="10" fill="#FACC15" />
          <path d="M184 170 l8 10 M200 170 l8 10 M216 170 l8 10 M232 170 l8 10" stroke="#111827" strokeWidth="3" />
          <rect x="300" y="140" width="50" height="34" rx="4" fill="#EAB308" />
          <path d="M340 140 l30 -30" stroke="#CA8A04" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
      {category === 'landslide' && (
        <g>
          <path d="M260 96 C 300 120 330 150 370 240 L 250 240 C 250 190 230 160 210 150Z" fill="#92400E" />
          {[[230, 190, 10], [262, 210, 14], [205, 214, 8], [290, 196, 9], [240, 226, 7]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#78716C' : '#57534E'} />
          ))}
        </g>
      )}
      {category === 'traffic' && (
        <g>
          {[
            [150, 150, '#F8FAFC', 0.7],
            [222, 150, '#DC2626', 0.7],
            [120, 178, '#2563EB', 0.9],
            [232, 180, '#F59E0B', 0.9],
            [92, 210, '#F8FAFC', 1.1],
            [250, 212, '#16A34A', 1.1],
          ].map(([x, y, c, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <rect x="0" y="0" width="44" height="22" rx="6" fill={c as string} />
              <rect x="6" y="-8" width="30" height="12" rx="4" fill="#CBD5E1" />
              <circle cx="4" cy="14" r="2.5" fill="#EF4444" />
              <circle cx="40" cy="14" r="2.5" fill="#EF4444" />
            </g>
          ))}
        </g>
      )}
      {category === 'other' && (
        <g>
          <path d="M290 176 l18 -32 l18 32Z" fill="#FACC15" stroke="#111827" strokeWidth="3" strokeLinejoin="round" />
          <rect x="305" y="176" width="4" height="40" fill="#475569" />
          <text x="308" y="171" textAnchor="middle" fontSize="16" fontWeight="800" fill="#111827">!</text>
        </g>
      )}
    </svg>
  )
}
