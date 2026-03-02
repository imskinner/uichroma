import { textOn } from '@/lib/color-utils.ts';
import { getTone, type PaletteColors } from '@/lib/palette-utils.ts';
import { useDemoSettings } from '@/hooks/use-demo-settings.tsx';
import {
  LayoutDashboard, BarChart3, Users, FileText, Settings, TrendingUp, TrendingDown,
  Search, Bell, Download, Filter, MoreHorizontal, Plus, DollarSign, Activity, UserCheck,
  LogOut, HelpCircle,
} from 'lucide-react';

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
    { label: 'Overview', Icon: LayoutDashboard, active: true },
    { label: 'Analytics', Icon: BarChart3, active: false },
    { label: 'Users', Icon: Users, active: false },
    { label: 'Reports', Icon: FileText, active: false },
    { label: 'Settings', Icon: Settings, active: false },
  ];

  const dashStats = [
    { label: 'Total Users', value: '24,521', color: p.hex, change: '+12%', up: true, Icon: Users },
    { label: 'Revenue', value: '$48.2K', color: s.hex, change: '+8.1%', up: true, Icon: DollarSign },
    { label: 'Growth', value: '+12.5%', color: su.hex, change: '+3.2%', up: true, Icon: Activity },
    { label: 'Active Now', value: '1,429', color: a.hex, change: '-2.4%', up: false, Icon: UserCheck },
  ];

  const rows = [
    { name: 'Alice Johnson', initials: 'AJ', email: 'alice@example.com', status: 'Active', statusColor: su.hex, statusBg: isDark ? getTone(colors, 'success', 1) : getTone(colors, 'success', 8), role: 'Admin', color: p.hex },
    { name: 'Bob Smith', initials: 'BS', email: 'bob@example.com', status: 'Pending', statusColor: w.hex, statusBg: isDark ? getTone(colors, 'warning', 1) : getTone(colors, 'warning', 8), role: 'Editor', color: s.hex },
    { name: 'Carol White', initials: 'CW', email: 'carol@example.com', status: 'Inactive', statusColor: d.hex, statusBg: isDark ? getTone(colors, 'danger', 1) : getTone(colors, 'danger', 8), role: 'Viewer', color: a.hex },
    { name: 'Dave Wilson', initials: 'DW', email: 'dave@example.com', status: 'Active', statusColor: su.hex, statusBg: isDark ? getTone(colors, 'success', 1) : getTone(colors, 'success', 8), role: 'Editor', color: su.hex },
  ];

  const chartData = [
    { day: 'Mon', height: 45 },
    { day: 'Tue', height: 72 },
    { day: 'Wed', height: 58 },
    { day: 'Thu', height: 85 },
    { day: 'Fri', height: 65 },
    { day: 'Sat', height: 38 },
    { day: 'Sun', height: 52 },
  ];

  return (
    <div className="flex rounded-xl overflow-hidden" style={{ minHeight: 620, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      {/* Sidebar */}
      <div
        className="flex flex-col p-4"
        style={{ width: 200, background: sidebarBg }}
      >
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard size={18} style={{ color: p.hex }} />
          <span className="font-bold text-lg" style={{ color: p.hex, fontFamily: headingFont }}>Dashboard</span>
        </div>
        <div className="text-xs mb-4" style={{ color: getTone(colors, 'neutral', 5), fontFamily: bodyFont }}>
          Management Panel
        </div>
        <div className="mb-4" style={{ borderBottom: `1px solid ${getTone(colors, 'neutral', 2)}` }} />
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
              style={{
                fontFamily: bodyFont,
                ...(item.active
                  ? { background: `${p.hex}15`, color: p.hex, fontWeight: 600, borderLeft: `3px solid ${p.hex}` }
                  : { color: getTone(colors, 'neutral', 4) }
                ),
              }}
            >
              <item.Icon size={16} />
              {item.label}
            </div>
          ))}
        </div>
        {/* Sidebar bottom */}
        <div className="mt-auto flex flex-col gap-1">
          <div className="mb-2" style={{ borderBottom: `1px solid ${getTone(colors, 'neutral', 2)}` }} />
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer" style={{ color: getTone(colors, 'neutral', 4), fontFamily: bodyFont }}>
            <HelpCircle size={16} /> Help
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer" style={{ color: getTone(colors, 'neutral', 4), fontFamily: bodyFont }}>
            <LogOut size={16} /> Logout
          </div>
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: getTone(colors, 'neutral', 1) }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: p.hex, color: textOn(p.hex) }}
            >
              JD
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: getTone(colors, 'neutral', 7), fontFamily: bodyFont }}>John Doe</div>
              <div className="text-[10px]" style={{ color: getTone(colors, 'neutral', 5), fontFamily: bodyFont }}>Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-5" style={{ background: mainBg }}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="relative" style={{ maxWidth: 240 }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
            <input
              className="rounded-lg pl-9 pr-3 py-2 text-sm outline-none w-full"
              type="text"
              placeholder="Search..."
              style={{
                fontFamily: bodyFont,
                background: isDark ? getTone(colors, 'neutral', 2) : '#f9fafb',
                color: textDefault,
                border: `1px solid ${borderColor}`,
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-all hover:brightness-110"
              style={{ background: `${p.hex}15`, color: p.hex, fontFamily: bodyFont }}
            >
              <Download size={13} /> Export
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-all hover:brightness-110"
              style={{ background: `${s.hex}15`, color: s.hex, fontFamily: bodyFont }}
            >
              <Filter size={13} /> Filter
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-all hover:brightness-110"
              style={{ background: p.hex, color: textOn(p.hex), fontFamily: bodyFont }}
            >
              <Plus size={13} /> Add User
            </span>
            <div className="relative cursor-pointer">
              <Bell size={18} style={{ color: textMuted }} />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: d.hex }} />
            </div>
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
              className="rounded-xl p-4 transition-all hover:-translate-y-1 relative overflow-hidden"
              style={{ background: cardBg, borderTop: `3px solid ${st.color}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${st.color}12` }}>
                <st.Icon size={16} style={{ color: st.color }} />
              </div>
              <div className="text-xs mb-1" style={{ color: textMuted, fontFamily: bodyFont }}>{st.label}</div>
              <div className="text-xl font-bold" style={{ color: st.color, fontFamily: headingFont }}>
                {st.value}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                {st.up
                  ? <TrendingUp size={12} style={{ color: su.hex }} />
                  : <TrendingDown size={12} style={{ color: d.hex }} />
                }
                <span className="text-xs font-semibold" style={{ color: st.up ? su.hex : d.hex, fontFamily: bodyFont }}>
                  {st.change}
                </span>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 mt-2.5 h-5">
                {[35, 60, 45, 75, 50].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{ height: `${h}%`, background: `${st.color}${i === 3 ? '50' : '20'}` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div
          className="rounded-xl p-5 mb-5"
          style={{ background: cardBg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} style={{ color: p.hex }} />
              <span className="font-bold text-sm" style={{ color: textDefault, fontFamily: headingFont }}>Weekly Revenue</span>
            </div>
            <span className="text-xs" style={{ color: textMuted, fontFamily: bodyFont }}>Last 7 days</span>
          </div>
          <div className="flex items-end gap-3" style={{ height: 120 }}>
            {chartData.map((bar, i) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all hover:opacity-80"
                  style={{
                    height: `${bar.height}%`,
                    background: i === 3 ? p.hex : `${p.hex}40`,
                  }}
                />
                <span className="text-[10px]" style={{ color: textMuted, fontFamily: bodyFont }}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data table */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: isDark ? getTone(colors, 'neutral', 2) : '#f9fafb' }}>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Name</th>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Email</th>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Status</th>
                <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Role</th>
                <th className="px-4 py-2.5 text-right font-semibold text-xs uppercase tracking-wider" style={{ color: textMuted, fontFamily: bodyFont }}>Actions</th>
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
                  <td className="px-4 py-2.5" style={{ fontFamily: bodyFont }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: row.color, color: textOn(row.color) }}
                      >
                        {row.initials}
                      </div>
                      <span className="font-medium" style={{ color: textDefault }}>{row.name}</span>
                    </div>
                  </td>
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
                  <td className="px-4 py-2.5 text-right">
                    <MoreHorizontal size={16} style={{ color: textMuted }} className="cursor-pointer inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Table footer */}
          <div
            className="flex items-center justify-between px-4 py-2.5 text-xs"
            style={{ background: isDark ? getTone(colors, 'neutral', 2) : '#f9fafb', color: textMuted, fontFamily: bodyFont }}
          >
            <span>Showing 4 of 24 users</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full cursor-pointer"
                  style={{ background: i === 0 ? p.hex : (isDark ? getTone(colors, 'neutral', 4) : '#d1d5db') }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
