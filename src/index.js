const SECRET_PATTERNS = [
  /gho_[A-Za-z0-9_]+/g,
  /\bgithub_pat_[A-Za-z0-9_]{19,}\b/g,
  /\bnpm_[A-Za-z0-9]{36}\b/g,
  /sk-[A-Za-z0-9_]+/g,
  /(password|token)=\S+/gi
];
const MESSAGE_EVENT_TYPES = new Set(['decision', 'risk', 'next']);
const EVENT_TYPES = new Set([...MESSAGE_EVENT_TYPES, 'verification']);

export function createRunRetro(input) {
  if (!isRecord(input)) throw new TypeError('Run retro input must be an object.');
  validateOptionalString(input.objective, 'Run retro objective must be a string.');
  validateOptionalString(input.outcome, 'Run retro outcome must be a string.');
  if (input.events !== undefined && !Array.isArray(input.events)) {
    throw new TypeError('Run retro events must be an array.');
  }
  const events = (input.events ?? []).map((event, index) => {
    if (!isRecord(event)) throw new TypeError(`Run retro event at index ${index} must be an object.`);
    validateEvent(event, index);
    return redactEvent(event);
  });
  const groups = { decisions: [], evidence: [], risks: [], nextActions: [], timeline: [] };
  for (const event of events) {
    groups.timeline.push(`${event.time ?? 'unknown'} ${event.type ?? 'event'}: ${event.message ?? ''}`);
    if (event.type === 'decision') groups.decisions.push(event.message);
    if (event.type === 'verification') {
      const evidenceLabel = nonEmpty(event.command) ? event.command : event.message;
      groups.evidence.push(`${evidenceLabel}: ${event.status}`);
      if (event.status !== 'passed') {
        groups.risks.push(event.message ?? `Verification status is ${event.status}: ${evidenceLabel}.`);
      }
    }
    if (event.type === 'risk') groups.risks.push(event.message);
    if (event.type === 'next') groups.nextActions.push(event.message);
  }
  if (!groups.evidence.length) groups.risks.push('No verification evidence was recorded.');
  const requestedOutcome = redact(input.outcome ?? inferOutcome(groups));
  const outcome = groups.risks.length ? inferOutcome(groups) : requestedOutcome;
  return { objective: redact(input.objective ?? 'unspecified'), outcome, ...groups };
}
function inferOutcome(groups) { return groups.risks.length ? 'needs-follow-up' : 'ready'; }
function validateEvent(event, index) {
  validateOptionalString(event.time, `Run retro event at index ${index} time must be a string.`);
  if (!EVENT_TYPES.has(event.type)) {
    throw new TypeError(`Run retro event at index ${index} has unsupported type "${String(event.type)}".`);
  }
  if (MESSAGE_EVENT_TYPES.has(event.type) && !nonEmpty(event.message)) {
    throw new TypeError(`Run retro ${event.type} event at index ${index} requires a non-empty message.`);
  }
  if (event.type === 'verification') {
    if (!nonEmpty(event.status)) {
      throw new TypeError(`Run retro verification event at index ${index} requires a non-empty status.`);
    }
    if (!nonEmpty(event.command) && !nonEmpty(event.message)) {
      throw new TypeError(`Run retro verification event at index ${index} requires a non-empty command or message.`);
    }
  }
}
function validateOptionalString(value, message) {
  if (value !== undefined && typeof value !== 'string') throw new TypeError(message);
}
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function redactEvent(event) { return Object.fromEntries(Object.entries(event).map(([k, v]) => [k, typeof v === 'string' ? redact(v) : v])); }
function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function redact(text) {
  let value = SECRET_PATTERNS.reduce((result, pattern) => result.replace(pattern, '[REDACTED]'), String(text));
  value = value.replace(/([\[{,]\s*\"(?:password|token)\"\s*:\s*)\"(?:\\.|[^\"\\])*\"/gi, '$1"[REDACTED]"');
  value = value.replace(/\b(password|token)(\s*[:=]\s*)\"(?:\\.|[^\"\\])*\"/gi, '$1$2"[REDACTED]"');
  return value.replace(/\b(password|token)(\s*[:=]\s*)[^\s,;}&]+/gi, '$1$2[REDACTED]');
}
export function formatRetroReport(retro) {
  return ['# Run Retro', scalar('Objective', retro.objective), scalar('Outcome', retro.outcome), 'Decisions:', ...list(retro.decisions), 'Evidence:', ...list(retro.evidence), 'Risks:', ...list(retro.risks), 'Next actions:', ...list(retro.nextActions)].join('\n');
}
function scalar(label, value) { return `${label}: ${renderMarkdownText(value)}`; }
function list(items) { return items.length ? items.map((item) => `- ${renderMarkdownText(item)}`) : ['- none']; }
function renderMarkdownText(value) {
  const lines = String(value).split(/\r?\n/);
  return lines.map((line, index) => {
    const escaped = line
      .replace(/([\\`*_[\]{}()#+!<>|])/g, '\\$1')
      .replace(/\\\[REDACTED\\\]/g, '[REDACTED]')
      .replace(/^(\s*)(\d+)([.)])(\s)/, '$1$2\\$3$4')
      .replace(/^(\s*)(-{3,}|[-+]\s)/, (_, space, marker) => `${space}${marker.replace(/[-+]/g, '\\$&')}`);
    return `${index ? '  ' : ''}${escaped}${index < lines.length - 1 ? '<br>' : ''}`;
  }).join('\n');
}
