import { useMemo } from 'react';

const VIEW_W = 800;
const VIEW_H = 170;
const PAD_TOP = 18;
const PAD_BOTTOM = 16;

function smoothPath(points) {
  if (points.length < 3) {
    return points
      .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`)
      .join(' ');
  }
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export default function EquityChart({ slice }) {
  const { path, areaPath } = useMemo(() => {
    const vals = slice.map((p) => p.balance);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const stepX = VIEW_W / (vals.length - 1 || 1);

    const pts = vals.map((v, i) => {
      const x = i * stepX;
      const y = (VIEW_H - PAD_BOTTOM) - ((v - min) / range) * (VIEW_H - PAD_TOP - PAD_BOTTOM);
      return [x, y];
    });

    const line = smoothPath(pts);
    const lastX = pts[pts.length - 1] ? pts[pts.length - 1][0] : VIEW_W;
    const firstX = pts[0] ? pts[0][0] : 0;
    const area = `${line} L${lastX.toFixed(1)},${VIEW_H} L${firstX.toFixed(1)},${VIEW_H} Z`;

    return { path: line, areaPath: area };
  }, [slice]);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none">
        <path d={areaPath} fill="var(--profit-tint)" stroke="none" />
        <path
          d={path}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
