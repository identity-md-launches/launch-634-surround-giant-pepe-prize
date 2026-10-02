import type { CSSProperties } from "react";

export type Hat =
  | "none"
  | "bucket"
  | "wizard"
  | "crown"
  | "cap"
  | "beanie"
  | "flower";

export function Pepe({
  hat = "none",
  shirt = "#708fba",
  className = "",
  style,
}: {
  hat?: Hat;
  shirt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <g
      className={`pepe ${className}`}
      style={style}
      stroke="#354332"
      strokeWidth="2.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <g className="pepe-body">
        <path
          d="M28 101 25 115Q12 121 11 114L17 99M65 102 72 113Q87 116 86 121L65 123 56 108"
          fill="#85a85e"
        />
        <path d="M25 66Q48 58 69 70L75 103Q48 115 20 102Z" fill={shirt} />
        <path
          d="M25 77Q22 90 9 96"
          className="left-arm"
          fill="none"
          stroke="#354332"
          strokeWidth="13"
        />
        <path
          d="M25 77Q22 90 9 96"
          className="left-arm"
          fill="none"
          stroke="#91b96b"
          strokeWidth="9"
        />
        <g className="left-hand">
          <path d="M5 94q-8-4-5 3l4 6q7 5 11-2l-3-6" fill="#91b96b" />
        </g>
        <g className="right-arm">
          <path d="M68 78q15 9 10 21" fill="none" strokeWidth="13" />
          <path
            d="M68 78q15 9 10 21"
            fill="none"
            stroke="#91b96b"
            strokeWidth="9"
          />
          <path d="M74 98q-5 9 3 10q9-1 8-10" fill="#91b96b" />
        </g>
        <path
          d="M15 28C9 6 37 2 45 21C58 1 88 10 83 32Q98 58 73 71Q47 84 20 68Q1 56 15 28Z"
          fill="#91b96b"
        />
        <path
          d="M13 48Q11 71 44 74Q79 76 88 55Q71 69 48 65Q28 62 13 48"
          fill="#7fa75b"
          stroke="none"
        />
        <g className="eyes">
          <path d="M14 27Q24 12 42 28L40 41Q23 48 13 37Z" fill="#fbf7df" />
          <path d="M47 28Q66 14 82 31L82 41Q61 50 46 39Z" fill="#fbf7df" />
          <path d="M15 28 41 29M47 30 80 32" fill="none" />
          <path d="M32 30v9m34-7v9" strokeWidth="5" />
        </g>
        <path
          d="M17 51Q38 57 75 51Q86 53 78 59Q48 70 22 59Q14 58 17 51Z"
          fill="#bd8060"
        />
        <path
          d="M20 55Q48 62 78 55"
          fill="none"
          stroke="#744b37"
          strokeWidth="2"
        />
        <path d="m20 48 4-1m48 1 4 1" fill="none" strokeWidth="1.5" />
        {hat === "bucket" && (
          <g fill="#ecc563">
            <path d="M18 18 25-5Q45-14 65-3L73 22Z" />
            <path d="M13 17Q43 12 76 21L84 29Q45 27 10 25Z" />
            <path d="M27 5q16-4 31 1" fill="none" stroke="#bf9541" />
          </g>
        )}
        {hat === "beanie" && (
          <g fill="#d68e72">
            <path d="M17 19Q18-11 47-10Q73-7 77 22Z" />
            <path d="M15 15Q44 7 78 20L79 29Q43 18 14 24Z" />
            <circle cx="47" cy="-12" r="7" />
            <path
              d="m28 5 1 8m15-12v10m14-8 3 9"
              fill="none"
              stroke="#9c6453"
            />
          </g>
        )}
        {hat === "cap" && (
          <g fill="#7297b4">
            <path d="M16 19Q18-9 45-7Q72-5 75 24Z" />
            <path d="M40 17Q70 14 88 29Q63 33 41 24Z" />
            <path d="M44-6Q31 3 32 18" fill="none" />
            <circle cx="45" cy="-8" r="3" />
          </g>
        )}
        {hat === "wizard" && (
          <g fill="#a49acb">
            <path d="m20 18 23-55 24 58Z" />
            <path d="M8 23Q42 11 79 25Q83 37 45 31Q14 34 8 23Z" />
            <path
              d="m42-18 2 5 6 1-5 4 1 6-5-4-5 3 2-6-4-4 6-1Z"
              fill="#fff2ba"
              stroke="none"
            />
          </g>
        )}
        {hat === "crown" && (
          <g fill="#efc95f">
            <path d="m18 17-4-27 20 11 11-21 13 22 18-13-4 31Z" />
            <path d="m20 12 50 3" />
            <circle cx="45" cy="7" r="4" fill="#dc916e" />
          </g>
        )}
        {hat === "flower" && (
          <g fill="#e9c5ca">
            <path d="M18 19Q25-6 51-3Q69 0 74 23Z" fill="#d9b89b" />
            <path d="M10 21Q43 7 82 27Q46 32 10 28Z" fill="#d9b89b" />
            <g transform="translate(65 12)">
              <circle cx="-6" cy="-3" r="6" />
              <circle cx="5" cy="-6" r="6" />
              <circle cx="8" cy="5" r="6" />
              <circle cx="-3" cy="8" r="6" />
              <circle r="5" fill="#efce65" />
            </g>
          </g>
        )}
      </g>
    </g>
  );
}

export function PepePortrait({
  hat = "none",
  className = "",
}: {
  hat?: Hat;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="-4 -42 105 172" aria-hidden="true">
      <Pepe hat={hat} />
    </svg>
  );
}
