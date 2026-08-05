export default function NoteCard({ note }) {
  return (
    <div className="rounded-3xl border-l-4 border-coral bg-white/70 p-5 shadow-card">
      <h3 className="font-display text-base font-bold">{note.title}</h3>
      <div className="mt-2 space-y-2 text-sm font-semibold leading-relaxed text-cocoa-soft">
        {note.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
