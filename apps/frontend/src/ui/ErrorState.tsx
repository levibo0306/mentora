import React from "react";

type ErrorStateProps = {
  onRetry?: () => void;
  message?: string;
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  onRetry,
  message,
}) => {
  return (
    <div className="empty-state">
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
      <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: 'var(--danger)' }}>
        Hiba történt
      </p>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
        {message || "Valami nem sikerült. Kérjük próbáld újra!"}
      </p>
      {onRetry && (
        <button 
          type="button" 
          onClick={onRetry}
          className="btn btn-primary"
          style={{ padding: '14px 32px', fontSize: '16px' }}
        >
          Próbáld újra
        </button>
      )}
    </div>
  );
};