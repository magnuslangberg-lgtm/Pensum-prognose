import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'pensum_produkter_admin_v1';
const ADMIN_CODE = 'pensumadmin2026'; // enkel kode - ikke sikkerhet på ordentlig

const defaultData = {
  enkeltfond: [
    { id: 'norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 21.5, aar2023: 17.7, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 7.3, aar2023: -1.1, aar2022: 11.0, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
  ],
  fondsportefoljer: [
    { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 18.3, aar2023: 17.5, aar2022: -3.7, aar2021: 16.3, aar2020: 14.8, aarlig3ar: 13.6, risiko3ar: 10.7 },
    { id: 'basis', navn: 'Pensum Basis', aktivatype: 'blandet', likviditet: 'likvid', aar2024: 6.2, aar2023: 13.1, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
    { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, aar2021: 5.3, aar2020: 3.0, aarlig3ar: 6.9, risiko3ar: 2.3 },
    { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
  ],
  alternative: [
    { id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null },
    { id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null },
    { id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', forventetAvkastning: 12.0, aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null }
  ]
};

function parseNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  const cleaned = String(v).trim().replace('%', '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) throw new Error('CSV-filen er tom eller mangler data.');

  const headers = lines[0].split(';').map((h) => h.trim());

  const rows = lines.slice(1).map((line) => {
    const values = line.split(';');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || '').trim();
    });
    return obj;
  });

  const grouped = {
    enkeltfond: [],
    fondsportefoljer: [],
    alternative: []
  };

  rows.forEach((row, index) => {
    const kategori = (row.kategori || '').trim();
    if (!grouped[kategori]) return;

    const navn = row.navn || `Produkt ${index + 1}`;
    const item = {
      id: row.id || slugify(navn),
      navn,
      aktivatype: row.aktivatype || 'aksje',
      likviditet: row.likviditet || 'likvid',
      aar2024: parseNumber(row.aar2024),
      aar2023: parseNumber(row.aar2023),
      aar2022: parseNumber(row.aar2022),
      aar2021: parseNumber(row.aar2021),
      aar2020: parseNumber(row.aar2020),
      aarlig3ar: parseNumber(row.aarlig3ar),
      risiko3ar: parseNumber(row.risiko3ar),
      forventetAvkastning: parseNumber(row.forventetAvkastning)
    };

    grouped[kategori].push(item);
  });

  return grouped;
}

export default function AdminPage() {
  const [code, setCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [status, setStatus] = useState('');

  const currentData = useMemo(() => {
    if (typeof window === 'undefined') return defaultData;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultData;
    } catch {
      return defaultData;
    }
  }, [status]);

  const handleUnlock = () => {
    if (code === ADMIN_CODE) {
      setIsUnlocked(true);
      setStatus('');
    } else {
      setStatus('Feil admin-kode');
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseCsv(text);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }

      setStatus('Data oppdatert. Gå tilbake til hovedsiden og oppdater nettleseren.');
    } catch (err) {
      setStatus(err.message || 'Kunne ikke lese CSV-filen.');
    }

    e.target.value = '';
  };

  const resetToDefault = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStatus('Tilbakestilt til standarddata.');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Admin – Pensum Løsninger</h1>
      <p>Last opp CSV eksportert fra Excel. Semikolon-separert fil anbefales.</p>

      {!isUnlocked ? (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
          <label>Admin-kode</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ padding: 10, flex: 1 }}
            />
            <button onClick={handleUnlock} style={{ padding: '10px 16px' }}>
              Logg inn
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
            <p><strong>CSV-kolonner:</strong></p>
            <code>
              kategori;id;navn;aktivatype;likviditet;aar2024;aar2023;aar2022;aar2021;aar2020;aarlig3ar;risiko3ar;forventetAvkastning
            </code>

            <div style={{ marginTop: 16 }}>
              <input type="file" accept=".csv,text/csv" onChange={handleFile} />
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={resetToDefault} style={{ padding: '10px 16px' }}>
                Tilbakestill til standarddata
              </button>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Produkter i bruk nå</h3>
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, overflow: 'auto' }}>
              {JSON.stringify(currentData, null, 2)}
            </pre>
          </div>
        </>
      )}

      {status && <p style={{ marginTop: 16 }}><strong>{status}</strong></p>}
    </div>
  );
}
