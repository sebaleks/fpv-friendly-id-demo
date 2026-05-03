// SF Embarcadero / FiDi basemap. Hand-traced from real coordinates and
// emitted into the same 0..1 normalized space the marker projection uses, so
// coastlines and roads register exactly with lat/lng-anchored markers.
// Tactical aesthetic — thin strokes, low contrast, no fills beyond water/land.

export const AO_BBOX = { south: 37.7810, north: 37.8110, west: -122.4180, east: -122.3870 };
export const FOB_LATLNG: [number, number] = [37.8055, -122.4045]; // Pier 33 area

export function latLngToXY(lat: number, lng: number): [number, number] {
  const x = (lng - AO_BBOX.west) / (AO_BBOX.east - AO_BBOX.west);
  const y = 1 - (lat - AO_BBOX.south) / (AO_BBOX.north - AO_BBOX.south);
  return [x, y];
}

function px(latLng: [number, number]): [number, number] {
  const [x, y] = latLngToXY(latLng[0], latLng[1]);
  return [x * 100, y * 100];
}

function poly(points: [number, number][]): string {
  return points.map((p) => px(p).join(",")).join(" ");
}

function path(points: [number, number][], close = false): string {
  let d = "";
  points.forEach((p, i) => { const [x, y] = px(p); d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " "; });
  if (close) d += "Z";
  return d;
}

// Pier rectangle: from a base point on the seawall extending east into bay.
function pier(baseLatLng: [number, number], lengthM: number, widthM: number, angleDeg = 90): [number, number][] {
  const [lat, lng] = baseLatLng;
  const dLat = (lengthM / 111000) * Math.cos(angleDeg * Math.PI / 180);
  const dLng = (lengthM / (111000 * Math.cos(lat * Math.PI / 180))) * Math.sin(angleDeg * Math.PI / 180);
  const wLat = (widthM / 111000) * Math.cos((angleDeg + 90) * Math.PI / 180);
  const wLng = (widthM / (111000 * Math.cos(lat * Math.PI / 180))) * Math.sin((angleDeg + 90) * Math.PI / 180);
  const p1: [number, number] = [lat - wLat / 2, lng - wLng / 2];
  const p2: [number, number] = [lat + wLat / 2, lng + wLng / 2];
  const p3: [number, number] = [p2[0] + dLat, p2[1] + dLng];
  const p4: [number, number] = [p1[0] + dLat, p1[1] + dLng];
  return [p1, p2, p3, p4];
}

// Embarcadero waterfront — traced south→north along the seawall.
const COASTLINE: [number, number][] = [
  [37.7820, -122.3870], [37.7860, -122.3878], [37.7895, -122.3895], [37.7920, -122.3905],
  [37.7935, -122.3917], [37.7948, -122.3927], [37.7955, -122.3937], [37.7975, -122.3937],
  [37.7991, -122.3957], [37.8011, -122.3978], [37.8023, -122.3992], [37.8035, -122.4011],
  [37.8050, -122.4030], [37.8060, -122.4045], [37.8075, -122.4070], [37.8087, -122.4098],
  [37.8080, -122.4140], [37.8080, -122.4180],
];

const LAND_POLY: [number, number][] = [
  ...COASTLINE,
  [37.8080, -122.4180], [37.7820, -122.4180], [37.7820, -122.3870],
];

