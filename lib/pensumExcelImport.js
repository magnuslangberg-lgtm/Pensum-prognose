import * as XLSX from 'xlsx';

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = String(value)
    .replace(/\s/g, '')
    .replace('%', '')
    .replace(',', '.');

  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const NAME_ALIASES = {
  'pensum globale aksjer': 'pensum-core-active',
  'pensum core active': 'pensum-core-active',
  'core active': 'pensum-core-active',

  'pensum edge': 'pensum-edge',
  'edge': 'pensum-edge',

  'pensum global høyrente': 'pensum-global-hoyrente',
  'pensum global hoyrente': 'pensum-global-hoyrente',

  'pensum nordisk høyrente': 'pensum-nordisk-hoyrente',
  'pensum nordisk hoyrente': 'pensum-nordisk-hoyrente',

  'pensum norge a': 'pensum-norge-a',
  'pensum global energy a': 'pensum-global-energy-a',
  'pensum nordic banking sector d': 'pensum-banking-d',
  'pensum financial opportunity fund d': 'pensum-financial-d',

  'turnstone private equity': 'turnstone-pe',
  'amaron real estate': 'amaron-re',
  'unoterte aksjer': 'unoterte-aksjer'
};

const DEFAULT_PRODUCTS = {
  enkeltfond: [
    { id: 'pensum-norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 21.5, aar2023: 17.7, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'pensum-global-energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 7.3, aar2023: -1.1, aar2022: 11.0, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'pensum-banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'pensum-financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
  ],
  fondsportefoljer: [
    { id: 'pensum-core-active', navn: 'Pensum Core Active', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'pensum-edge', navn: 'Pensum Edge', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'basis', navn: 'Pensum Basis', aktivatype: 'blandet', likviditet: 'likvid', aar2024: 6.2, aar2023: 13.1, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'pensum-global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, aar2021: 5.3, aar2020: 3.0, aarlig3ar: 6.9, risiko3ar: 2.3 },
    { id: 'pensum-nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
  ],
  alternative: [
    { id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null },
    { id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null },
    { id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null }
  ]
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function flattenProducts(products) {
  return [
    ...products.enkeltfond.map((p) => ({ ...p, kategori: 'enkeltfond' })),
    ...products.fondsportefoljer.map((p) => ({ ...p, kategori: 'fondsportefoljer' })),
    ...products.alternative.map((p) => ({ ...p, kategori: 'alternative' }))
  ];
}

function findColumn(row, possibleNames) {
  const keys = Object.keys(row || {});
  for (const key of keys) {
    const normalizedKey = normalizeName(key);
    if (possibleNames.includes(normalizedKey)) return key;
  }
  return null;
}

function mapExcelNameToId(name) {
  const n = normalizeName(name);
  return NAME_ALIASES[n] || null;
}

export function importPensumProductsFromExcel(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];

          const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false
          });

          const updated = deepClone(DEFAULT_PRODUCTS);
          const flat = flattenProducts(updated);

          let updatedCount = 0;
          const unknownRows = [];

          rows.forEach((row) => {
            const navnCol = findColumn(row, ['navn', 'produkt', 'fond', 'portefølje', 'portefolje']);
            if (!navnCol) return;

            const originalName = row[navnCol];
            const mappedId = mapExcelNameToId(originalName);

            if (!mappedId) {
              if (String(originalName || '').trim()) unknownRows.push(originalName);
              return;
            }

            const product = flat.find((p) => p.id === mappedId);
            if (!product) {
              unknownRows.push(originalName);
              return;
            }

            const aar2024Col = findColumn(row, ['2024', 'aar2024', 'år2024']);
            const aar2023Col = findColumn(row, ['2023', 'aar2023', 'år2023']);
            const aar2022Col = findColumn(row, ['2022', 'aar2022', 'år2022']);
            const aar2021Col = findColumn(row, ['2021', 'aar2021', 'år2021']);
            const aar2020Col = findColumn(row, ['2020', 'aar2020', 'år2020']);
            const aarlig3arCol = findColumn(row, ['aarlig3ar', 'årlig3år', 'årlig 3 år', 'annualisert 3 år', '3 år']);
            const risiko3arCol = findColumn(row, ['risiko3ar', 'risiko 3 år', 'std 3 år', 'standardavvik 3 år']);
            const forventetCol = findColumn(row, ['forventet avkastning', 'forventet', 'forventetavkastning']);

            if (aar2024Col) product.aar2024 = toNumber(row[aar2024Col]);
            if (aar2023Col) product.aar2023 = toNumber(row[aar2023Col]);
            if (aar2022Col) product.aar2022 = toNumber(row[aar2022Col]);
            if (aar2021Col) product.aar2021 = toNumber(row[aar2021Col]);
            if (aar2020Col) product.aar2020 = toNumber(row[aar2020Col]);
            if (aarlig3arCol) product.aarlig3ar = toNumber(row[aarlig3arCol]);
            if (risiko3arCol) product.risiko3ar = toNumber(row[risiko3arCol]);
            if (forventetCol && product.kategori === 'alternative') {
              product.forventetAvkastning = toNumber(row[forventetCol]);
            }

            updatedCount += 1;
          });

          resolve({
            products: updated,
            updatedCount,
            unknownRows
          });
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
