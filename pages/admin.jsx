import React, { useEffect, useState } from 'react';
import {
  STANDARD_PENSUM_PRODUKTER,
  importPensumExcel,
  loadPensumProdukterFromStorage,
  resetPensumProdukterInStorage
} from '../lib/pensumExcelImport';

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [produkter, setProdukter] = useState(STANDARD_PENSUM_PRODUKTER);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    setMounted(true);
    try {
      const data = loadPensumProdukterFromStorage();
      setProdukter(data);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke laste admin-data.');
    }
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('Laster inn Excel-fil...');
    setError('');
    setImportResult(null);

    try {
      const result = await importPensumExcel(file);
      setProdukter(result.produkter);
      setImportResult(result);
      setStatus(`Ferdig. Oppdaterte ${result.oppdaterte} produkt(er).`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Noe gikk galt ved import.');
      setStatus('');
    }

    e.target.value = '';
  }

  function handleReset() {
    try {
      const resetData = resetPensumProdukterInStorage();
      setProdukter(resetData);
      setImportResult(null);
      setError('');
      setStatus('Data er nullstilt til standardverdier.');
    } catch (err) {
      console.error(err);
      setError('Kunne ikke nullstille data.');
    }
  }

  function renderRows(list) {
    return list.map((p) => (
      <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
        <td style={td}>{p.navn}</td>
        <td style={tdCenter}>{p.aar2024 ?? '—'}</td>
        <td style={tdCenter}>{p.aar2023 ?? '—'}</td>
        <td style={tdCenter}>{p.aar2022 ?? '—'}</td>
        <td style={tdCenter}>{p.aar2021 ?? '—'}</td>
        <td style={tdCenter}>{p.aar2020 ?? '—'}</td>
        <td style={tdCenter}>{p.aarlig3ar ?? p.forventetAvkastning ?? '—'}</td>
        <td style={tdCenter}>{p.risiko3ar ?? '—'}</td>
      </tr>
    ));
  }

  if (!mounted) {
    return <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>Laster admin...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={card}>
          <h1 style={{ marginTop: 0, color: '#0D2240' }}>Pensum admin</h1>
          <p style={{ color: '#475569', marginTop: 8 }}>
            Last opp månedlig Excel-fil for å oppdatere tallene som lagres lokalt i nettleseren.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <label style={primaryButton}>
              Last opp Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>

            <button onClick={handleReset} style={secondaryButton}>
              Nullstill til standard
            </button>
          </div>

          {status && <div style={successBox}>{status}</div>}
          {error && <div style={errorBox}>{error}</div>}

          {importResult && (
            <div style={infoBox}>
              <div><strong>Oppdaterte produkter:</strong> {importResult.oppdaterte}</div>
              {importResult.ikkeMatchet?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Ikke matchet i filen:</strong> {importResult.ikkeMatchet.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Enkeltfond</h2>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={thLeft}>Navn</th>
                  <th style={th}>2024</th>
                  <th style={th}>2023</th>
                  <th style={th}>2022</th>
                  <th style={th}>2021</th>
                  <th style={th}>2020</th>
                  <th style={th}>Årlig 3 år</th>
                  <th style={th}>Risiko 3 år</th>
                </tr>
              </thead>
              <tbody>{renderRows(produkter.enkeltfond)}</tbody>
            </table>
          </div>
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Fondsporteføljer</h2>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={thLeft}>Navn</th>
                  <th style={th}>2024</th>
                  <th style={th}>2023</th>
                  <th style={th}>2022</th>
                  <th style={th}>2021</th>
                  <th style={th}>2020</th>
                  <th style={th}>Årlig 3 år</th>
                  <th style={th}>Risiko 3 år</th>
                </tr>
              </thead>
              <tbody>{renderRows(produkter.fondsportefoljer)}</tbody>
            </table>
          </div>
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Alternative investeringer</h2>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={thLeft}>Navn</th>
                  <th style={th}>2024</th>
                  <th style={th}>2023</th>
                  <th style={th}>2022</th>
                  <th style={th}>2021</th>
                  <th style={th}>2020</th>
                  <th style={th}>Årlig / forventet</th>
                  <th style={th}>Risiko 3 år</th>
                </tr>
              </thead>
              <tbody>{renderRows(produkter.alternative)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: '#ffffff',
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 16,
  color: '#0D2240'
};

const tableWrap = {
  overflowX: 'auto'
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14
};

const th = {
  background: '#0D2240',
  color: '#ffffff',
  padding: '10px 12px',
  textAlign: 'center',
  whiteSpace: 'nowrap'
};

const thLeft = {
  ...th,
  textAlign: 'left'
};

const td = {
  padding: '10px 12px',
  color: '#0D2240'
};

const tdCenter = {
  ...td,
  textAlign: 'center'
};

const primaryButton = {
  display: 'inline-block',
  background: '#0D2240',
  color: '#ffffff',
  padding: '10px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600
};

const secondaryButton = {
  background: '#e5e7eb',
  color: '#111827',
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600
};

const successBox = {
  marginTop: 16,
  padding: 12,
  borderRadius: 8,
  background: '#dcfce7',
  color: '#166534'
};

const errorBox = {
  marginTop: 16,
  padding: 12,
  borderRadius: 8,
  background: '#fee2e2',
  color: '#991b1b'
};

const infoBox = {
  marginTop: 16,
  padding: 12,
  borderRadius: 8,
  background: '#dbeafe',
  color: '#1e3a8a'
};
