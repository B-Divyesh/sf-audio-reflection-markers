import './styles.css';
import { clearMarkers, deleteMarker, getMarkers, replaceMarkers, saveMarker } from './db';
import type { Backup, BackupMarker, Marker, ReviewResult, SourceInfo } from './types';
import { escapeHtml, formatTime, isDue, markersToCsv, markersToMarkdown, parseTime, sourceTimestampUrl } from './utils';

const $ = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const markerDialog = $('#marker-dialog') as HTMLDialogElement;
const reviewDialog = $('#review-dialog') as HTMLDialogElement;
const dataDialog = $('#data-dialog') as HTMLDialogElement;
const markerForm = $('#marker-form') as HTMLFormElement;
const timeOutput = $('#current-time') as HTMLOutputElement;
const timerToggle = $('#timer-toggle') as HTMLButtonElement;
const markerList = $('#marker-list') as HTMLElement;
const emptyState = $('#empty-state') as HTMLElement;
const toast = $('#toast') as HTMLElement;
const toastMessage = $('#toast-message');
const toastAction = $('#toast-action') as HTMLButtonElement;

let markers: Marker[] = [];
let source: SourceInfo = { kind: 'manual', title: 'Untitled listening session', reference: '' };
let timerSeconds = 0;
let timerStartedAt = 0;
let timerBase = 0;
let timerInterval = 0;
let mediaElement: HTMLMediaElement | null = null;
let mediaUrl = '';
let captureStartedAt = 0;
let editingVoice: Blob | undefined;
let voiceUrl = '';
let recorder: MediaRecorder | null = null;
let recorderStream: MediaStream | null = null;
let recorderChunks: Blob[] = [];
let recordingTimeout = 0;
let reviewId = '';
let dueOnly = false;
let toastTimer = 0;

function showToast(message: string, action?: { label: string; run: () => void }): void {
  window.clearTimeout(toastTimer);
  toastMessage.textContent = message;
  toastAction.hidden = !action;
  toastAction.textContent = action?.label ?? '';
  toastAction.onclick = action ? () => { action.run(); toast.hidden = true; } : null;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, action ? 7000 : 3500);
}

function setSource(next: SourceInfo, persist = true): void {
  source = next;
  $('#source-kind').textContent = next.kind === 'link' ? 'Linked source' : next.kind === 'file' ? 'Local file' : 'Manual timer';
  $('#active-title').textContent = next.title || 'Untitled listening session';
  const link = $('#active-link') as HTMLAnchorElement;
  link.hidden = !next.reference;
  link.href = next.reference || '#';
  if (persist && next.kind !== 'file') localStorage.setItem('arm-source', JSON.stringify(next));
}

function currentSeconds(): number {
  if (mediaElement) return Number.isFinite(mediaElement.currentTime) ? mediaElement.currentTime : 0;
  if (timerStartedAt) return timerBase + (performance.now() - timerStartedAt) / 1000;
  return timerSeconds;
}

function updateClock(): void {
  timerSeconds = currentSeconds();
  timeOutput.value = formatTime(timerSeconds);
  const duration = mediaElement?.duration;
  const progress = duration && Number.isFinite(duration) && duration > 0 ? Math.min(100, timerSeconds / duration * 100) : timerSeconds % 300 / 3;
  ($('#orbit-progress') as HTMLElement).style.width = `${progress}%`;
  ($('#orbit-node') as HTMLElement).style.left = `calc(${progress}% - 6px)`;
}

function setPlaying(playing: boolean): void {
  timerToggle.classList.toggle('is-playing', playing);
  timerToggle.setAttribute('aria-label', playing ? 'Pause timer' : 'Start timer');
}

function stopTimer(): void {
  if (timerStartedAt) {
    timerBase = currentSeconds();
    timerStartedAt = 0;
  }
  window.clearInterval(timerInterval);
  setPlaying(false);
  updateClock();
}

function toggleTimer(): void {
  if (mediaElement) {
    if (mediaElement.paused) void mediaElement.play().catch(() => showToast('Playback could not start. Try the file player controls.'));
    else mediaElement.pause();
    return;
  }
  if (timerStartedAt) stopTimer();
  else {
    timerBase = timerSeconds;
    timerStartedAt = performance.now();
    timerInterval = window.setInterval(updateClock, 250);
    setPlaying(true);
  }
}

function seek(amount: number): void {
  if (mediaElement) mediaElement.currentTime = Math.max(0, mediaElement.currentTime + amount);
  else {
    const wasRunning = Boolean(timerStartedAt);
    timerSeconds = Math.max(0, currentSeconds() + amount);
    timerBase = timerSeconds;
    if (wasRunning) timerStartedAt = performance.now();
    updateClock();
  }
}