const STREETS: { name: string; pts: [number, number][]; w: number }[] = [
  { name: "embarcadero", pts: COASTLINE.slice(1, -1), w: 0.6 },
  { name: "market",      pts: [[37.7955, -122.3937], [37.7903, -122.3989], [37.7853, -122.4060], [37.7810, -122.4135]], w: 0.7 },
  { name: "mission",     pts: [[37.7905, -122.3905], [37.7858, -122.3990], [37.7810, -122.4090]], w: 0.4 },
  { name: "howard",      pts: [[37.7892, -122.3905], [37.7842, -122.3997], [37.7810, -122.4060]], w: 0.4 },
  { name: "folsom",      pts: [[37.7878, -122.3905], [37.7825, -122.3998], [37.7810, -122.4022]], w: 0.4 },
  { name: "battery",     pts: [[37.7910, -122.4002], [37.7990, -122.4022]], w: 0.4 },
  { name: "sansome",     pts: [[37.7895, -122.4015], [37.8005, -122.4040]], w: 0.4 },
  { name: "montgomery",  pts: [[37.7888, -122.4028], [37.8045, -122.4062]], w: 0.4 },
  { name: "kearny",      pts: [[37.7878, -122.4042], [37.8075, -122.4090]], w: 0.4 },
  { name: "grant",       pts: [[37.7867, -122.4060], [37.8085, -122.4105]], w: 0.4 },
  { name: "stockton",    pts: [[37.7857, -122.4075], [37.8075, -122.4115]], w: 0.4 },
  { name: "powell",      pts: [[37.7847, -122.4090], [37.8075, -122.4130]], w: 0.4 },
  { name: "mason",       pts: [[37.7838, -122.4105], [37.8075, -122.4145]], w: 0.4 },
  { name: "california",  pts: [[37.7920, -122.4180], [37.7935, -122.3970]], w: 0.4 },
  { name: "pine",        pts: [[37.7900, -122.4180], [37.7918, -122.3982]], w: 0.4 },
  { name: "bush",        pts: [[37.7888, -122.4180], [37.7905, -122.3995]], w: 0.4 },
  { name: "sutter",      pts: [[37.7878, -122.4180], [37.7895, -122.4005]], w: 0.4 },
  { name: "post",        pts: [[37.7868, -122.4180], [37.7888, -122.4015]], w: 0.4 },
  { name: "geary",       pts: [[37.7858, -122.4180], [37.7878, -122.4030]], w: 0.4 },
  { name: "clay",        pts: [[37.7937, -122.4180], [37.7955, -122.3960]], w: 0.4 },
  { name: "washington",  pts: [[37.7948, -122.4180], [37.7965, -122.3970]], w: 0.4 },
  { name: "jackson",     pts: [[37.7958, -122.4180], [37.7980, -122.3985]], w: 0.4 },
  { name: "pacific",     pts: [[37.7972, -122.4180], [37.7993, -122.3995]], w: 0.4 },
  { name: "broadway",    pts: [[37.7985, -122.4180], [37.8008, -122.4005]], w: 0.5 },
  { name: "vallejo",     pts: [[37.7997, -122.4180], [37.8020, -122.4020]], w: 0.4 },
  { name: "green",       pts: [[37.8010, -122.4180], [37.8030, -122.4035]], w: 0.4 },
  { name: "union",       pts: [[37.8025, -122.4180], [37.8045, -122.4048]], w: 0.4 },
  { name: "filbert",     pts: [[37.8038, -122.4180], [37.8055, -122.4060]], w: 0.4 },
  { name: "greenwich",   pts: [[37.8052, -122.4180], [37.8068, -122.4072]], w: 0.4 },
  { name: "lombard",     pts: [[37.8065, -122.4180], [37.8077, -122.4082]], w: 0.4 },
  { name: "bay",         pts: [[37.8085, -122.4180], [37.8095, -122.4095]], w: 0.5 },
];

const PIERS: { id: string; base: [number, number]; len: number; w: number; ang: number; label?: string; isFerry?: boolean }[] = [
  { id: "P14",  base: [37.7935, -122.3917], len: 110, w: 22, ang: 100 },
  { id: "FB",   base: [37.7955, -122.3937], len: 200, w: 75, ang:  90, label: "FERRY BLDG", isFerry: true },
  { id: "P1",   base: [37.7975, -122.3937], len: 110, w: 18, ang:  85 },
  { id: "P3",   base: [37.7980, -122.3942], len:  95, w: 18, ang:  80 },
  { id: "P5",   base: [37.7986, -122.3949], len: 110, w: 18, ang:  75 },
  { id: "P7",   base: [37.7991, -122.3957], len: 145, w: 25, ang:  70 },
  { id: "P15",  base: [37.8011, -122.3978], len: 175, w: 30, ang:  65 },
  { id: "P19",  base: [37.8023, -122.3992], len: 165, w: 28, ang:  60 },
  { id: "P23",  base: [37.8035, -122.4011], len: 150, w: 25, ang:  55 },
  { id: "P27",  base: [37.8050, -122.4030], len: 140, w: 25, ang:  50 },
  { id: "P33",  base: [37.8060, -122.4045], len: 130, w: 22, ang:  45 },
  { id: "P35",  base: [37.8075, -122.4070], len: 120, w: 22, ang:  40 },
  { id: "P39",  base: [37.8087, -122.4098], len: 130, w: 90, ang:  35, label: "PIER 39" },
];

