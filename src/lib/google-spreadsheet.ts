import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { normalizeNumber } from "./normalize-number";

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

let cachedDoc: GoogleSpreadsheet | null = null;

export async function getDoc() {
  if (cachedDoc) return cachedDoc;
  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SPREADSHEET_ID!,
    serviceAccountAuth
  );
  await doc.loadInfo();
  cachedDoc = doc;
  return doc;
}

export async function getSheet(sheetName: string) {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return sheet;
}

export async function getRows(
  sheetName: string,
  options?: { offset?: number; limit?: number; parseNumber?: boolean }
) {
  const sheet = await getSheet(sheetName);

  const rows = await sheet.getRows({
    offset: options?.offset ?? 0,
    limit: options?.limit ?? sheet.rowCount,
  });

  return rows.map((row) => {
    const obj = row.toObject();

    if (options?.parseNumber) {
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === "string") {
          const num = normalizeNumber(val);
          if (num !== null) obj[key] = num;
        }
      }
    }

    return obj;
  });
}

export async function getColumnValues(
  sheetName: string,
  columnName: string,
  options?: { offset?: number; limit?: number; parseNumber?: boolean }
) {
  const sheet = await getSheet(sheetName);

  const rows = await sheet.getRows({
    offset: options?.offset ?? 0,
    limit: options?.limit ?? sheet.rowCount,
  });

  return Array.from(
    new Set(
      rows
        .map((row) => {
          const raw = row.get(columnName);

          if (options?.parseNumber) {
            return normalizeNumber(raw);
          }

          return raw ? String(raw).trim() : null;
        })
        .filter((v) => v !== null && v !== "" && v !== columnName)
    )
  );
}

export async function addRow<T extends Record<string, string | number>>(
  sheetName: string,
  data: T
): Promise<GoogleSpreadsheetRow | null> {
  const sheet = await getSheet(sheetName);
  const newRow = await sheet.addRow(data);
  return newRow.toObject() as GoogleSpreadsheetRow;
}
