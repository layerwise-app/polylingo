/**
 * Checks every clip with ffprobe, then writes `public/audio/manifest.json`, the
 * only file the app reads to find audio. Fails loudly if anything is missing.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';

type Clip = {
  key: string;
  text: string;
  kind: string;
  lessons: string[];
  normal: string;
  slow: string;
};

const clips = JSON.parse(readFileSync('scripts/audio/clips.json', 'utf8')) as Clip[];
const reportPath = 'scripts/audio/generation-report.json';
const generator = existsSync(reportPath)
  ? JSON.parse(readFileSync(reportPath, 'utf8'))
  : null;

function durationSeconds(file: string): number {
  const output = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
    { encoding: 'utf8' }
  );
  return Number(output.trim());
}

const problems: string[] = [];
const manifestClips: Record<string, object> = {};
const expected = new Set<string>();

for (const clip of clips) {
  const durations: Record<string, number> = {};
  for (const speed of ['normal', 'slow'] as const) {
    const file = clip[speed];
    expected.add(file);
    if (!existsSync(file) || statSync(file).size === 0) {
      problems.push(`missing: ${file} (${clip.text})`);
      continue;
    }
    try {
      durations[speed] = durationSeconds(file);
      if (!(durations[speed] > 0.05)) {
        problems.push(`too short: ${file} (${clip.text})`);
      }
    } catch {
      problems.push(`unreadable: ${file} (${clip.text})`);
    }
  }
  if (durations.normal && durations.slow && durations.slow < durations.normal * 1.3) {
    problems.push(`slow isn't slow enough: ${clip.slow} (${clip.text})`);
  }
  manifestClips[clip.key] = {
    text: clip.text,
    kind: clip.kind,
    lessons: clip.lessons,
    normal: clip.normal.replace(/^public/, ''),
    slow: clip.slow.replace(/^public/, ''),
    normalMs: Math.round((durations.normal ?? 0) * 1000),
    slowMs: Math.round((durations.slow ?? 0) * 1000)
  };
}

if (problems.length > 0) {
  console.error(problems.slice(0, 40).join('\n'));
  console.error(`\n${problems.length} problem(s). The manifest was not written.`);
  process.exit(1);
}

// Clips left over from edited or removed course content.
let removed = 0;
for (const speed of ['normal', 'slow']) {
  const folder = `public/audio/${speed}`;
  for (const name of readdirSync(folder)) {
    if (!expected.has(`${folder}/${name}`)) {
      rmSync(`${folder}/${name}`);
      removed += 1;
    }
  }
}

writeFileSync(
  'public/audio/manifest.json',
  `${JSON.stringify({ version: 1, generator, clips: manifestClips })}\n`
);
console.log(
  `Manifest written: ${clips.length} clips, ${clips.length * 2} files.${removed ? ` Removed ${removed} unused files.` : ''}`
);
