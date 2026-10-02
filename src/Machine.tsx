import type { CSSProperties } from "react";
import { Pepe } from "./Pepe";
import { prizes, targets, type Phase, type Prize } from "./game";

type Props = {
  phase: Phase;
  position: number;
  caught: Prize | null;
  celebrating: boolean;
  motion: boolean;
};

export default function Machine({
  phase,
  position,
  caught,
  celebrating,
  motion,
}: Props) {
  const pressed = phase === "press-play" || phase === "press-drop";
  const y = phase === "dropping" ? 352 : 265;
  const x = phase === "delivering" ? 466 : position;
  const lifted = ["lifting", "delivering"].includes(phase) && caught;
  return (
    <svg
      className={`machine-scene ${pressed ? "pressing" : ""} ${celebrating ? "celebrating" : ""} ${motion ? "" : "motion-paused"}`}
      viewBox="0 0 800 655"
      role="img"
      aria-labelledby="machine-title machine-description"
      data-phase={phase}
    >
      <title id="machine-title">Pepe’s lucky prize machine</title>
      <desc id="machine-description">
        A giant green Pepe claw machine with five friends in different hats.
        Your Pepe stands beside the red button.{" "}
        {phase === "won"
          ? `${caught?.name} is waiting in the collection hatch. The crew is celebrating!`
          : phase === "aiming"
            ? "The claw is ready. Use the controls to aim above a prize."
            : "Play a round to bring a little Pepe home."}
      </desc>
      <defs>
        <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#e4edce" />
          <stop offset="1" stopColor="#b5c6a0" />
        </linearGradient>
        <linearGradient id="case" x1="0" x2="1">
          <stop stopColor="#efe1b9" />
          <stop offset=".5" stopColor="#f8edce" />
          <stop offset="1" stopColor="#e9d8aa" />
        </linearGradient>
        <clipPath id="chamber">
          <rect x="235" y="222" width="278" height="221" rx="15" />
        </clipPath>
        <pattern
          id="floor-grid"
          width="48"
          height="26"
          patternUnits="userSpaceOnUse"
          patternTransform="skewX(-30)"
        >
          <path d="M48 0H0V26" fill="none" stroke="#d9ddc5" strokeWidth=".7" />
        </pattern>
      </defs>
      <ellipse cx="395" cy="544" rx="337" ry="100" fill="#e8e9d7" />
      <ellipse cx="395" cy="544" rx="337" ry="100" fill="url(#floor-grid)" />
      <ellipse cx="392" cy="583" rx="227" ry="31" fill="#344d32" opacity=".1" />
      <g
        className="scene-sparkles"
        fill="none"
        stroke="#7c9168"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="m159 176 0 18m-9-9h18m432 43v14m-7-7h14M193 339v13m-7-6h14M588 111v22m-10-11h20" />
        <circle cx="155" cy="281" r="3" />
        <circle cx="641" cy="334" r="3" />
      </g>
      <g transform="translate(118 383) scale(.81)">
        <Pepe hat="bucket" shirt="#d8a887" className="spectator spectator-1" />
      </g>
      <g transform="translate(616 374) scale(.79)">
        <Pepe hat="wizard" shirt="#b3a5ca" className="spectator spectator-2" />
      </g>
      <g stroke="#384832" strokeWidth="3" strokeLinejoin="round">
        <path
          d="M249 559v33q13 10 26 0v-28m204-5v33q13 10 26 0v-28"
          fill="#708657"
        />
        <path d="m524 175 29 22v363l-23 21-22-21Z" fill="#a4b67c" />
        <rect
          x="214"
          y="172"
          width="321"
          height="405"
          rx="26"
          fill="url(#case)"
        />
        <path d="M215 472H535V551q0 26-26 26H239q-25 0-25-26Z" fill="#d7dfb4" />
        <rect x="228" y="214" width="292" height="238" rx="19" fill="#7f9369" />
        <rect
          x="235"
          y="222"
          width="278"
          height="221"
          rx="15"
          fill="url(#glass)"
          strokeWidth="2"
        />
        <g clipPath="url(#chamber)">
          <path d="M241 433h268v15H241" fill="#93a878" stroke="none" />
          <path
            d="M272 223h9l-34 197h-9Zm30 0h24l-34 197h-24Z"
            fill="#fffdf0"
            opacity=".24"
            stroke="none"
          />
          <path d="M237 241H512" stroke="#66785b" strokeWidth="6" />
          <path d="M240 239H510" stroke="#f6efd7" strokeWidth="2" />
          {prizes.map((prize, index) => (
            <g
              key={prize.id}
              transform={`translate(${targets[index] - 27} 373) scale(.57)`}
              opacity={lifted && caught.id === prize.id ? 0 : 1}
            >
              <Pepe hat={prize.hat} />
            </g>
          ))}
          <g
            className="claw-position"
            style={{ transform: `translate(${x}px, 0px)` }}
          >
            <path
              className="claw-cable"
              d={`M0 244V${y}`}
              stroke="#66725e"
              strokeWidth="3"
            />
            <rect
              x="-16"
              y="234"
              width="32"
              height="13"
              rx="4"
              fill="#e3d7b4"
              strokeWidth="2"
            />
            <g
              className="claw-height"
              style={{ transform: `translateY(${y}px)` }}
            >
              {lifted && (
                <g transform="translate(-25 22) scale(.52)">
                  <Pepe hat={caught.hat} />
                </g>
              )}
              <path
                d="M-9 13-24 30l7 20 8-6m18-31 24 17-7 20-8-6"
                fill="none"
                stroke="#576950"
                strokeWidth="7"
              />
              <path
                d="M-9 13-24 30l7 20 8-6m18-31 24 17-7 20-8-6"
                fill="none"
                stroke="#d7d8bd"
                strokeWidth="3"
              />
              <path d="M0 10v29" fill="none" stroke="#576950" strokeWidth="5" />
              <rect
                x="-12"
                y="-3"
                width="24"
                height="22"
                rx="8"
                fill="#d7d8bd"
                strokeWidth="2"
              />
            </g>
          </g>
        </g>
        <g className="giant-pepe">
          <path
            d="M212 127Q197 57 252 50Q296 43 319 90Q345 40 401 49Q457 51 466 108Q520 123 527 168Q531 199 501 209Q374 232 239 208Q188 196 212 127Z"
            fill="#91b169"
          />
          <path
            d="M210 163Q263 184 351 179Q459 182 519 157Q541 199 499 209Q375 228 239 208Q206 201 210 163Z"
            fill="#7e9c59"
            stroke="none"
          />
          <path
            d="M224 109Q251 79 302 105L301 135Q260 155 224 134Z"
            fill="#fcf7dd"
          />
          <path
            d="M335 105Q390 77 431 110L434 137Q388 153 337 134Z"
            fill="#fcf7dd"
          />
          <path d="m225 110 77 2m35-3 93 4" strokeWidth="4" />
          <path
            d="M276 113v21m128-20v21"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M229 169Q338 184 471 161Q495 165 477 184Q359 215 242 188Q224 184 229 169Z"
            fill="#be8561"
          />
          <path
            d="M237 177Q355 200 479 173"
            fill="none"
            stroke="#75513b"
            strokeWidth="3"
          />
          <path d="m236 157 9-2m229-10 8 3" fill="none" strokeWidth="2" />
        </g>
        <path d="m214 447-17 19 8 23h338l8-21-16-21Z" fill="#ecdeb9" />
        <path d="M204 470H543" fill="none" stroke="#c4b790" strokeWidth="2" />
        <rect
          x="237"
          y="458"
          width="122"
          height="19"
          rx="9"
          fill="#344e39"
          stroke="none"
        />
        <text
          x="298"
          y="471"
          fill="#f7efcf"
          stroke="none"
          fontSize="10"
          textAnchor="middle"
          fontFamily="sans-serif"
          letterSpacing="2"
        >
          GOOD LUCK, FREN
        </text>
        <ellipse cx="493" cy="468" rx="23" ry="11" fill="#8e6c48" />
        <g className="machine-button">
          <path d="M475 459v7q18 14 36 0v-7Z" fill="#b85440" />
          <ellipse cx="493" cy="458" rx="18" ry="9" fill="#e78260" />
          <path
            d="M482 455q9-4 15-2"
            fill="none"
            stroke="#f7bf91"
            strokeWidth="2"
          />
        </g>
        <rect
          x="246"
          y="510"
          width="116"
          height="47"
          rx="16"
          fill="#708457"
          strokeWidth="2"
        />
        <path
          d="M250 532q58-28 108 0"
          fill="none"
          stroke="#43553a"
          strokeWidth="3"
        />
        <rect
          x="400"
          y="501"
          width="99"
          height="60"
          rx="12"
          fill="#61734e"
          strokeWidth="2"
        />
        <path d="M405 511h89v42h-89" fill="#384a32" stroke="none" />
        <text
          x="449"
          y="495"
          fill="#526342"
          stroke="none"
          fontSize="8"
          fontFamily="sans-serif"
          letterSpacing="1.6"
          textAnchor="middle"
        >
          HAPPY LITTLE THINGS
        </text>
        {(phase === "delivering" || phase === "won") && caught && (
          <g
            className={`hatch-prize ${phase === "delivering" ? "arriving" : ""}`}
            data-testid="hatch-prize"
            transform="translate(429 509) scale(.4)"
          >
            <Pepe hat={caught.hat} />
          </g>
        )}
        <path d="M403 552h94v8h-94Z" fill="#aebe88" strokeWidth="2" />
        <path
          d="M234 486v72M521 486v65"
          fill="none"
          stroke="#bdc798"
          strokeWidth="2"
        />
      </g>
      <g transform="translate(62 469) scale(.87)">
        <Pepe hat="beanie" shirt="#c48c75" className="spectator spectator-3" />
      </g>
      <g transform="translate(162 491) scale(.83)">
        <Pepe hat="cap" shirt="#e2c37d" className="spectator spectator-4" />
      </g>
      <g transform="translate(658 473) scale(.86)">
        <Pepe hat="flower" shirt="#be9daa" className="spectator spectator-5" />
      </g>
      <g transform="translate(552 402) scale(1.08)">
        <Pepe className="player" shirt="#7899c1" />
      </g>
      <g transform="translate(573 560)">
        <rect width="65" height="24" rx="12" fill="#fbf8ee" stroke="#b2bda0" />
        <circle cx="13" cy="12" r="3" fill="#3f6845" />
        <text
          x="38"
          y="16"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="#3f5138"
          letterSpacing="1.3"
        >
          YOU
        </text>
      </g>
      <g className="chat-bubble" transform="translate(87 383)">
        <path
          d="M0 0q-7 0-7 8v12q0 8 8 8h18l8 7-1-7h6q8 0 8-8V8q0-8-8-8Z"
          fill="#fffaf0"
          stroke="#abb897"
          strokeWidth="1.5"
        />
        <text x="14" y="20" textAnchor="middle" fontSize="20" fill="#788564">
          ···
        </text>
      </g>
      {celebrating && (
        <g className="celebration" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <rect
              className="confetti"
              key={i}
              x={130 + ((i * 83) % 560)}
              y={130 + (i % 4) * 70}
              width="6"
              height="11"
              rx="1"
              fill={["#e2b44d", "#8aaf64", "#b2a1cf", "#de9173"][i % 4]}
              style={
                {
                  "--delay": `${i * 0.047}s`,
                  "--rotation": `${i * 37}deg`,
                } as CSSProperties
              }
            />
          ))}
          <g transform="translate(613 343) rotate(7)">
            <rect
              width="105"
              height="33"
              rx="15"
              fill="#fcf8e9"
              stroke="#809167"
            />
            <text
              x="52"
              y="22"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#3f583b"
            >
              LET’S GOO!
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
