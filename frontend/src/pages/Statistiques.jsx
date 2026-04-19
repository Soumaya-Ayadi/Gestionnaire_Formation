import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import api from '../services/api.jsx';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function Statistiques() {
  const [data, setData] = useState({
    formationsParAnnee: [],
    participantsParAnnee: [],
    participantsParStructure: [],
    participantsParProfil: [],
    formationsParDomaine: [],
    evolution: [],
  });

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
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="grid-2 mb-24">
        {/* Bar: formations per year */}
        <div className="card">
          <div className="card-header"><h3>Formations par année</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.formationsParAnnee}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="annee" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Formations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: participants per year */}
        <div className="card">
          <div className="card-header"><h3>Participants par année</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.participantsParAnnee}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="annee" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4,4,0,0]} name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        {/* Pie: participants per structure */}
        <div className="card">
          <div className="card-header"><h3>Participants par structure</h3></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={data.participantsParStructure} dataKey="count" nameKey="structure"
                  cx="50%" cy="50%" outerRadius={85} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {data.participantsParStructure.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, fontSize: 12 }}>
              {data.participantsParStructure.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ color: 'var(--muted)' }}>{d.structure}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie: formations per domaine */}
        <div className="card">
          <div className="card-header"><h3>Formations par domaine</h3></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={data.formationsParDomaine} dataKey="count" nameKey="domaine"
                  cx="50%" cy="50%" outerRadius={85} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {data.formationsParDomaine.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, fontSize: 12 }}>
              {data.formationsParDomaine.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ color: 'var(--muted)' }}>{d.domaine}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line: evolution with % */}
      <div className="card mb-24">
        <div className="card-header"><h3>Évolution du nombre de participants (avec % de progression)</h3></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="annee" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(val, name) => name === 'Évolution %' ? `${val}%` : val} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Participants" />
              <Line yAxisId="right" type="monotone" dataKey="evolution" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Évolution %" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar: participants per profil */}
      <div className="card">
        <div className="card-header"><h3>Participants par profil</h3></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.participantsParProfil} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="profil" fontSize={11} width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0,4,4,0]} name="Participants" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
