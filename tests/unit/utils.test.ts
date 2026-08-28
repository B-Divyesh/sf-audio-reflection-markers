import { describe, expect, it } from 'vitest';
import type { Marker } from '../../src/types';
import { formatTime, isDue, markersToCsv, markersToMarkdown, parseTime, sourceTimestampUrl } from '../../src/utils';

const marker: Marker = {
  id: 'one', createdAt: '2026-08-20T10:00:00.000Z', updatedAt: '2026-08-20T10:00:00.000Z',
  source: { kind: 'link', title: 'Good episode', reference: 'https://example.com/watch' },
  seconds: 754, takeaway: 'Small prompts beat full summaries.', cue: 'What should I capture?',
  actionDate: '2026-08-21', reviews: []
};

describe('timestamp helpers', () => {
  it('formats short and long recordings', () => {
    expect(formatTime(754)).toBe('12:34');
    expect(formatTime(3730)).toBe('01:02:10');
  });
  it('parses valid timestamps and rejects invalid ones', () => {
    expect(parseTime('12:34')).toBe(754);
    expect(parseTime('1:02:10')).toBe(3730);
    expect(parseTime('4:99')).toBeNull();
    expect(parseTime('oops')).toBeNull();
  });
});

describe('review and exports', () => {
  it('identifies a marker whose check date has passed', () => {
    expect(isDue(marker, new Date('2026-08-22T12:00:00Z'))).toBe(true);
    expect(isDue({ ...marker, reviews: [{ date: '2026-08-22T11:00:00Z', result: 'remembered' }] }, new Date('2026-08-22T12:00:00Z'))).toBe(false);
    expect(isDue({ ...marker, actionDate: '', reviews: [{ date: '2026-08-22T11:00:00Z', result: 'revisit' }] })).toBe(true);
  });
  it('exports useful Markdown and safe CSV', () => {
    expect(markersToMarkdown([marker])).toContain('**Recall cue:** What should I capture?');
    expect(markersToCsv([{ ...marker, takeaway: '=unsafe' }])).toContain("\"'=unsafe\"");
  });
  it('adds timestamps only for supported video links', () => {
    expect(sourceTimestampUrl('https://www.youtube.com/watch?v=abc', 91)).toContain('t=91s');
    expect(sourceTimestampUrl('https://example.com/talk', 91)).toBe('https://example.com/talk');
  });
});