const LABELS: { lat: number; lng: number; text: string; size: number; color: string; italic?: boolean }[] = [
  { lat: 37.7900, lng: -122.4080, text: "FINANCIAL DISTRICT", size: 2.4, color: "rgba(160,170,185,0.7)" },
  { lat: 37.8020, lng: -122.4115, text: "NORTH BEACH",        size: 2.2, color: "rgba(160,170,185,0.6)" },
  { lat: 37.7965, lng: -122.4115, text: "CHINATOWN",          size: 2.0, color: "rgba(160,170,185,0.55)" },
  { lat: 37.7855, lng: -122.4030, text: "SOMA",               size: 2.0, color: "rgba(160,170,185,0.55)" },
  { lat: 37.7980, lng: -122.3920, text: "SAN FRANCISCO BAY",  size: 2.6, color: "rgba(120,170,255,0.55)" },
  { lat: 37.7910, lng: -122.4030, text: "MARKET ST",          size: 1.6, color: "rgba(160,170,185,0.45)", italic: true },
];

export default function SfBasemap() {
  const market = STREETS.find((s) => s.name === "market")!;
  return (
    <svg className="tmap-basemap" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="0" y="0" width="100" height="100" fill="rgba(28,52,84,0.45)" />
      <defs>
        <pattern id="bay-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="rgba(120,170,255,0.06)" strokeWidth="0.3" />
        </pattern>
        <pattern id="land-tex" width="2.2" height="2.2" patternUnits="userSpaceOnUse">
          <rect width="2.2" height="2.2" fill="rgba(20,28,40,0)" />
          <circle cx="1.1" cy="1.1" r="0.15" fill="rgba(120,140,170,0.08)" />
        </pattern>
        <clipPath id="land-clip">
          <path d={path(LAND_POLY, true)} />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#bay-hatch)" />

      <path d={path(LAND_POLY, true)} fill="rgba(18,24,34,0.78)" stroke="rgba(120,140,170,0.5)" strokeWidth="0.35" />
      <path d={path(LAND_POLY, true)} fill="url(#land-tex)" stroke="none" />

      <g className="tmap-streets" clipPath="url(#land-clip)">
        {STREETS.filter((s) => s.name !== "embarcadero").map((s) => (
          <polyline key={s.name} points={poly(s.pts)} fill="none"
            stroke="rgba(180,195,215,0.22)" strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <polyline points={poly(market.pts)} fill="none" stroke="rgba(200,215,235,0.32)" strokeWidth="0.9" strokeLinecap="round" />
      </g>

      <polyline points={poly(COASTLINE.slice(1, -1))} fill="none" stroke="rgba(200,215,235,0.32)" strokeWidth="0.7" strokeLinecap="round" />

      <g className="tmap-bridge">
        <line x1={px([37.7917, -122.3868])[0]} y1={px([37.7917, -122.3868])[1]}
              x2={100} y2={px([37.7910, -122.3870])[1]}
              stroke="rgba(180,195,215,0.45)" strokeWidth="0.7" strokeDasharray="2 0.8" />
        <text x={px([37.7905, -122.3878])[0]} y={px([37.7905, -122.3878])[1]}
              fill="rgba(180,195,215,0.55)" fontSize="1.6" fontFamily="JetBrains Mono, monospace" letterSpacing="0.3">BAY BR →</text>
      </g>

      <g className="tmap-piers">
        {PIERS.map((p) => {
          const corners = pier(p.base, p.len, p.w, p.ang);
          return (
            <polygon key={p.id} points={poly(corners)}
              fill={p.isFerry ? "rgba(60,80,110,0.55)" : "rgba(35,48,70,0.7)"}
              stroke={p.isFerry ? "rgba(220,160,80,0.6)" : "rgba(120,140,170,0.45)"}
              strokeWidth="0.25" />
          );
        })}
        {PIERS.filter((p) => p.label).map((p) => {
          const [cx, cy] = px(p.base);
          return (
            <text key={`lbl-${p.id}`} x={cx + 1.5} y={cy - 0.5}
                  fill="rgba(220,180,120,0.8)" fontSize="1.5" fontFamily="JetBrains Mono, monospace" letterSpacing="0.3">{p.label}</text>
          );
        })}
      </g>

      <g className="tmap-labels">
        {LABELS.map((l, i) => {
          const [x, y] = px([l.lat, l.lng]);
          return (
            <text key={i} x={x} y={y} fill={l.color} fontSize={l.size}
                  fontFamily="JetBrains Mono, monospace" textAnchor="middle"
                  fontStyle={l.italic ? "italic" : "normal"} letterSpacing="0.5">{l.text}</text>
          );
        })}
      </g>
    </svg>
  );
}
