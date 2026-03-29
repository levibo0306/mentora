import { useState } from "react";
import { api } from "../api/http";

type Props = {
  onAdded: () => void;
};

export const SharedAdd = ({ onAdded }: Props) => {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const extractToken = (input: string) => {
    const trimmed = input.trim();
    const match = trimmed.match(/\/shared\/([A-Za-z0-9_-]+)/);
    if (match) return match[1];
    return trimmed;
  };

  const handleAdd = async () => {
    const token = extractToken(value);
    if (!token || token.length < 6) {
      setStatus("error");
      setMessage("Adj meg egy érvényes kódot vagy linket.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      await api<{ token: string }>("/api/share/claim", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setStatus("success");
      setMessage("Sikeresen hozzáadva.");
      setValue("");
      onAdded();
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Nem sikerült hozzáadni.");
    }
  };

  return (
    <div className="card section">
      <h3>Kvíz hozzáadása</h3>
      <p style={{ color: "#666", marginBottom: "12px" }}>
        Illeszd be a kódot vagy a megosztási linket.
      </p>
      <div className="input-group">
        <label>Link vagy kód</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="pl. https://.../shared/ABCD1234 vagy ABCD1234"
        />
      </div>
      <button className="btn btn-primary btn-sm" type="button" onClick={handleAdd} disabled={status === "loading"}>
        {status === "loading" ? "Hozzáadás..." : "Hozzáadás"}
      </button>
      {message && (
        <div className={`inline-status ${status}`}>
          {message}
        </div>
      )}
    </div>
  );
};
