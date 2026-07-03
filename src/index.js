const SECRET_PATTERNS = [/gho_[A-Za-z0-9_]+/g, /sk-[A-Za-z0-9_]+/g, /(password|token)=\S+/gi];
export function createRunRetro(input) {
  const events = (Array.isArray(input.events) ? input.events : []).map(redactEvent);
  const groups = { decisions: [], evidence: [], risks: [], nextActions: [], timeline: [] };
  for (const event of events) {
    groups.timeline.push(`${event.time ?? 'unknown'} ${event.type ?? 'event'}: ${event.message ?? ''}`);
    if (event.type === 'decision') groups.decisions.push(event.message);
    if (event.type === 'verification') groups.evidence.push(`${event.command ?? 'check'}: ${event.status ?? 'unknown'}`);
    if (event.type === 'risk' || event.status === 'failed' || event.status === 'blocked') groups.risks.push(event.message);
    if (event.type === 'next') groups.nextActions.push(event.message);
  }
  if (!groups.evidence.length) groups.risks.push('No verification evidence was recorded.');
  return { objective: redact(input.objective ?? 'unspecified'), outcome: input.outcome ?? inferOutcome(groups), ...groups };
}
function inferOutcome(groups) { return groups.risks.length ? 'needs-follow-up' : 'ready'; }
function redactEvent(event) { return Object.fromEntries(Object.entries(event).map(([k, v]) => [k, typeof v === 'string' ? redact(v) : v])); }
export function redact(text) { return SECRET_PATTERNS.reduce((value, pattern) => value.replace(pattern, '[REDACTED]'), String(text)); }
export function formatRetroReport(retro) {
  return ['# Run Retro', `Objective: ${retro.objective}`, `Outcome: ${retro.outcome}`, 'Decisions:', ...list(retro.decisions), 'Evidence:', ...list(retro.evidence), 'Risks:', ...list(retro.risks), 'Next actions:', ...list(retro.nextActions)].join('\n');
}
function list(items) { return items.length ? items.map((item) => `- ${item}`) : ['- none']; }
