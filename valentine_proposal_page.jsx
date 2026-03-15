import { useEffect, useRef, useState } from "react";

function Confetti() {
  const pieces = Array.from({ length: 110 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4.5}s`,
    duration: `${5.5 + Math.random() * 3.5}s`,
    drift: `${-40 + Math.random() * 80}px`,
    rotate: `${Math.random() * 360}deg`,
    size: 4 + Math.random() * 6,
    shape: index % 3 === 0 ? "50%" : index % 2 === 0 ? "4px" : "0px",
    color:
      index % 4 === 0
        ? "#facc15"
        : index % 4 === 1
          ? "#fde047"
          : index % 4 === 2
            ? "#eab308"
            : "#fef08a",
  }));

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-[-12%]"
          style={{
            left: piece.left,
            width: `${piece.size}px`,
            height: `${piece.size * 1.4}px`,
            borderRadius: piece.shape,
            background: piece.color,
            transform: `rotate(${piece.rotate})`,
            animation: `confetti-fall ${piece.duration} linear infinite`,
            animationDelay: piece.delay,
            boxShadow: "0 0 8px rgba(255, 235, 59, 0.4)",
            opacity: 0.95,
            ["--drift" as string]: piece.drift,
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -12%, 0) rotate(0deg);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(var(--drift), 120vh, 0) rotate(720deg);
            opacity: 0.9;
          }
          100% {
            transform: translate3d(var(--drift), 120vh, 0) rotate(720deg);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
}

const MAX_YES_SCALE = 2.2;
const BUTTON_WIDTH = 176;
const BUTTON_GAP = 40;

const lines = [
  "Pick carefully 💘",
  "Still no? Try again 😏",
  "That button is slippery 🏃",
  "The yes button looks better already 💖",
  "Nope, you have to catch it first 😄",
  "The universe is saying yes ✨",
  "That no button is not loyal 😌",
  "Every dodge means yes is winning 💞",
];

export default function ValentinePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);

  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [yesPosition, setYesPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const lastMoveTimeRef = useRef(0);
  const moveCountRef = useRef(0);

  useEffect(() => {
    const placeNoButtonInitially = () => {
      const container = containerRef.current;
      const noBtn = noButtonRef.current;
      if (!container || !noBtn) return;

      const containerRect = container.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();
      const padding = 12;

      const rowCenterX = containerRect.width / 2;
      const yesX = Math.max(
        padding,
        Math.min(
          containerRect.width - BUTTON_WIDTH * 2 - BUTTON_GAP - padding,
          rowCenterX - BUTTON_WIDTH - BUTTON_GAP / 2
        )
      );
      const noX = Math.max(
        padding,
        Math.min(containerRect.width - btnRect.width - padding, yesX + BUTTON_WIDTH + BUTTON_GAP)
      );
      const startY = Math.max(
        padding,
        Math.min(containerRect.height - btnRect.height - padding, containerRect.height * 0.74)
      );

      setYesPosition({ x: yesX, y: startY });
      setNoPosition({ x: noX, y: startY });
      setIsMounted(true);
    };

    const frameId = requestAnimationFrame(placeNoButtonInitially);
    window.addEventListener("resize", placeNoButtonInitially);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", placeNoButtonInitially);
    };
  }, []);

  const moveNoButton = () => {
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 60) return;
    lastMoveTimeRef.current = now;

    const container = containerRef.current;
    const noBtn = noButtonRef.current;
    if (!container || !noBtn || accepted) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const padding = 12;

    const minX = padding;
    const minY = padding;
    const maxX = Math.max(minX, containerRect.width - btnRect.width - padding);
    const maxY = Math.max(minY, containerRect.height - btnRect.height - padding);

    const randomX = Math.random() * (maxX - minX) + minX;
    const randomY = Math.random() * (maxY - minY) + minY;

    setNoPosition({ x: randomX, y: randomY });
    setYesScale((prev) => Math.min(prev + 0.012, MAX_YES_SCALE));
    moveCountRef.current += 1;
    if (moveCountRef.current % 4 === 0) {
      setMessageIndex((prev) => (prev + 1) % lines.length);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const noBtn = noButtonRef.current;
    if (!noBtn || accepted || !isMounted) return;

    const rect = noBtn.getBoundingClientRect();
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    const closestX = Math.max(rect.left, Math.min(cursorX, rect.right));
    const closestY = Math.max(rect.top, Math.min(cursorY, rect.bottom));
    const distance = Math.hypot(cursorX - closestX, cursorY - closestY);

    if (distance < 140) {
      moveNoButton();
    }
  };

  const handleYes = () => {
    setAccepted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100 p-6">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[78vh] w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-2xl backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute left-10 top-8 text-4xl">💘</div>
          <div className="absolute right-12 top-12 text-5xl">🌹</div>
          <div className="absolute bottom-16 left-16 text-4xl">💕</div>
          <div className="absolute bottom-12 right-14 text-5xl">✨</div>
        </div>

        <div className="relative z-10 flex min-h-[78vh] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="relative z-20 max-w-3xl">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-rose-600 md:text-6xl lg:text-7xl">
              Bulan will you be my Valentine?
            </h1>
            <p className="mt-5 text-lg font-medium text-rose-500 md:text-2xl">
              {accepted ? "YAY!" : lines[messageIndex]}
            </p>
          </div>

          {!accepted && (
            <button
              onClick={handleYes}
              className="absolute z-20 cursor-pointer w-44 rounded-2xl bg-rose-500 px-10 py-4 text-xl font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl active:scale-95 md:text-2xl"
              style={{
                left: `${yesPosition.x}px`,
                top: `${yesPosition.y}px`,
                transform: `scale(${yesScale})`,
              }}
              type="button"
            >
              Yes 💖
            </button>
          )}

          {!accepted && (
            <button
              ref={noButtonRef}
              className="absolute z-30 cursor-pointer w-44 rounded-2xl bg-slate-700 px-10 py-4 text-xl font-bold text-white shadow-lg select-none transition-[left,top,transform] duration-100 md:text-2xl text-white"
              style={{ left: `${noPosition.x}px`, top: `${noPosition.y}px` }}
              aria-label="No button"
              type="button"
            >
              No 🙈
            </button>
          )}

          {accepted && <Confetti />}

          {accepted && (
            <img
              src="https://media.giphy.com/media/vvyOEBptWygI7NDT56/giphy.gif"
              alt="Winking celebration"
              className="relative z-20 mt-16 h-80 w-80 rounded-3xl object-cover shadow-2xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}
