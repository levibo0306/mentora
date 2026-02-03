import React, { useState } from 'react';
import { api } from '../api/http';

interface ShareModalProps {
  quizId: string;
  quizTitle: string;
  isOpen: boolean;
  onClose: () => void;
  sourceToken?: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  quizId, 
  quizTitle, 
  isOpen, 
  onClose,
  sourceToken
}) => {
  const [shareLinks, setShareLinks] = useState<Array<{ url: string; recipient_email?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientsText, setRecipientsText] = useState("");
  const [allowReshare, setAllowReshare] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const recipients = recipientsText
        .split(/[,\n;]/g)
        .map((r) => r.trim())
        .filter(Boolean);

      const response = await api<{ tokens: Array<{ token: string; recipient_email?: string }> }>(
        `/api/quizzes/${quizId}/share`,
        {
          method: 'POST',
          body: JSON.stringify({
            recipients: recipients.length > 0 ? recipients : undefined,
            allow_reshare: allowReshare,
            source_token: sourceToken ?? undefined,
          })
        }
      );

      const links = response.tokens.map((t) => ({
        url: `${window.location.origin}/shared/${t.token}`,
        recipient_email: t.recipient_email
      }));
      setShareLinks(links);
    } catch (err: any) {
      setError(err.message || 'Nem sikerült létrehozni a megosztási linket');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (link: string) => {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Nem sikerült a másolás. Kérjük, másold ki manuálisan!');
    }
  };

  const handleClose = () => {
    setShareLinks([]);
    setError(null);
    setCopied(false);
    setRecipientsText("");
    setAllowReshare(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">📤 Kvíz Megosztása</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Kvíz info */}
          <div style={{
            background: 'var(--light)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Megosztandó kvíz
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: 'var(--dark)' 
            }}>
              {quizTitle}
            </div>
          </div>

          {/* Instrukciók */}
          {shareLinks.length === 0 && !error && (
            <div style={{
              textAlign: 'center',
              padding: '30px 20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔗</div>
              <p style={{ 
                color: '#666', 
                fontSize: '15px', 
                marginBottom: '30px',
                lineHeight: '1.6'
              }}>
                Kattints a lenti gombra egy egyedi link generálásához, 
                amit megoszthatasz a diákjaiddal.
              </p>
              <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: '520px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  Címzettek email címei (vesszővel vagy új sorral elválasztva)
                </label>
                <textarea
                  value={recipientsText}
                  onChange={(e) => setRecipientsText(e.target.value)}
                  placeholder="pelda@iskola.hu, diak2@iskola.hu"
                  rows={3}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                    padding: '12px',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                />
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#444',
                  marginBottom: '16px'
                }}>
                  <input
                    type="checkbox"
                    checked={allowReshare}
                    onChange={(e) => setAllowReshare(e.target.checked)}
                  />
                  Továbbosztható (a címzett is megoszthatja)
                </label>
              </div>

              <button
                onClick={generateLink}
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                  padding: '16px 40px', 
                  fontSize: '16px',
                  minWidth: '200px'
                }}
              >
                {loading ? '⏳ Generálás...' : '🔗 Link Generálása'}
              </button>
            </div>
          )}

          {/* Error állapot */}
          {error && (
            <div style={{
              background: '#ffebee',
              border: '2px solid #ef5350',
              color: '#c62828',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Link megjelenítése */}
          {shareLinks.length > 0 && (
            <div>
              <div style={{
                background: '#e8f5e9',
                border: '2px dashed var(--success)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#2e7d32',
                  fontWeight: '600',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ✅ A megosztási link készen áll!
                </div>
                {shareLinks.map((link, idx) => (
                  <div key={`${link.url}-${idx}`} style={{ marginBottom: '16px' }}>
                    {link.recipient_email && (
                      <div style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '6px' }}>
                        Címzett: <strong>{link.recipient_email}</strong>
                      </div>
                    )}
                    <div style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '10px',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      color: 'var(--dark)',
                      marginBottom: '10px',
                      border: '1px solid #c8e6c9'
                    }}>
                      {link.url}
                    </div>
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        background: copied 
                          ? 'linear-gradient(135deg, var(--success), #00d4aa)' 
                          : undefined
                      }}
                    >
                      {copied ? '✓ Másolva!' : '📋 Link Másolása'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Megosztási opciók */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <a
                  href={`mailto:?subject=${encodeURIComponent(quizTitle)}&body=${encodeURIComponent(`Töltsd ki ezt a kvízt: ${shareLinks[0]?.url ?? ""}`)}`}
                  className="btn btn-secondary"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px'
                  }}
                >
                  📧 Email
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${quizTitle}: ${shareLinks[0]?.url ?? ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px'
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>

              {/* Info box */}
              <div style={{
                background: '#fff3e0',
                border: '1px solid #ffb74d',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#e65100',
                lineHeight: '1.6'
              }}>
                <strong>ℹ️ Fontos:</strong> Ez a link korlátlan ideig érvényes, 
                és bárki használhatja aki rendelkezik vele. A diákok bejelentkezés 
                nélkül is kitölthetik a kvízt.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
