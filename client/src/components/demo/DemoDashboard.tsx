import { textOn } from '@/lib/color-utils.ts';
import { getTone, type PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';

interface DemoDashboardProps {
  colors: PaletteColors;
}

export function DemoDashboard({ colors }: DemoDashboardProps) {
  const { headingFont, bodyFont, isDark } = useDemoSettings();
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent;
  const su = colors.success;
  const w = colors.warning;
  const d = colors.danger;

  const sidebarBg = isDark ? getTone(colors, 'neutral', 0) : getTone(colors, 'neutral', 0);
  const mainBg = isDark ? getTone(colors, 'neutral', 1) : '#fff';
  const cardBg = isDark ? getTone(colors, 'neutral', 2) : '#fff';
  const textMuted = isDark ? getTone(colors, 'neutral', 6) : '#6b7280';
  const textDefault = isDark ? getTone(colors, 'neutral', 8) : '#374151';
  const borderColor = isDark ? getTone(colors, 'neutral', 3) : '#e5e7eb';

  const navItems = [
    { label: 'Overview', active: true },
    { label: 'Analytics', active: false },
    { label: 'Users', active: false },
    { label: 'Reports', active: false },
    { label: 'Settings', active: false },
  ];

  const dashStats = [
    { label: 'Total Users', value: '24,521', color: p.hex, change: '+12%', up: true },
    { label: 'Revenue', value: '$48.2K', color: s.hex, change: '+8.1%', up: true },
    { label: 'Growth', value: '+12.5%', color: su.hex, change: '+3.2%', up: true },
    { label: 'Active Now', value: '1,429', color: a.hex, change: '-2.4%', up: false },
  ];

  const rows = [
    { name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', statusColor: su.hex, statusBg: isDark ? getTone(colors, 'success', 1) : getTone(colors, 'success', 8), role: 'Admin' },
    { name: 'Bob Smith', email: 'bob@example.com', status: 'Pending', statusColor: w.hex, statusBg: isDark ? getTone(colors, 'warning', 1) : getTone(colors, 'warning', 8), role: 'Editor' },
    { name: 'Carol White', email: 'carol@example.com', status: 'Inactive', statusColor: d.hex, statusBg: isDark ? getTone(colors, 'danger', 1) : getTone(colors, 'danger', 8), role: 'Viewer' },
    { name: 'Dave Wilson', email: 'dave@example.com', status: 'Active', statusColor: su.hex, statusBg: isDark ? getTone(colors, 'success', 1) : getTone(colors, 'success', 8), role: 'Editor' },
  ];

  return (
    <div className="flex rounded-xl overflow-hidden" style={{ minHeight: 520, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {/* Sidebar */}
      <div
        className="flex flex-col p-4"
        style={{ width: 200, background: sidebarBg }}
      >
        <div className="font-bold text-lg mb-1" style={{ color: p.hex, fontFamily: headingFont }}>
          Dashboard
        </div>
        <div className="text-xs mb-4" style={{ color: getTone(colors, 'neutral', 5), fontFamily: bodyFont }}>
          Management Panel
        </div>
        <div
          className="mb-4"
          style={{ borderBottom: `1px solid ${getTone(colors, 'neutral', 2)}` }}
        />
        <div className="flex flex-col gap-1">
          {navItems.map(item => (
            <div
              key={item.label}
              className="px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
              style={{
                fontFamily: bodyFont,
                ...(item.active
                  ? { background: p.hex, color: textOn(p.hex), fontWeight: 600 }
                  : { color: getTone(colors, 'neutral', 4) }
                ),
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-5" style={{ background: mainBg }}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <input
            className="rounded-lg px-3 py-2 text-sm outline-none"
            type="text"
            placeholder="Search..."
            style={{
              maxWidth: 240,
              fontFamily: bodyFont,
              background: isDark ? getTone(colors, 'neutral', 2) : '#f9fafb',
              color: textDefault,
              border: `1px solid ${borderColor}`,
            }}
          />
          <div className="flex items-center gap-3">
            <span
              className="inline-block px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-all hover:brightness-110"
              style={{ background: `${p.hex}15`, color: p.hex, fontFamily: bodyFont }}
            >
              Export
            </span>
            <span
              className="inline-block px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-all hover:brightness-110"
              style={{ background: `${s.hex}15`, color: s.hex, fontFamily: bodyFont }}
            >
              Filter
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: p.hex, color: textOn(p.hex) }}
            >
              JD
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {dashStats.map(st => (
            <div
              key={st.label}
              className="rounded-xl p-4 transition-transform hover:scale-[1.02]"
              style={{ background: cardBg, borderTop: `3px solid ${st.color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="text-xs mb-1" style={{ color: textMuted, fontFamily: bodyFont }}>{st.label}</div>
              <div className="text-xl font-bold" style={{ color: st.color, fontFamily: headingFont }}>
                {st.value}
              </div>
              <div className="text-xs mt-1.5 font-semibold" style={{ color: st.up ? su.hex : d.hex, fontFamily: bodyFont }}>
                {st.change}
              </div>
            </div>
          ))}
        </div>

        {/* Data table */}
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: `1px solid ${borderColor}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: isDark ? getTone(colors, 'neutral', 2) : '#f9fafb' }}>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Name</th>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Email</th>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Status</th>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.name}
                  className="transition-colors"
                  style={{
                    background: i % 2 === 1
                      ? (isDark ? getTone(colors, 'neutral', 2) : '#fafafa')
                      : (isDark ? getTone(colors, 'neutral', 1) : '#fff'),
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? getTone(colors, 'neutral', 3) : '#f0f4ff'; }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = i % 2 === 1
                      ? (isDark ? getTone(colors, 'neutral', 2) : '#fafafa')
                      : (isDark ? getTone(colors, 'neutral', 1) : '#fff');
                  }}
                >
                  <td className="px-4 py-2.5 font-medium" style={{ color: textDefault, fontFamily: bodyFont }}>{row.name}</td>
                  <td className="px-4 py-2.5" style={{ color: textMuted, fontFamily: bodyFont }}>{row.email}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: row.statusBg, color: row.statusColor, fontFamily: bodyFont }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: textMuted, fontFamily: bodyFont }}>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <span
            className="inline-block px-5 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
            style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
          >
            Edit
          </span>
          <span
            className="inline-block px-5 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
            style={{ background: d.hex, color: textOn(d.hex), fontFamily: bodyFont, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
          >
            Delete
          </span>
        </div>
      </div>
    </div>
  );
}
