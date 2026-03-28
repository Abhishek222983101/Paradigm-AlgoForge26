import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const IV_LENGTH = 16;

export interface AnonymizedEntity {
  original: string;
  replacement: string;
  type: "name" | "email" | "phone" | "address" | "date" | "ssn" | "medical_record" | "hospital" | "physician";
}

export interface AnonymizedData {
  anonymized: any;
  entityMap: AnonymizedEntity[];
  timestamp: string;
  method: "ner" | "pattern" | "hybrid";
}

const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+91[\s-]?)?[789]\d{9}\b/g,
  ssn: /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g,
  date: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
  aadhar: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  pan: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
};

const INDIAN_NAMES = [
  "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Raj", "Kavita",
  "Deepak", "Meera", "Arjun", "Fatima", "Sanjay", "Sunita", "Krishna", "Lakshmi",
  "Om", "Hari", "Shiva", "Ganesh", "Durga", "Kali", "Parvati", "Saraswati"
];

const INDIAN_SURNAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Joshi", "Mehta",
  "Shah", "Chopra", "Kapoor", "Malhotra", "Khanna", "Bhatia", "Sinha", "Verma"
];

const HOSPITALS = [
  "Tata Memorial Hospital", "AIIMS", "Apollo Hospitals", "Fortis Healthcare",
  "Max Healthcare", "Narayana Health", "Manipal Hospitals", "Christian Medical College",
  "PGIMER", "NIMHANS", "Kokilaben Dhirubhai Ambani Hospital", "Cancer Institute"
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune",
  "Ahmedabad", "Chandigarh", "Jaipur", "Lucknow", "Kochi", "Vellore"
];

function generateReplacement(type: AnonymizedEntity["type"]): string {
  switch (type) {
    case "name":
      return `PATIENT_${INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)]}_${Math.floor(Math.random() * 999)}`;
    case "email":
      return `patient${Math.floor(Math.random() * 99999)}@redacted.in`;
    case "phone":
      return `+91-XXXXX-${Math.floor(Math.random() * 90000 + 10000)}`;
    case "address":
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      return `Redacted Address, ${city}, India`;
    case "date":
      const year = 1950 + Math.floor(Math.random() * 60);
      return `${year}-XX-XX`;
    case "ssn":
      return `XXX-XX-${Math.floor(Math.random() * 9000 + 1000)}`;
    case "medical_record":
      return `MRN-${Math.floor(Math.random() * 999999)}`;
    case "hospital":
      return HOSPITALS[Math.floor(Math.random() * HOSPITALS.length)];
    case "physician":
      return `Dr. ${INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)]}`;
    default:
      return `[REDACTED_${(type as string).toUpperCase()}]`;
  }
}

export function anonymizePatientData(data: any): AnonymizedData {
  const entityMap: AnonymizedEntity[] = [];
  let anonymized = JSON.parse(JSON.stringify(data));

  function processValue(value: any, path: string): any {
    if (typeof value === "string") {
      for (const [type, pattern] of Object.entries(PATTERNS)) {
        if (pattern.test(value)) {
          const replacement = generateReplacement(type as AnonymizedEntity["type"]);
          entityMap.push({ original: value, replacement, type: type as AnonymizedEntity["type"] });
          return replacement;
        }
      }
    }
    return value;
  }

  function traverse(obj: any, path: string = ""): any {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => traverse(item, `${path}[${i}]`));
    }
    if (obj !== null && typeof obj === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const newPath = path ? `${path}.${key}` : key;
        const lowerKey = key.toLowerCase();
        
        if (lowerKey.includes("name") && typeof value === "string") {
          const replacement = generateReplacement("name");
          entityMap.push({ original: value as string, replacement, type: "name" });
          result[key] = replacement;
        } else if (lowerKey.includes("email") && typeof value === "string") {
          const replacement = generateReplacement("email");
          entityMap.push({ original: value as string, replacement, type: "email" });
          result[key] = replacement;
        } else if (lowerKey.includes("phone") || lowerKey.includes("mobile")) {
          const replacement = generateReplacement("phone");
          entityMap.push({ original: String(value), replacement, type: "phone" });
          result[key] = replacement;
        } else if (lowerKey === "ssn" || lowerKey.includes("social")) {
          const replacement = generateReplacement("ssn");
          entityMap.push({ original: String(value), replacement, type: "ssn" });
          result[key] = replacement;
        } else if (lowerKey.includes("address") || lowerKey.includes("city")) {
          const replacement = generateReplacement("address");
          entityMap.push({ original: String(value), replacement, type: "address" });
          result[key] = replacement;
        } else if (lowerKey.includes("hospital") || lowerKey.includes("facility")) {
          const replacement = generateReplacement("hospital");
          entityMap.push({ original: String(value), replacement, type: "hospital" });
          result[key] = replacement;
        } else if (lowerKey.includes("physician") || lowerKey.includes("doctor")) {
          const replacement = generateReplacement("physician");
          entityMap.push({ original: String(value), replacement, type: "physician" });
          result[key] = replacement;
        } else if (lowerKey.includes("dob") || lowerKey.includes("birth")) {
          const replacement = generateReplacement("date");
          entityMap.push({ original: String(value), replacement, type: "date" });
          result[key] = replacement;
        } else if (typeof value === "object") {
          result[key] = traverse(value, newPath);
        } else {
          result[key] = processValue(value, newPath);
        }
      }
      return result;
    }
    return processValue(obj, path);
  }

  anonymized = traverse(anonymized);

  return {
    anonymized,
    entityMap,
    timestamp: new Date().toISOString(),
    method: "hybrid"
  };
}

export function encryptData(data: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32), "utf8");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptData(encryptedData: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32), "utf8");
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(parts[1], "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function generateSecureId(prefix: string = "HIPAA"): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex");
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export const HIPAA_COMPLIANCE = {
  encryption: "AES-256-CBC",
  anonymization: "NER + Pattern Matching",
  retention_days: 90,
  session_timeout_minutes: 15,
  max_login_attempts: 3,
  password_min_length: 12,
  mfa_required: true,
  audit_logging: true,
  data_at_rest: true,
  data_in_transit: true
};
