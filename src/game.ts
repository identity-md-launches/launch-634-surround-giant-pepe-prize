export const prizes = [
  {
    id: "classic",
    name: "Classic Pepe",
    subtitle: "The original good mood.",
    rarity: "Classic",
    color: "#dce8cb",
    hat: "none",
  },
  {
    id: "sunshine",
    name: "Sunshine Pepe",
    subtitle: "A little ray of ribbit.",
    rarity: "Uncommon",
    color: "#f6e7bb",
    hat: "bucket",
  },
  {
    id: "cosmic",
    name: "Cosmic Pepe",
    subtitle: "Head in the stars.",
    rarity: "Rare",
    color: "#e4dff0",
    hat: "wizard",
  },
  {
    id: "royal",
    name: "King Pepe",
    subtitle: "Big crown. Bigger vibes.",
    rarity: "Legendary",
    color: "#f0d6c7",
    hat: "crown",
  },
] as const;

export type Prize = (typeof prizes)[number];
export type Phase =
  | "idle"
  | "press-play"
  | "aiming"
  | "press-drop"
  | "dropping"
  | "lifting"
  | "delivering"
  | "won"
  | "missed";
export type Collection = Record<string, number>;
export const targets = [270, 337, 407, 475];
export const timing = {
  press: 520,
  drop: 950,
  lift: 950,
  deliver: 1000,
  celebrate: 3600,
};

export function catchAt(position: number): Prize | null {
  const index = targets.findIndex(
    (target) => Math.abs(target - position) <= 24,
  );
  return index < 0 ? null : prizes[index];
}

export function clampPosition(position: number) {
  return Math.min(489, Math.max(249, position));
}

export function parseCollection(raw: string | null): Collection {
  try {
    const value: unknown = JSON.parse(raw ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      prizes.map((prize) => {
        const count = (value as Record<string, unknown>)[prize.id];
        return [
          prize.id,
          typeof count === "number" && Number.isSafeInteger(count) && count > 0
            ? Math.min(count, 9999)
            : 0,
        ];
      }),
    );
  } catch {
    return {};
  }
}
