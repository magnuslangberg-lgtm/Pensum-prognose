const STORAGE_KEY = 'pensum_produkter_admin_v1';

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
      risiko3ar: null
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
      risiko3ar: null
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
      risiko3ar: null
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
      risiko3ar: null
    }
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
      risiko3ar: null
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
      risiko3ar: null
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
      risiko3ar: null
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
      risiko3ar: 2.3
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
      risiko3ar: null
    }
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
      risiko3ar: null
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
      risiko3ar: null
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
      risiko3ar: null
    }
  ]
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s%.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = String(value)
    .replace(/\s/g, '')
    .replace('%', '')
    .replace(/\./g, '')
    .replace(',', '.');

  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

function getRowValue(row, candidates) {
  const keys = Object.keys(row || {});
  for (const candidate of candidates) {
    const match = keys.find((k) => normalizeText(k) === normalizeText(candidate));
    if (match) return row[match];
  }
  return null;
}

function findProductByName(produkter, rawName) {
  const navn = normalizeText(rawName);

  const aliases = {
    'pensum globale aksjer': 'pensum global core active',
    'globale aksjer': 'pensum global core active',
    'core active': 'pensum global core active',
    'pensum core active': 'pensum global core active',
    'edge': 'pensum global edge',
    'pensum edge': 'pensum global edge'
  };

  const lookupName = aliases[navn] || navn;

  const all = [
    ...produkter.enkeltfond,
    ...produkter.fondsportefoljer,
    ...produkter.alternative
  ];

  return all.find((p) => normalizeText(p.navn) === lookupName) || null;
}

export function loadPensumProdukterFromStorage() {
  if (typeof window === 'undefined') {
    return deepClone(STANDARD_PENSUM_PRODUKTER);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(STANDARD_PENSUM_PRODUKTER);

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.enkeltfond) &&
      Array.isArray(parsed.fondsportefoljer) &&
      Array.isArray(parsed.alternative)
    ) {
      return parsed;
    }

    return deepClone(STANDARD_PENSUM_PRODUKTER);
  } catch (error) {
    console.error('Kunne ikke laste Pensum-produkter fra localStorage:', error);
    return deepClone(STANDARD_PENSUM_PRODUKTER);
  }
}

export function savePensumProdukterToStorage(data) {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Kunne ikke lagre Pensum-produkter til localStorage:', error);
    return false;
  }
}

export function resetPensumProdukterInStorage() {
  const resetData = deepClone(STANDARD_PENSUM_PRODUKTER);
  savePensumProdukterToStorage(resetData);
  return resetData;
}

export async function importPensumExcel(file) {
  const XLSX = await import('xlsx');

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Fant ikke noe ark i Excel-filen.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    raw: false
  });

  if (!rows || rows.length === 0) {
    throw new Error('Excel-filen ser ut til å være tom.');
  }

  const produkter = deepClone(loadPensumProdukterFromStorage());
  let oppdaterte = 0;
  const ikkeMatchet = [];

  for (const row of rows) {
    const navn = getRowValue(row, [
      'Navn',
      'Produkt',
      'Produktnavn',
      'Fond',
      'Portefølje',
      'Løsning'
    ]);

    if (!navn) continue;

    const produkt = findProductByName(produkter, navn);
    if (!produkt) {
      ikkeMatchet.push(String(navn));
      continue;
    }

    const aar2024 = parseNumber(getRowValue(row, ['2024', 'Avkastning 2024', 'aar2024']));
    const aar2023 = parseNumber(getRowValue(row, ['2023', 'Avkastning 2023', 'aar2023']));
    const aar2022 = parseNumber(getRowValue(row, ['2022', 'Avkastning 2022', 'aar2022']));
    const aar2021 = parseNumber(getRowValue(row, ['2021', 'Avkastning 2021', 'aar2021']));
    const aar2020 = parseNumber(getRowValue(row, ['2020', 'Avkastning 2020', 'aar2020']));
    const aarlig3ar = parseNumber(getRowValue(row, ['Årlig 3 år', 'Aarlig 3 ar', '3 år', 'aarlig3ar']));
    const risiko3ar = parseNumber(getRowValue(row, ['Risiko 3 år', 'Risiko 3 ar', 'Volatilitet 3 år', 'risiko3ar']));
    const forventetAvkastning = parseNumber(
      getRowValue(row, ['Forventet avkastning', 'Forventet', 'forventetAvkastning'])
    );

    if (aar2024 !== null) produkt.aar2024 = aar2024;
    if (aar2023 !== null) produkt.aar2023 = aar2023;
    if (aar2022 !== null) produkt.aar2022 = aar2022;
    if (aar2021 !== null) produkt.aar2021 = aar2021;
    if (aar2020 !== null) produkt.aar2020 = aar2020;
    if (aarlig3ar !== null) produkt.aarlig3ar = aarlig3ar;
    if (risiko3ar !== null) produkt.risiko3ar = risiko3ar;
    if (forventetAvkastning !== null) produkt.forventetAvkastning = forventetAvkastning;

    oppdaterte += 1;
  }

  savePensumProdukterToStorage(produkter);

  return {
    produkter,
    oppdaterte,
    ikkeMatchet
  };
}
