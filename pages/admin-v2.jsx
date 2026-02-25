import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pensum_produkter_admin_v2';

const DEFAULT_DATA = {
  enkeltfond: [
    { id: 'norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 21.5, aar2023: 17.7, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null, forventetAvkastning: null },
    { id: 'energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 7.3, aar2023: -1.1, aar2022: 11.0, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null, forventetAvkastning: null },
    { id: 'banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null, forventetAvkastning: null },
    { id: 'financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null, forventetAvkastning: null }
  ],
  fondsportefoljer: [
    { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 18.3, aar2023: 17.5, aar2022: -3.7, aar2021: 16.3, aar2020: 14.8, aarlig3ar: 13.6, risiko3ar: 10.7, forventetAvkastning: null },
    { id: 'basis', navn: 'Pensum Basis', aktivatype: 'blandet', likviditet: 'likvid', aar2024: 6.2, aar2023: 13.1, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null, forventetAvkastning: null },
    { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, aar2021: 5.3, aar2020: 3.0, aarlig3ar: 6.9, risiko3ar: 2.3, forventetAvkastning: null },
    { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null, forventetAvkastning: null }
  ],
  alternative: [
    { id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null, forventetAvkastning: 12.0 },
    { id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null, forventetAvkastning: 12.0 },
    { id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: 12.0, risiko3ar: null, forventetAvkastning: 12.0 }
  ]
};

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).trim().replace(',', '.');
  if (cleaned === '' || cleaned.toLowerCase() === 'null') return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function buildCsvFromData(data) {
  const rows = [
    [
      'kategori',
      'id',
      'navn',
      'aktivatype',
      'likviditet',
      'aar2024',
      'aar2023',
      'aar2022',
      'aar2021',
      'aar2020',
      'aarlig3ar',
      'risiko3ar',
      'forventetAvkastning'
    ]
  ];

  ['enkeltfond', 'fondsportefoljer', 'alternative'].forEach((kategori) => {
    (data[kategori] || []).forEach((item) => {
      rows.push([
        kategori,
        item.id,
        item.navn,
        item.aktivatype,
        item.likviditet,
        item.aar2024,
        item.aar2023,
        item.aar2022,
        item.aar2021,
        item.aar2020,
        item.aarlig3ar,
        item.risiko3ar,
        item.forventetAvkastning
      ]);
    });
  });

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function parseCsvToData(text) {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV-filen er tom eller mangler data.');
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const required = [
    'kategori',
    'id',
    'navn',
    'aktivatype',
    'likviditet',
    'aar2024',
    'aar2023',
    'aar2022',
    'aar2021',
    'aar2020',
    'aarlig3ar',
    'risiko3ar',
    'forventetAvkastning'
  ];

  const missing = required.filter((col) => !header.includes(col));
  if (missing.length) {
    throw new Error(`Mangler kolonner: ${missing.join(', ')}`);
  }

  const result = {
    enkeltfond: [],
    fondsportefoljer: [],
    alternative: []
  };

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row = {};

    header.forEach((key, index) => {
      row[key] = values[index] ?? '';
    });

    const kategori = row.kategori?.trim();
    if (!['enkeltfond', 'fondsportefoljer', 'alternative'].includes(kategori)) {
      continue;
    }

    result[kategori].push({
      id: row.id?.trim(),
      navn: row.navn?.trim(),
      aktivatype: row.aktivatype?.trim() || null,
      likviditet: row.likviditet?.trim() || null,
      aar2024: parseNumber(row.aar2024),
      aar2023: parseNumber(row.aar2023),
      aar2022: parseNumber(row.aar2022),
      aar2021: parseNumber(row.aar2021),
      aar2020: parseNumber(row.aar2020),
      aarlig3ar: parseNumber(row.aarlig3ar),
      risiko3ar: parseNumber(row.risiko3ar),
      forventetAvkastning: parseNumber(row.forventetAvkastning)
    });
  }

  return result;
}

function downloadFile(filename, content, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function countItems(data) {
  return (data.enkeltfond?.length || 0) + (data.fondsportefoljer?.length || 0) + (data.alternative?.length || 0);
}

export default function AdminV2() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [status, setStatus] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.enkeltfond && parsed?.fondsportefoljer && parsed?.alternative) {
          setData(parsed);
          setJsonInput(JSON.stringify(parsed, null, 2));
          return;
        }
      }
      setJsonInput(JSON.stringify(DEFAULT_DATA, null, 2));
    } catch {
      setJsonInput(JSON.stringify(DEFAULT_DATA, null, 2));
    }
  }, []);

  const total = useMemo(() => countItems(data), [data]);

  function saveToLocalStorage(nextData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    setData(nextData);
    setJsonInput(JSON.stringify(nextData, null, 2));
    setStatus('Lagret lokalt i nettleseren.');
    setTimeout(() => setStatus(''), 2500);
  }

  function handleReset() {
    if (!window.confirm('Tilbakestille til standarddata?')) return;
    saveToLocalStorage(DEFAULT_DATA);
  }

  function handleClear() {
    if (!window.confirm('Slette admin-data fra nettleseren?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setData(DEFAULT_DATA);
    setJsonInput(JSON.stringify(DEFAULT_DATA, null, 2));
    setStatus('Admin-data slettet. Standarddata vises nå.');
    setTimeout(() => setStatus(''), 2500);
  }

  function handleJsonSave() {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed?.enkeltfond || !parsed?.fondsportefoljer || !parsed?.alternative) {
        throw new Error('JSON må inneholde enkeltfond, fondsportefoljer og alternative.');
      }
      saveToLocalStorage(parsed);
    } catch (err) {
      alert(err.message || 'Ugyldig JSON');
    }
  }

  function handleCsvTemplateDownload() {
    const csv = buildCsvFromData(data);
    downloadFile('pensum_produkter_template.csv', csv, 'text/csv;charset=utf-8;');
  }

  function handleJsonDownload() {
    downloadFile('pensum_produkter_admin_v2.json', JSON.stringify(data, null, 2), 'application/json;charset=utf-8;');
  }

  function handleCsvUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || '');
        const parsed = parseCsvToData(text);
        saveToLocalStorage(parsed);
      } catch (err) {
        alert(err.message || 'Kunne ikke lese CSV-filen.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-slate-900 text-white">
            <h1 className="text-2xl font-bold">Pensum Admin V2</h1>
            <p className="text-sm text-slate-300 mt-1">
              Egen admin-side. Påvirker ikke den fungerende hovedsiden.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Totalt antall produkter</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{total}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Enkeltfond</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{data.enkeltfond.length}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Fondsporteføljer</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{data.fondsportefoljer.length}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Alternative</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{data.alternative.length}</div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="font-semibold text-blue-900 mb-2">Trygg løsning</div>
              <p className="text-sm text-blue-900">
                Denne versjonen bruker <strong>CSV fra Excel</strong> (ikke .xlsx direkte), så vi slipper nye pakker og unngår å ødelegge builden.
              </p>
              <p className="text-sm text-blue-900 mt-1">
                I Excel: åpne arket → velg <strong>Lagre som CSV</strong> → last opp her.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white font-medium cursor-pointer hover:opacity-90">
                Last opp CSV
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
              </label>

              <button
                onClick={handleCsvTemplateDownload}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white font-medium hover:bg-slate-50"
              >
                Last ned CSV-mal
              </button>

              <button
                onClick={handleJsonDownload}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white font-medium hover:bg-slate-50"
              >
                Last ned JSON-backup
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-medium hover:bg-amber-100"
              >
                Tilbakestill til standard
              </button>

              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-xl border border-red-300 bg-red-50 text-red-700 font-medium hover:bg-red-100"
              >
                Slett lagret admin-data
              </button>
            </div>

            {status && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium">
                {status}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">Forhåndsvisning</h2>
                </div>
                <div className="p-4 space-y-5 max-h-[700px] overflow-auto">
                  {['enkeltfond', 'fondsportefoljer', 'alternative'].map((kategori) => (
                    <div key={kategori}>
                      <div className="font-semibold text-slate-900 mb-2 capitalize">{kategori}</div>
                      <div className="space-y-2">
                        {(data[kategori] || []).map((item) => (
                          <div key={item.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                            <div className="font-medium text-slate-900">{item.navn}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {item.id} • {item.aktivatype} • {item.likviditet}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                              <div>2024: <strong>{item.aar2024 ?? '—'}</strong></div>
                              <div>2023: <strong>{item.aar2023 ?? '—'}</strong></div>
                              <div>2022: <strong>{item.aar2022 ?? '—'}</strong></div>
                              <div>2021: <strong>{item.aar2021 ?? '—'}</strong></div>
                              <div>2020: <strong>{item.aar2020 ?? '—'}</strong></div>
                              <div>3 år: <strong>{item.aarlig3ar ?? '—'}</strong></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900">Rediger JSON direkte</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Hvis du vil gjøre manuelle endringer uten CSV.
                  </p>
                </div>
                <div className="p-4">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-[560px] border border-slate-300 rounded-xl p-3 font-mono text-xs"
                    spellCheck={false}
                  />
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={handleJsonSave}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:opacity-90"
                    >
                      Lagre JSON
                    </button>
                    <button
                      onClick={() => setJsonInput(JSON.stringify(data, null, 2))}
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white font-medium hover:bg-slate-50"
                    >
                      Tilbakestill editor til lagret data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-900 mb-2">CSV-format</div>
              <p className="text-sm text-slate-700 mb-2">
                Bruk disse kolonnene i første rad:
              </p>
              <code className="block text-xs bg-white border border-slate-200 rounded-lg p-3 overflow-auto">
                kategori,id,navn,aktivatype,likviditet,aar2024,aar2023,aar2022,aar2021,aar2020,aarlig3ar,risiko3ar,forventetAvkastning
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
