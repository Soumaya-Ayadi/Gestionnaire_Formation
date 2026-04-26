import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart, RadialBarChart, RadialBar,
} from 'recharts';
import api from '../services/api.jsx';

// ─── Color palette ────────────────────────────────────────────────────────────
const PALETTE = ['#2d5be3', '#e8a87c', '#2da870', '#e04444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
const CHART_GRID = '#f0ede8';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #ddd9d3', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#1a1c24' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.stroke, display: 'inline-block' }} />
          <span style={{ color: '#7a7d8a' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#1a1c24' }}>{p.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color = '#2d5be3', icon }) {
  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div className="kpi-label">{label}</div>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div className="kpi-value" style={{ color }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 32 }}>
      <div style={{ height: 1, background: 'var(--border)', flex: 1 }} />
      <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 13.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ height: 1, background: 'var(--border)', flex: 1 }} />
    </div>
  );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style }) {
  return (
    <div className="chart-card" style={style}>
      <div className="chart-header">
        <h3>{title}</h3>
        {subtitle && <span className="chart-meta">{subtitle}</span>}
      </div>
      <div className="chart-body">{children}</div>
    </div>
  );
}

// ─── Pie Legend ───────────────────────────────────────────────────────────────
function PieLegend({ data, nameKey, valueKey }) {
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="legend-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
          <span style={{ flex: 1, fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d[nameKey]}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: 'var(--text)', marginLeft: 6 }}>
            {d[valueKey]}
          </span>
          <span style={{ fontSize: 10.5, color: 'var(--muted)', minWidth: 34, textAlign: 'right' }}>
            {total ? `${((d[valueKey] / total) * 100).toFixed(0)}%` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom Pie Label ─────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Statistiques() {
  const [data, setData] = useState({
    formationsParAnnee: [], participantsParAnnee: [], participantsParStructure: [],
    participantsParProfil: [], formationsParDomaine: [], evolution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/statistiques/formations-par-annee'),
      api.get('/statistiques/participants-par-annee'),
      api.get('/statistiques/participants-par-structure'),
      api.get('/statistiques/participants-par-profil'),
      api.get('/statistiques/formations-par-domaine'),
      api.get('/statistiques/evolution-participants'),
    ]).then(([fpa, ppA, ppS, ppP, fpD, evo]) => {
      setData({
        formationsParAnnee: fpa.data,
        participantsParAnnee: ppA.data,
        participantsParStructure: ppS.data,
        participantsParProfil: ppP.data,
        formationsParDomaine: fpD.data,
        evolution: evo.data,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Derive KPIs
  const totalFormations = data.formationsParAnnee.reduce((s, d) => s + d.count, 0);
  const totalParticipants = data.participantsParAnnee.reduce((s, d) => s + d.count, 0);
  const lastEvo = data.evolution[data.evolution.length - 1];
  const maxDomaine = data.formationsParDomaine.length
    ? data.formationsParDomaine.reduce((a, b) => a.count > b.count ? a : b)
    : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14 }}>Chargement des statistiques…</div>
      </div>
    </div>
  );

  return (
    <div>
      {/* ─── KPI Row ─── */}
      <div className="kpi-grid">
        <KpiCard label="Formations au total" value={totalFormations} icon="📋" color="#2d5be3"
          sub={`Sur ${data.formationsParAnnee.length} année${data.formationsParAnnee.length !== 1 ? 's' : ''}`} />
        <KpiCard label="Participants au total" value={totalParticipants} icon="👥" color="#2da870"
          sub={`Tous cycles confondus`} />
        <KpiCard label="Évolution (dernière ann.)" icon="📈" color="#e8a87c"
          value={lastEvo?.evolution != null ? `${lastEvo.evolution > 0 ? '+' : ''}${lastEvo.evolution}%` : '—'}
          sub={lastEvo ? `Année ${lastEvo.annee}` : ''} />
        <KpiCard label="Domaine principal" icon="🏆" color="#8b5cf6"
          value={maxDomaine?.count ?? '—'}
          sub={maxDomaine?.domaine || 'N/A'} />
      </div>

      {/* ─── Activité annuelle ─── */}
      <SectionTitle>Activité annuelle</SectionTitle>
      <div className="chart-two-col">
        <ChartCard title="Formations par année" subtitle={`${totalFormations} au total`}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data.formationsParAnnee} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="annee" fontSize={11.5} tickLine={false} axisLine={false} />
              <YAxis fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Formations" fill="#2d5be3" radius={[5, 5, 0, 0]}>
                {data.formationsParAnnee.map((_, i) => (
                  <Cell key={i} fill={i === data.formationsParAnnee.length - 1 ? '#2d5be3' : '#c2d3fa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Participants par année" subtitle={`${totalParticipants} au total`}>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={data.participantsParAnnee}>
              <defs>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2da870" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2da870" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="annee" fontSize={11.5} tickLine={false} axisLine={false} />
              <YAxis fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Participants" stroke="#2da870" strokeWidth={2.5}
                fill="url(#gradGreen)" dot={{ r: 4, fill: '#2da870', strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ─── Évolution ─── */}
      <SectionTitle>Évolution & progression</SectionTitle>
      <div className="chart-full mb-24">
        <ChartCard
          title="Évolution du nombre de participants"
          subtitle="Avec taux de progression annuel (%)"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.evolution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2d5be3" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#2d5be3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="annee" fontSize={11.5} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <YAxis yAxisId="r" orientation="right" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={38} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{v}</span>}
                iconType="circle" iconSize={8}
              />
              <Line yAxisId="l" type="monotone" dataKey="count" name="Participants" stroke="#2d5be3"
                strokeWidth={2.5} dot={{ r: 5, fill: '#2d5be3', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }} />
              <Line yAxisId="r" type="monotone" dataKey="evolution" name="Évolution %" stroke="#e8a87c"
                strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#e8a87c', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ─── Répartitions ─── */}
      <SectionTitle>Répartitions</SectionTitle>
      <div className="chart-two-col mb-24">
        {/* Pie: structure */}
        <ChartCard title="Participants par structure"
          subtitle={`${data.participantsParStructure.length} structure${data.participantsParStructure.length !== 1 ? 's' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {data.participantsParStructure.length === 0 ? (
              <div className="empty" style={{ flex: 1, padding: 20 }}>Aucune donnée</div>
            ) : (
              <>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={data.participantsParStructure} dataKey="count" nameKey="structure"
                      cx="50%" cy="50%" outerRadius={82} innerRadius={40}
                      labelLine={false} label={renderCustomLabel}>
                      {data.participantsParStructure.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <PieLegend data={data.participantsParStructure} nameKey="structure" valueKey="count" />
              </>
            )}
          </div>
        </ChartCard>

        {/* Pie: domaine */}
        <ChartCard title="Formations par domaine"
          subtitle={`${data.formationsParDomaine.length} domaine${data.formationsParDomaine.length !== 1 ? 's' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {data.formationsParDomaine.length === 0 ? (
              <div className="empty" style={{ flex: 1, padding: 20 }}>Aucune donnée</div>
            ) : (
              <>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={data.formationsParDomaine} dataKey="count" nameKey="domaine"
                      cx="50%" cy="50%" outerRadius={82} innerRadius={40}
                      labelLine={false} label={renderCustomLabel}>
                      {data.formationsParDomaine.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <PieLegend data={data.formationsParDomaine} nameKey="domaine" valueKey="count" />
              </>
            )}
          </div>
        </ChartCard>
      </div>

      {/* ─── Par profil (horizontal bar) ─── */}
      <SectionTitle>Profils des participants</SectionTitle>
      <ChartCard
        title="Participants par profil"
        subtitle="Classement par nombre de participants"
        style={{ marginBottom: 8 }}
      >
        {data.participantsParProfil.length === 0 ? (
          <div className="empty">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, data.participantsParProfil.length * 44)}>
            <BarChart data={data.participantsParProfil} layout="vertical" barSize={22} margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
              <XAxis type="number" fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="profil" fontSize={12} width={160} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Participants" radius={[0, 5, 5, 0]}>
                {data.participantsParProfil.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}