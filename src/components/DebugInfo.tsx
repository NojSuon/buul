// Opened by adding ?debug to the address: shows which build loaded and what the device reports,
// to troubleshoot layouts on phones we can't inspect directly.
export default function DebugInfo({ mobile }: { mobile: boolean }) {
  const rows: [string, string][] = [
    ['Build', __BUILD_TIME__],
    ['Layout', mobile ? 'phone' : 'desktop'],
    ['Window', `${window.innerWidth} × ${window.innerHeight}`],
    ['Screen', `${screen.width} × ${screen.height}`],
    ['Pixel ratio', String(window.devicePixelRatio)],
    ['Touch', String(window.matchMedia('(pointer: coarse)').matches)],
    ['Browser', navigator.userAgent],
  ];
  return (
    <div className="debug-info">
      {rows.map(([label, value]) => (
        <div key={label}>
          <strong>{label}:</strong> {value}
        </div>
      ))}
    </div>
  );
}
