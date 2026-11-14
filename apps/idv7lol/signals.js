'use strict';
/**
 * signals.js - the signal store keyed by catalog id, and the decoders that
 * turn BMW enum payloads into the catalog's values. No dependency on the
 * kit, so it can be unit-tested on a desktop.
 */
class SignalStore {
  constructor() {
    this.map = {};
  }
  set(id, value, at) {
    if (value === null || value === undefined || (typeof value === 'number' && !isFinite(value)))
      return;
    this.map[id] = { value, at: at || Date.now(), valid: true };
  }
  invalidate(id) {
    const s = this.map[id];
    if (s) s.valid = false;
  }
  get(id) {
    return this.map[id];
  }
  number(id, fallback) {
    const s = this.map[id];
    return s && s.valid && typeof s.value === 'number' ? s.value : fallback;
  }
  snapshot() {
    return Object.assign({}, this.map);
  }
  ids() {
    return Object.keys(this.map);
  }
}

/** BMW drive-mode names (TAB_FES_MODUS_ARG and friends) to the catalog's enum. */
const DRIVE_MODES = [
  [/ECO_?PRO|EFFICIENT|ECO/i, 'ECO_PRO'],
  [/SPORT_?PLUS|SPORT\+|SPORTPLUS/i, 'SPORT_PLUS'],
  [/TRACK|RACE/i, 'TRACK'],
  [/ADAPTIVE|ADAPTIV/i, 'ADAPTIVE'],
  [/SPORT|XTRABOOST|S_MINUS/i, 'SPORT'],
  [/COMFORT|NORMAL|BASIS|BASE/i, 'COMFORT'],
];

function driveModeOf(raw) {
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw || '');
  for (const [re, mode] of DRIVE_MODES) if (re.test(text)) return mode;
  return null;
}

/**
 * BMW gearbox enums copied from the field decoders in M Vitals / Redline.
 * Keep selector stage, engaged gear and D/S/M programme separate: they are
 * three different values in the SOME/IP payloads.
 */
const GEARS = { G1: 1, G2: 2, G3: 3, G4: 4, G5: 5, G6: 6, G7: 7, G8: 8, G9: 9, G10: 10, R: -1, N_OR_P: 0 };
function gearOf(value) {
  if (typeof value === 'number')
    return value >= 3 && value <= 12 ? value - 2 : value === 1 ? -1 : value === 2 ? 0 : undefined;
  return Object.prototype.hasOwnProperty.call(GEARS, value) ? GEARS[value] : undefined;
}

const STAGES = { P: 'P', R: 'R', N: 'N', D: 'D', 1: 'P', 2: 'R', 3: 'N', 4: 'D' };
function stageOf(value) {
  return Object.prototype.hasOwnProperty.call(STAGES, value) ? STAGES[value] : undefined;
}

/**
 * DataPowerTrain2.statusGearSelectionDrive:
 * N=1, R=2, P=3, NP=4, _1=5 ... _9=13 (names or wire numbers).
 */
function selectionOf(value) {
  let n;
  if (typeof value === 'number') n = value;
  else if (value === 'N' || value === 'R' || value === 'P' || value === 'NP')
    n = { N: 1, R: 2, P: 3, NP: 4 }[value];
  else if (/^_\\d$/.test(String(value))) n = 4 + Number(String(value).slice(1));
  if (n === 1) return { stage: 'N', gear: 0 };
  if (n === 2) return { stage: 'R', gear: -1 };
  if (n === 3) return { stage: 'P', gear: 0 };
  if (n === 4) return { stage: undefined, gear: 0 };
  if (n >= 5 && n <= 13) return { stage: 'D', gear: n - 4 };
  return undefined;
}

const PROGRAMS = {
  S_MINUS_PROGRAMM: 'S',
  M_MINUS_PROGRAMM: 'M',
  '1': 'S',
  '2': 'M',
};

/** MDrive.dataDisplayGearbox: the programme displayed beside the gear. */
function programModeOf(raw) {
  const value = raw && typeof raw === 'object' ? raw.displayProgramGearbox : raw;
  if (Object.prototype.hasOwnProperty.call(PROGRAMS, String(value))) return PROGRAMS[String(value)];
  if (value === 0 || /^D/i.test(String(value))) return 'D';
  return null;
}

/** D/S/M selector-like fields in VehicleInformation.statusGearboxDrive. */
function gearboxModeOf(payload) {
  if (!payload || typeof payload !== 'object') return null;
  for (const key of Object.keys(payload)) {
    if (key === 'statusActualGearDrive' || /StageDrive/.test(key) ||
        !/select|lever|position|program|mode|range|manual|sport|tip/i.test(key)) continue;
    const value = payload[key];
    if (value === true || value === 1) {
      if (/manual|tip/i.test(key)) return 'M';
      if (/sport/i.test(key)) return 'S';
      continue;
    }
    const token = String(value).toUpperCase();
    if (/NOT|INACTIVE|INVALID|SIGNAL|UNKNOWN|OFF|NO_/.test(token)) continue;
    if (/MANU|TIPP|^M$|^M_|_M$|^M\\d/.test(token)) return 'M';
    if (/SPORT|^S$|_S$|^DS$/.test(token)) return 'S';
    if (/^D$|^D_|_D$|^DRIVE/.test(token)) return 'D';
  }
  return null;
}

function transmissionModeOf(raw) {
  if (typeof raw === 'string') {
    const direct = programModeOf(raw);
    if (direct) return direct;
    if (/^(\\{|\\[)/.test(raw.trim())) {
      try { return transmissionModeOf(JSON.parse(raw)); } catch (_e) { return null; }
    }
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const program = programModeOf(raw);
  return program || gearboxModeOf(raw);
}

const GEAR_TEXT = (gear, stage) => {
  if (stage === 'P' || stage === 'R' || stage === 'N') return stage;
  if (typeof gear === 'number') {
    if (gear === -1) return 'R';
    if (gear === 0) return stage || 'N';
    return String(gear);
  }
  return stage || null;
};

module.exports = { SignalStore, driveModeOf, transmissionModeOf, programModeOf, gearboxModeOf, gearOf, stageOf, selectionOf, GEAR_TEXT };
