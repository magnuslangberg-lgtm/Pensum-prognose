import * as XLSX from 'xlsx';

export const PENSUM_PRODUKTER_STORAGE_KEY = 'pensum_produkter_admin_v1';

export const STANDARD_PENSUM_PRODUKTER = {
  enkeltfond: [
    {
      id: 'norge-a',
      navn: 'Pensum Norge A',
      aktivatype: 'aksje',
      likviditet: 'likvid',
      aar2024: 21.5,
      aar2023: 17.7,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
    {
      id: 'energy-a',
      navn: 'Pensum Global Energy A',
      aktivatype: 'aksje',
      likviditet: 'likvid',
      aar2024: 7.3,
      aar2023: -1.1,
      aar2022: 11.0,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
    {
      id: 'banking-d',
      navn: 'Pensum Nordic Banking Sector D',
      aktivatype: 'aksje',
      likviditet: 'likvid',
      aar2024: null,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
    {
      id: 'financial-d',
      navn: 'Pensum Financial Opportunity Fund D',
      aktivatype: 'rente',
      likviditet: 'likvid',
      aar2024: null,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
  ],
  fondsportefoljer: [
    {
      id: 'core-active',
      navn: 'Pensum Global Core Active',
      aktivatype: 'aksje',
      likviditet: 'likvid',
      aar2024: null,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
    {
      id: 'edge',
      navn: 'Pensum Global Edge',
      aktivatype: 'aksje',
      likviditet: 'likvid',
      aar2024: null,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
    {
      id: 'basis',
      navn: 'Pensum Basis',
      aktivatype: 'blandet',
      likviditet: 'likvid',
      aar2024: 6.2,
      aar2023: 13.1,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
    {
      id: 'global-hoyrente',
      navn: 'Pensum Global Høyrente',
      aktivatype: 'rente',
      likviditet: 'likvid',
      aar2024: 6.5,
      aar2023: 7.9,
      aar2022: -5.1,
      aar2021: 5.3,
      aar2020: 3.0,
      aarlig3ar: 6.9,
      risiko3ar: 2.3,
    },
    {
      id: 'nordisk-hoyrente',
      navn: 'Pensum Nordisk Høyrente',
      aktivatype: 'rente',
      likviditet: 'likvid',
      aar2024: 6.5,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: null,
      risiko3ar: null,
    },
  ],
  alternative: [
    {
      id: 'turnstone-pe',
      navn: 'Turnstone Private Equity',
      aktivatype: 'alternativ',
      likviditet: 'illikvid',
      forventetAvkastning: 12.0,
      aar2024: null,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: 12.0,
      risiko3ar: null,
    },
    {
      id: 'amaron-re',
      navn: 'Amaron Real Estate',
      aktivatype: 'alternativ',
      likviditet: 'illikvid',
      forventetAvkastning: 12.0,
      aar2024: null,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: 12.0,
      risiko3ar: null,
    },
    {
      id: 'unoterte-aksjer',
      navn: 'Unoterte aksjer',
      aktivatype: 'alternativ',
      likviditet: 'illikvid',
      forventetAvkastning: 12.0,
      aar2024: null,
      aar2023: null,
      aar2022: null,
      aar2021: null,
      aar2020: null,
      aarlig3ar: 12.0,
      risiko3ar: null,
    },
  ],
};

function safeNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = String(value)
    .replace('%', '')
    .replace(/\s/g, '')
    .replace(',', '.');

  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function mapProduktNavnTilId(navn) {
  const n = normalizeName(navn);

  const map = {
    'pensum norge a': 'norge-a',
    'pensum global energy a': 'energy-a',
    'pensum nordic banking sector d': 'banking-d',
    'pensum financial opportunity fund d': 'financial-d',

    'pensum globale aksjer': 'core-active',
    'pensum global core active': 'core-active',
    'pensum core active': 'core-active',

    'pensum global edge': 'edge',
    'pensum edge': 'edge',

    'pensum basis': 'basis',
    'pensum global høyrente': 'global-hoyrente',
    'pensum global hoyrente': 'global-hoyrente',
    'pensum nordisk høyrente': 'nordisk-hoyrente',
    'pensum nordisk hoyrente': 'nordisk-hoyrente',

    'turnstone private equity': 'turnstone-pe',
    'amaron real estate': 'amaron-re',
    'unoterte aksjer': 'unoterte-aksjer',
  };

  return map[n] || null;
}

function findColumn(row, candidates) {
  const keys = Object.keys(row || {});
  for (const key of keys) {
    const nk = normalizeName(key);
    if (candidates.some((c) => nk === normalizeName(c))) {
      return key;
    }
  }
  return null;
}

function cloneStandard() {
  return JSON.parse(JSON.stringify(STANDARD_PENSUM_PRODUKTER));
}

function applyRowToProdukt(produkt, row) {
  const col2024 = findColumn(row, ['2024', 'aar2024', 'avkastning 2024']);
  const col2023 = findColumn(row, ['2023', 'aar2023', 'avkastning 2023']);
  const col2022 = findColumn(row, ['2022', 'aar2022', 'avkastning 2022']);
  const col2021 = findColumn(row, ['2021', 'aar2021', 'avkastning 2021']);
  const col2020 = findColumn(row, ['2020', 'aar2020', 'avkastning 2020']);
  const col3y = findColumn(row, ['årlig 3 år', 'aarlig3ar', 'annualisert 3 år', '3 år']);
  const colRisk = findColumn(row, ['risiko 3 år', 'risiko3ar', 'std 3 år', 'volatilitet 3 år']);

  if (col2024) produkt.aar2024 = safeNumber(row[col2024]);
  if (col2023) produkt.aar2023 = safeNumber(row[col2023]);
  if (col2022) produkt.aar2022 = safeNumber(row[col2022]);
  if (col2021) produkt.aar2021 = safeNumber(row[col2021]);
  if (col2020) produkt.aar2020 = safeNumber(row[col2020]);
  if (col3y) produkt.aarlig3ar = safeNumber(row[col3y]);
  if (colRisk) produkt.risiko3ar = safeNumber(row[colRisk]);

  return produkt;
}

export function importPensumExcel(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

          const result = cloneStandard();

          for (const row of rows) {
            const navnKey = findColumn(row, ['navn', 'produkt', 'fondsnavn', 'fund', 'løsning']);
            if (!navnKey) continue;

            const navn = row[navnKey];
            const id = mapProduktNavnTilId(navn);
            if (!id) continue;

            let found = null;

            for (const kategori of ['enkeltfond', 'fondsportefoljer', 'alternative']) {
              const item = result[kategori].find((p) => p.id === id);
              if (item) {
                found = item;
                break;
              }
            }

            if (found) {
              applyRowToProdukt(found, row);
            }
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Kunne ikke lese filen.'));
      reader.readAsArrayBuffer(file);
    } catch (err) {
      reject(err);
    }
  });
}

export function savePensumProdukterToStorage(data) {
  if (typeof window === 'undefined') return false;
  localStorage.setItem(PENSUM_PRODUKTER_STORAGE_KEY, JSON.stringify(data));
  return true;
}

export function loadPensumProdukterFromStorage() {
  if (typeof window === 'undefined') return cloneStandard();

  try {
    const raw = localStorage.getItem(PENSUM_PRODUKTER_STORAGE_KEY);
    if (!raw) return cloneStandard();

    const parsed = JSON.parse(raw);

    if (
      parsed &&
      Array.isArray(parsed.enkeltfond) &&
      Array.isArray(parsed.fondsportefoljer) &&
      Array.isArray(parsed.alternative)
    ) {
      return parsed;
    }

    return cloneStandard();
  } catch (e) {
    return cloneStandard();
  }
}

export function resetPensumProdukterInStorage() {
  if (typeof window === 'undefined') return cloneStandard();
  localStorage.removeItem(PENSUM_PRODUKTER_STORAGE_KEY);
  return cloneStandard();
}