function openDialog(dialog: HTMLDialogElement): void {
  if (!dialog.open) dialog.showModal();
}

function stopRecording(): void {
  if (recorder?.state === 'recording') recorder.stop();
}

function closeDialog(dialog: HTMLDialogElement): void {
  if (dialog === markerDialog) stopRecording();
  dialog.close();
}

function resetVoice(blob?: Blob): void {
  if (voiceUrl) URL.revokeObjectURL(voiceUrl);
  editingVoice = blob;
  const preview = $('#voice-preview') as HTMLAudioElement;
  const remove = $('#remove-voice') as HTMLButtonElement;
  if (blob) {
    voiceUrl = URL.createObjectURL(blob);
    preview.src = voiceUrl;
    preview.hidden = false;
    remove.hidden = false;
  } else {
    voiceUrl = '';
    preview.removeAttribute('src');
    preview.hidden = true;
    remove.hidden = true;
  }
}

function openMarker(marker?: Marker): void {
  captureStartedAt = performance.now();
  ($('#marker-id') as HTMLInputElement).value = marker?.id ?? '';
  ($('#marker-dialog-title')).textContent = marker ? 'Edit this marker' : 'Mark this moment';
  const seconds = marker?.seconds ?? currentSeconds();
  ($('#capture-time')).textContent = formatTime(seconds);
  ($('#marker-timestamp') as HTMLInputElement).value = formatTime(seconds);
  ($('#takeaway') as HTMLTextAreaElement).value = marker?.takeaway ?? '';
  ($('#cue') as HTMLInputElement).value = marker?.cue ?? '';
  ($('#action-date') as HTMLInputElement).value = marker?.actionDate ?? '';
  ($('#timestamp-error')).textContent = '';
  ($('#takeaway-error')).textContent = '';
  resetVoice(marker?.voice);
  openDialog(markerDialog);
  window.setTimeout(() => ($('#takeaway') as HTMLTextAreaElement).focus(), 20);
}

