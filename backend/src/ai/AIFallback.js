// AIFallback.js
// -----------------------------------------------------------------------------
// Deterministic AI fallback for when AI_PROVIDER=none (no OpenAI key).
//
// Rules of the fallback:
//   - We never invent clinical data. We only reformat what's already in the note.
//   - We label the output as a fallback so the UI can show that label.
//   - For "explain prescription" we always include a disclaimer that says
//     this is not medical advice.
// -----------------------------------------------------------------------------

// bullets: turn a list of strings into a markdown bullet list.
//   items: array of strings (may be undefined)
//   returns: one string with each item on its own line, prefixed by "•"
function bullets(items) {
  const list = items ? items : [];
  const lines = [];
  for (let i = 0; i < list.length; i++) {
    const raw = list[i];
    const trimmed = raw ? raw.trim() : '';
    if (trimmed.length === 0) {
      continue;
    }
    let line = trimmed;
    if (line.endsWith('.')) {
      line = line.slice(0, line.length - 1);
    }
    lines.push('• ' + line + '.');
  }
  return lines.join('\n');
}

// trimOnce: shorten a string to <= 200 characters with an ellipsis.
function trimOnce(s) {
  const original = s ? s : '';
  const trimmed = original.trim();
  if (trimmed.length > 200) {
    return trimmed.slice(0, 200) + '…';
  }
  return trimmed;
}

// fallbackSummarize: turn a SOAP note into a short summary using only the
// text the doctor already wrote.
export function fallbackSummarize(input) {
  const subjective = input ? input.subjective : '';
  const objective = input ? input.objective : '';
  const assessment = input ? input.assessment : '';
  const plan = input ? input.plan : '';
  const diagnosis = input && input.diagnosis ? input.diagnosis : [];

  const parts = [];

  if (diagnosis.length > 0) {
    parts.push('**Assessment:** ' + diagnosis.join(', ') + '.');
  }
  if (assessment && assessment.trim().length > 0) {
    parts.push('**Clinical picture:** ' + assessment.trim());
  }
  if (plan && plan.trim().length > 0) {
    parts.push('**Plan:**\n' + bullets([plan]));
  }

  if (subjective || objective) {
    const chunks = [];
    if (subjective && subjective.trim().length > 0) {
      chunks.push('Patient reports ' + trimOnce(subjective));
    }
    if (objective && objective.trim().length > 0) {
      chunks.push('Examination shows ' + trimOnce(objective));
    }
    const findings = chunks.join('; ');
    if (findings.length > 0) {
      parts.push('**Findings:** ' + findings + '.');
    }
  }

  if (parts.length === 0) {
    parts.push('Insufficient structured data — clinician review required.');
  }

  return {
    summary: parts.join('\n\n'),
    model: 'fallback',
    fallback: true,
  };
}

// fallbackExplain: turn a prescription into a plain-language explainer
// for the patient.
export function fallbackExplain(input) {
  const medications = input && input.medications ? input.medications : [];
  const generalInstructions = input ? input.generalInstructions : '';
  const followUpDate = input ? input.followUpDate : null;

  const lines = [];
  lines.push('**What this prescription does**');

  if (medications.length === 0) {
    lines.push('Your doctor has written general instructions for you.');
  } else {
    for (let i = 0; i < medications.length; i++) {
      const m = medications[i];
      const name = m.name ? m.name : 'Medication';
      const bits = [];
      if (m.dosage) bits.push(m.dosage);
      if (m.frequency) bits.push(m.frequency);
      const usage = bits.length > 0 ? bits.join(', ') : "follow your doctor's directions";
      lines.push('• **' + name + '** — ' + usage + '.');
      if (m.instructions) {
        lines.push('  How to take: ' + m.instructions);
      }
    }
  }

  if (generalInstructions && generalInstructions.trim().length > 0) {
    lines.push('');
    lines.push('**Additional instructions from your doctor**');
    lines.push(generalInstructions);
  }

  if (followUpDate) {
    lines.push('');
    lines.push('**Follow-up:** scheduled for ' + new Date(followUpDate).toDateString() + '.');
  }

  return { explanation: lines.join('\n'), fallback: true };
}
