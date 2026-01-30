import React from "react";
import { getMetrics } from "../infra/metrics";

export const MetricsPanel: React.FC = () => {
  const m = getMetrics();

  return (
    <section style={{ 
      marginTop: '32px', 
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    }}>
      <h3 style={{ 
        fontSize: '24px', 
        fontWeight: '700', 
        marginBottom: '24px',
        color: 'var(--dark)'
      }}>
        📊 Megfigyelhetőség
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          background: 'var(--light)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>
            {m.requestsTotal}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Összes API-hívás
          </div>
        </div>

        <div style={{
          background: 'var(--light)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--danger)' }}>
            {m.requestsFailed}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Hibás hívások
          </div>
        </div>

        <div style={{
          background: 'var(--light)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)' }}>
            {m.quizzesCreated}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Létrehozott kvízek
          </div>
        </div>

        {m.lastErrorAt && (
          <div style={{
            background: 'var(--light)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
              Utolsó hiba:
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              {m.lastErrorAt}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};