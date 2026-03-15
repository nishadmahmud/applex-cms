const STORAGE_KEY = "commeriva.additionalInfos.v1";

export const ADDITIONAL_INFOS_FIELDS = [
  {
    key: "manufacturer_details",
    label: "Manufacturer Details",
    placeholder: "Enter manufacturer information",
  },
  {
    key: "packer_details",
    label: "Packer Details",
    placeholder: "Enter packer information",
  },
  {
    key: "seller_details",
    label: "Seller Details",
    placeholder: "Enter seller information",
  },
  {
    key: "return_delivery_days",
    label: "Return / Delivery Days",
    placeholder: "Enter return or delivery days policy",
  },
  {
    key: "importer_details",
    label: "Importer Details",
    placeholder: "Enter importer information",
  },
];

function defaultAdditionalInfos() {
  return {
    manufacturer_details: [],
    packer_details: [],
    seller_details: [],
    return_delivery_days: [],
    importer_details: [],
    updatedAt: "",
  };
}

function normalize(obj) {
  const base = defaultAdditionalInfos();
  if (!obj || typeof obj !== "object") return base;

  const out = { ...base };
  for (const { key } of ADDITIONAL_INFOS_FIELDS) {
    const val = obj?.[key];
    if (Array.isArray(val)) {
      out[key] = val.filter((v) => typeof v === "string" && v.trim() !== "");
    } else if (typeof val === "string" && val.trim() !== "") {
      // Backward compatibility with old schema (single string)
      out[key] = [val];
    } else {
      out[key] = [];
    }
  }
  out.updatedAt = typeof obj?.updatedAt === "string" ? obj.updatedAt : "";
  return out;
}

export function readAdditionalInfosFromStorage() {
  if (typeof window === "undefined") return defaultAdditionalInfos();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAdditionalInfos();
    return normalize(JSON.parse(raw));
  } catch {
    return defaultAdditionalInfos();
  }
}

export function writeAdditionalInfosToStorage(next) {
  if (typeof window === "undefined") return normalize(next);
  const payload = normalize(next);
  payload.updatedAt = new Date().toISOString();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore (storage quota / blocked)
  }
  return payload;
}

export function clearAdditionalInfosStorage() {
  return writeAdditionalInfosToStorage(defaultAdditionalInfos());
}

