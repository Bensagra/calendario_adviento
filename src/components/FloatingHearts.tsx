import { HeartIcon } from "./icons";

// Cada globo: posición horizontal, tamaño, color, opacidad, tiempo de subida,
// tiempo de balanceo y un retraso negativo para que ya estén repartidos al cargar.
const balloons = [
  { left: "5%", size: 26, color: "#e98a8a", opacity: 0.55, rise: 18, sway: 4.2, delay: -1 },
  { left: "13%", size: 16, color: "#f0a9a4", opacity: 0.45, rise: 14, sway: 3.4, delay: -7 },
  { left: "21%", size: 38, color: "#d85f65", opacity: 0.4, rise: 22, sway: 5.1, delay: -12 },
  { left: "29%", size: 20, color: "#eebab5", opacity: 0.5, rise: 16, sway: 3.8, delay: -4 },
  { left: "37%", size: 30, color: "#e7a39e", opacity: 0.5, rise: 19, sway: 4.6, delay: -15 },
  { left: "45%", size: 14, color: "#f5c4be", opacity: 0.45, rise: 13, sway: 3.1, delay: -2 },
  { left: "52%", size: 34, color: "#d97c83", opacity: 0.42, rise: 21, sway: 4.9, delay: -9 },
  { left: "60%", size: 18, color: "#efb0b8", opacity: 0.5, rise: 15, sway: 3.5, delay: -18 },
  { left: "68%", size: 28, color: "#e98a8a", opacity: 0.5, rise: 18, sway: 4.3, delay: -6 },
  { left: "76%", size: 22, color: "#f0a9a4", opacity: 0.48, rise: 16, sway: 3.9, delay: -13 },
  { left: "83%", size: 40, color: "#d85f65", opacity: 0.38, rise: 23, sway: 5.3, delay: -3 },
  { left: "90%", size: 17, color: "#eebab5", opacity: 0.5, rise: 14, sway: 3.3, delay: -10 },
  { left: "95%", size: 24, color: "#e7a39e", opacity: 0.48, rise: 17, sway: 4.1, delay: -16 },
  { left: "33%", size: 13, color: "#f5c4be", opacity: 0.4, rise: 12, sway: 2.9, delay: -8 },
  { left: "64%", size: 15, color: "#f5c4be", opacity: 0.42, rise: 13, sway: 3.2, delay: -20 },
  { left: "48%", size: 21, color: "#efb0b8", opacity: 0.48, rise: 16, sway: 3.7, delay: -11 },
];

export function FloatingHearts() {
  return (
    <div className="balloon-layer pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {balloons.map((balloon, index) => (
        <span
          key={index}
          className="balloon"
          style={{
            left: balloon.left,
            animationDuration: `${balloon.rise}s`,
            animationDelay: `${balloon.delay}s`,
          }}
        >
          <span className="balloon-sway" style={{ animationDuration: `${balloon.sway}s` }}>
            <HeartIcon
              className="balloon-glow block"
              style={{ width: balloon.size, height: balloon.size, color: balloon.color, opacity: balloon.opacity }}
            />
            <span className="balloon-string" />
          </span>
        </span>
      ))}
    </div>
  );
}