function dueLabel(marker: Marker): string {
  if (!marker.actionDate) return marker.reviews.length ? `${marker.reviews.length} check${marker.reviews.length === 1 ? '' : 's'}` : 'Ready to review';
  const date = new Date(`${marker.actionDate}T12:00:00`);
  return `${isDue(marker) ? 'Due' : 'Check'} ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function renderMarkers(): void {
  const visible = dueOnly ? markers.filter((marker) => isDue(marker)) : markers;
  $('#marker-count').textContent = String(markers.length);
  emptyState.hidden = markers.length > 0;
  markerList.innerHTML = visible.length ? visible.map((marker) => {
    const timestampLink = marker.source.reference ? sourceTimestampUrl(marker.source.reference, marker.seconds) : '';
    const voice = marker.voice ? `<audio controls preload="none" src="${URL.createObjectURL(marker.voice)}" aria-label="Voice takeaway for ${escapeHtml(marker.source.title)}"></audio>` : '';
    return `<article class="marker-card${isDue(marker) ? ' is-due' : ''}" data-id="${marker.id}">
      <div class="marker-meta">
        ${timestampLink ? `<a class="marker-time" href="${escapeHtml(timestampLink)}" target="_blank" rel="noopener noreferrer">${formatTime(marker.seconds)} ↗</a>` : `<span class="marker-time">${formatTime(marker.seconds)}</span>`}
        <span>•</span><span>${escapeHtml(marker.source.title)}</span><span>•</span><span>${escapeHtml(dueLabel(marker))}</span>
      </div>
      <h3>${escapeHtml(marker.takeaway || 'Voice takeaway')}</h3>
      ${marker.cue ? `<p class="marker-cue"><strong>Cue:</strong> ${escapeHtml(marker.cue)}</p>` : ''}
      ${voice}
      <footer><button class="mini-button review" type="button" data-action="review">Review</button><div><button class="mini-button" type="button" data-action="edit">Edit</button><button class="mini-button" type="button" data-action="delete">Delete</button></div></footer>
    </article>`;
  }).join('') : dueOnly && markers.length ? '<p class="filter-empty">Nothing is due. Your next prompt will appear here on its check date.</p>' : '';
  const reviewed = markers.filter((marker) => marker.reviews.length > 0).length;
  const percent = markers.length ? Math.round(reviewed / markers.length * 100) : 0;
  ($('#progress-wrap') as HTMLElement).hidden = markers.length === 0;
  $('#review-percent').textContent = `${percent}%`;
  const progress = $('.progress-track') as HTMLElement;
  progress.setAttribute('aria-valuenow', String(percent));
  ($('#progress-fill') as HTMLElement).style.width = `${percent}%`;
}

async function refresh(): Promise<void> {
  try {
    markers = await getMarkers();
    renderMarkers();
  } catch (error) {
    console.error(error);
    showToast('Local storage is unavailable. Check this browser’s privacy settings.');
  }
}

async function saveFromForm(): Promise<void> {
  const timestampInput = $('#marker-timestamp') as HTMLInputElement;
  const seconds = parseTime(timestampInput.value);
  if (seconds === null) {
    $('#timestamp-error').textContent = 'Enter a valid time such as 12:34 or 1:02:03.';
    timestampInput.focus();
    return;
  }
  const takeawayInput = $('#takeaway') as HTMLTextAreaElement;
  const takeaway = takeawayInput.value.trim();
  if (!takeaway && !editingVoice) {
    $('#takeaway-error').textContent = 'Write a takeaway or record a voice takeaway.';
    takeawayInput.focus();
    return;
  }
  const id = ($('#marker-id') as HTMLInputElement).value;
  const existing = markers.find((marker) => marker.id === id);
  const now = new Date().toISOString();
  const marker: Marker = {
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    source: existing?.source ?? source,
    seconds,
    takeaway,
    cue: ($('#cue') as HTMLInputElement).value.trim(),
    actionDate: ($('#action-date') as HTMLInputElement).value,
    reviews: existing?.reviews ?? [],
    ...(editingVoice ? { voice: editingVoice } : {})
  };
  try {
    await saveMarker(marker);
    closeDialog(markerDialog);
    await refresh();
    const elapsed = Math.round((performance.now() - captureStartedAt) / 1000);
    showToast(existing ? 'Marker updated.' : `Marker saved in ${elapsed} second${elapsed === 1 ? '' : 's'}.`);
  } catch (error) {
    console.error(error);
    showToast('This marker could not be saved. Check available device storage.');
  }
}

function openReview(marker: Marker): void {
  reviewId = marker.id;
  $('#review-source').textContent = `${marker.source.title} · ${formatTime(marker.seconds)}`;
  $('#review-cue').textContent = marker.cue || 'What was useful to you at this moment?';
  $('#review-takeaway').textContent = marker.takeaway || 'Play your recorded voice takeaway from the marker card.';
  ($('#review-answer') as HTMLElement).hidden = true;
  ($('#reveal-button') as HTMLButtonElement).hidden = false;
  openDialog(reviewDialog);
  ($('#reveal-button') as HTMLButtonElement).focus();
}

async function recordReview(result: ReviewResult): Promise<void> {
  const marker = markers.find((item) => item.id === reviewId);
  if (!marker) return;
  marker.reviews.push({ date: new Date().toISOString(), result });
  marker.updatedAt = new Date().toISOString();
  await saveMarker(marker);
  closeDialog(reviewDialog);
  await refresh();
  showToast(result === 'revisit' ? 'Review saved. This marker stays in your due list.' : 'Follow-up saved.');
}

function download(name: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function blobToData(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function exportBackup(): Promise<void> {
  const packed: BackupMarker[] = await Promise.all(markers.map(async ({ voice, ...marker }) => ({
    ...marker,
    ...(voice ? { voice: { type: voice.type, data: await blobToData(voice) } } : {})
  })));
  const backup: Backup = { product: 'audio-reflection-markers', version: 1, exportedAt: new Date().toISOString(), markers: packed };
  download('reflection-markers-backup.json', JSON.stringify(backup, null, 2), 'application/json');
  showToast('Complete backup downloaded.');
}

function dataToBlob(data: string, type: string): Blob {
  const bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type });
}

async function importBackup(file: File): Promise<void> {
  const parsed = JSON.parse(await file.text()) as Backup;
  if (parsed.product !== 'audio-reflection-markers' || parsed.version !== 1 || !Array.isArray(parsed.markers)) throw new Error('Not an Audio Reflection Markers backup');
  const imported: Marker[] = parsed.markers.map(({ voice, ...marker }) => {
    if (!marker.id || typeof marker.takeaway !== 'string' || !marker.source) throw new Error('The backup contains an invalid marker');
    return { ...marker, reviews: Array.isArray(marker.reviews) ? marker.reviews : [], ...(voice ? { voice: dataToBlob(voice.data, voice.type) } : {}) };
  });
  if (markers.length && !confirm(`Replace ${markers.length} local marker${markers.length === 1 ? '' : 's'} with the ${imported.length} in this backup?`)) return;
  await replaceMarkers(imported);
  await refresh();
  closeDialog(dataDialog);
  showToast(`Imported ${imported.length} marker${imported.length === 1 ? '' : 's'}.`);
}

async function toggleRecording(): Promise<void> {
  if (recorder?.state === 'recording') { stopRecording(); return; }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    showToast('Voice recording is not supported here. You can still type your takeaway.');
    return;
  }
  try {
    recorderStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorderChunks = [];
    recorder = new MediaRecorder(recorderStream);
    recorder.ondataavailable = (event) => { if (event.data.size) recorderChunks.push(event.data); };
    recorder.onstop = () => {
      const type = recorder?.mimeType || 'audio/webm';
      resetVoice(new Blob(recorderChunks, { type }));
      recorderStream?.getTracks().forEach((track) => track.stop());
      recorderStream = null;
      window.clearTimeout(recordingTimeout);
      const button = $('#voice-button');
      button.classList.remove('is-recording');
      button.querySelector('b')!.textContent = 'Record again';
      showToast('Voice takeaway recorded locally.');
    };
    recorder.start();
    $('#voice-button').classList.add('is-recording');
    $('#voice-button').querySelector('b')!.textContent = 'Stop recording';
    recordingTimeout = window.setTimeout(stopRecording, 60_000);
  } catch (error) {
    console.error(error);
    showToast('Microphone access was not granted. You can still type your takeaway.');
  }
}

function setupSourceTabs(): void {
  const tabs = [$('#tab-link') as HTMLButtonElement, $('#tab-file') as HTMLButtonElement];
  tabs.forEach((tab, index) => tab.addEventListener('click', () => {
    tabs.forEach((item, itemIndex) => {
      const selected = itemIndex === index;
      item.setAttribute('aria-selected', String(selected));
      $(`#${item.getAttribute('aria-controls')!}`).toggleAttribute('hidden', !selected);
    });
  }));
  $('.source-switch').addEventListener('keydown', (event) => {
    const keyboard = event as KeyboardEvent;
    if (!['ArrowLeft', 'ArrowRight'].includes(keyboard.key)) return;
    const current = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    const next = keyboard.key === 'ArrowRight' ? (current + 1) % tabs.length : (current - 1 + tabs.length) % tabs.length;
    tabs[next]!.click(); tabs[next]!.focus();
  });
}

