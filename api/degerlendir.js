// ============================================
// api/degerlendir.js — Prompt değerlendirme + gömülü cevap
// İki şey döner: (1) Claude'un prompt'a verdiği GERÇEK cevap,
//               (2) prompt'un 5 eksende puanı + iyileştirme önerisi
// ============================================

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Sadece POST" });

  const KEY = process.env.ANTHROPIC_API_KEY;
  const MODEL = "claude-haiku-4-5-20251001";

  async function claude(system, user, maxTokens = 1024) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
    });
    if (!r.ok) throw new Error(await r.text());
    const d = await r.json();
    return (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  }

  try {
    const { prompt, gorev } = req.body || {};
    if (!prompt || prompt.trim().length < 2) return res.status(400).json({ error: "Prompt boş olamaz" });

    // 1) Prompt'u gerçekten çalıştır — katılımcı kendi prompt'unun çıktısını görsün
    const aiCevapPromise = claude(
      "Sen yardımsever bir asistansın. Kullanıcının verdiği talimatı uygula. Kısa ve net ol, en fazla 180 kelime.",
      prompt, 600
    ).catch(() => "(Cevap üretilemedi)");

    // 2) Prompt'u değerlendir
    const degerSystem = `Sen bir prompt mühendisliği eğitmenisin.
${gorev ? `Eğitimdeki görev: "${gorev}"` : ""}
Promptu 5 eksende 0-100 puanla: aciklik, baglam, spesifiklik, format, rol.
SADECE şu JSON'u döndür, markdown yok:
{"aciklik":0,"baglam":0,"spesifiklik":0,"format":0,"rol":0,"geri_bildirim":"2 cümle Türkçe: güçlü yön + en önemli eksik","iyilestirilmis":"daha iyi yeniden yazılmış prompt"}`;

    const [aiCevap, degerMetinRaw] = await Promise.all([
      aiCevapPromise,
      claude(degerSystem, prompt, 1024),
    ]);

    let degerMetin = degerMetinRaw.replace(/```json|```/g, "").trim();
    let s;
    try { s = JSON.parse(degerMetin); }
    catch { return res.status(500).json({ error: "JSON ayrıştırılamadı", ham: degerMetin }); }

    const eks = ["aciklik", "baglam", "spesifiklik", "format", "rol"];
    const puan = Math.round(eks.reduce((a, k) => a + (Number(s[k]) || 0), 0) / eks.length);

    return res.status(200).json({
      puan,
      detay: { aciklik: s.aciklik || 0, baglam: s.baglam || 0, spesifiklik: s.spesifiklik || 0, format: s.format || 0, rol: s.rol || 0 },
      geri_bildirim: s.geri_bildirim || "",
      iyilestirilmis: s.iyilestirilmis || "",
      ai_cevap: aiCevap,
    });
  } catch (err) {
    return res.status(500).json({ error: "Sunucu hatası", detay: String(err) });
  }
}
