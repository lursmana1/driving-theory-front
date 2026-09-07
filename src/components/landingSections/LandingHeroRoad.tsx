/**
 * Top-down "P"-shaped road illustration for the landing hero.
 * Explicit width/height keep the reserved box stable (no layout shift).
 */
const ROAD_PATH =
  "M250 620 V325 C250 182 332 108 420 108 C506 108 548 176 548 262 V334 C548 402 588 428 641 402 C688 379 712 330 720 292";

const START_LINE_CELLS = 8;
const CELL = 12;
const STEM_X = 250;
const ROAD_HALF_WIDTH = 48;

export function LandingHeroRoad() {
  const startLineX = STEM_X - ROAD_HALF_WIDTH;

  return (
    <svg
      className="landing-road h-auto w-full max-w-[620px]"
      viewBox="0 0 740 620"
      width={740}
      height={620}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* olive hill tucked into the corner between the loop and the exit */}
      <g transform="rotate(-28 686 262)">
        <ellipse cx="686" cy="262" rx="118" ry="74" fill="#6E7C4C" />
        <ellipse cx="686" cy="262" rx="118" ry="74" fill="#000" opacity="0.06" />
      </g>
      <g fill="#59663C">
        <ellipse cx="706" cy="206" rx="15" ry="8" />
        <ellipse cx="736" cy="246" rx="12" ry="7" />
        <ellipse cx="672" cy="182" rx="10" ry="6" />
      </g>

      {/* asphalt: dark outline, white edge lines, then the road surface */}
      <path d={ROAD_PATH} stroke="#2A2A22" strokeWidth="98" strokeLinecap="butt" />
      <path d={ROAD_PATH} stroke="#F0EBDF" strokeWidth="92" strokeLinecap="butt" />
      <path d={ROAD_PATH} stroke="#3A3B33" strokeWidth="86" strokeLinecap="butt" />
      {/* dashed centre line */}
      <path
        d={ROAD_PATH}
        stroke="#F6F2E7"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="14 18"
        opacity="0.9"
      />

      {/* checkered start line */}
      <g>
        {Array.from({ length: START_LINE_CELLS }).map((_, i) => (
          <g key={i}>
            <rect
              x={startLineX + i * CELL}
              y={566}
              width={CELL}
              height={CELL}
              fill={i % 2 === 0 ? "#F6F2E7" : "#22251C"}
            />
            <rect
              x={startLineX + i * CELL}
              y={578}
              width={CELL}
              height={CELL}
              fill={i % 2 === 0 ? "#22251C" : "#F6F2E7"}
            />
          </g>
        ))}
      </g>

      {/* learner car, nose up */}
      <g transform={`translate(${STEM_X} 452)`}>
        <ellipse cx="0" cy="36" rx="22" ry="8" fill="#22251C" opacity="0.25" />
        <rect x="-21" y="-34" width="42" height="68" rx="13" fill="#B4543C" />
        <rect x="-21" y="-34" width="42" height="68" rx="13" fill="url(#carSheen)" />
        <path
          d="M-14 -24 h28 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-28 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 4 -4 z"
          fill="#2C3028"
          opacity="0.85"
        />
        <path
          d="M-14 20 h28 a4 4 0 0 0 4 -4 v-7 a4 4 0 0 0 -4 -4 h-28 a4 4 0 0 0 -4 4 v7 a4 4 0 0 0 4 4 z"
          fill="#2C3028"
          opacity="0.65"
        />
        <rect x="-24" y="-16" width="3.5" height="14" rx="1.75" fill="#8C3E2C" />
        <rect x="20.5" y="-16" width="3.5" height="14" rx="1.75" fill="#8C3E2C" />
        <rect x="-10" y="-5" width="20" height="15" rx="3" fill="#F6F2E7" />
        <text
          x="0"
          y="6.5"
          textAnchor="middle"
          fill="#B4543C"
          fontSize="12"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          L
        </text>
      </g>

      {/* mandatory-direction sign on the hill */}
      <g transform="translate(660 232)">
        <rect x="-2" y="-4" width="4" height="30" fill="#877F6B" />
        <circle cy="-24" r="20" fill="#3F6C86" />
        <circle cy="-24" r="16.5" fill="#3F6C86" stroke="#F6F2E7" strokeWidth="2" />
        <path
          d="M-6 -17 v-6 a4 4 0 0 1 4 -4 h6"
          stroke="#F6F2E7"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M4 -33 l7 6 l-7 6 z" fill="#F6F2E7" />
      </g>

      {/* numbered callouts */}
      <g
        fill="#22251C"
        fontFamily="system-ui, sans-serif"
        fontSize="12"
        fontWeight="700"
      >
        <path d="M126 470 H198" stroke="#22251C" strokeWidth="1" />
        <circle cx="198" cy="470" r="3" fill="#22251C" />
        <circle cx="106" cy="470" r="18" fill="#F0EBDF" stroke="#22251C" strokeWidth="1.2" />
        <text x="106" y="474" textAnchor="middle">
          01
        </text>

        <path d="M126 252 H200" stroke="#22251C" strokeWidth="1" />
        <circle cx="200" cy="252" r="3" fill="#22251C" />
        <circle cx="106" cy="252" r="18" fill="#F0EBDF" stroke="#22251C" strokeWidth="1.2" />
        <text x="106" y="256" textAnchor="middle">
          02
        </text>

        <path d="M690 100 L672 176" stroke="#22251C" strokeWidth="1" />
        <circle cx="694" cy="82" r="18" fill="#F0EBDF" stroke="#22251C" strokeWidth="1.2" />
        <text x="694" y="86" textAnchor="middle">
          03
        </text>
      </g>

      <defs>
        <linearGradient id="carSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#22251C" stopOpacity="0.16" />
        </linearGradient>
      </defs>
    </svg>
  );
}