function setupPlayer(): void {
  $('#link-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const url = ($('#source-url') as HTMLInputElement).value;
    const titleValue = ($('#source-title') as HTMLInputElement).value.trim();
    let fallback = 'Linked listening session';
    try { fallback = new URL(url).hostname.replace(/^www\./, ''); } catch { /* Native validation handles this. */ }
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    mediaElement?.pause(); mediaElement = null; $('#media-mount').replaceChildren();
    setSource({ kind: 'link', title: titleValue || fallback, reference: url });
    timerSeconds = 0; timerBase = 0; timerStartedAt = 0; updateClock();
    showToast('Source set. Start the timer when playback begins.');
  });
  $('#media-file').addEventListener('change', (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) { showToast('Choose an audio or video file.'); return; }
    stopTimer();
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    mediaUrl = URL.createObjectURL(file);
    mediaElement = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
    mediaElement.src = mediaUrl; mediaElement.controls = true; mediaElement.preload = 'metadata';
    mediaElement.addEventListener('timeupdate', updateClock);
    mediaElement.addEventListener('play', () => setPlaying(true));
    mediaElement.addEventListener('pause', () => setPlaying(false));
    mediaElement.addEventListener('ended', () => setPlaying(false));
    $('#media-mount').replaceChildren(mediaElement);
    setSource({ kind: 'file', title: file.name, reference: '' }, false);
    timerSeconds = 0; updateClock();
    showToast('Local file ready. It has not left your device.');
  });
  timerToggle.addEventListener('click', toggleTimer);
  $('#back-15').addEventListener('click', () => seek(-15));
  $('#forward-15').addEventListener('click', () => seek(15));
}

