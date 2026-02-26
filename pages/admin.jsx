import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pensum_produkter_admin_v1';

const STANDARD_PENSUM_PRODUKTER = {
  enkeltfond: [
    { id: 'norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', aar2025: null, aar2024: 21.5, aar2023: 17.7, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', aar2025: null, aar2024: 7.3, aar2023: -1.1, aar2022: 11.0, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', aar2025: null, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', aar2025: null, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
  ],
  fondsportefoljer: [
    { id: 'core-active', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid', aar2025: null, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'edge', navn: 'Pensum Global Edge', aktivatype: 'aksje', likviditet: 'likvid', aar2025: null, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'basis', navn: 'Pensum Basis', aktivatype: 'blandet', likviditet: 'likvid', aar2025: null, aar2024: 6.2, aar2023: 13.1, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2025: null, aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, aar2021: 5.3, aar2020: 3.0, aarlig3ar: 6.9, risiko3ar: 2.3 },
    { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2025: null, aar2024: 6.5, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
  ],
  alternative: [
    { id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2025: null, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null },
    { id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2025: null, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null },
    { id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2025: null, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null }
  ]
};

const PRODUCT_MAP = {
  'pensum norge a': { kategori: 'enkeltfond', id: 'norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid' },
  'pensum global energy a': { kategori: 'enkeltfond', id: 'energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid' },
  'pensum nordic banking sector d': { kategori: 'enkeltfond', id: 'banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid' },
  'pensum financial opportunity fund d': { kategori: 'enkeltfond', id: 'financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid' },

  'pensum globale aksjer': { kategori: 'fondsportefoljer', id: 'core-active', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid' },
  'pensum global core active': { kategori: 'fondsportefoljer', id: 'core-active', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid' },
  'pensum core active': { kategori: 'fondsportefoljer', id: 'core-active', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid' },

  'pensum global edge': { kategori: 'fondsportefoljer', id: 'edge', navn: 'Pensum Global Edge', aktivatype: 'aksje', likviditet: 'likvid' },
  'pensum edge': { kategori: 'fondsportefoljer', id: 'edge', navn: 'Pensum Global Edge', aktivatype: 'aksje', likviditet: 'likvid' },

  'pensum basis': { kategori: 'fondsportefoljer', id: 'basis', navn: 'Pensum Basis', aktivatype: 'blandet', likviditet: 'likvid' },
  'pensum global høyrente': { kategori: 'fondsportefoljer', id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid' },
  'pensum global hoyrente': { kategori: 'fondsportefoljer', id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid' },
  'pensum nordisk høyrente': { kategori: 'fondsportefoljer', id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid' },
  'pensum nordisk hoyrente': { kategori: 'fondsportefoljer', id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid' },

  'turnstone private equity': { kategori: 'alternative', id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0 },
  'amaron real estate': { kategori: 'alternative', id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0 },
  'unoterte aksjer': { kategori: 'alternative', id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0 }
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(STANDARD_PENSUM_PRODUKTER));
}

function normalizeText(v) {
  return String(v || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const cleaned = String(v).replace(/\s/g, '').replace('%', '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function loadFromStorage() {
  if (typeof window === 'undefined') return cloneDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.enkeltfond || !parsed.fondsportefoljer || !parsed.alternative) {
      return cloneDefault();
    }
    return parsed;
  } catch {
    return cloneDefault();
  }
}

function saveToStorage(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetStorage() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function findValue(row, possibleKeys) {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    const k = normalizeText(key);
    if (possibleKeys.some((p) => k.includes(p))) {
      return value;
    }
  }
  return null;
}

function importRowsToPensumProdukter(rows) {
  const next = cloneDefault();

  rows.forEach((row) => {
    const rawName =
      findValue(row, ['navn', 'produkt', 'fund', 'portefølje', 'portfolio']) ||
      row.Navn ||
      row.navn ||
      row.Produkt ||
      row.produkt;

    const match = PRODUCT_MAP[normalizeText(rawName)];
    if (!match) return;

    const aar2025 = parseNumber(findValue(row, ['2025', 'ytd', '31.01.2026', 'jan-26', 'jan 26']));
    const aar2024 = parseNumber(findValue(row, ['2024']));
    const aar2023 = parseNumber(findValue(row, ['2023']));
    const aar2022 = parseNumber(findValue(row, ['2022']));
    const aar2021 = parseNumber(findValue(row, ['2021']));
    const aar2020 = parseNumber(findValue(row, ['2020']));
    const aarlig3ar = parseNumber(findValue(row, ['årlig 3', 'aarlig 3', 'annualisert 3', '3 år', '3aar']));
    const risiko3ar = parseNumber(findValue(row, ['risiko 3', 'volatilitet', 'std', 'stdev']));

    const list = next[match.kategori];
    const index = list.findIndex((item) => item.id === match.id);

    const merged = {
      ...(index >= 0 ? list[index] : {}),
      ...match,
      aar2025,
      aar2024,
      aar2023,
      aar2022,
      aar2021,
      aar2020,
      aarlig3ar,
      risiko3ar
    };

    if (index >= 0) {
      list[index] = merged;
    } else {
      list.push(merged);
    }
  });

  return next;
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(STANDARD_PENSUM_PRODUKTER);
  const [status, setStatus] = useState('');
  const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    setMounted(true);
    setData(loadFromStorage());
  }, []);

  const allRows = useMemo(() => {
    return [
      ...data.enkeltfond.map((x) => ({ ...x, kategori: 'Enkeltfond' })),
      ...data.fondsportefoljer.map((x) => ({ ...x, kategori: 'Fondsporteføljer' })),
      ...data.alternative.map((x) => ({ ...x, kategori: 'Alternative' }))
    ];
  }, [data]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus('Leser Excel-fil...');
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

      setPreviewRows(rows.slice(0, 8));

      const imported = importRowsToPensumProdukter(rows);
      setData(imported);
      saveToStorage(imported);
      setStatus('Excel importert og lagret.');
    } catch (err) {
      console.error(err);
      setStatus('Feil ved lesing av Excel-fil.');
    } finally {
      e.target.value = '';
    }
  }

  function handleReset() {
    const fresh = cloneDefault();
    setData(fresh);
    resetStorage();
    setStatus('Nullstilt til standardverdier.');
  }

  function handleSaveCurrent() {
    saveToStorage(data);
    setStatus('Lagret.');
  }

  if (!mounted) {
    return <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>Laster admin...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: '#0D2240', color: '#fff', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Pensum Admin</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
            Last opp månedsfil i Excel. Data lagres i nettleseren og kan brukes av verktøyet.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <label
              style={{
                background: '#0D2240',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Last opp Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleFile} style={{ display: 'none' }} />
            </label>

            <button
              onClick={handleSaveCurrent}
              style={{
                background: '#1B3A5F',
                color: '#fff',
                padding: '12px 16px',
                border: 0,
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Lagre nåværende data
            </button>

            <button
              onClick={handleReset}
              style={{
                background: '#fff',
                color: '#C62828',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Nullstill
            </button>
          </div>

          {status && (
            <div style={{ marginTop: 16, padding: 12, background: '#eef6ff', borderRadius: 8, color: '#0D2240' }}>
              {status}
            </div>
          )}
        </div>

        {previewRows.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h2 style={{ marginTop: 0, color: '#0D2240' }}>Preview av import</h2>
            <pre
              style={{
                margin: 0,
                background: '#f8fafc',
                padding: 12,
                borderRadius: 8,
                overflowX: 'auto',
                fontSize: 12
              }}
            >
              {JSON.stringify(previewRows, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#0D2240' }}>Lagrede produkter</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#0D2240', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: 10 }}>Kategori</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Navn</th>
                  <th style={{ textAlign: 'right', padding: 10 }}>2025/YTD</th>
                  <th style={{ textAlign: 'right', padding: 10 }}>2024</th>
                  <th style={{ textAlign: 'right', padding: 10 }}>2023</th>
                  <th style={{ textAlign: 'right', padding: 10 }}>Årlig 3 år</th>
                  <th style={{ textAlign: 'right', padding: 10 }}>Risiko 3 år</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>{row.kategori}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#0D2240' }}>{row.navn}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{row.aar2025 ?? '—'}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{row.aar2024 ?? '—'}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{row.aar2023 ?? '—'}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{row.aarlig3ar ?? '—'}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{row.risiko3ar ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
