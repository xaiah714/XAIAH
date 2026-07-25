"use client";

import { useEffect, useState } from "react";

// Care Tracker (rev 12) — logs, goals, and timestamped progress photos.
// v1 stores everything on this device (localStorage; photos downscaled to
// stay inside storage limits). Cloud sync can layer on later without
// changing this UI.
const KEY = "hairiq-tracker-v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { logs: [], goals: [], photos: [] };
  } catch {
    return { logs: [], goals: [], photos: [] };
  }
}

const card = "rounded-3xl bg-white/80 p-5 shadow-card";
const input =
  "w-full rounded-2xl border-2 border-blush-deep/40 bg-white px-4 py-2.5 text-sm font-semibold placeholder:text-cocoa-soft/60 focus:border-berry focus:outline-none";
const btn =
  "rounded-full bg-berry px-5 py-2.5 font-display text-sm font-bold text-white shadow-soft transition hover:bg-blush-deep active:scale-95";

export default function Tracker() {
  const [data, setData] = useState(null);
  const [note, setNote] = useState("");
  const [washDay, setWashDay] = useState(true);
  const [goal, setGoal] = useState("");

  useEffect(() => setData(load()), []);
  function save(next) {
    setData(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      alert("Storage is full — delete an old photo to make room.");
    }
  }
  if (!data) return null;

  function addLog() {
    save({ ...data, logs: [{ ts: Date.now(), washDay, note: note.trim() }, ...data.logs].slice(0, 200) });
    setNote("");
  }
  function addGoal() {
    if (!goal.trim()) return;
    save({ ...data, goals: [...data.goals, { text: goal.trim(), done: false }] });
    setGoal("");
  }
  function toggleGoal(i) {
    const goals = data.goals.map((g, j) => (j === i ? { ...g, done: !g.done } : g));
    save({ ...data, goals });
  }
  function addPhoto(file) {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(1, 800 / Math.max(img.width, img.height));
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      save({ ...data, photos: [{ ts: Date.now(), src: c.toDataURL("image/jpeg", 0.8) }, ...data.photos].slice(0, 24) });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }
  const fmt = (ts) => new Date(ts).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-5">
      <section className={card}>
        <h3 className="font-display text-lg font-bold">Log today</h3>
        <div className="mt-3 flex gap-2">
          {[true, false].map((w) => (
            <button
              key={String(w)}
              type="button"
              onClick={() => setWashDay(w)}
              className={`min-h-11 rounded-full border-2 px-4 py-2 font-display text-sm font-bold uppercase tracking-wide ${
                washDay === w ? "border-berry bg-berry text-white" : "border-blush-deep/40 bg-white text-cocoa-soft"
              }`}
            >
              {w ? "🚿 Wash day" : "☀️ Non-wash day"}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="How did your hair feel? What did you use?" className={`${input} mt-3`} />
        <button type="button" onClick={addLog} className={`${btn} mt-3`}>Add entry</button>
        <ul className="mt-4 space-y-2">
          {data.logs.slice(0, 7).map((l) => (
            <li key={l.ts} className="rounded-2xl bg-blush/30 px-4 py-2.5 text-sm font-semibold">
              <span className="font-extrabold">{l.washDay ? "🚿" : "☀️"} {fmt(l.ts)}</span>
              {l.note ? <span className="text-cocoa-soft"> — {l.note}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h3 className="font-display text-lg font-bold">My goals</h3>
        <div className="mt-3 flex gap-2">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Waist-length by December" className={input} />
          <button type="button" onClick={addGoal} className={btn}>Add</button>
        </div>
        <ul className="mt-3 space-y-2">
          {data.goals.map((g, i) => (
            <li key={i}>
              <button type="button" onClick={() => toggleGoal(i)} className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-bold ${g.done ? "bg-mint text-mint-deep line-through" : "bg-blush/30"}`}>
                {g.done ? "✅" : "⬜"} {g.text}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h3 className="font-display text-lg font-bold">Progress photos</h3>
        <p className="mt-1 text-xs font-semibold text-cocoa-soft">Timestamped automatically. Stored privately on this device.</p>
        <label className={`${btn} mt-3 inline-block cursor-pointer`}>
          📸 Add photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && addPhoto(e.target.files[0])} />
        </label>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.photos.map((p) => (
            <figure key={p.ts}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="Progress" className="aspect-square w-full rounded-2xl object-cover" />
              <figcaption className="mt-1 text-[10px] font-bold text-cocoa-soft">{fmt(p.ts)}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
