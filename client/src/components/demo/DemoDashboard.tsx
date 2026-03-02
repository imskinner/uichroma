import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors, PaletteKey } from '@/lib/palette-utils.ts';

interface DemoDashboardProps {
  colors: PaletteColors;
}

function getTone(colors: PaletteColors, key: PaletteKey, index: number): string {
  const c = colors[key];
  if (c && c.tones && c.tones[index]) return c.tones[index].hex;
  return c ? c.hex : '#888';
}

export function DemoDashboard({ colors }: DemoDashboardProps) {
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;
  const su = colors.success;
  const w = colors.warning;
  const d = colors.danger;

  const navItems = [
    { label: 'Overview', active: true },
    { label: 'Analytics', active: false },
    { label: 'Users', active: false },
    { label: 'Settings', active: false },
  ];

  const dashStats = [
    { label: 'Total Users', value: '24,521', color: p.hex },
    { label: 'Revenue', value: '$48.2K', color: s.hex },
    { label: 'Growth', value: '+12.5%', color: su.hex },
    { label: 'Active Now', value: '1,429', color: a.hex },
  ];

  const rows = [
    { name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', statusColor: su.hex, statusBg: getTone(colors, 'success', 8), role: 'Admin' },
    { name: 'Bob Smith', email: 'bob@example.com', status: 'Pending', statusColor: w.hex, statusBg: getTone(colors, 'warning', 8), role: 'Editor' },
    { name: 'Carol White', email: 'carol@example.com', status: 'Inactive', statusColor: d.hex, statusBg: getTone(colors, 'danger', 8), role: 'Viewer' },
    { name: 'Dave Wilson', email: 'dave@example.com', status: 'Active', statusColor: su.hex, statusBg: getTone(colors, 'success', 8), role: 'Editor' },
  ];

  return (
    <div className="flex rounded-lg overflow-hidden" style={{ minHeight: 480 }}>
      {/* Sidebar */}
      <div
        className="flex flex-col gap-1 p-4"
        style={{ width: 180, background: getTone(colors, 'neutral', 0) }}
      >
        <div className="font-bold text-lg mb-4 font-heading" style={{ color: p.hex }}>
          Dashboard
        </div>
        {navItems.map(item => (
          <div
            key={item.label}
            className="px-3 py-2 rounded-md text-sm cursor-pointer font-sans"
            style={
              item.active
                ? { background: p.hex, color: textOn(p.hex) }
                : { color: getTone(colors, 'neutral', 3) }
            }
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4 bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none font-sans"
            type="text"
            placeholder="Search..."
            style={{ maxWidth: 240 }}
          />
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: p.hex, color: textOn(p.hex) }}
          >
            JD
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {dashStats.map(st => (
            <div
              key={st.label}
              className="bg-white rounded-lg p-4 shadow-sm"
              style={{ borderTop: `3px solid ${st.color}` }}
            >
              <div className="text-xs text-gray-500 mb-1 font-sans">{st.label}</div>
              <div className="text-xl font-bold font-heading" style={{ color: st.color }}>
                {st.value}
              </div>
            </div>
          ))}
        </div>

        {/* Data table */}
        <div className="rounded-lg border border-gray-200 overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 font-semibold text-gray-600 font-sans">Name</th>
                <th className="px-4 py-2 font-semibold text-gray-600 font-sans">Email</th>
                <th className="px-4 py-2 font-semibold text-gray-600 font-sans">Status</th>
                <th className="px-4 py-2 font-semibold text-gray-600 font-sans">Role</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.name}
                  style={{ background: i % 2 === 1 ? getTone(colors, 'neutral', 9) : '#fff' }}
                >
                  <td className="px-4 py-2 font-sans">{row.name}</td>
                  <td className="px-4 py-2 font-sans">{row.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: row.statusBg, color: row.statusColor }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-sans">{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <span
            className="inline-block px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer"
            style={{ background: p.hex, color: textOn(p.hex) }}
          >
            Edit
          </span>
          <span
            className="inline-block px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer"
            style={{ background: d.hex, color: textOn(d.hex) }}
          >
            Delete
          </span>
        </div>
      </div>
    </div>
  );
}
