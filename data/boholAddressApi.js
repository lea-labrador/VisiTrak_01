import { boholAddressData } from "./boholAddressData";

const PSGC_API_BASE_URL = "https://psgc.cloud/api/v2";
const BOHOL_PROVINCE_CODE = "0712";
const API_TIMEOUT_MS = 10000;
const SOURCE_ONLINE = "online";
const SOURCE_FALLBACK = "fallback";
const OFFLINE_REASON = "offline";

const isClientOffline = () =>
  typeof navigator !== "undefined" &&
  typeof navigator.onLine === "boolean" &&
  navigator.onLine === false;

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeMunicipalityName = (value) => {
  const name = normalizeText(value);
  if (!name) return "";
  if (name.toLowerCase().startsWith("city of ")) {
    return `${name.slice(8).trim()} City`;
  }
  if (name.toLowerCase().startsWith("municipality of ")) {
    return name.slice(16).trim();
  }
  return name.replace(/^president\b/i, "Pres.");
};

const sortByName = (a, b) =>
  a.localeCompare(b, "en", { sensitivity: "base" });

const fetchJsonWithTimeout = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

const normalizeMunicipalityItems = (items) => {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  const normalized = [];

  for (const item of items) {
    let name = "";
    let code = "";

    if (typeof item === "string") {
      name = normalizeMunicipalityName(item);
      code = name;
    } else if (item && typeof item === "object") {
      name = normalizeMunicipalityName(item.name);
      code = normalizeText(item.code) || name;
    }

    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({ code, name });
  }

  return normalized.sort((a, b) => sortByName(a.name, b.name));
};

const normalizeBarangayItems = (items) => {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  const normalized = [];

  for (const item of items) {
    const name =
      typeof item === "string"
        ? normalizeText(item)
        : normalizeText(item?.name);

    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push(name);
  }

  return normalized.sort(sortByName);
};

const municipalityKey = (value) =>
  normalizeMunicipalityName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

let fallbackMunicipalityCache = null;
let fallbackMunicipalityNameLookup = new Map();

const loadFallbackBoholMunicipalities = () => {
  if (fallbackMunicipalityCache) return fallbackMunicipalityCache;

  const normalized = normalizeMunicipalityItems(
    Object.keys(boholAddressData || {}).map((name) => ({
      code: normalizeMunicipalityName(name),
      name,
    }))
  );

  fallbackMunicipalityCache = normalized;
  fallbackMunicipalityNameLookup = new Map(
    normalized.map((item) => [municipalityKey(item.name), item.name])
  );

  return normalized;
};

const resolveFallbackMunicipalityName = (value) => {
  if (!value) return "";
  if (fallbackMunicipalityNameLookup.size === 0) {
    loadFallbackBoholMunicipalities();
  }
  return fallbackMunicipalityNameLookup.get(municipalityKey(value)) || "";
};

const loadFallbackBoholBarangays = (municipalityName) => {
  const resolvedName = resolveFallbackMunicipalityName(municipalityName);
  if (!resolvedName) return [];
  return normalizeBarangayItems(boholAddressData[resolvedName]);
};

const buildMetaResult = ({
  items,
  source,
  onlineAvailable,
  reason = "",
}) => ({
  items,
  source,
  onlineAvailable,
  reason,
  count: items.length,
  fetchedAt: new Date().toISOString(),
});

const getFallbackBarangays = ({ municipalityCode, municipalityName }) => {
  const byName = loadFallbackBoholBarangays(municipalityName);
  if (byName.length > 0) return byName;
  return loadFallbackBoholBarangays(municipalityCode);
};

export const loadBoholMunicipalitiesWithMeta = async () => {
  if (isClientOffline()) {
    return buildMetaResult({
      items: loadFallbackBoholMunicipalities(),
      source: SOURCE_FALLBACK,
      onlineAvailable: false,
      reason: OFFLINE_REASON,
    });
  }

  try {
    const data = await fetchJsonWithTimeout(
      `${PSGC_API_BASE_URL}/provinces/${BOHOL_PROVINCE_CODE}/cities-municipalities`
    );
    const normalized = normalizeMunicipalityItems(data);
    if (normalized.length > 0) {
      return buildMetaResult({
        items: normalized,
        source: SOURCE_ONLINE,
        onlineAvailable: true,
      });
    }
  } catch {
    // Fallback handled below.
  }

  const fallbackItems = loadFallbackBoholMunicipalities();
  return buildMetaResult({
    items: fallbackItems,
    source: SOURCE_FALLBACK,
    onlineAvailable: false,
    reason: "municipalities-unavailable-online",
  });
};

export const loadBoholBarangaysWithMeta = async ({
  municipalityCode,
  municipalityName,
}) => {
  if (!municipalityCode && !municipalityName) {
    return buildMetaResult({
      items: [],
      source: SOURCE_FALLBACK,
      onlineAvailable: false,
      reason: "missing-municipality",
    });
  }

  if (isClientOffline()) {
    return buildMetaResult({
      items: getFallbackBarangays({ municipalityCode, municipalityName }),
      source: SOURCE_FALLBACK,
      onlineAvailable: false,
      reason: OFFLINE_REASON,
    });
  }

  try {
    if (municipalityCode) {
      const byCode = await fetchJsonWithTimeout(
        `${PSGC_API_BASE_URL}/cities-municipalities/${encodeURIComponent(
          municipalityCode
        )}/barangays`
      );
      const normalizedByCode = normalizeBarangayItems(byCode);
      if (normalizedByCode.length > 0) {
        return buildMetaResult({
          items: normalizedByCode,
          source: SOURCE_ONLINE,
          onlineAvailable: true,
        });
      }
    }

    if (municipalityName) {
      const byName = await fetchJsonWithTimeout(
        `${PSGC_API_BASE_URL}/cities-municipalities/${encodeURIComponent(
          municipalityName
        )}/barangays`
      );
      const normalizedByName = normalizeBarangayItems(byName);
      if (normalizedByName.length > 0) {
        return buildMetaResult({
          items: normalizedByName,
          source: SOURCE_ONLINE,
          onlineAvailable: true,
        });
      }
    }
  } catch {
    // Fallback handled below.
  }

  return buildMetaResult({
    items: getFallbackBarangays({ municipalityCode, municipalityName }),
    source: SOURCE_FALLBACK,
    onlineAvailable: false,
    reason: "barangays-unavailable-online",
  });
};

export const loadBoholMunicipalities = async () => {
  const result = await loadBoholMunicipalitiesWithMeta();
  return result.items;
};

export const loadBoholBarangays = async (params) => {
  const result = await loadBoholBarangaysWithMeta(params);
  return result.items;
};

export const formatAddressForDB = (municipality, barangay) => {
  if (!municipality || !barangay) return null;
  return {
    barangay,
    municipality,
    province: "Bohol",
    fullAddress: `${barangay}, ${municipality}, Bohol`,
    country: "Philippines",
  };
};
