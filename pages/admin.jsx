import { useEffect, useMemo, useState } from 'react';
import {
  STANDARD_PENSUM_PRODUKTER,
  importPensumExcel,
  loadPensumProdukterFromStorage,
  savePensumProdukterToStorage,
  resetPensumProdukterInStorage,
} from '../lib/pensumExcelImport';

const COLORS = {
  navy: '#0D2240',
  blue: '#1B3A5F',
  light: '#F5F7FA',
  border: '#E5E7EB',
  green: '#16A34A',
  red: '#DC2626',
  amber: '#D97706',
};

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '—';
  return `${Number(value).toFixed(1)}%`;
}

function ProduktTable({ title, items }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: COLORS.navy, color: 'white', padding: '14px 18px', fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: COLORS.light }}>
              <th style={th}>Navn</th>
              <th style={thRight}>2024</th>
              <th style={thRight}>2023</th>
              <th style={thRight}>2022</th>
              <th style={thRight}>2021</th>
              <th style={thRight}>2020</th>
              <th style={thRight}>Årlig 3 år</th>
              <th style={thRight}>Risiko 3 år</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ background: idx % 2 === 0 ? 'white' : '#FAFAFA' }}>
                <td style={tdName}>{item.navn}</td>
                <td style={tdRight}>{formatPercent(item.aar2024)}</td>
                <td style={tdRight}>{formatPercent(item.aar2023)}</td>
                <td style={tdRight}>{formatPercent(item.aar2022)}</td>
                <td style={tdRight}>{formatPercent(item.aar2021)}</td>
                <td style={tdRight}>{formatPercent(item.aar2020)}</td>
                <td style={tdRight}>{formatPercent(item.aarlig3ar)}</td>
                <td style={tdRight}>{formatPercent(item.risiko3ar)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  textAlign: 'left',
  padding: '12px 14px',
  borderBottom: `1px solid ${COLORS.border}`,
  color: COLORS.blue,
  fontWeight: 700,
};

const thRight = {
  ...th,
  textAlign: 'right',
};

const tdName = {
  padding: '10px 14px',
  borderBottom: `1px solid ${COLORS.border}`,
  color: COLORS.blue,
  fontWeight: 600,
};

const tdRight = {
  padding: '10px 14px',
  borderBottom: `1px solid ${COLORS.border}`,
  textAlign: 'right',
  color: '#374151',
};

export default function AdminPage() {
  const [produkter, setProdukter] = useState(STANDARD_PENSUM_PRODUKTER);
  const [status, setStatus] = useState('Klar');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const data = loadPensumProdukterFromStorage();
    setProdukter(data);
  }, []);

  const totalAntall = useMemo(() => {
    return (
      produkter.enkeltfond.length +
      produkter.fondsportefoljer.length +
      produkter.alternative.length
    );
  }, [produkter]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBusy(true);
    setStatus('Leser Excel-fil ...');

    try {
      const imported = await importPensumExcel(file);
      setProdukter(imported);
      savePensumProdukterToStorage(imported);
      setStatus(`Import fullført: ${file.name}`);
    } catch (err) {
      console.error(err);
      setStatus('Feil ved import av Excel-fil');
      alert('Kunne ikke lese Excel-filen. Sjekk formatet og prøv igjen.');
    } finally {
      setIsBusy(false);
      e.target.value = '';
    }
  }

  function handleReset() {
    const ok = window.confirm('Vil du nullstille til standarddata?');
    if (!ok) return;

    const resetData = resetPensumProdukterInStorage();
    setProdukter(resetData);
    setStatus('Nullstilt til standarddata');
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.light, padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, color: COLORS.navy }}>Admin 2.0</h1>
          <p style={{ marginTop: 8, marginBottom: 0, color: '#6B7280' }}>
            Last opp månedlig Excel-fil for å oppdatere tall i Pensum Løsninger.
          </p>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: COLORS.navy,
                color: 'white',
                borderRadius: 10,
                cursor: isBusy ? 'not-allowed' : 'pointer',
                opacity: isBusy ? 0.7 : 1,
                fontWeight: 600,
              }}
            >
              Last opp Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isBusy}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={handleReset}
              style={{
                padding: '12px 16px',
                background: 'white',
                color: COLORS.red,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Nullstill
            </button>

            <div
              style={{
                padding: '12px 16px',
                background: '#F9FAFB',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                color: '#374151',
              }}
            >
              Status: <strong>{status}</strong>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={card}>
            <div style={cardLabel}>Totalt produkter</div>
            <div style={cardValue}>{totalAntall}</div>
          </div>
          <div style={card}>
            <div style={cardLabel}>Enkeltfond</div>
            <div style={cardValue}>{produkter.enkeltfond.length}</div>
          </div>
          <div style={card}>
            <div style={cardLabel}>Fondsporteføljer</div>
            <div style={cardValue}>{produkter.fondsportefoljer.length}</div>
          </div>
          <div style={card}>
            <div style={cardLabel}>Alternative</div>
            <div style={cardValue}>{produkter.alternative.length}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <ProduktTable title="Enkeltfond" items={produkter.enkeltfond} />
          <ProduktTable title="Fondsporteføljer" items={produkter.fondsportefoljer} />
          <ProduktTable title="Alternative investeringer" items={produkter.alternative} />
        </div>
      </div>
    </div>
  );
}

const card = {
  background: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: 18,
};

const cardLabel = {
  fontSize: 13,
  color: '#6B7280',
  marginBottom: 8,
};

const cardValue = {
  fontSize: 28,
  fontWeight: 800,
  color: COLORS.navy,
};
