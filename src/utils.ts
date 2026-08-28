import type { Marker } from './types';

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function parseTime(value: string): number | null {
  const parts = value.trim().split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) return null;
  const numbers = parts.map(Number);
  const seconds = numbers.at(-1) ?? 0;
  const minutes = numbers.at(-2) ?? 0;
  const hours = numbers.length === 3 ? numbers[0] ?? 0 : 0;
  if (seconds > 59 || minutes > 59) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

export function isDue(marker: Marker, today = new Date()): boolean {
  if (!marker.actionDate) return marker.reviews.length === 0;
  const end = new Date(`${marker.actionDate}T23:59:59`);
  const lastReview = marker.reviews.at(-1);
  return end.getTime() <= today.getTime() && (!lastReview || lastReview.date.slice(0, 10) < marker.actionDate);
}

function safeCell(value: string | number): string {
  let text = String(value).replace(/\r?\n/g, ' ');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function markersToCsv(markers: Marker[]): string {
  const rows = [['timestamp', 'source', 'source_url', 'takeaway', 'recall_cue', 'action_date', 'reviews', 'created_at']];
  for (const marker of markers) {
    rows.push([
      formatTime(marker.seconds), marker.source.title, marker.source.reference, marker.takeaway,
      marker.cue, marker.actionDate, String(marker.reviews.length), marker.createdAt
    ]);
  }
  return rows.map((row) => row.map(safeCell).join(',')).join('\n');
}

export function markersToMarkdown(markers: Marker[]): string {
  const out = ['# Audio reflection markers', '', `Exported ${new Date().toISOString()}`, ''];
  for (const marker of markers) {
    out.push(`## ${formatTime(marker.seconds)} — ${marker.source.title || 'Untitled source'}`);
    if (marker.source.reference) out.push('', `Source: ${marker.source.reference}`);
    out.push('', `**My takeaway:** ${marker.takeaway}`);
    if (marker.cue) out.push('', `**Recall cue:** ${marker.cue}`);
    if (marker.actionDate) out.push('', `**Check again:** ${marker.actionDate}`);
    if (marker.reviews.length) out.push('', `**Follow-ups:** ${marker.reviews.map((r) => `${r.result} on ${r.date.slice(0, 10)}`).join('; ')}`);
    if (marker.voice) out.push('', '_A local voice note exists in the JSON backup._');
    out.push('', '---', '');
  }
  return out.join('\n');
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
}

export function sourceTimestampUrl(reference: string, seconds: number): string {
  if (!reference) return '';
  try {
    const url = new URL(reference);
    if (/youtu\.be$|youtube\.com$/.test(url.hostname.replace(/^www\./, ''))) url.searchParams.set('t', `${Math.floor(seconds)}s`);
    return url.toString();
  } catch { return reference; }
}
