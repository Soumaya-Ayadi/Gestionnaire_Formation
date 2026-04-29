import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart,
} from 'recharts';
import api from '../services/api.jsx';

// ─── Color palette ────────────────────────────────────────────────────────────
const PALETTE = ['#2d5be3', '#e8a87c', '#2da870', '#e04444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
const CHART_GRID = '#f0ede8';

const MONTH_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

const CURRENT_YEAR = new Date().getFullYear();

// ─── Filter mode definitions ──────────────────────────────────────────────────
const FILTER_MODES = [
  { id: 'all',        label: 'Tout',           icon: '📊' },
  { id: 'year',       label: 'Année',          icon: '📅' },
 /* { id: 'month',      label: 'Mois',           icon: '🗓️' },
  { id: 'range',      label: 'Plage de dates', icon: '📆' },
  { id: 'compare',    label: 'Comparer 2 ans', icon: '⚖️' },*/
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const filterBarStyle = {
  display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
  padding: '14px 18px', background: '#f8f7f5',
  border: '1px solid #e8e4df', borderRadius: 12, marginBottom: 24,
};

const selectStyle = {
  padding: '6px 10px', borderRadius: 7, border: '1px solid #d6d1cb',
  fontSize: 13, background: '#fff', color: '#1a1c24', cursor: 'pointer',
  outline: 'none',
};

const chipStyle = (active) => ({
  padding: '5px 12px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer',
  border: `1px solid ${active ? '#2d5be3' : '#d6d1cb'}`,
  background: active ? '#eef1fd' : '#fff',
  color: active ? '#2d5be3' : '#6b6f7e',
  fontWeight: active ? 600 : 400,
  transition: 'all .15s',
  display: 'flex', alignItems: 'center', gap: 5,
});

const labelStyle = {
  fontSize: 12, color: '#7a7d8a', fontWeight: 500, whiteSpace: 'nowrap',
};

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
CustomTooltip.propTypes = {
  active: PropTypes.bool, payload: PropTypes.array,
  label: PropTypes.string, unit: PropTypes.string,
};

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
KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sub: PropTypes.string, color: PropTypes.string, icon: PropTypes.string,
};

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
SectionTitle.propTypes = { children: PropTypes.node.isRequired };

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
ChartCard.propTypes = {
  title: PropTypes.string.isRequired, subtitle: PropTypes.string,
  children: PropTypes.node.isRequired, style: PropTypes.object,
};

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
PieLegend.propTypes = { data: PropTypes.array.isRequired, nameKey: PropTypes.string.isRequired, valueKey: PropTypes.string.isRequired };

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

// ─── Filter Bar Component ─────────────────────────────────────────────────────
function FilterBar({ mode, setMode, filters, setFilters, availableYears }) {
  return (
    <div>
      {/* Mode selector chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {FILTER_MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={chipStyle(mode === m.id)}>
            <span>{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      {/* Mode-specific controls */}
      {mode !== 'all' && (
        <div style={filterBarStyle}>
          {/* ── By year ── */}
          {mode === 'year' && (
            <>
              <span style={labelStyle}>Année :</span>
              <select style={selectStyle} value={filters.year}
                onChange={e => setFilters(f => ({ ...f, year: +e.target.value }))}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}

          {/* ── By month ── */}
          {mode === 'month' && (
            <>
              <span style={labelStyle}>Année :</span>
              <select style={selectStyle} value={filters.year}
                onChange={e => setFilters(f => ({ ...f, year: +e.target.value }))}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span style={labelStyle}>Mois :</span>
              <select style={selectStyle} value={filters.month}
                onChange={e => setFilters(f => ({ ...f, month: +e.target.value }))}>
                {MONTH_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </>
          )}

          {/* ── Date range ── */}
          {mode === 'range' && (
            <>
              <span style={labelStyle}>De :</span>
              <select style={selectStyle} value={filters.yearFrom}
                onChange={e => setFilters(f => ({ ...f, yearFrom: +e.target.value }))}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={selectStyle} value={filters.monthFrom}
                onChange={e => setFilters(f => ({ ...f, monthFrom: +e.target.value }))}>
                {MONTH_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <span style={labelStyle}>À :</span>
              <select style={selectStyle} value={filters.yearTo}
                onChange={e => setFilters(f => ({ ...f, yearTo: +e.target.value }))}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={selectStyle} value={filters.monthTo}
                onChange={e => setFilters(f => ({ ...f, monthTo: +e.target.value }))}>
                {MONTH_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </>
          )}

          {/* ── Compare 2 years ── */}
          {mode === 'compare' && (
            <>
              <span style={labelStyle}>Année A :</span>
              <select style={selectStyle} value={filters.compareA}
                onChange={e => setFilters(f => ({ ...f, compareA: +e.target.value }))}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span style={labelStyle}>Année B :</span>
              <select style={selectStyle} value={filters.compareB}
                onChange={e => setFilters(f => ({ ...f, compareB: +e.target.value }))}>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}
        </div>
      )}
    </div>
  );
}
FilterBar.propTypes = {
  mode: PropTypes.string.isRequired, setMode: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired, setFilters: PropTypes.func.isRequired,
  availableYears: PropTypes.array.isRequired,
};

// ─── Comparison Chart ─────────────────────────────────────────────────────────
function CompareChart({ rawFormations, rawParticipants, yearA, yearB }) {
  // Build month-by-month data for both years
  const formationsData = MONTH_LABELS.map((m, i) => {
    const month = i + 1;
    const a = rawFormations.filter(d => d.annee === yearA && d.mois === month).reduce((s, d) => s + d.count, 0);
    const b = rawFormations.filter(d => d.annee === yearB && d.mois === month).reduce((s, d) => s + d.count, 0);
    return { month: m, [yearA]: a, [yearB]: b };
  });

  const participantsData = MONTH_LABELS.map((m, i) => {
    const month = i + 1;
    const a = rawParticipants.filter(d => d.annee === yearA && d.mois === month).reduce((s, d) => s + d.count, 0);
    const b = rawParticipants.filter(d => d.annee === yearB && d.mois === month).reduce((s, d) => s + d.count, 0);
    return { month: m, [yearA]: a, [yearB]: b };
  });

  return (
    <div className="chart-two-col">
      <ChartCard title={`Formations — ${yearA} vs ${yearB}`} subtitle="Par mois">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={formationsData} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={v => <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{v}</span>} iconType="circle" iconSize={8} />
            <Bar dataKey={yearA} name={`${yearA}`} fill="#2d5be3" radius={[3, 3, 0, 0]} />
            <Bar dataKey={yearB} name={`${yearB}`} fill="#e8a87c" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={`Participants — ${yearA} vs ${yearB}`} subtitle="Par mois">
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={participantsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={v => <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{v}</span>} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey={yearA} name={`${yearA}`} stroke="#2d5be3" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey={yearB} name={`${yearB}`} stroke="#e8a87c" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
CompareChart.propTypes = {
  rawFormations: PropTypes.array.isRequired, rawParticipants: PropTypes.array.isRequired,
  yearA: PropTypes.number.isRequired, yearB: PropTypes.number.isRequired,
};

// ─── Active filter badge ──────────────────────────────────────────────────────
function FilterBadge({ mode, filters }) {
  if (mode === 'all') return null;
  let text = '';
  if (mode === 'year')    text = `Année ${filters.year}`;
  if (mode === 'month')   text = `${MONTH_LABELS[filters.month - 1]} ${filters.year}`;
  if (mode === 'range')   text = `${MONTH_LABELS[filters.monthFrom - 1]} ${filters.yearFrom} → ${MONTH_LABELS[filters.monthTo - 1]} ${filters.yearTo}`;
  if (mode === 'compare') text = `${filters.compareA} vs ${filters.compareB}`;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11.5,
      background: '#eef1fd', color: '#2d5be3', fontWeight: 600, marginLeft: 8,
    }}>
      🔍 {text}
    </span>
  );
}
FilterBadge.propTypes = { mode: PropTypes.string.isRequired, filters: PropTypes.object.isRequired };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Statistiques() {
  const [data, setData] = useState({
    formationsParAnnee: [], participantsParAnnee: [], participantsParStructure: [],
    participantsParProfil: [], formationsParDomaine: [], evolution: [],
    // Monthly breakdown (fetched when needed)
    formationsParMois: [], participantsParMois: [],
  });
  const [loading, setLoading] = useState(true);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState('all');
  const [filters, setFilters] = useState({
    year:      CURRENT_YEAR,
    month:     new Date().getMonth() + 1,
    yearFrom:  CURRENT_YEAR - 1,
    monthFrom: 1,
    yearTo:    CURRENT_YEAR,
    monthTo:   12,
    compareA:  CURRENT_YEAR - 1,
    compareB:  CURRENT_YEAR,
  });

  useEffect(() => {
    Promise.all([
      api.get('/statistiques/formations-par-annee'),
      api.get('/statistiques/participants-par-annee'),
      api.get('/statistiques/participants-par-structure'),
      api.get('/statistiques/participants-par-profil'),
      api.get('/statistiques/formations-par-domaine'),
      api.get('/statistiques/evolution-participants'),
      // Monthly data — your backend should support these endpoints.
      // If they don't exist yet, the fallback gracefully degrades.
      api.get('/statistiques/formations-par-mois').catch(() => ({ data: [] })),
      api.get('/statistiques/participants-par-mois').catch(() => ({ data: [] })),
    ]).then(([fpa, ppA, ppS, ppP, fpD, evo, fpm, ppm]) => {
      setData({
        formationsParAnnee:      fpa.data,
        participantsParAnnee:    ppA.data,
        participantsParStructure: ppS.data,
        participantsParProfil:   ppP.data,
        formationsParDomaine:    fpD.data,
        evolution:               evo.data,
        formationsParMois:       fpm.data,
        participantsParMois:     ppm.data,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── Available years derived from data ─────────────────────────────────────
  const availableYears = useMemo(() => {
    const years = [...new Set(data.formationsParAnnee.map(d => d.annee))].sort((a, b) => a - b);
    return years.length ? years : [CURRENT_YEAR];
  }, [data.formationsParAnnee]);

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const fpa  = data.formationsParAnnee;
    const ppA  = data.participantsParAnnee;
    const fpD  = data.formationsParDomaine;
    const ppP  = data.participantsParProfil;
    const ppS  = data.participantsParStructure;
    const evo  = data.evolution;
    const fpm  = data.formationsParMois;
    const ppm  = data.participantsParMois;

    if (filterMode === 'all') return { fpa, ppA, fpD, ppP, ppS, evo };

    if (filterMode === 'year') {
      const y = filters.year;
      // formations & participants bar/area charts → show monthly breakdown for that year
      const fpaFiltered = fpm.filter(d => d.annee === y).length
        ? fpm.filter(d => d.annee === y).map(d => ({ annee: MONTH_LABELS[d.mois - 1], count: d.count }))
        : fpa.filter(d => d.annee === y);
      const ppAFiltered = ppm.filter(d => d.annee === y).length
        ? ppm.filter(d => d.annee === y).map(d => ({ annee: MONTH_LABELS[d.mois - 1], count: d.count }))
        : ppA.filter(d => d.annee === y);
      return {
        fpa: fpaFiltered, ppA: ppAFiltered,
        fpD, ppP, ppS, evo: evo.filter(d => d.annee === y),
      };
    }

    if (filterMode === 'month') {
      const { year, month } = filters;
      const fpaFiltered = fpm.filter(d => d.annee === year && d.mois === month)
        .map(d => ({ annee: `${MONTH_LABELS[d.mois - 1]} ${d.annee}`, count: d.count }));
      const ppAFiltered = ppm.filter(d => d.annee === year && d.mois === month)
        .map(d => ({ annee: `${MONTH_LABELS[d.mois - 1]} ${d.annee}`, count: d.count }));
      return {
        fpa: fpaFiltered.length ? fpaFiltered : fpa.filter(d => d.annee === year),
        ppA: ppAFiltered.length ? ppAFiltered : ppA.filter(d => d.annee === year),
        fpD, ppP, ppS, evo: evo.filter(d => d.annee === year),
      };
    }

    if (filterMode === 'range') {
      const { yearFrom, monthFrom, yearTo, monthTo } = filters;
      const inRange = (annee, mois) => {
        const val = annee * 100 + mois;
        return val >= yearFrom * 100 + monthFrom && val <= yearTo * 100 + monthTo;
      };
      const fpaFiltered = fpm.filter(d => inRange(d.annee, d.mois))
        .map(d => ({ annee: `${MONTH_LABELS[d.mois - 1]} ${d.annee}`, count: d.count }));
      const ppAFiltered = ppm.filter(d => inRange(d.annee, d.mois))
        .map(d => ({ annee: `${MONTH_LABELS[d.mois - 1]} ${d.annee}`, count: d.count }));
      const yearRange = [...new Set([
        ...fpa.map(d => d.annee), ...ppA.map(d => d.annee),
      ])].filter(y => y >= yearFrom && y <= yearTo);
      return {
        fpa: fpaFiltered.length ? fpaFiltered : fpa.filter(d => d.annee >= yearFrom && d.annee <= yearTo),
        ppA: ppAFiltered.length ? ppAFiltered : ppA.filter(d => d.annee >= yearFrom && d.annee <= yearTo),
        fpD, ppP, ppS, evo: evo.filter(d => yearRange.includes(d.annee)),
      };
    }

    // compare mode doesn't use this filtered object — rendered separately
    return { fpa, ppA, fpD, ppP, ppS, evo };
  }, [filterMode, filters, data]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalFormations  = filtered.fpa.reduce((s, d) => s + d.count, 0);
  const totalParticipants = filtered.ppA.reduce((s, d) => s + d.count, 0);
  const lastEvo          = filtered.evo[filtered.evo.length - 1];
  const maxDomaine       = filtered.fpD?.length
    ? filtered.fpD.reduce((a, b) => a.count > b.count ? a : b)
    : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14 }}>Chargement des statistiques…</div>
      </div>
    </div>
  );

  const isCompare = filterMode === 'compare';

  return (
    <div>

      {/* ─── Filter Bar ─── */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1c24' }}>Filtrer par</span>
          <FilterBadge mode={filterMode} filters={filters} />
        </div>
        <FilterBar
          mode={filterMode} setMode={setFilterMode}
          filters={filters} setFilters={setFilters}
          availableYears={availableYears}
        />
      </div>

      {/* ─── KPI Row ─── */}
      <div className="kpi-grid">
        <KpiCard label="Formations" value={totalFormations} icon="📋" color="#2d5be3"
          sub={isCompare ? `${filters.compareA} + ${filters.compareB}` : `Sur ${filtered.fpa.length} période${filtered.fpa.length !== 1 ? 's' : ''}`} />
        <KpiCard label="Participants" value={totalParticipants} icon="👥" color="#2da870"
          sub="Tous cycles confondus" />
        <KpiCard label="Évolution" icon="📈" color="#e8a87c"
          value={lastEvo?.evolution != null ? `${lastEvo.evolution > 0 ? '+' : ''}${lastEvo.evolution}%` : '—'}
          sub={lastEvo ? `Année ${lastEvo.annee}` : ''} />
        <KpiCard label="Domaine principal" icon="🏆" color="#8b5cf6"
          value={maxDomaine?.count ?? '—'}
          sub={maxDomaine?.domaine || 'N/A'} />
      </div>

      {/* ─── Compare mode ─── */}
      {isCompare && (
        <>
          <SectionTitle>Comparaison annuelle</SectionTitle>
          <CompareChart
            rawFormations={data.formationsParMois}
            rawParticipants={data.participantsParMois}
            yearA={filters.compareA}
            yearB={filters.compareB}
          />
        </>
      )}

      {/* ─── Normal mode charts ─── */}
      {!isCompare && (
        <>
          {/* ─── Activité ─── */}
          <SectionTitle>
            {filterMode === 'all'   && 'Activité annuelle'}
            {filterMode === 'year'  && `Activité mensuelle — ${filters.year}`}
            {filterMode === 'month' && `Activité — ${MONTH_LABELS[filters.month - 1]} ${filters.year}`}
            {filterMode === 'range' && `Activité — plage sélectionnée`}
          </SectionTitle>
          <div className="chart-two-col">
            <ChartCard title="Formations" subtitle={`${totalFormations} au total`}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={filtered.fpa} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="annee" fontSize={11.5} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Formations" fill="#2d5be3" radius={[5, 5, 0, 0]}>
                    {filtered.fpa.map((_, i) => (
                      <Cell key={i} fill={i === filtered.fpa.length - 1 ? '#2d5be3' : '#c2d3fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Participants" subtitle={`${totalParticipants} au total`}>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={filtered.ppA}>
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

          {/* ─── Évolution (only for all/year/range) ─── */}
          {(filterMode === 'all' || filterMode === 'range') && (
            <>
              <SectionTitle>Évolution & progression</SectionTitle>
              <div className="chart-full mb-24">
                <ChartCard title="Évolution du nombre de participants" subtitle="Avec taux de progression (%)">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={filtered.evo} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                      <XAxis dataKey="annee" fontSize={11.5} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="l" fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                      <YAxis yAxisId="r" orientation="right" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={38} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={v => <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{v}</span>} iconType="circle" iconSize={8} />
                      <Line yAxisId="l" type="monotone" dataKey="count" name="Participants" stroke="#2d5be3"
                        strokeWidth={2.5} dot={{ r: 5, fill: '#2d5be3', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                      <Line yAxisId="r" type="monotone" dataKey="evolution" name="Évolution %" stroke="#e8a87c"
                        strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#e8a87c', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </>
          )}

          {/* ─── Répartitions ─── */}
          <SectionTitle>Répartitions</SectionTitle>
          <div className="chart-two-col mb-24">
            <ChartCard title="Participants par structure"
              subtitle={`${filtered.ppS.length} structure${filtered.ppS.length !== 1 ? 's' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {filtered.ppS.length === 0 ? (
                  <div className="empty" style={{ flex: 1, padding: 20 }}>Aucune donnée</div>
                ) : (
                  <>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={filtered.ppS} dataKey="count" nameKey="structure"
                          cx="50%" cy="50%" outerRadius={82} innerRadius={40}
                          labelLine={false} label={renderCustomLabel}>
                          {filtered.ppS.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <PieLegend data={filtered.ppS} nameKey="structure" valueKey="count" />
                  </>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Formations par domaine"
              subtitle={`${filtered.fpD.length} domaine${filtered.fpD.length !== 1 ? 's' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {filtered.fpD.length === 0 ? (
                  <div className="empty" style={{ flex: 1, padding: 20 }}>Aucune donnée</div>
                ) : (
                  <>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={filtered.fpD} dataKey="count" nameKey="domaine"
                          cx="50%" cy="50%" outerRadius={82} innerRadius={40}
                          labelLine={false} label={renderCustomLabel}>
                          {filtered.fpD.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <PieLegend data={filtered.fpD} nameKey="domaine" valueKey="count" />
                  </>
                )}
              </div>
            </ChartCard>
          </div>

          {/* ─── Par profil ─── */}
          <SectionTitle>Profils des participants</SectionTitle>
          <ChartCard title="Participants par profil" subtitle="Classement par nombre de participants" style={{ marginBottom: 8 }}>
            {filtered.ppP.length === 0 ? (
              <div className="empty">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, filtered.ppP.length * 44)}>
                <BarChart data={filtered.ppP} layout="vertical" barSize={22} margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                  <XAxis type="number" fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="profil" fontSize={12} width={160} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Participants" radius={[0, 5, 5, 0]}>
                    {filtered.ppP.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}