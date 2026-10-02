import { useEffect, useRef, useState } from "react";
import Machine from "./Machine";
import { PepePortrait } from "./Pepe";
import {
  catchAt,
  clampPosition,
  parseCollection,
  prizes,
  timing,
  type Collection,
  type Phase,
  type Prize,
} from "./game";

function containDialogFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>(
    "button:not(:disabled)",
  );
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

function Icon({
  name,
  size = 20,
}: {
  name:
    | "arrow"
    | "sound"
    | "mute"
    | "bag"
    | "help"
    | "close"
    | "spark"
    | "pause"
    | "play";
  size?: number;
}) {
  const paths: Record<typeof name, React.ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    sound: (
      <>
        <path d="m11 5-5 4H3v6h3l5 4Z" />
        <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
      </>
    ),
    mute: (
      <>
        <path d="m11 5-5 4H3v6h3l5 4Z" />
        <path d="m16 9 5 6m0-6-5 6" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1 12H4Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2m0 3h.01" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    spark: (
      <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" />
    ),
    pause: (
      <>
        <path d="M8 5v14m8-14v14" strokeWidth="3" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const messages: Record<Phase, string> = {
  idle: "Your next little friend is one grab away.",
  "press-play": "Pepe is pressing the button…",
  aiming: "Move the claw above a Pepe, then press Drop.",
  "press-drop": "One little push. Fingers crossed…",
  dropping: "Going in! The whole crew is watching.",
  lifting: "Hold tight, little friend…",
  delivering: "A special delivery for you…",
  won: "A new friend! Pick them up in the hatch.",
  missed: "So close! Aim over a Pepe and try again.",
};

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [position, setPosition] = useState(337);
  const [caught, setCaught] = useState<Prize | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [motion, setMotion] = useState(true);
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [collection, setCollection] = useState<Collection>(() => {
    try {
      return parseCollection(localStorage.getItem("pepe-lucky-collection-v1"));
    } catch {
      return {};
    }
  });
  const helpDialog = useRef<HTMLDialogElement>(null);
  const collectionDialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const primaryButton = useRef<HTMLButtonElement>(null);
  const busy = !["idle", "aiming", "won", "missed"].includes(phase);
  const total = Object.values(collection).reduce(
    (sum, count) => sum + count,
    0,
  );
  const unique = prizes.filter((prize) => collection[prize.id] > 0).length;

  function tone(frequency: number, duration = 0.12) {
    if (!sound) return;
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      void context.resume().catch(() => setSoundError(true));
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.065, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration,
      );
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch {
      setSoundError(true);
      setSound(false);
    }
  }

  useEffect(() => {
    const transitions: Partial<Record<Phase, [number, Phase]>> = {
      "press-play": [timing.press, "aiming"],
      "press-drop": [timing.press, "dropping"],
      dropping: [timing.drop, "lifting"],
      lifting: [timing.lift, caught ? "delivering" : "missed"],
      delivering: [timing.deliver, "won"],
    };
    const next = transitions[phase];
    if (!next) return;
    const timer = window.setTimeout(() => setPhase(next[1]), next[0]);
    return () => window.clearTimeout(timer);
  }, [phase, caught]);

  useEffect(() => {
    if (phase !== "won" || !caught) return;
    setCelebrating(true);
    setCollection((previous) => ({
      ...previous,
      [caught.id]: Math.min((previous[caught.id] ?? 0) + 1, 9999),
    }));
    tone(784, 0.5);
    const timer = window.setTimeout(
      () => setCelebrating(false),
      timing.celebrate,
    );
    return () => window.clearTimeout(timer);
    // Only a transition into won awards a prize. Changing sound never awards another.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, caught]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "pepe-lucky-collection-v1",
        JSON.stringify(collection),
      );
    } catch {
      setStorageError(true);
    }
  }, [collection]);

  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );

  function play() {
    if (busy) return;
    if (phase === "aiming") {
      setCaught(catchAt(position));
      setPhase("press-drop");
      tone(280, 0.18);
    } else {
      setCaught(null);
      setCelebrating(false);
      setPosition(337);
      setPhase("press-play");
      tone(440);
    }
  }

  function move(amount: number) {
    if (phase === "aiming")
      setPosition((previous) => clampPosition(previous + amount));
  }

  function toggleSound() {
    if (!sound) {
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume().catch(() => {
          setSound(false);
          setSoundError(true);
        });
      } catch {
        setSoundError(true);
        return;
      }
    }
    setSoundError(false);
    setSound(!sound);
  }

  return (
    <>
      <a className="skip-link" href="#arcade">
        Skip to the arcade
      </a>
      <header className="site-header wrap">
        <a className="brand" href="#arcade" aria-label="Pepe’s Lucky Club home">
          <img src="./favicon.svg" alt="" width="43" height="43" />
          <span>
            pepe’s<span className="brand-sub">LUCKY CLUB</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#arcade" className="nav-active">
            The arcade <span className="nav-dot" />
          </a>
          <button onClick={() => collectionDialog.current?.showModal()}>
            My collection <span className="count">{total}</span>
          </button>
        </nav>
        <div className="header-tools">
          <button
            className="icon-button sound-button"
            aria-label="Sound"
            aria-pressed={sound}
            onClick={toggleSound}
            title={sound ? "Turn sound off" : "Turn sound on"}
          >
            <Icon name={sound ? "sound" : "mute"} />
          </button>
          <button
            className="help-button"
            aria-label="How to play"
            onClick={() => helpDialog.current?.showModal()}
          >
            <Icon name="help" size={18} />
            <span>How to play</span>
          </button>
        </div>
      </header>
      <main id="arcade" className="wrap">
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow">
            <span /> Small wins. Big feelings.
          </div>
          <h1 id="page-title">
            A little luck. <span>A lot of Pepe.</span>
          </h1>
          <p>Grab a little friend. Make the whole crew’s day.</p>
        </section>
        <section className="arcade-layout" aria-label="Play the claw machine">
          <div className="stage-panel">
            <div className="stage-topline">
              <span className="open-label">
                <span /> The good vibes machine
              </span>
              <span className="machine-number">NO. 001</span>
            </div>
            <div className="scene-wrap">
              <div className="lucky-sticker" aria-hidden="true">
                <Icon name="spark" size={20} />
                <span>
                  100%
                  <br />
                  good vibes
                </span>
              </div>
              <Machine
                phase={phase}
                position={position}
                caught={caught}
                celebrating={celebrating}
                motion={motion}
              />
            </div>
            <div className="stage-bottomline">
              <span>
                <span className="tiny-star">✦</span> A little encouragement goes
                a long way.
              </span>
              <button
                className="motion-button"
                aria-pressed={motion}
                aria-label="Crowd animation"
                onClick={() => setMotion(!motion)}
              >
                <Icon name={motion ? "pause" : "play"} size={14} />
                {motion ? "Pause crowd" : "Animate crowd"}
              </button>
            </div>
          </div>
          <div className="play-panel">
            <div className="free-pill">
              <span /> Free play. Forever.
            </div>
            <h2>
              Feeling lucky, <br />
              fren?
            </h2>
            <p className="play-description">
              A claw full of possibilities. <br />A crowd that’s rooting for
              you.
            </p>
            <div
              className="game-controls"
              onKeyDown={(event) => {
                if (event.target instanceof HTMLInputElement) return;
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  move(event.key === "ArrowLeft" ? -8 : 8);
                }
              }}
            >
              <div
                className={`game-status ${phase === "won" ? "is-won" : ""}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="status-mark">
                  {phase === "won" ? "✦" : phase === "missed" ? "↻" : "•"}
                </span>
                <span>
                  {phase === "won"
                    ? `${caught?.name} is yours! Check the hatch.`
                    : messages[phase]}
                </span>
              </div>
              <button
                ref={primaryButton}
                className="primary-button"
                onClick={play}
                aria-disabled={busy}
              >
                {phase === "aiming"
                  ? "Drop the claw"
                  : phase === "won" || phase === "missed"
                    ? "Play again"
                    : busy
                      ? phase === "press-play"
                        ? "Starting…"
                        : "Claw in action…"
                      : "Let’s play"}
                <Icon name={busy ? "spark" : "arrow"} size={22} />
              </button>
              <div className="aim-controls">
                <button
                  className="direction-button"
                  disabled={phase !== "aiming" || position <= 249}
                  onClick={() => move(-8)}
                  aria-label="Move claw left"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <div className="range-wrap">
                  <label htmlFor="claw-position">
                    {phase === "aiming"
                      ? "Line up your lucky grab"
                      : "Aim your claw"}
                  </label>
                  <input
                    id="claw-position"
                    type="range"
                    min="249"
                    max="489"
                    step="1"
                    value={position}
                    onChange={(event) =>
                      setPosition(Number(event.target.value))
                    }
                    disabled={phase !== "aiming"}
                    aria-valuetext={`${Math.round(((position - 249) / 240) * 100)} percent across the machine`}
                  />
                </div>
                <button
                  className="direction-button"
                  disabled={phase !== "aiming" || position >= 489}
                  onClick={() => move(8)}
                  aria-label="Move claw right"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className="keyboard-hint">
                Use <kbd>←</kbd> <kbd>→</kbd> to aim · <kbd>Space</kbd> on the
                button to play
              </p>
            </div>
            <div className="crew-note">
              <div className="mini-crew">
                <PepePortrait hat="bucket" />
                <PepePortrait hat="beanie" />
                <PepePortrait hat="cap" />
              </div>
              <p>
                Your hype crew is ready.
                <br />
                <strong>Every win is a group celebration.</strong>
              </p>
            </div>
            {soundError && (
              <p className="notice" role="status">
                Sound isn’t available in this browser. You can keep playing.
              </p>
            )}
          </div>
        </section>
        <section
          className="prizes-section"
          id="prizes"
          aria-labelledby="prizes-title"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">Tiny friends. Major personality.</div>
              <h2 id="prizes-title">Meet your next lucky grab.</h2>
            </div>
            <button
              className="text-button"
              onClick={() => collectionDialog.current?.showModal()}
            >
              View my collection <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="prize-grid">
            {prizes.map((prize, index) => (
              <article className="prize-card" key={prize.id}>
                <div
                  className="prize-image"
                  style={{ backgroundColor: prize.color }}
                >
                  <span className="prize-index">0{index + 1}</span>
                  <PepePortrait hat={prize.hat} />
                  <span className={`rarity rarity-${prize.id}`}>
                    {prize.rarity}
                  </span>
                  {collection[prize.id] > 0 && (
                    <span className="owned-badge">✓ Collected</span>
                  )}
                </div>
                <div className="prize-copy">
                  <h3>{prize.name}</h3>
                  <p>{prize.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="collection-note">
            <Icon name="bag" size={15} /> Four little legends to collect. Yours
            to keep in this browser.
          </p>
        </section>
        <section className="kindness-banner">
          <span className="banner-flower" aria-hidden="true">
            ✿
          </span>
          <p>
            Come for the prizes. <span>Stay for the Pepes.</span>
          </p>
          <span className="small-caps">All frens welcome</span>
        </section>
      </main>
      <footer className="site-footer wrap">
        <span>© {new Date().getFullYear()} Pepe’s Lucky Club</span>
        <span>
          A tiny arcade with a big heart. <span aria-hidden="true">♡</span>
        </span>
        <button onClick={() => helpDialog.current?.showModal()}>
          How it works <span aria-hidden="true">↗</span>
        </button>
      </footer>
      <dialog
        ref={helpDialog}
        onKeyDown={containDialogFocus}
        className="modal"
        aria-labelledby="help-title"
      >
        <button
          className="icon-button close-dialog"
          autoFocus
          aria-label="Close instructions"
          onClick={() => helpDialog.current?.close()}
        >
          <Icon name="close" />
        </button>
        <div className="eyebrow">Your first lucky grab</div>
        <h2 id="help-title">A little claw-some.</h2>
        <p>It’s free, with unlimited turns and four collectible friends.</p>
        <ol className="instructions">
          <li>
            <span>01</span>
            <div>
              <h3>Press Play</h3>
              <p>Your Pepe steps up and presses the machine’s button.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Aim, then Drop</h3>
              <p>
                Use the slider or arrow buttons to line up over a Pepe’s center.
                Press Drop to send the claw down. Keyboard: use arrow keys while
                a game control is focused, then Space or Enter on the main
                button.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Celebrate with the crew</h3>
              <p>
                A good grab arrives in the hatch and joins your collection.
                Missed? Try again. There’s no time limit.
              </p>
            </div>
          </li>
        </ol>
        <p className="dialog-note">
          These are digital collectibles for fun. No payments, wallets, or
          real-world prizes. Your collection is saved on this browser when
          storage is available.
        </p>
        <button
          className="primary-button"
          onClick={() => {
            helpDialog.current?.close();
            primaryButton.current?.focus();
          }}
        >
          Ready to play <Icon name="arrow" />
        </button>
      </dialog>
      <dialog
        ref={collectionDialog}
        onKeyDown={containDialogFocus}
        className="modal collection-modal"
        aria-labelledby="collection-title"
      >
        <button
          className="icon-button close-dialog"
          autoFocus
          aria-label="Close collection"
          onClick={() => collectionDialog.current?.close()}
        >
          <Icon name="close" />
        </button>
        <div className="eyebrow">Your happy little things</div>
        <h2 id="collection-title">The fren collection.</h2>
        <p>
          {total === 0
            ? "Your shelf is waiting for its first little friend. Play a round to start your collection."
            : `${unique} of 4 friends collected · ${total} ${total === 1 ? "lucky grab" : "lucky grabs"}`}
        </p>
        <div className="collection-grid">
          {prizes.map((prize) => (
            <div
              className={`collection-item ${collection[prize.id] ? "collected" : ""}`}
              key={prize.id}
            >
              <div style={{ backgroundColor: prize.color }}>
                <PepePortrait hat={prize.hat} />
              </div>
              <h3>{prize.name}</h3>
              <span>
                {collection[prize.id]
                  ? `Collected × ${collection[prize.id]}`
                  : "Waiting to be found"}
              </span>
            </div>
          ))}
        </div>
        <p className="dialog-note">
          {storageError
            ? "Browser storage is unavailable. Your collection will last for this visit only."
            : "Saved in this browser. Clearing site data also clears your collection."}
        </p>
        <button
          className="primary-button"
          onClick={() => {
            collectionDialog.current?.close();
            primaryButton.current?.focus();
            document.getElementById("arcade")?.scrollIntoView();
          }}
        >
          Back to the arcade <Icon name="arrow" />
        </button>
      </dialog>
    </>
  );
}
