import { textOn } from '@/lib/color-utils.ts';
import type { PaletteColors } from '@/lib/palette-utils.ts';
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
  const { headingFont, bodyFont, chrome, radii } = useDemoSettings();
  const p = colors.primary.hex;
  const s = colors.secondary.hex;
  const a = colors.accent.hex;
  const su = colors.success.hex;
  const d = colors.danger.hex;
  const H = { fontFamily: `'${headingFont}', sans-serif` };
  const B = { fontFamily: `'${bodyFont}', sans-serif` };
  const rx = (n: number) => `${n}px`;

  const navItems = [
    { label: 'Overview', Icon: LayoutDashboard, active: true },
    { label: 'Analytics', Icon: BarChart3, active: false },
    { label: 'Users', Icon: Users, active: false },
    { label: 'Reports', Icon: FileText, active: false },
    { label: 'Settings', Icon: Settings, active: false },
  ];
  const dashStats = [
    { label: 'Total users', value: '24,521', color: p, change: '+12%', up: true, Icon: Users },
    { label: 'Revenue', value: '$48.2K', color: s, change: '+8.1%', up: true, Icon: DollarSign },
    { label: 'Growth', value: '+12.5%', color: su, change: '+3.2%', up: true, Icon: Activity },
    { label: 'Active now', value: '1,429', color: a, change: '-2.4%', up: false, Icon: UserCheck },
  ];
  const rows = [
    { name: 'Alice Johnson', initials: 'AJ', email: 'alice@example.com', status: 'Active', sc: su, role: 'Admin', color: p },
    { name: 'Bob Smith', initials: 'BS', email: 'bob@example.com', status: 'Pending', sc: colors.warning.hex, role: 'Editor', color: s },
    { name: 'Carol White', initials: 'CW', email: 'carol@example.com', status: 'Inactive', sc: d, role: 'Viewer', color: a },
    { name: 'Dave Wilson', initials: 'DW', email: 'dave@example.com', status: 'Active', sc: su, role: 'Editor', color: su },
  ];
  const chartData = [45, 72, 58, 85, 65, 38, 52];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const pill = (bg: string, color: string) => ({ background: bg, color, borderRadius: rx(radii.md), ...B });

  return (
    <div className="flex overflow-hidden" style={{ minHeight: 620, borderRadius: rx(Math.max(radii.lg, 12)), border: `1px solid ${chrome.border}`, boxShadow: '0 12px 32px -16px rgba(0,0,0,0.2)' }}>
      {/* Sidebar */}
      <div className="flex flex-col p-4" style={{ width: 210, background: chrome.surfaceMuted, borderRight: `1px solid ${chrome.border}` }}>
        <div className="flex items-center gap-2.5 mb-6 px-1">
          <span className="w-8 h-8 flex items-center justify-center" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md) }}><LayoutDashboard size={17} /></span>
          <span className="font-bold text-[15px]" style={{ color: chrome.text, ...H }}>Northwind</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <div key={item.label} className="relative flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer" style={{ borderRadius: rx(radii.md), ...(item.active ? { background: `${p}16`, color: p, fontWeight: 600 } : { color: chrome.textMuted }), ...B }}>
              {item.active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full" style={{ background: p }} />}
              <item.Icon size={16} /> {item.label}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 pt-3" style={{ borderTop: `1px solid ${chrome.border}` }}>
          <div className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer" style={{ color: chrome.textMuted, ...B }}><HelpCircle size={16} /> Help</div>
          <div className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer" style={{ color: chrome.textMuted, ...B }}><LogOut size={16} /> Log out</div>
          <div className="flex items-center gap-2 px-2 py-2 mt-1" style={{ background: chrome.surface, borderRadius: rx(radii.md) }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: p, color: textOn(p) }}>JD</span>
            <div><div className="text-xs font-semibold" style={{ color: chrome.text, ...B }}>John Doe</div><div className="text-[10px]" style={{ color: chrome.textMuted, ...B }}>Admin</div></div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col p-5 min-w-0" style={{ background: chrome.background }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl" style={{ color: chrome.text, ...H }}>Overview</h2>
            <p className="text-xs" style={{ color: chrome.textMuted, ...B }}>Welcome back, here's what's happening.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative max-md:hidden">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: chrome.textMuted }} />
              <input readOnly placeholder="Search…" className="pl-9 pr-3 py-2 text-sm outline-none" style={{ width: 180, background: chrome.surfaceMuted, color: chrome.text, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.md), ...B }} />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold" style={pill(`${p}16`, p)}><Download size={13} /> Export</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold" style={{ background: p, color: textOn(p), borderRadius: rx(radii.md), ...B }}><Plus size={13} /> Add user</span>
            <div className="relative cursor-pointer"><Bell size={18} style={{ color: chrome.textMuted }} /><span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: d }} /></div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-5 max-md:grid-cols-2">
          {dashStats.map((st) => (
            <div key={st.label} className="p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg) }}>
              <span className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${st.color}14` }}><st.Icon size={16} style={{ color: st.color }} /></span>
              <div className="text-xs mb-1" style={{ color: chrome.textMuted, ...B }}>{st.label}</div>
              <div className="text-xl font-bold" style={{ color: chrome.text, ...H }}>{st.value}</div>
              <div className="flex items-center gap-1 mt-1.5" style={{ color: st.up ? su : d }}>
                {st.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}<span className="text-xs font-semibold" style={B}>{st.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="p-5 mb-5" style={{ background: chrome.surface, border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg) }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm" style={{ color: chrome.text, ...H }}>Weekly revenue</span>
            <span className="text-xs" style={{ color: chrome.textMuted, ...B }}>Last 7 days</span>
          </div>
          <div className="flex items-end gap-3" style={{ height: 120 }}>
            {chartData.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md transition-opacity hover:opacity-80" style={{ height: `${h}%`, background: i === 3 ? p : `${p}3a` }} />
                <span className="text-[10px]" style={{ color: chrome.textMuted, ...B }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden" style={{ border: `1px solid ${chrome.border}`, borderRadius: rx(radii.lg) }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: chrome.surfaceMuted }}>
                {['Name', 'Email', 'Status', 'Role', ''].map((h, i) => (
                  <th key={i} className={`px-4 py-2.5 font-semibold text-[11px] uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`} style={{ color: chrome.textMuted, ...B }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.name} style={{ background: chrome.surface, borderTop: i > 0 ? `1px solid ${chrome.border}` : 'none' }}>
                  <td className="px-4 py-2.5" style={B}>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: row.color, color: textOn(row.color) }}>{row.initials}</span>
                      <span className="font-medium" style={{ color: chrome.text }}>{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: chrome.textMuted, ...B }}>{row.email}</td>
                  <td className="px-4 py-2.5"><span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${row.sc}20`, color: row.sc, ...B }}>{row.status}</span></td>
                  <td className="px-4 py-2.5" style={{ color: chrome.textMuted, ...B }}>{row.role}</td>
                  <td className="px-4 py-2.5 text-right"><MoreHorizontal size={16} style={{ color: chrome.textMuted }} className="inline-block cursor-pointer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-2.5 text-xs" style={{ background: chrome.surfaceMuted, color: chrome.textMuted, borderTop: `1px solid ${chrome.border}`, ...B }}>
            <span>Showing 4 of 24 users</span>
            <span className="inline-flex items-center gap-1.5"><Filter size={12} /> Filtered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
