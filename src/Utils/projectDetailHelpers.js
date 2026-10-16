/* Helpers from the Angular ProjectDetailComponent (project-detail.component.ts), kept verbatim. */
import config from '../Config/config';
import { cleanBinaryField } from './projectModel';
import { devLog } from './apiHelpers';

/** Some KPI endpoints expect the project id under a different key than others - every common
 *  variant is merged into the payload so whichever key a given endpoint reads is present. */
export const withProjectIdAliases = (projectId, base) => ({
  ...base,
  projectCode: projectId,
  projectId: projectId,
  ProjectId: projectId,
  Project_id: projectId,
  project_id: projectId
});

/** Formats a successful (2xx) cmd_* response's message for display. */
export const formatApiResult = (res, fallback) => {
  if (!res) {
    return fallback;
  }
  return res.message || res.Message || (typeof res.status === 'string' && res.status.toLowerCase() !== 'success' ? res.status : '') || fallback;
};

/** The KPI list on State/District KPI responses isn't always named the same - try every plausible key. */
export const extractKpiArray = (res) => {
  if (!res) {
    return [];
  }

  const candidates = [
    res.data && res.data.ProjectKPIs,
    res.data && res.data.projectKPIs,
    res.data && res.data.projectKpis,
    res.data && res.data.stateKpis,
    res.data && res.data.data,
    res.data,
    res.projectKPIs,
    res.projectKpis,
    res.stateKpis,
    res.districtKPIs,
    res.districtKpis,
    res.kpis,
    res.result,
    res.results
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) {
      return c;
    }
  }

  devLog('[ProjectDetail] extractKpiArray: no array field recognized on response - checked data.ProjectKPIs/data.projectKPIs/stateKpis/districtKPIs/kpis/result. Raw response:', res);
  return [];
};

/** Debug helper: summarizes a raw API field's type + a short preview. */
export const describeRaw = (val) => {
  if (val === undefined) { return '(key missing)'; }
  if (val === null) { return '(null)'; }
  if (typeof val === 'string') {
    return `string, length ${val.length}, starts "${val.substring(0, 40)}"`;
  }
  return `${typeof val}: ${JSON.stringify(val).substring(0, 80)}`;
};

/** Returns the first non-empty value found on `obj` across the given key names - exact match first,
 *  then a case/punctuation-insensitive match; copes with a value nested one level ({ base64: "..." }). */
export const pick = (obj, keys) => {
  if (!obj) {
    return '';
  }

  const asString = (val) => {
    if (typeof val === 'string') {
      return val;
    }
    if (val && typeof val === 'object') {
      return val.base64 || val.data || val.value || val.url || '';
    }
    return '';
  };

  for (const k of keys) {
    const v = asString(obj[k]);
    if (v) {
      return cleanBinaryField(v);
    }
  }

  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const wanted = keys.map(normalize);

  for (const actualKey of Object.keys(obj)) {
    if (wanted.includes(normalize(actualKey))) {
      const v = asString(obj[actualKey]);
      if (v) {
        devLog(`[ProjectDetail] pick(): matched "${actualKey}" for requested keys [${keys.join(', ')}] via case-insensitive fallback`);
        return cleanBinaryField(v);
      }
    }
  }

  return '';
};

/** Guesses the image MIME type from the base64 payload's leading bytes. */
const sniffImageMime = (base64) => {
  if (base64.startsWith('iVBORw0KG')) { return 'image/png'; }
  if (base64.startsWith('/9j/')) { return 'image/jpeg'; }
  if (base64.startsWith('R0lGOD')) { return 'image/gif'; }
  if (base64.startsWith('UklGR')) { return 'image/webp'; }
  if (base64.startsWith('PHN2Zw') || base64.startsWith('PD94bWwg')) { return 'image/svg+xml'; }
  return 'image/png'; // reasonable default
};

/** Builds a safe <img> src from whatever base64 the API gave us (raw base64 or a full data: URI). */
export const toImageDataUrl = (raw, debugLabel) => {
  if (!raw) {
    return '';
  }

  const trimmed = raw.trim();

  if (trimmed.startsWith('data:')) {
    devLog(`[ProjectDetail] ${debugLabel}: value already a data: URI, using as-is (length ${trimmed.length})`);
    return trimmed;
  }

  // strip any embedded whitespace/newlines that would otherwise break the base64
  const cleaned = trimmed.replace(/\s/g, '');
  const mime = sniffImageMime(cleaned);
  devLog(`[ProjectDetail] ${debugLabel}: building data URI from raw base64 (length ${cleaned.length}, had whitespace: ${cleaned.length !== trimmed.length}, sniffed mime: ${mime})`);
  return `data:${mime};base64,${cleaned}`;
};

/** Best-effort extraction of the uploaded file's path from upload_mission_documents' response
 *  (exact response shape isn't documented). */
export const extractUploadedPath = (res, def) => {
  if (!res) {
    return '';
  }

  const candidates = [
    res[def.formField],
    res[def.key],
    res.data && res.data[def.formField],
    res.data && res.data[def.key],
    res.path,
    res.filePath,
    res.file_path,
    res.url,
    res.data && res.data.path,
    res.data && res.data.url
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      return c.trim();
    }
  }

  return '';
};

/** A relative document path is joined with the configured API host (best-effort default). */
export const resolveDocUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = config.ApiCredentials.credentials.kodiApiBaseUrl || '';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

/** Reads an <input type="file"> image as base64 without the "data:" prefix. */
export const readFileAsBase64 = (file, onDone, onError) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    const commaIdx = result.indexOf(',');
    onDone(commaIdx !== -1 ? result.substring(commaIdx + 1) : result);
  };
  if (onError) {
    reader.onerror = onError;
  }
  reader.readAsDataURL(file);
};