function setupEvents(): void {
  setupSourceTabs(); setupPlayer();
  $('#mark-button').addEventListener('click', () => openMarker());
  markerForm.addEventListener('submit', (event) => { event.preventDefault(); void saveFromForm(); });
  $('#voice-button').addEventListener('click', () => void toggleRecording());
  $('#remove-voice').addEventListener('click', () => resetVoice());
  document.querySelectorAll<HTMLElement>('[data-close]').forEach((button) => button.addEventListener('click', () => closeDialog($(`#${button.dataset.close!}`) as HTMLDialogElement)));
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  }));
  markerList.addEventListener('click', async (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-action]');
    const card = (event.target as Element).closest<HTMLElement>('[data-id]');
    if (!button || !card) return;
    const marker = markers.find((item) => item.id === card.dataset.id);
    if (!marker) return;
    if (button.dataset.action === 'edit') openMarker(marker);
    if (button.dataset.action === 'review') openReview(marker);
    if (button.dataset.action === 'delete' && confirm(`Delete the marker at ${formatTime(marker.seconds)} from “${marker.source.title}”?`)) {
      await deleteMarker(marker.id); await refresh(); showToast('Marker deleted.');
    }
  });
  $('#reveal-button').addEventListener('click', () => { ($('#reveal-button') as HTMLButtonElement).hidden = true; ($('#review-answer') as HTMLElement).hidden = false; ($('[data-result]') as HTMLButtonElement).focus(); });
  document.querySelectorAll<HTMLButtonElement>('[data-result]').forEach((button) => button.addEventListener('click', () => void recordReview(button.dataset.result as ReviewResult)));
  $('#filter-button').addEventListener('click', () => { dueOnly = !dueOnly; $('#filter-button').setAttribute('aria-pressed', String(dueOnly)); $('#filter-button').textContent = dueOnly ? 'Show all' : 'Due only'; renderMarkers(); });
  const exportMenu = $('#export-menu') as HTMLElement;
  $('#export-button').addEventListener('click', () => {
    const button = $('#export-button').getBoundingClientRect();
    exportMenu.style.top = `${button.bottom + 6}px`; exportMenu.style.left = `${Math.max(10, button.right - 190)}px`; exportMenu.hidden = !exportMenu.hidden;
  });
  exportMenu.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-export]'); if (!button) return;
    if (!markers.length) { showToast('Save a marker before exporting.'); exportMenu.hidden = true; return; }
    if (button.dataset.export === 'markdown') download('reflection-markers.md', markersToMarkdown(markers), 'text/markdown');
    else download('reflection-markers.csv', markersToCsv(markers), 'text/csv');
    exportMenu.hidden = true; showToast(`${button.dataset.export === 'markdown' ? 'Markdown' : 'CSV'} exported.`);
  });
  document.addEventListener('click', (event) => { if (!(event.target as Element).closest('#export-menu, #export-button')) exportMenu.hidden = true; });
  $('#data-button').addEventListener('click', () => openDialog(dataDialog));
  $('#export-json').addEventListener('click', () => void exportBackup());
  $('#import-json').addEventListener('change', (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) void importBackup(file).catch((error) => { console.error(error); showToast('That file is not a valid backup. Nothing was changed.'); });
  });
  $('#clear-data').addEventListener('click', async () => {
    if (!markers.length) { showToast('There are no markers to delete.'); return; }
    if (!confirm(`Permanently delete all ${markers.length} local marker${markers.length === 1 ? '' : 's'}? Export a backup first if you need one.`)) return;
    await clearMarkers(); await refresh(); closeDialog(dataDialog); showToast('All local markers deleted.');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() !== 'm' || event.metaKey || event.ctrlKey || event.altKey || markerDialog.open || reviewDialog.open || dataDialog.open) return;
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) || target.isContentEditable) return;
    event.preventDefault(); openMarker();
  });
}

function updateConnection(): void {
  const element = $('#connection');
  const online = navigator.onLine;
  element.classList.toggle('is-offline', !online);
  element.lastChild!.textContent = online ? 'Offline-ready' : 'Working offline';
}

function setupServiceWorker(): void {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('An app update is ready.', { label: 'Reload', run: () => location.reload() });
      });
    });
  }).catch((error) => console.error('Offline setup failed', error));
}

function restoreSource(): void {
  try {
    const saved = JSON.parse(localStorage.getItem('arm-source') ?? 'null') as SourceInfo | null;
    if (saved?.kind === 'link' || saved?.kind === 'manual') {
      setSource(saved, false);
      if (saved.kind === 'link') {
        ($('#source-url') as HTMLInputElement).value = saved.reference;
        ($('#source-title') as HTMLInputElement).value = saved.title;
      }
    } else setSource(source, false);
  } catch { setSource(source, false); }
}

setupEvents(); restoreSource(); updateClock(); updateConnection(); setupServiceWorker(); void refresh();
window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection);
