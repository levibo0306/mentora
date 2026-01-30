import React from "react";

type EmptyStateProps = {
  onCreateClick?: () => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="empty-state">
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>📚</div>
      <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: 'var(--dark)' }}>
        Még nincs kvízed
      </p>
      <p style={{ color: '#999', marginBottom: '32px', fontSize: '16px' }}>
        Kezdj el egyet létrehozni és oszd meg diákjaiddal!
      </p>
      {onCreateClick && (
        <button 
          type="button" 
          onClick={onCreateClick}
          className="btn btn-primary"
          style={{ padding: '14px 32px', fontSize: '16px' }}
        >
          + Új Kvíz Létrehozása
        </button>
      )}
    </div>
  );
};