import React, { useMemo, useState } from 'react';
import {
  importPensumExcel,
  loadPensumProdukterFromStorage,
  resetPensumProdukterInStorage,
  savePensumProdukterToStorage,
  STANDARD_PENSUM_PRODUKTER
} from '../lib/pensumExcelImport';

const PENSUM_COLORS = {
  navy: '#0D2240',
  lightGray: '#F5F7FA',
  white: '#FFFFFF',
  green: '#2E7D32',
  red: '#C62828',
  teal: '#0D9488',
  gold: '#B8860B'
};

function formatPercent(value) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(1)} %`;
}

function flattenProducts(data) {
  return [
    ...data.enkeltfond.map((x) => ({ ...x, kategori: 'Enkeltfond' })),
    ...data.fondsportefoljer.map((x) => ({ ...x, kategori: 'Fondsporteføljer' })),
    ...data.alternative.map((x) => ({ ...x, kategori: 'Alternative' }))
  ];
}

export default function AdminPage() {
  const [produkter, setProdukter] = useState(() => loadPensumProdukterFromStorage());
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [lastImportInfo, setLastImportInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const allProducts = useMemo(() => flattenProducts(produkter), [produkter]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatus('');
    setError('');

    try {
      const result = await importPensumExcel(file);

      setProdukter(result.produkter);
      savePensumProdukterToStorage(result.produkter);

      setLastImportInfo(result);
      setStatus(`Import fullført. ${result.updated.length} produkter oppdatert.`);
    } catch (err) {
      setError(err.message || 'Noe gikk galt under import.');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleReset = () => {
    resetPensumProdukterInStorage();
    setProdukter(STANDARD_PENSUM_PRODUKTER);
    setLastImportInfo(null);
    setStatus('Lokale admin-data er nullstilt.');
    setError('');
  };

  const handleReload = () => {
    const latest = loadPensumProdukterFromStorage();
    setProdukter(latest);
    setStatus('Data lastet fra nettleserens lagring.');
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', background: PENSUM_COLORS.lightGray, padding: '32px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            background: PENSUM_COLORS.navy,
            color: PENSUM_COLORS.white,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Pensum Admin</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
            Last opp månedlig Excel-fil og lagre oppdaterte tall for Pensum Løsninger.
          </p>
        </div>

        <div
          style={{
            background: PENSUM_COLORS.white,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h2 style={{ marginTop: 0, color: PENSUM_COLORS.navy }}>Importer Excel</h2>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <label
              style={{
                background: PENSUM_COLORS.teal,
                color: '#fff',
                padding: '12px 18px',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {isLoading ? 'Leser fil...' : 'Velg Excel-fil'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isLoading}
              />
            </label>

            <button
              onClick={handleReload}
              style={{
                background: '#fff',
                color: PENSUM_COLORS.navy,
                border: `1px solid ${PENSUM_COLORS.navy}`,
                padding: '12px 18px',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Last inn lagrede data
            </button>

            <button
              onClick={handleReset}
              style={{
                background: '#fff',
                color: PENSUM_COLORS.red,
                border: `1px solid ${PENSUM_COLORS.red}`,
                padding: '12px 18px',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Nullstill admin-data
            </button>
          </div>

          {status ? (
            <div
              style={{
                background: '#ECFDF5',
                color: PENSUM_COLORS.green,
                border: `1px solid #A7F3D0`,
                padding: 12,
                borderRadius: 10,
                marginBottom: 12
              }}
            >
              {status}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                background: '#FEF2F2',
                color: PENSUM_COLORS.red,
                border: `1px solid #FECACA`,
                padding: 12,
                borderRadius: 10,
                marginBottom: 12
              }}
            >
              {error}
            </div>
          ) : null}

          {lastImportInfo ? (
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: 16,
                borderRadius: 10
              }}
            >
              <div><strong>Ark:</strong> {lastImportInfo.sheetName}</div>
              <div><strong>Antall rader lest:</strong> {lastImportInfo.rowCount}</div>
              <div><strong>Oppdatert:</strong> {lastImportInfo.updated.length}</div>
              <div><strong>Hoppet over:</strong> {lastImportInfo.skipped.length}</div>

              {lastImportInfo.updated.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <strong>Oppdaterte produkter:</strong>
                  <ul style={{ margin: '8px 0 0 18px' }}>
                    {lastImportInfo.updated.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lastImportInfo.skipped.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <strong>Ikke matchet:</strong>
                  <ul style={{ margin: '8px 0 0 18px' }}>
                    {lastImportInfo.skipped.map((name, index) => (
                      <li key={`${name}-${index}`}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div
          style={{
            background: PENSUM_COLORS.white,
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h2 style={{ marginTop: 0, color: PENSUM_COLORS.navy }}>Gjeldende data</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={thStyle}>Kategori</th>
                  <th style={thStyle}>Navn</th>
                  <th style={thStyle}>2024</th>
                  <th style={thStyle}>2023</th>
                  <th style={thStyle}>2022</th>
                  <th style={thStyle}>2021</th>
                  <th style={thStyle}>2020</th>
                  <th style={thStyle}>Årlig 3 år</th>
                  <th style={thStyle}>Risiko 3 år</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.kategori}</td>
                    <td style={tdStyle}>{item.navn}</td>
                    <td style={tdStyle}>{formatPercent(item.aar2024)}</td>
                    <td style={tdStyle}>{formatPercent(item.aar2023)}</td>
                    <td style={tdStyle}>{formatPercent(item.aar2022)}</td>
                    <td style={tdStyle}>{formatPercent(item.aar2021)}</td>
                    <td style={tdStyle}>{formatPercent(item.aar2020)}</td>
                    <td style={tdStyle}>{formatPercent(item.aarlig3ar)}</td>
                    <td style={tdStyle}>{formatPercent(item.risiko3ar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: 16, color: '#64748B', fontSize: 13 }}>
            Denne siden lagrer data i nettleseren din. Neste steg er å koble hovedsiden til samme lagring.
          </p>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: '1px solid #E2E8F0',
  color: '#0D2240'
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #F1F5F9'
};
