import React, { useEffect, useState } from 'react';
import { api } from '../api/http';

interface StatsProps {
  quizId: string;
}

interface Attempt {
  id: string;
  score: number;
  created_at: string;
  student_email: string;
}

export const TeacherStats = ({ quizId }: StatsProps) => {
  const [stats, setStats] = useState<{ attempts: Attempt[], summary: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<any>(`/api/quizzes/${quizId}/stats`)
      .then(data => setStats(data))
      .catch(err => console.error("Stats load failed", err))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div>Statisztika betöltése...</div>;
  if (!stats) return <div>Nem sikerült betölteni az adatokat.</div>;

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <h3>📊 Tanári Eredménytábla</h3>
      
      {/* Összesítő kártyák */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: '#666' }}>Kitöltések száma</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.summary.total_attempts}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: '#666' }}>Átlagpontszám</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
            {stats.summary.avg_score}%
          </div>
        </div>
      </div>

      {/* Részletes lista */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Diák</th>
            <th style={{ padding: '10px' }}>Eredmény</th>
            <th style={{ padding: '10px' }}>Dátum</th>
          </tr>
        </thead>
        <tbody>
          {stats.attempts.map((att) => (
            <tr key={att.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{att.student_email || 'Vendég'}</td>
              <td style={{ padding: '10px', fontWeight: 'bold', color: getScoreColor(att.score) }}>
                {att.score}%
              </td>
              <td style={{ padding: '10px', color: '#666', fontSize: '14px' }}>
                {new Date(att.created_at).toLocaleString('hu-HU')}
              </td>
            </tr>
          ))}
          {stats.attempts.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                Még senki nem töltötte ki ezt a kvízt.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Segédfüggvények a stílushoz
const cardStyle = {
  background: 'white',
  padding: '15px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  flex: 1,
  textAlign: 'center' as const
};

function getScoreColor(score: number) {
  if (score >= 80) return '#2e7d32'; // Zöld
  if (score >= 50) return '#f57c00'; // Narancs
  return '#c62828'; // Piros
}