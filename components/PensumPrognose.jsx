import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PENSUM_LOGO = 'data:image/webp;base64,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';

const PENSUM_COLORS = {
  navy: '#0D2240', darkBlue: '#1B3A5F', lightBlue: '#5B9BD5', salmon: '#D4886B',
  gray: '#A6A6A6', darkGray: '#6B7280', lightGray: '#F5F7FA', white: '#FFFFFF',
  green: '#2E7D32', red: '#C62828', gold: '#B8860B', teal: '#0D9488', purple: '#7C3AED'
};

const CATEGORY_COLORS = { aksjer: '#0D2240', renter: '#D4886B', privateMarkets: '#0D9488', eiendom: '#B8860B' };
const ASSET_COLORS = { 'Globale Aksjer': '#5B9BD5', 'Norske Aksjer': '#0D2240', 'Høyrente': '#D4886B', 'Investment Grade': '#E8A690', 'Private Equity': '#0D9488', 'Eiendom': '#B8860B' };
const ASSET_COLORS_LIGHT = { 'Globale Aksjer': '#93C5FD', 'Norske Aksjer': '#60A5FA', 'Høyrente': '#FDBA74', 'Investment Grade': '#FED7AA', 'Private Equity': '#5EEAD4', 'Eiendom': '#FDE047' };

const formatCurrency = (v) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(v);
const formatNumber = (v) => new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(v);
const formatPercent = (v) => v.toFixed(1) + '%';
const formatDateEuro = (d) => { const dt = new Date(d); return dt.getDate().toString().padStart(2,'0') + '.' + (dt.getMonth()+1).toString().padStart(2,'0') + '.' + dt.getFullYear(); };

const RISK_PROFILES = {
  'Defensiv': { aksjer: 30, renter: 70, hoyrenteAndel: 75 },
  'Moderat': { aksjer: 50, renter: 50, hoyrenteAndel: 75 },
  'Dynamisk': { aksjer: 70, renter: 30, hoyrenteAndel: 100 },
  'Offensiv': { aksjer: 100, renter: 0, hoyrenteAndel: 100 }
};

function beregnAllokering(likvid, pe, eiendom, profilNavn) {
  const total = likvid + pe + eiendom;
  if (total === 0) {
    // Returner standard allokering med 0 vekt, men med alle aktivaklasser
    return [
      { navn: 'Globale Aksjer', vekt: 0, avkastning: 9, kategori: 'aksjer' },
      { navn: 'Norske Aksjer', vekt: 0, avkastning: 10, kategori: 'aksjer' },
      { navn: 'Høyrente', vekt: 0, avkastning: 8, kategori: 'renter' },
      { navn: 'Investment Grade', vekt: 0, avkastning: 5, kategori: 'renter' },
      { navn: 'Private Equity', vekt: 0, avkastning: 15, kategori: 'privateMarkets' },
      { navn: 'Eiendom', vekt: 0, avkastning: 8, kategori: 'eiendom' }
    ];
  }
  const profile = RISK_PROFILES[profilNavn];
  const aksjeAndel = (likvid * profile.aksjer / 100) / total * 100;
  const renteAndel = (likvid * profile.renter / 100) / total * 100;
  const peAndel = pe > 0 ? (pe / total) * 100 : 0;
  const eiendomAndel = eiendom > 0 ? (eiendom / total) * 100 : 0;
  
  // Alltid inkluder alle aktivaklasser, men med 0 vekt hvis ikke relevant
  return [
    { navn: 'Globale Aksjer', vekt: parseFloat((aksjeAndel * 0.75).toFixed(1)), avkastning: 9, kategori: 'aksjer' },
    { navn: 'Norske Aksjer', vekt: parseFloat((aksjeAndel * 0.25).toFixed(1)), avkastning: 10, kategori: 'aksjer' },
    { navn: 'Høyrente', vekt: parseFloat((renteAndel * profile.hoyrenteAndel / 100).toFixed(1)), avkastning: 8, kategori: 'renter' },
    { navn: 'Investment Grade', vekt: parseFloat((renteAndel * (100 - profile.hoyrenteAndel) / 100).toFixed(1)), avkastning: 5, kategori: 'renter' },
    { navn: 'Private Equity', vekt: parseFloat(peAndel.toFixed(1)), avkastning: 15, kategori: 'privateMarkets' },
    { navn: 'Eiendom', vekt: parseFloat(eiendomAndel.toFixed(1)), avkastning: 8, kategori: 'eiendom' }
  ];
}



const DEFAULT_PENSUM_PRODUKTER = {
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
const PENSUM_PRODUCT_STORAGE_KEY = 'pensum_admin_produkter_v1';
const ADMIN_PASSCODE = 'Pensum2026!';

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const normalizeText = (value) => (value || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
const toNumeric = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined || value === '') return null;
  const cleaned = value.toString().replace(/\s/g, '').replace('%','').replace(',', '.');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
};
const toDateValue = (raw) => {
  if (!raw && raw !== 0) return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === 'number') {
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
};
const nearestPointOnOrBefore = (points, targetDate) => {
  let candidate = null;
  for (const point of points) {
    if (point.date <= targetDate) candidate = point;
    else break;
  }
  return candidate;
};
const calculateFeedMetrics = (points) => {
  if (!points || points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.date - b.date);
  const latest = sorted[sorted.length - 1];
  const result = {
    aar2024: null,
    aar2023: null,
    aar2022: null,
    aar2021: null,
    aar2020: null,
    aarlig3ar: null,
    risiko3ar: null,
    sistOppdatert: latest?.date ? latest.date.toISOString().split('T')[0] : null
  };
  [2024, 2023, 2022, 2021, 2020].forEach((year) => {
    const withinYear = sorted.filter((p) => p.date.getFullYear() === year);
    if (withinYear.length >= 2) {
      const start = withinYear[0].value;
      const end = withinYear[withinYear.length - 1].value;
      if (start > 0 && end > 0) {
        result['aar' + year] = ((end / start) - 1) * 100;
      }
    }
  });
  const threeYearBack = new Date(latest.date);
  threeYearBack.setFullYear(threeYearBack.getFullYear() - 3);
  const start3y = nearestPointOnOrBefore(sorted, threeYearBack) || sorted[0];
  if (start3y && start3y.value > 0 && latest.value > 0) {
    const days = Math.max(1, (latest.date - start3y.date) / (1000 * 60 * 60 * 24));
    const years = days / 365.25;
    if (years >= 1) {
      result.aarlig3ar = (Math.pow(latest.value / start3y.value, 1 / years) - 1) * 100;
    }
  }
  const monthlyReturns = [];
  const lookback = new Date(latest.date);
  lookback.setFullYear(lookback.getFullYear() - 3);
  const recentPoints = sorted.filter((p) => p.date >= lookback);
  for (let i = 1; i < recentPoints.length; i++) {
    const prev = recentPoints[i - 1].value;
    const curr = recentPoints[i].value;
    if (prev > 0 && curr > 0) {
      monthlyReturns.push((curr / prev) - 1);
    }
  }
  if (monthlyReturns.length >= 6) {
    const mean = monthlyReturns.reduce((sum, v) => sum + v, 0) / monthlyReturns.length;
    const variance = monthlyReturns.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / monthlyReturns.length;
    result.risiko3ar = Math.sqrt(variance) * Math.sqrt(12) * 100;
  }
  return result;
};
const findProductByName = (products, incomingName) => {
  const target = normalizeText(incomingName);
  if (!target) return null;
  let match = products.find((p) => normalizeText(p.navn) === target);
  if (match) return match;
  match = products.find((p) => normalizeText(p.navn).includes(target) || target.includes(normalizeText(p.navn)));
  return match || null;
};
const DEFAULT_LIKVID = 8000000;  // 3 mill aksjefond + 1 mill aksjer + 2 mill renter + 2 mill kontanter
const DEFAULT_PE = 1000000;
const DEFAULT_EIENDOM = 1000000;

export default function PensumPrognoseModell() {
  const [activeTab, setActiveTab] = useState('input');
  const [showPessimistic, setShowPessimistic] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({ aksjer: false, renter: false });
  const [expandedKundeKategorier, setExpandedKundeKategorier] = useState({ likvide: true, illikvide: true, pe: false, eiendom: false });

  const [kundeNavn, setKundeNavn] = useState('');
  const [risikoprofil, setRisikoprofil] = useState('Moderat');
  const [horisont, setHorisont] = useState(10);
  const [localHorisont, setLocalHorisont] = useState('10');
  const [radgiver, setRadgiver] = useState('');
  const [dato, setDato] = useState(new Date().toISOString().split('T')[0]);
  
  // Standardverdier: 10 mill totalt (8 mill likvid + 1 mill PE + 1 mill eiendom)
  const [aksjerKunde, setAksjerKunde] = useState(1000000);       // 1 mill
  const [aksjefondKunde, setAksjefondKunde] = useState(3000000); // 3 mill
  const [renterKunde, setRenterKunde] = useState(2000000);       // 2 mill
  const [kontanterKunde, setKontanterKunde] = useState(2000000); // 2 mill
  const [peFondKunde, setPeFondKunde] = useState(1000000);       // 1 mill
  const [unoterteAksjerKunde, setUnoterteAksjerKunde] = useState(0);
  const [shippingKunde, setShippingKunde] = useState(0);
  const [egenEiendomKunde, setEgenEiendomKunde] = useState(1000000); // 1 mill
  const [eiendomSyndikatKunde, setEiendomSyndikatKunde] = useState(0);
  const [eiendomFondKunde, setEiendomFondKunde] = useState(0);
  const [innskudd, setInnskudd] = useState(0);
  const [uttak, setUttak] = useState(0);
  
  const [scenarioParams, setScenarioParams] = useState({ pessimistisk: -2, optimistisk: 12 });
  const [sammenligningProfil, setSammenligningProfil] = useState('Offensiv');
  const [sammenligningAllokering, setSammenligningAllokering] = useState(() => beregnAllokering(DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_EIENDOM, 'Offensiv'));
  const [allokering, setAllokering] = useState(() => beregnAllokering(DEFAULT_LIKVID, DEFAULT_PE, DEFAULT_EIENDOM, 'Moderat'));

  // Rebalansering - årlig endring i allokering
  const [rebalanseringAktiv, setRebalanseringAktiv] = useState(false);
  const [rebalansering, setRebalansering] = useState({
    fraAktiva: 'Eiendom',
    tilAktiva: 'Globale Aksjer',
    prosentPerAar: 10
  });

  // Lagring av kunder - bruker window.storage API (Claude's persistent storage)
  const [lagredeKunder, setLagredeKunder] = useState([]);
  const [aktivKundeId, setAktivKundeId] = useState(null);
  const [visKundeliste, setVisKundeliste] = useState(false);
  const [lagringsStatus, setLagringsStatus] = useState('');
  const [visAdminPanel, setVisAdminPanel] = useState(false);
  const [adminUnlockValue, setAdminUnlockValue] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');


  // Pensum Løsninger - fond og mandater med historisk avkastning
  // aktivatype: 'aksje', 'rente' eller 'alternativ'
  // likviditet: 'likvid' eller 'illikvid'
  const [pensumProdukter, setPensumProdukter] = useState(() => deepClone(DEFAULT_PENSUM_PRODUKTER));

  // Innstillinger for Pensum Løsninger
  const [visAlternative, setVisAlternative] = useState(false);
  const [brukBasis, setBrukBasis] = useState(true);

  // Porteføljeallokering for Pensum-produkter
  const [pensumAllokering, setPensumAllokering] = useState([
    { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 40, kategori: 'fondsportefoljer' },
    { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 30, kategori: 'fondsportefoljer' },
    { id: 'norge-a', navn: 'Pensum Norge A', vekt: 20, kategori: 'enkeltfond' },
    { id: 'energy-a', navn: 'Pensum Global Energy A', vekt: 10, kategori: 'enkeltfond' }
  ]);

  // Standardporteføljer MED Basis
  const pensumStandardPortefoljerMedBasis = {
    'Defensiv': [
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 50, kategori: 'fondsportefoljer' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 30, kategori: 'fondsportefoljer' },
      { id: 'basis', navn: 'Pensum Basis', vekt: 20, kategori: 'fondsportefoljer' }
    ],
    'Moderat': [
      { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 30, kategori: 'fondsportefoljer' },
      { id: 'basis', navn: 'Pensum Basis', vekt: 30, kategori: 'fondsportefoljer' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 25, kategori: 'fondsportefoljer' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 15, kategori: 'fondsportefoljer' }
    ],
    'Dynamisk': [
      { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 40, kategori: 'fondsportefoljer' },
      { id: 'basis', navn: 'Pensum Basis', vekt: 25, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 20, kategori: 'enkeltfond' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 15, kategori: 'fondsportefoljer' }
    ],
    'Offensiv': [
      { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 45, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 25, kategori: 'enkeltfond' },
      { id: 'basis', navn: 'Pensum Basis', vekt: 15, kategori: 'fondsportefoljer' },
      { id: 'energy-a', navn: 'Pensum Global Energy A', vekt: 15, kategori: 'enkeltfond' }
    ]
  };

  // Standardporteføljer UTEN Basis
  const pensumStandardPortefoljerUtenBasis = {
    'Defensiv': [
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 55, kategori: 'fondsportefoljer' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 35, kategori: 'fondsportefoljer' },
      { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 10, kategori: 'fondsportefoljer' }
    ],
    'Moderat': [
      { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 35, kategori: 'fondsportefoljer' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 35, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 20, kategori: 'enkeltfond' },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', vekt: 10, kategori: 'fondsportefoljer' }
    ],
    'Dynamisk': [
      { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 50, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 25, kategori: 'enkeltfond' },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', vekt: 25, kategori: 'fondsportefoljer' }
    ],
    'Offensiv': [
      { id: 'globale-aksjer', navn: 'Pensum Globale Aksjer', vekt: 50, kategori: 'fondsportefoljer' },
      { id: 'norge-a', navn: 'Pensum Norge A', vekt: 30, kategori: 'enkeltfond' },
      { id: 'energy-a', navn: 'Pensum Global Energy A', vekt: 20, kategori: 'enkeltfond' }
    ]
  };

  // Velg riktig porteføljesett basert på brukBasis
  const pensumStandardPortefoljer = brukBasis ? pensumStandardPortefoljerMedBasis : pensumStandardPortefoljerUtenBasis;

  const [valgtPensumProfil, setValgtPensumProfil] = useState('Moderat');
  
  const velgPensumStandardPortefolje = (profil) => {
    setValgtPensumProfil(profil);
    setPensumAllokering(pensumStandardPortefoljer[profil]);
  };

  const leggTilPensumProdukt = (produkt, kategori) => {
    if (!pensumAllokering.find(p => p.id === produkt.id)) {
      setPensumAllokering(prev => [...prev, { id: produkt.id, navn: produkt.navn, vekt: 0, kategori }]);
    }
  };

  const fjernPensumProdukt = (id) => {
    setPensumAllokering(prev => prev.filter(p => p.id !== id));
  };

  const oppdaterPensumVekt = (id, nyVekt) => {
    setPensumAllokering(prev => prev.map(p => p.id === id ? { ...p, vekt: Math.max(0, Math.min(100, nyVekt)) } : p));
  };

  const pensumTotalVekt = pensumAllokering.reduce((s, p) => s + p.vekt, 0);

  // Beregn vektet historisk avkastning
  const beregnPensumHistorikk = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    const aarKolonner = ['aar2024', 'aar2023', 'aar2022', 'aar2021', 'aar2020'];
    const resultat = {};
    
    aarKolonner.forEach(aar => {
      let vektetSum = 0;
      let totalVekt = 0;
      pensumAllokering.forEach(allok => {
        const produkt = alleProdukt.find(p => p.id === allok.id);
        if (produkt && allok.vekt > 0) {
          // For alternative investeringer, bruk forventet avkastning
          const avkastning = produkt[aar] !== null ? produkt[aar] : (produkt.forventetAvkastning || null);
          if (avkastning !== null) {
            vektetSum += avkastning * allok.vekt;
            totalVekt += allok.vekt;
          }
        }
      });
      resultat[aar] = totalVekt > 0 ? vektetSum / totalVekt : null;
    });
    
    return resultat;
  }, [pensumAllokering, pensumProdukter]);

  // Beregn aktivafordeling (aksjer vs renter vs alternativer)
  const pensumAktivafordeling = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    let aksjeVekt = 0;
    let renteVekt = 0;
    let alternativVekt = 0;
    let blandetVekt = 0;
    
    pensumAllokering.forEach(allok => {
      const produkt = alleProdukt.find(p => p.id === allok.id);
      if (produkt && allok.vekt > 0) {
        if (produkt.aktivatype === 'aksje') {
          aksjeVekt += allok.vekt;
        } else if (produkt.aktivatype === 'rente') {
          renteVekt += allok.vekt;
        } else if (produkt.aktivatype === 'alternativ') {
          alternativVekt += allok.vekt;
        } else if (produkt.aktivatype === 'blandet') {
          blandetVekt += allok.vekt;
        }
      }
    });
    
    return [
      { name: 'Aksjer', value: aksjeVekt, color: PENSUM_COLORS.darkBlue },
      { name: 'Renter', value: renteVekt, color: PENSUM_COLORS.salmon },
      { name: 'Alternativer', value: alternativVekt, color: PENSUM_COLORS.teal },
      { name: 'Blandet', value: blandetVekt, color: PENSUM_COLORS.gold }
    ];
  }, [pensumAllokering, pensumProdukter]);

  // Beregn likviditetsfordeling
  const pensumLikviditet = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    let likvidVekt = 0;
    let illikvidVekt = 0;
    
    pensumAllokering.forEach(allok => {
      const produkt = alleProdukt.find(p => p.id === allok.id);
      if (produkt && allok.vekt > 0) {
        if (produkt.likviditet === 'likvid') {
          likvidVekt += allok.vekt;
        } else if (produkt.likviditet === 'illikvid') {
          illikvidVekt += allok.vekt;
        }
      }
    });
    
    return { likvid: likvidVekt, illikvid: illikvidVekt };
  }, [pensumAllokering, pensumProdukter]);

  // Beregn forventet avkastning for Pensum-portefølje
  const pensumForventetAvkastning = useMemo(() => {
    const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
    let vektetSum = 0;
    let totalVekt = 0;
    
    pensumAllokering.forEach(allok => {
      const produkt = alleProdukt.find(p => p.id === allok.id);
      if (produkt && allok.vekt > 0) {
        // Bruk 3-års annualisert eller forventet avkastning
        const avkastning = produkt.aarlig3ar || produkt.forventetAvkastning || produkt.aar2024 || 0;
        vektetSum += avkastning * allok.vekt;
        totalVekt += allok.vekt;
      }
    });
    
    return totalVekt > 0 ? vektetSum / totalVekt : 0;
  }, [pensumAllokering, pensumProdukter]);

  const likvideTotal = aksjerKunde + aksjefondKunde + renterKunde + kontanterKunde;
  const peTotal = peFondKunde + unoterteAksjerKunde + shippingKunde;
  const eiendomTotal = egenEiendomKunde + eiendomSyndikatKunde + eiendomFondKunde;
  const illikvideTotal = peTotal + eiendomTotal;
  const totalKapital = likvideTotal + illikvideTotal;
  const nettoKontantstrom = innskudd - uttak;

  // Beregn prognose for Pensum-portefølje
  const pensumPrognose = useMemo(() => {
    const avkastning = pensumForventetAvkastning / 100;
    const prognose = [];
    let verdi = totalKapital;
    
    for (let i = 0; i <= horisont; i++) {
      prognose.push({
        year: new Date().getFullYear() + i,
        verdi: Math.round(verdi)
      });
      verdi = verdi * (1 + avkastning);
    }
    
    return prognose;
  }, [pensumForventetAvkastning, totalKapital, horisont]);
  
  const valgtLosning = null; // Fjernet gammel state

  // Last lagrede kunder ved oppstart
  useEffect(() => {
    const lastKunder = async () => {
      if (radgiver) {
        const storageKey = 'pensum_kunder_' + radgiver.toLowerCase().replace(/\s+/g, '_');
        try {
          // Prøv window.storage først (Claude's persistent storage)
          if (window.storage && window.storage.get) {
            const result = await window.storage.get(storageKey);
            if (result && result.value) {
              setLagredeKunder(JSON.parse(result.value));
              return;
            }
          }
        } catch (e) {
          console.log('Storage not available:', e);
        }
        // Fallback: ingen lagrede kunder
        setLagredeKunder([]);
      }
    };
    lastKunder();
  }, [radgiver]);

  // Hent alle data som objekt
  const getKundeData = useCallback(() => ({
    id: aktivKundeId || Date.now().toString(),
    kundeNavn,
    radgiver,
    dato,
    risikoprofil,
    horisont,
    aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde,
    peFondKunde, unoterteAksjerKunde, shippingKunde,
    egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde,
    innskudd, uttak,
    allokering,
    scenarioParams,
    sistEndret: new Date().toISOString()
  }), [aktivKundeId, kundeNavn, radgiver, dato, risikoprofil, horisont, aksjerKunde, aksjefondKunde, renterKunde, kontanterKunde, peFondKunde, unoterteAksjerKunde, shippingKunde, egenEiendomKunde, eiendomSyndikatKunde, eiendomFondKunde, innskudd, uttak, allokering, scenarioParams]);

  // Last inn kundedata
  const lastKundeData = useCallback((data) => {
    setAktivKundeId(data.id);
    setKundeNavn(data.kundeNavn || '');
    setDato(data.dato || new Date().toISOString().split('T')[0]);
    setRisikoprofil(data.risikoprofil || 'Moderat');
    setHorisont(data.horisont || 10);
    setLocalHorisont((data.horisont || 10).toString());
    setAksjerKunde(data.aksjerKunde || 0);
    setAksjefondKunde(data.aksjefondKunde || 0);
    setRenterKunde(data.renterKunde || 0);
    setKontanterKunde(data.kontanterKunde || 0);
    setPeFondKunde(data.peFondKunde || 0);
    setUnoterteAksjerKunde(data.unoterteAksjerKunde || 0);
    setShippingKunde(data.shippingKunde || 0);
    setEgenEiendomKunde(data.egenEiendomKunde || 0);
    setEiendomSyndikatKunde(data.eiendomSyndikatKunde || 0);
    setEiendomFondKunde(data.eiendomFondKunde || 0);
    setInnskudd(data.innskudd || 0);
    setUttak(data.uttak || 0);
    if (data.allokering) setAllokering(data.allokering);
    if (data.scenarioParams) setScenarioParams(data.scenarioParams);
    setVisKundeliste(false);
    setActiveTab('input');
  }, []);

  // Lagre kunde
  const lagreKunde = useCallback(async () => {
    if (!radgiver) {
      alert('Vennligst fyll inn rådgivernavn først');
      return;
    }
    if (!kundeNavn) {
      alert('Vennligst fyll inn kundenavn først');
      return;
    }
    const storageKey = 'pensum_kunder_' + radgiver.toLowerCase().replace(/\s+/g, '_');
    const kundeData = getKundeData();
    
    let oppdatertListe;
    const eksisterendeIndex = lagredeKunder.findIndex(k => k.id === kundeData.id);
    if (eksisterendeIndex >= 0) {
      oppdatertListe = [...lagredeKunder];
      oppdatertListe[eksisterendeIndex] = kundeData;
    } else {
      oppdatertListe = [...lagredeKunder, kundeData];
    }
    
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set(storageKey, JSON.stringify(oppdatertListe));
        setLagredeKunder(oppdatertListe);
        setAktivKundeId(kundeData.id);
        setLagringsStatus('Lagret!');
        setTimeout(() => setLagringsStatus(''), 2000);
      } else {
        throw new Error('Storage not available');
      }
    } catch (e) {
      // Fallback: tilby nedlasting av fil
      setLagredeKunder(oppdatertListe);
      setAktivKundeId(kundeData.id);
      alert('Automatisk lagring er ikke tilgjengelig i denne nettleseren. Bruk "Eksporter" for å lagre kunden som fil.');
    }
  }, [radgiver, kundeNavn, getKundeData, lagredeKunder]);

  // Slett kunde
  const slettKunde = useCallback(async (id) => {
    if (!confirm('Er du sikker på at du vil slette denne kunden?')) return;
    const storageKey = 'pensum_kunder_' + radgiver.toLowerCase().replace(/\s+/g, '_');
    const oppdatertListe = lagredeKunder.filter(k => k.id !== id);
    
    try {
      if (window.storage && window.storage.set) {
        await window.storage.set(storageKey, JSON.stringify(oppdatertListe));
      }
    } catch (e) {
      console.log('Could not save to storage:', e);
    }
    
    setLagredeKunder(oppdatertListe);
    if (aktivKundeId === id) setAktivKundeId(null);
  }, [radgiver, lagredeKunder, aktivKundeId]);

  // Ny kunde
  const nyKunde = useCallback(() => {
    setAktivKundeId(null);
    setKundeNavn('');
    setDato(new Date().toISOString().split('T')[0]);
    setRisikoprofil('Moderat');
    setHorisont(10);
    setLocalHorisont('10');
    setAksjerKunde(0);
    setAksjefondKunde(0);
    setRenterKunde(0);
    setKontanterKunde(0);
    setPeFondKunde(0);
    setUnoterteAksjerKunde(0);
    setShippingKunde(0);
    setEgenEiendomKunde(0);
    setEiendomSyndikatKunde(0);
    setEiendomFondKunde(0);
    setInnskudd(0);
    setUttak(0);
    setAllokering(beregnAllokering(0, 0, 0, 'Moderat'));
    setVisKundeliste(false);
    setActiveTab('input');
  }, []);

  // Eksporter til fil
  const eksporterKunde = useCallback(() => {
    const data = getKundeData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Kunde_' + (kundeNavn || 'ukjent').replace(/[^a-zA-Z0-9æøåÆØÅ]/g, '_') + '.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [getKundeData, kundeNavn]);

  // Importer fra fil
  const importerKunde = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        data.id = Date.now().toString(); // Ny ID for importert kunde
        lastKundeData(data);
        alert('Kunde importert! Husk å lagre for å beholde endringene.');
      } catch (err) {
        alert('Kunne ikke lese filen. Sjekk at det er en gyldig JSON-fil.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [lastKundeData]);


  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem(PENSUM_PRODUCT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.enkeltfond && parsed.fondsportefoljer && parsed.alternative) {
          setPensumProdukter(parsed);
        }
      }
    } catch (e) {
      console.log('Kunne ikke lese admin-data:', e);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(PENSUM_PRODUCT_STORAGE_KEY, JSON.stringify(pensumProdukter));
    } catch (e) {
      console.log('Kunne ikke lagre admin-data:', e);
    }
  }, [pensumProdukter]);

  const unlockAdmin = useCallback(() => {
    if (adminUnlockValue === ADMIN_PASSCODE) {
      setAdminUnlocked(true);
      setAdminStatus('Adminmodus aktivert');
      setAdminUnlockValue('');
    } else {
      setAdminStatus('Feil passord');
    }
    setTimeout(() => setAdminStatus(''), 2500);
  }, [adminUnlockValue]);

  const lockAdmin = useCallback(() => {
    setAdminUnlocked(false);
    setVisAdminPanel(false);
    setAdminUnlockValue('');
    setAdminStatus('');
  }, []);

  const updatePensumProduktField = useCallback((kategori, id, field, value) => {
    setPensumProdukter(prev => ({
      ...prev,
      [kategori]: prev[kategori].map(item => item.id === id ? {
        ...item,
        [field]: ['forventetAvkastning', 'aarlig3ar', 'risiko3ar', 'aar2024', 'aar2023', 'aar2022', 'aar2021', 'aar2020'].includes(field)
          ? toNumeric(value)
          : value
      } : item)
    }));
  }, []);

  const resetPensumProdukterTilDefault = useCallback(() => {
    if (!confirm('Tilbakestille alle Pensum-produkter til standardverdier?')) return;
    setPensumProdukter(deepClone(DEFAULT_PENSUM_PRODUKTER));
    setAdminStatus('Standardverdier gjenopprettet');
    setTimeout(() => setAdminStatus(''), 2500);
  }, []);

  const eksportPensumProdukter = useCallback(() => {
    const blob = new Blob([JSON.stringify(pensumProdukter, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pensum-produkter-admin.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [pensumProdukter]);

  const importerPensumProdukterJson = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed?.enkeltfond || !parsed?.fondsportefoljer || !parsed?.alternative) throw new Error('Ugyldig fil');
        setPensumProdukter(parsed);
        setAdminStatus('Produktoppsett importert');
      } catch (err) {
        setAdminStatus('Kunne ikke lese JSON-fil');
      }
      setTimeout(() => setAdminStatus(''), 2500);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const importerPensumExcel = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const xlsxModule = await import('xlsx');
      const XLSX = xlsxModule?.default || xlsxModule;
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const preferredSheet = workbook.SheetNames.find(name => normalizeText(name).includes('pensum')) || workbook.SheetNames[0];
      const sheet = workbook.Sheets[preferredSheet];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });

      if (!rows[3]) throw new Error('Fant ikke forventet header-rad i Excel-filen.');
      const headers = rows[3];
      const seriesDefs = [];
      for (let col = 1; col < headers.length; col++) {
        const productName = headers[col];
        if (productName && productName.toString().trim()) {
          seriesDefs.push({ navn: productName.toString().trim(), dateCol: col, valueCol: col + 1 });
          col += 1;
        }
      }
      if (!seriesDefs.length) throw new Error('Fant ingen produktkolonner i rad 4.');

      const updated = deepClone(pensumProdukter);
      const flatUpdated = [...updated.enkeltfond, ...updated.fondsportefoljer, ...updated.alternative];
      let count = 0;

      seriesDefs.forEach((series) => {
        const points = [];
        for (let rowIndex = 6; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex] || [];
          const dt = toDateValue(row[series.dateCol]);
          const val = toNumeric(row[series.valueCol]);
          if (!dt || val === null) continue;
          points.push({ date: dt, value: val });
        }
        if (points.length < 2) return;

        const metrics = calculateFeedMetrics(points);
        const product = findProductByName(flatUpdated, series.navn);
        if (!product || !metrics) return;

        product.aar2024 = metrics.aar2024;
        product.aar2023 = metrics.aar2023;
        product.aar2022 = metrics.aar2022;
        product.aar2021 = metrics.aar2021;
        product.aar2020 = metrics.aar2020;
        product.aarlig3ar = metrics.aarlig3ar;
        product.risiko3ar = metrics.risiko3ar;
        product.sistOppdatert = metrics.sistOppdatert;
        if (product.likviditet === 'likvid' && metrics.aarlig3ar !== null) {
          product.forventetAvkastning = metrics.aarlig3ar;
        }
        count += 1;
      });

      setPensumProdukter(updated);
      setAdminStatus('Oppdatert ' + count + ' produkter fra ' + file.name);
    } catch (err) {
      console.log(err);
      setAdminStatus('Excel-import feilet: ' + (err?.message || 'ukjent feil'));
    }
    setTimeout(() => setAdminStatus(''), 4000);
    e.target.value = '';
  }, [pensumProdukter]);

  const oppdaterSammenligningProfil = useCallback((nyProfil) => {
    setSammenligningProfil(nyProfil);
    setSammenligningAllokering(beregnAllokering(likvideTotal, peTotal, eiendomTotal, nyProfil));
  }, [likvideTotal, peTotal, eiendomTotal]);

  const updateSammenligningVekt = useCallback((index, newVekt) => {
    setSammenligningAllokering(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], vekt: newVekt };
      return updated;
    });
  }, []);

  const updateSammenligningAvkastning = useCallback((index, avk) => {
    setSammenligningAllokering(prev => { const u = [...prev]; u[index] = { ...u[index], avkastning: parseFloat(avk) || 0 }; return u; });
  }, []);

  const resetTilAutomatisk = useCallback((nyProfil) => {
    const profil = nyProfil || risikoprofil;
    if (nyProfil) setRisikoprofil(nyProfil);
    setAllokering(beregnAllokering(likvideTotal, peTotal, eiendomTotal, profil));
  }, [likvideTotal, peTotal, eiendomTotal, risikoprofil]);

  const kategorierData = useMemo(() => {
    const cats = ['aksjer', 'renter', 'privateMarkets', 'eiendom'];
    const names = { aksjer: 'Aksjer', renter: 'Renter', privateMarkets: 'Private Equity', eiendom: 'Eiendom' };
    return cats.map(cat => {
      const items = allokering.filter(a => a.kategori === cat);
      const totalVekt = items.reduce((s, a) => s + a.vekt, 0);
      const vektetAvk = totalVekt > 0 ? items.reduce((s, a) => s + a.vekt * a.avkastning, 0) / totalVekt : 0;
      return { kategori: cat, navn: names[cat], vekt: totalVekt, avkastning: vektetAvk, items, belop: (totalVekt / 100) * totalKapital };
    }).filter(c => c.items.length > 0);
  }, [allokering, totalKapital]);

  const pieData = useMemo(() => {
    const data = [];
    kategorierData.forEach(cat => {
      if (cat.vekt > 0) {
        if (expandedCategories[cat.kategori] && cat.items.length > 1) {
          cat.items.filter(i => i.vekt > 0).forEach(item => data.push({ name: item.navn, value: item.vekt }));
        } else {
          data.push({ name: cat.navn, value: cat.vekt });
        }
      }
    });
    return data;
  }, [kategorierData, expandedCategories]);

  const sammenligningPieData = useMemo(() => sammenligningAllokering.filter(a => a.vekt > 0).map(a => ({ name: a.navn, value: a.vekt })), [sammenligningAllokering]);
  const vektetAvkastning = useMemo(() => allokering.reduce((s, a) => s + (a.vekt / 100) * a.avkastning, 0), [allokering]);
  const sammenligningAvkastning = useMemo(() => sammenligningAllokering.reduce((s, a) => s + (a.vekt / 100) * a.avkastning, 0), [sammenligningAllokering]);
  const totalVekt = useMemo(() => allokering.reduce((s, a) => s + a.vekt, 0), [allokering]);
  const aktiveAktiva = useMemo(() => allokering.filter(a => a.vekt > 0), [allokering]);
  const sammenligningAktiva = useMemo(() => sammenligningAllokering.filter(a => a.vekt > 0), [sammenligningAllokering]);

  // Likvid vs Illikvid beregning (PE og Eiendom er illikvide)
  const likviditetData = useMemo(() => {
    const illikvideKategorier = ['privateMarkets', 'eiendom'];
    const illikvidVekt = allokering.filter(a => illikvideKategorier.includes(a.kategori)).reduce((s, a) => s + a.vekt, 0);
    const likvidVekt = totalVekt - illikvidVekt;
    return [
      { name: 'Likvid', value: likvidVekt, belop: (likvidVekt / 100) * totalKapital },
      { name: 'Illikvid', value: illikvidVekt, belop: (illikvidVekt / 100) * totalKapital }
    ];
  }, [allokering, totalVekt, totalKapital]);

  // Renter vs Aksjer (andel av total portefølje)
  const renterAksjerData = useMemo(() => {
    const aksjerVekt = allokering.filter(a => a.kategori === 'aksjer').reduce((s, a) => s + a.vekt, 0);
    const renterVekt = allokering.filter(a => a.kategori === 'renter').reduce((s, a) => s + a.vekt, 0);
    return [
      { name: 'Renter', value: renterVekt },
      { name: 'Aksjer', value: aksjerVekt }
    ];
  }, [allokering]);

  useEffect(() => {
    setScenarioParams(prev => ({
      pessimistisk: Math.min(prev.pessimistisk, vektetAvkastning - 1),
      optimistisk: Math.max(prev.optimistisk, vektetAvkastning + 2)
    }));
  }, [vektetAvkastning]);

  const verdiutvikling = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i, kontantstrom: i === 0 ? 0 : nettoKontantstrom };
      
      // Beregn gjeldende allokering med rebalansering
      let gjeldendAllokering = aktiveAktiva.map(a => ({ ...a }));
      if (rebalanseringAktiv && i > 0) {
        const fraIdx = gjeldendAllokering.findIndex(a => a.navn === rebalansering.fraAktiva);
        const tilIdx = gjeldendAllokering.findIndex(a => a.navn === rebalansering.tilAktiva);
        if (fraIdx >= 0 && tilIdx >= 0) {
          // Beregn kumulativ endring over årene
          const endringPerAar = rebalansering.prosentPerAar;
          const totalEndring = Math.min(endringPerAar * i, gjeldendAllokering[fraIdx].vekt);
          gjeldendAllokering[fraIdx] = { ...gjeldendAllokering[fraIdx], vekt: Math.max(0, aktiveAktiva[fraIdx].vekt - totalEndring) };
          gjeldendAllokering[tilIdx] = { ...gjeldendAllokering[tilIdx], vekt: aktiveAktiva[tilIdx].vekt + totalEndring };
        }
      }
      
      gjeldendAllokering.forEach(asset => {
        if (i === 0) {
          row[asset.navn] = (asset.vekt / 100) * totalKapital;
        } else {
          // Finn forrige verdi og beregn ny verdi med eventuell rebalansering
          const prevRow = data[i - 1];
          const prevTotal = aktiveAktiva.reduce((s, a) => s + (prevRow[a.navn] || 0), 0);
          
          if (rebalanseringAktiv) {
            // Med rebalansering: redistribuer basert på ny allokering
            const originalAsset = aktiveAktiva.find(a => a.navn === asset.navn);
            const prevValue = prevRow[asset.navn] || 0;
            
            // Beregn hvor mye som flyttes
            const fraAsset = rebalansering.fraAktiva;
            const tilAsset = rebalansering.tilAktiva;
            const endringProsent = rebalansering.prosentPerAar / 100;
            
            let nyVerdi = prevValue;
            if (asset.navn === fraAsset && prevRow[fraAsset] > 0) {
              // Selg andel fra denne aktiva
              const salgVerdi = prevRow[fraAsset] * endringProsent;
              nyVerdi = (prevValue - salgVerdi) * (1 + asset.avkastning / 100);
            } else if (asset.navn === tilAsset) {
              // Kjøp andel til denne aktiva
              const fraVerdi = prevRow[fraAsset] || 0;
              const kjopVerdi = fraVerdi * endringProsent;
              nyVerdi = (prevValue + kjopVerdi + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
            } else {
              // Ingen endring, bare vekst
              nyVerdi = (prevValue + (originalAsset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
            }
            row[asset.navn] = Math.max(0, nyVerdi);
          } else {
            // Uten rebalansering: normal vekst
            const prev = prevRow[asset.navn] || 0;
            row[asset.navn] = (prev + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
          }
        }
      });
      row.total = aktiveAktiva.reduce((s, a) => s + (row[a.navn] || 0), 0);
      
      // Lagre allokering-snapshot for dette året
      row.allokeringSnapshot = gjeldendAllokering.map(a => ({ navn: a.navn, vekt: row.total > 0 ? (row[a.navn] / row.total) * 100 : 0 }));
      
      data.push(row);
    }
    return data;
  }, [aktiveAktiva, totalKapital, nettoKontantstrom, horisont, rebalanseringAktiv, rebalansering]);

  const sammenligningVerdiutvikling = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i };
      sammenligningAktiva.forEach(asset => {
        if (i === 0) row[asset.navn] = (asset.vekt / 100) * totalKapital;
        else {
          const prev = data[i - 1][asset.navn] || 0;
          row[asset.navn] = (prev + (asset.vekt / 100) * nettoKontantstrom) * (1 + asset.avkastning / 100);
        }
      });
      row.total = sammenligningAktiva.reduce((s, a) => s + (row[a.navn] || 0), 0);
      data.push(row);
    }
    return data;
  }, [sammenligningAktiva, totalKapital, nettoKontantstrom, horisont]);

  const kombinertVerdiutvikling = useMemo(() => {
    if (!showComparison) return verdiutvikling;
    return verdiutvikling.map((row, idx) => ({ ...row, total_alt: sammenligningVerdiutvikling[idx]?.total || 0 }));
  }, [verdiutvikling, sammenligningVerdiutvikling, showComparison]);

  const scenarioData = useMemo(() => {
    const data = [];
    const startYear = new Date().getFullYear();
    // For "forventet" bruker vi verdiutviklingen direkte for konsistens
    // For optimistisk/pessimistisk bruker vi vektet avkastning +/- justering
    for (let i = 0; i <= horisont; i++) {
      const row = { year: startYear + i };
      // Forventet = samme som verdiutvikling (sum av individuelle aktivaklasser)
      row.forventet = verdiutvikling[i]?.total || totalKapital;
      // Pessimistisk og optimistisk beregnes med justerte rater
      if (i === 0) {
        row.pessimistisk = totalKapital;
        row.optimistisk = totalKapital;
      } else {
        row.pessimistisk = (data[i-1].pessimistisk + nettoKontantstrom) * (1 + scenarioParams.pessimistisk / 100);
        row.optimistisk = (data[i-1].optimistisk + nettoKontantstrom) * (1 + scenarioParams.optimistisk / 100);
      }
      data.push(row);
    }
    return data;
  }, [totalKapital, nettoKontantstrom, verdiutvikling, scenarioParams, horisont]);

  const updateAllokeringVekt = useCallback((index, newVekt) => {
    setAllokering(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], vekt: newVekt };
      return updated;
    });
  }, []);

  const updateAllokeringBelop = useCallback((index, newBelop) => {
    setAllokering(prev => {
      const updated = [...prev];
      const newVekt = totalKapital > 0 ? (newBelop / totalKapital) * 100 : 0;
      updated[index] = { ...updated[index], vekt: parseFloat(newVekt.toFixed(1)) };
      return updated;
    });
  }, [totalKapital]);

  const updateAllokeringAvkastning = useCallback((index, avk) => {
    setAllokering(prev => { const u = [...prev]; u[index] = { ...u[index], avkastning: parseFloat(avk) || 0 }; return u; });
  }, []);

  const toggleCategory = (cat) => setExpandedCategories(p => ({ ...p, [cat]: !p[cat] }));
  const toggleKundeKategori = (cat) => setExpandedKundeKategorier(p => ({ ...p, [cat]: !p[cat] }));

  const generateReportHTML = () => {
    const sluttverdi = verdiutvikling[verdiutvikling.length - 1]?.total || 0;
    const forventetSluttverdi = scenarioData[scenarioData.length - 1]?.forventet || 0;
    const optimistiskSluttverdi = scenarioData[scenarioData.length - 1]?.optimistisk || 0;
    
    const allokeringRows = aktiveAktiva.map(a => 
      '<tr><td style="padding:12px;border-bottom:1px solid #E2E8F0"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:8px;background:' + (ASSET_COLORS[a.navn] || '#888') + '"></span>' + a.navn + '</td><td style="padding:12px;border-bottom:1px solid #E2E8F0;text-align:center">' + formatPercent(a.vekt) + '</td><td style="padding:12px;border-bottom:1px solid #E2E8F0;text-align:right">' + formatCurrency((a.vekt/100)*totalKapital) + '</td></tr>'
    ).join('');
    
    // Create SVG pie chart
    let pieSlices = '';
    let cumulative = 0;
    const pieColors = aktiveAktiva.map(a => ASSET_COLORS[a.navn] || '#888');
    aktiveAktiva.forEach((a, i) => {
      const pct = a.vekt / 100;
      const startAngle = cumulative * 2 * Math.PI - Math.PI/2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI/2;
      const largeArc = pct > 0.5 ? 1 : 0;
      const x1 = 80 + 60 * Math.cos(startAngle);
      const y1 = 80 + 60 * Math.sin(startAngle);
      const x2 = 80 + 60 * Math.cos(endAngle);
      const y2 = 80 + 60 * Math.sin(endAngle);
      if (pct > 0.001) {
        pieSlices += '<path d="M80,80 L' + x1 + ',' + y1 + ' A60,60 0 ' + largeArc + ',1 ' + x2 + ',' + y2 + ' Z" fill="' + pieColors[i] + '"/>';
      }
    });
    const pieSvg = '<svg width="160" height="160" viewBox="0 0 160 160">' + pieSlices + '<circle cx="80" cy="80" r="35" fill="white"/></svg>';
    
    // Create legend
    const legend = aktiveAktiva.map(a => 
      '<div style="display:flex;align-items:center;gap:6px;font-size:11px;margin:4px 0"><span style="width:10px;height:10px;border-radius:50%;background:' + (ASSET_COLORS[a.navn] || '#888') + '"></span>' + a.navn + ' (' + a.vekt.toFixed(1) + '%)</div>'
    ).join('');
    
    // Create stacked bar chart for value development
    const maxVal = Math.max(...verdiutvikling.map(r => r.total));
    const barWidth = Math.min(50, 540 / verdiutvikling.length - 6);
    const chartWidth = verdiutvikling.length * (barWidth + 6) + 100;
    let bars = '';
    
    // Y-axis labels - smart stepping based on max value
    let stepSize, yAxisMax;
    if (maxVal < 10) {
      // Very small values (like 100kr portfolio shown as percentages)
      stepSize = maxVal <= 50 ? 10 : 20;
      yAxisMax = Math.ceil(maxVal / stepSize) * stepSize;
    } else if (maxVal < 1000) {
      stepSize = maxVal <= 200 ? 50 : maxVal <= 500 ? 100 : 200;
      yAxisMax = Math.ceil(maxVal / stepSize) * stepSize;
    } else {
      const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
      const normalized = maxVal / magnitude;
      if (normalized <= 2) stepSize = magnitude * 0.5;
      else if (normalized <= 5) stepSize = magnitude;
      else stepSize = magnitude * 2;
      
      // Ensure we have 4-6 labels
      while (maxVal / stepSize > 6) stepSize *= 2;
      while (maxVal / stepSize < 3) stepSize /= 2;
      
      yAxisMax = Math.ceil(maxVal / stepSize) * stepSize;
    }
    
    const yAxisLabels = [];
    for (let v = 0; v <= yAxisMax; v += stepSize) {
      yAxisLabels.push(v);
    }
    
    // Format numbers nicely based on size
    const formatYLabel = (v) => {
      if (v === 0) return '0';
      if (v >= 1000000000) return 'kr ' + (v / 1000000000).toFixed(v % 1000000000 === 0 ? 0 : 1) + ' mrd';
      if (v >= 1000000) return 'kr ' + (v / 1000000).toFixed(0) + ' mill';
      if (v >= 1000) return 'kr ' + (v / 1000).toFixed(0) + ' k';
      return 'kr ' + v.toFixed(0);
    };
    
    let yAxis = '';
    yAxisLabels.forEach(v => {
      const y = 190 - (v / yAxisMax) * 180;
      yAxis += '<text x="75" y="' + (y + 4) + '" text-anchor="end" font-size="9" fill="#64748B">' + formatYLabel(v) + '</text>';
      yAxis += '<line x1="78" y1="' + y + '" x2="' + (chartWidth - 10) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="' + (v === 0 ? '0' : '3,3') + '"/>';
    });
    
    verdiutvikling.forEach((row, i) => {
      const x = 85 + i * (barWidth + 6);
      let yOffset = 0;
      
      // Stack each asset class
      aktiveAktiva.forEach(asset => {
        const val = row[asset.navn] || 0;
        const barHeight = (val / yAxisMax) * 180;
        const y = 190 - yOffset - barHeight;
        bars += '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barHeight + '" fill="' + (ASSET_COLORS[asset.navn] || '#888') + '"/>';
        yOffset += barHeight;
      });
      
      // Year label
      if (verdiutvikling.length <= 11 || i % 2 === 0) {
        bars += '<text x="' + (x + barWidth/2) + '" y="205" text-anchor="middle" font-size="10" fill="#64748B">' + row.year + '</text>';
      }
    });
    
    // Bar chart legend
    const barLegend = aktiveAktiva.map(a => 
      '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;font-size:10px"><span style="width:10px;height:10px;border-radius:2px;background:' + (ASSET_COLORS[a.navn] || '#888') + '"></span>' + a.navn + '</span>'
    ).join('');
    
    const barSvg = '<svg width="100%" height="220" viewBox="0 0 ' + chartWidth + ' 220" preserveAspectRatio="xMidYMid meet">' + yAxis + bars + '</svg>';
    
    // Create detailed value development table
    const verdiTableHeader = '<tr style="background:#F8FAFC"><th style="padding:8px 6px;text-align:left;font-size:11px;font-weight:600">År</th>' + aktiveAktiva.map(a => '<th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600">' + a.navn + '</th>').join('') + '<th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:600">Total</th></tr>';
    const verdiTableRows = verdiutvikling.map((row, idx) => 
      '<tr style="background:' + (idx % 2 === 0 ? '#fff' : '#F8FAFC') + '"><td style="padding:6px;font-weight:500;font-size:11px">' + row.year + '</td>' + aktiveAktiva.map(a => '<td style="padding:6px;text-align:right;font-size:10px;color:#64748B">' + formatCurrency(row[a.navn] || 0) + '</td>').join('') + '<td style="padding:6px;text-align:right;font-size:11px;font-weight:600">' + formatCurrency(row.total) + '</td></tr>'
    ).join('');
    
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Investeringsprognose - ' + (kundeNavn || 'Kunde') + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;color:#1B3A5F;line-height:1.5;background:#fff}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:15mm}}.page{max-width:800px;margin:0 auto}.header{background:#fff;padding:25px 40px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between}.header-right{text-align:right}.header-right h1{font-size:18px;color:#1B3A5F;margin-bottom:2px}.header-right p{color:#64748B;font-size:12px}.content{padding:30px 40px}.info{display:flex;flex-wrap:wrap;gap:6px 30px;margin-bottom:25px;font-size:13px}.info div{flex:1 1 45%}.info span{color:#64748B}.info strong{color:#1B3A5F}.section{margin-bottom:25px}.section h2{font-size:15px;font-weight:700;color:#1B3A5F;border-bottom:2px solid #1B3A5F;padding-bottom:6px;margin-bottom:14px}.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.card{background:#F8FAFC;border-radius:8px;padding:14px 10px;text-align:center}.card-label{font-size:10px;color:#64748B;margin-bottom:3px}.card-value{font-size:16px;font-weight:700;color:#1B3A5F}.card-value.green{color:#16A34A}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#F8FAFC;padding:10px;text-align:left;font-weight:600}td{padding:10px}.alloc-grid{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start}.pie-section{display:flex;flex-direction:column;align-items:center}.scenarios{display:grid;grid-template-columns:1fr 1fr;gap:12px}.box{padding:18px;border-radius:10px;text-align:center}.box-label{font-size:12px;font-weight:600;margin-bottom:4px}.box-value{font-size:20px;font-weight:700}.chart-section{margin-top:10px;padding:15px;background:#FAFAFA;border-radius:8px}.chart-legend{text-align:center;margin-bottom:10px;padding:8px;background:#fff;border-radius:6px}.disclaimer{font-size:9px;color:#64748B;background:#F8FAFC;padding:14px;border-radius:6px;margin-top:25px}.footer{background:#F8FAFC;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#64748B;margin-top:15px}.footer-logo{height:45px}.detail-table{font-size:11px;margin-top:10px}</style></head><body><div class="page"><div class="header"><img src="' + PENSUM_LOGO + '" alt="Pensum" style="height:70px"><div class="header-right"><h1>Investeringsprognose</h1><p>' + formatDateEuro(dato) + '</p></div></div><div class="content"><div class="info"><div><span>Kunde:</span> <strong>' + (kundeNavn || '—') + '</strong></div><div><span>Rådgiver:</span> <strong>' + (radgiver || '—') + '</strong></div><div><span>Risikoprofil:</span> <strong>' + risikoprofil + '</strong></div><div><span>Horisont:</span> <strong>' + horisont + ' år</strong></div></div><div class="section"><h2>Nøkkeltall</h2><div class="grid4"><div class="card"><div class="card-label">Startkapital</div><div class="card-value">' + formatCurrency(totalKapital) + '</div></div><div class="card"><div class="card-label">Horisont</div><div class="card-value">' + horisont + ' år</div></div><div class="card"><div class="card-label">Forv. avkastning</div><div class="card-value">' + formatPercent(vektetAvkastning) + '</div></div><div class="card"><div class="card-label">Sluttverdi</div><div class="card-value green">' + formatCurrency(sluttverdi) + '</div></div></div></div><div class="section"><h2>Anbefalt allokering</h2><div class="alloc-grid"><table><thead><tr><th>Aktivaklasse</th><th style="text-align:center">Andel</th><th style="text-align:right">Beløp</th></tr></thead><tbody>' + allokeringRows + '</tbody></table><div class="pie-section">' + pieSvg + '<div style="margin-top:10px">' + legend + '</div></div></div></div><div class="section"><h2>Forventet verdiutvikling</h2><div class="chart-section"><div class="chart-legend">' + barLegend + '</div>' + barSvg + '<div style="text-align:center;margin-top:8px;font-size:11px;color:#64748B">Sluttverdi: <strong style="color:#1B3A5F">' + formatCurrency(sluttverdi) + '</strong></div></div></div><div class="section"><h2>Scenarioanalyse etter ' + horisont + ' år</h2><div class="scenarios"><div class="box" style="background:#F8FAFC;border:2px solid #1B3A5F"><div class="box-label" style="color:#1B3A5F">Forventet</div><div class="box-value" style="color:#1B3A5F">' + formatCurrency(forventetSluttverdi) + '</div></div><div class="box" style="background:#DCFCE7"><div class="box-label" style="color:#16A34A">Optimistisk</div><div class="box-value" style="color:#16A34A">' + formatCurrency(optimistiskSluttverdi) + '</div></div></div></div><div class="section"><h2>Detaljert verdiutvikling</h2><table class="detail-table"><thead>' + verdiTableHeader + '</thead><tbody>' + verdiTableRows + '</tbody></table></div><div class="disclaimer"><strong>Viktig informasjon:</strong> Denne prognosen er kun veiledende og basert på historiske avkastningsforventninger. Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan både øke og synke.</div></div><div class="footer"><img src="' + PENSUM_LOGO + '" alt="Pensum" class="footer-logo"><div>Frøyas gate 15, 0273 Oslo · +47 23 89 68 44 · pensumgroup.no</div></div></div></body></html>';
    
    return html;
  };

  const handleDownloadHTML = () => {
    const html = generateReportHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Investeringsprognose_' + (kundeNavn || 'Kunde').replace(/[^a-zA-Z0-9æøåÆØÅ]/g, '_') + '.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CurrencyInput = ({ label, value, onChange, indent }) => {
    const [local, setLocal] = useState(formatNumber(value));
    useEffect(() => setLocal(formatNumber(value)), [value]);
    return (
      <div className={indent ? "mb-3 ml-6" : "mb-3"}>
        <label className="block text-sm font-medium mb-1.5" style={{ color: indent ? PENSUM_COLORS.darkGray : PENSUM_COLORS.darkBlue }}>{label}</label>
        <div className="relative">
          <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} onBlur={() => { const v = parseInt(local.replace(/[^0-9]/g,''),10)||0; onChange(v); setLocal(formatNumber(v)); }} onFocus={() => setLocal(value.toString())} className="w-full border border-gray-200 rounded-lg py-2 px-3 pr-10 text-sm" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
        </div>
      </div>
    );
  };

  const StatCard = ({ label, value, subtext, color }) => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border border-gray-100">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: color || PENSUM_COLORS.darkBlue }}>{value}</div>
      {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
    </div>
  );

  const CollapsibleSection = ({ title, isOpen, onToggle, sum, children }) => (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <svg className={"w-4 h-4 transition-transform " + (isOpen ? "rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          <span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{title}</span>
        </div>
        <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(sum)}</span>
      </div>
      {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );

  const AllokeringRow = ({ item, index, isSubItem }) => {
    const [localVekt, setLocalVekt] = useState(item.vekt.toString());
    const [localBelop, setLocalBelop] = useState(formatNumber((item.vekt / 100) * totalKapital));
    useEffect(() => { setLocalVekt(item.vekt.toFixed(1)); setLocalBelop(formatNumber((item.vekt / 100) * totalKapital)); }, [item.vekt, totalKapital]);
    
    return (
      <tr className={"border-b border-gray-100 hover:bg-gray-50 " + (isSubItem ? "bg-gray-50" : "")}>
        <td className={"py-3 pr-4 " + (isSubItem ? "pl-10" : "pl-4")}>
          <div className="flex items-center gap-2">
            <div className={isSubItem ? "w-2.5 h-2.5 rounded-full" : "w-3 h-3 rounded-full"} style={{ backgroundColor: ASSET_COLORS[item.navn] || CATEGORY_COLORS[item.kategori] }}></div>
            <span className={isSubItem ? "text-sm" : "font-medium"} style={{ color: PENSUM_COLORS.darkBlue }}>{item.navn}</span>
          </div>
        </td>
        <td className="py-3 px-2">
          <div className="flex items-center justify-center">
            <input type="text" value={localVekt} onChange={(e) => setLocalVekt(e.target.value)} onBlur={() => updateAllokeringVekt(index, parseFloat(localVekt) || 0)} className="w-16 text-center text-sm border border-gray-200 rounded py-1.5 px-2" />
            <span className="ml-1 text-gray-400 text-xs">%</span>
          </div>
        </td>
        <td className="py-3 px-2">
          <div className="flex items-center justify-center">
            <input type="text" value={localBelop} onChange={(e) => setLocalBelop(e.target.value)} onBlur={() => { const v = parseInt(localBelop.replace(/[^0-9]/g,''),10)||0; updateAllokeringVekt(index, parseFloat((v/totalKapital*100).toFixed(1))); }} className="w-28 text-center text-sm border border-gray-200 rounded py-1.5 px-2" />
            <span className="ml-1 text-gray-400 text-xs">kr</span>
          </div>
        </td>
        <td className="py-3 px-2">
          <div className="flex items-center justify-center">
            <input type="number" step="0.5" value={item.avkastning} onChange={(e) => updateAllokeringAvkastning(index, e.target.value)} className="w-16 text-center text-sm border border-gray-200 rounded py-1.5 px-2" />
            <span className="ml-1 text-gray-400 text-xs">%</span>
          </div>
        </td>
      </tr>
    );
  };

  const SammenligningRow = ({ item, index }) => {
    const [localVekt, setLocalVekt] = useState(item.vekt.toString());
    useEffect(() => { setLocalVekt(item.vekt.toFixed(1)); }, [item.vekt]);
    return (
      <tr className="border-b border-gray-100 hover:bg-purple-50">
        <td className="py-2 pl-3 pr-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ASSET_COLORS_LIGHT[item.navn] || ASSET_COLORS[item.navn] }}></div>
            <span className="text-sm" style={{ color: PENSUM_COLORS.purple }}>{item.navn}</span>
          </div>
        </td>
        <td className="py-2 px-1">
          <div className="flex items-center justify-center">
            <input type="text" value={localVekt} onChange={(e) => setLocalVekt(e.target.value)} onBlur={() => updateSammenligningVekt(index, parseFloat(localVekt) || 0)} className="w-14 text-center text-xs border border-purple-200 rounded py-1 px-1 bg-purple-50" />
            <span className="ml-1 text-purple-400 text-xs">%</span>
          </div>
        </td>
        <td className="py-2 px-1">
          <div className="flex items-center justify-center">
            <input type="number" step="0.5" value={item.avkastning} onChange={(e) => updateSammenligningAvkastning(index, e.target.value)} className="w-14 text-center text-xs border border-purple-200 rounded py-1 px-1 bg-purple-50" />
            <span className="ml-1 text-purple-400 text-xs">%</span>
          </div>
        </td>
      </tr>
    );
  };

  const KategoriHeaderRow = ({ kategori, isExpanded, onToggle }) => {
    if (!kategori || kategori.items.length <= 1) return null;
    return (
      <tr className="border-b border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={onToggle}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <svg className={"w-4 h-4 transition-transform " + (isExpanded ? "rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[kategori.kategori] }}></div>
            <span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{kategori.navn}</span>
          </div>
        </td>
        <td className="py-3 px-2 text-center font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(kategori.vekt)}</td>
        <td className="py-3 px-2 text-center font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(kategori.belop)}</td>
        <td className="py-3 px-2 text-center font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(kategori.avkastning)}</td>
      </tr>
    );
  };

  const SimpleKategoriRow = ({ kategori }) => {
    if (!kategori || kategori.items.length !== 1) return null;
    const item = kategori.items[0];
    return <AllokeringRow item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={false} />;
  };

  return (
    <div className="min-h-screen print:min-h-0 print:bg-white" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, footer, .no-print { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>
      <header className="bg-white shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={PENSUM_LOGO} alt="Pensum Asset Management" className="h-20 md:h-24" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setVisKundeliste(!visKundeliste)} className={"px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border " + (visKundeliste ? "bg-blue-100 border-blue-300 text-blue-700" : "border-gray-200 hover:bg-gray-50")} style={{ color: visKundeliste ? undefined : PENSUM_COLORS.darkBlue }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Mine kunder {lagredeKunder.length > 0 && <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{lagredeKunder.length}</span>}
              </button>
              <button onClick={lagreKunde} className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: lagringsStatus ? '#16A34A' : PENSUM_COLORS.darkBlue }}>
                {lagringsStatus ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                )}
                {lagringsStatus || 'Lagre'}
              </button>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-base font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringsprognose</div>
              <div className="text-xs text-gray-500">{formatDateEuro(dato)}</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-1 overflow-x-auto -mb-px">
              {['input', 'allokering', 'losninger', 'scenario', 'rapport'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={"px-5 py-3 font-medium whitespace-nowrap text-sm " + (activeTab === tab ? "text-white border-b-2 border-white" : "text-blue-200 hover:text-white")}>
                  {tab === 'input' ? 'Kundeinformasjon' : tab === 'allokering' ? 'Allokering & Prognose' : tab === 'losninger' ? 'Pensum Løsninger' : tab === 'scenario' ? 'Scenarioanalyse' : 'Kunderapport'}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Kundeliste panel */}
      {visKundeliste && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
              <h2 className="text-lg font-semibold text-white">Mine kunder</h2>
              <button onClick={() => setVisKundeliste(false)} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {!radgiver ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <p className="text-gray-500 mb-2">Fyll inn rådgivernavn først</p>
                  <p className="text-sm text-gray-400">Gå til Kundeinformasjon og skriv inn ditt navn</p>
                </div>
              ) : lagredeKunder.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-gray-500">Ingen lagrede kunder for {radgiver}</p>
                  <p className="text-sm text-gray-400 mt-1">Fyll inn kundedata og trykk "Lagre"</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lagredeKunder.map(kunde => (
                    <div key={kunde.id} className={"flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 " + (aktivKundeId === kunde.id ? "border-blue-500 bg-blue-50" : "border-gray-200")} onClick={() => lastKundeData(kunde)}>
                      <div>
                        <div className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{kunde.kundeNavn}</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency((kunde.aksjerKunde || 0) + (kunde.aksjefondKunde || 0) + (kunde.renterKunde || 0) + (kunde.kontanterKunde || 0) + (kunde.peFondKunde || 0) + (kunde.unoterteAksjerKunde || 0) + (kunde.shippingKunde || 0) + (kunde.egenEiendomKunde || 0) + (kunde.eiendomSyndikatKunde || 0) + (kunde.eiendomFondKunde || 0))} • {kunde.risikoprofil}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Sist endret: {new Date(kunde.sistEndret).toLocaleDateString('nb-NO')}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); slettKunde(kunde.id); }} className="text-red-500 hover:text-red-700 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <button onClick={nyKunde} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 flex items-center gap-2" style={{ color: PENSUM_COLORS.darkBlue }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Ny kunde
                  </button>
                </div>
                <div className="flex gap-2">
                  <label className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 flex items-center gap-2 cursor-pointer" style={{ color: PENSUM_COLORS.darkBlue }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Importer
                    <input type="file" accept=".json" onChange={importerKunde} className="hidden" />
                  </label>
                  <button onClick={eksporterKunde} disabled={!kundeNavn} className={"px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 " + (kundeNavn ? "border-gray-200 hover:bg-gray-50" : "border-gray-100 text-gray-300 cursor-not-allowed")} style={{ color: kundeNavn ? PENSUM_COLORS.darkBlue : undefined }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Eksporter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Kundeinformasjon</h3></div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Kundenavn</label>
                  <input type="text" defaultValue={kundeNavn} onBlur={(e) => setKundeNavn(e.target.value)} placeholder="Skriv inn kundenavn" className="w-full border border-gray-200 rounded-lg py-2.5 px-4" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Risikoprofil</label>
                  <select value={risikoprofil} onChange={(e) => setRisikoprofil(e.target.value)} className="w-full border border-gray-200 rounded-lg py-2.5 px-4">
                    <option>Defensiv</option><option>Moderat</option><option>Dynamisk</option><option>Offensiv</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{RISK_PROFILES[risikoprofil].aksjer}% aksjer, {RISK_PROFILES[risikoprofil].renter}% renter</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringshorisont</label>
                  <div className="relative">
                    <input type="text" value={localHorisont} onChange={(e) => setLocalHorisont(e.target.value)} onBlur={() => { const v = Math.max(1, Math.min(50, parseInt(localHorisont,10)||10)); setHorisont(v); setLocalHorisont(v.toString()); }} className="w-full border border-gray-200 rounded-lg py-2.5 px-4 pr-12" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">år</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Rådgiver</label>
                  <input type="text" defaultValue={radgiver} onBlur={(e) => setRadgiver(e.target.value)} placeholder="Navn på rådgiver" className="w-full border border-gray-200 rounded-lg py-2.5 px-4" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Dato</label>
                  <input type="date" value={dato} onChange={(e) => setDato(e.target.value)} className="w-full border border-gray-200 rounded-lg py-2.5 px-4" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Dagens økonomiske situasjon</h3></div>
                <div className="p-6">
                  <CollapsibleSection title="Likvide midler" isOpen={expandedKundeKategorier.likvide} onToggle={() => toggleKundeKategori('likvide')} sum={likvideTotal}>
                    <CurrencyInput label="Aksjer" value={aksjerKunde} onChange={setAksjerKunde} />
                    <CurrencyInput label="Aksjefond" value={aksjefondKunde} onChange={setAksjefondKunde} />
                    <CurrencyInput label="Renter" value={renterKunde} onChange={setRenterKunde} />
                    <CurrencyInput label="Kontanter (bank)" value={kontanterKunde} onChange={setKontanterKunde} />
                  </CollapsibleSection>
                  <CollapsibleSection title="Illikvide midler" isOpen={expandedKundeKategorier.illikvide} onToggle={() => toggleKundeKategori('illikvide')} sum={illikvideTotal}>
                    <div className="mb-3">
                      <div className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100" onClick={() => toggleKundeKategori('pe')}>
                        <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.teal }}>Private Equity</span>
                        <span className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(peTotal)}</span>
                      </div>
                      {expandedKundeKategorier.pe && (
                        <div className="mt-2">
                          <CurrencyInput label="PE-fond" value={peFondKunde} onChange={setPeFondKunde} indent />
                          <CurrencyInput label="Unoterte aksjer" value={unoterteAksjerKunde} onChange={setUnoterteAksjerKunde} indent />
                          <CurrencyInput label="Shipping" value={shippingKunde} onChange={setShippingKunde} indent />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between cursor-pointer py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100" onClick={() => toggleKundeKategori('eiendom')}>
                        <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.gold }}>Eiendom</span>
                        <span className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(eiendomTotal)}</span>
                      </div>
                      {expandedKundeKategorier.eiendom && (
                        <div className="mt-2">
                          <CurrencyInput label="Egen eiendom" value={egenEiendomKunde} onChange={setEgenEiendomKunde} indent />
                          <CurrencyInput label="Eiendomssyndikat" value={eiendomSyndikatKunde} onChange={setEiendomSyndikatKunde} indent />
                          <CurrencyInput label="Eiendomsfond" value={eiendomFondKunde} onChange={setEiendomFondKunde} indent />
                        </div>
                      )}
                    </div>
                  </CollapsibleSection>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Total kapital</span>
                      <span className="text-2xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(totalKapital)}</span>
                    </div>
                  </div>
                  <button onClick={() => resetTilAutomatisk()} className="w-full mt-4 py-2.5 px-4 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    Oppdater allokering basert på risikoprofil
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Årlig kontantstrøm</h3></div>
                <div className="p-6">
                  <CurrencyInput label="Årlig innskudd" value={innskudd} onChange={setInnskudd} />
                  <CurrencyInput label="Årlige uttak" value={uttak} onChange={setUttak} />
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Netto kontantstrøm</span>
                      <span className={"text-xl font-bold " + (nettoKontantstrom >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(nettoKontantstrom)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'allokering' && (
          <div className="space-y-6 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Risikoprofil:</label>
                  <select value={risikoprofil} onChange={(e) => resetTilAutomatisk(e.target.value)} className="border border-gray-200 rounded-lg py-2 px-4">
                    <option>Defensiv</option><option>Moderat</option><option>Dynamisk</option><option>Offensiv</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowComparison(!showComparison)} className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border " + (showComparison ? "bg-purple-100 border-purple-300 text-purple-700" : "border-gray-200 hover:bg-gray-100")} style={{ color: showComparison ? undefined : PENSUM_COLORS.darkBlue }}>
                    {showComparison ? 'Skjul sammenligning' : 'Sammenlign'}
                  </button>
                  <button onClick={() => resetTilAutomatisk()} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-100" style={{ color: PENSUM_COLORS.darkBlue }}>Tilbakestill</button>
                </div>
              </div>
              {showComparison && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium" style={{ color: PENSUM_COLORS.purple }}>Utgangspunkt:</span>
                    <select value={sammenligningProfil} onChange={(e) => oppdaterSammenligningProfil(e.target.value)} className="border border-purple-200 rounded-lg py-2 px-4 bg-purple-50">
                      <option>Defensiv</option><option>Moderat</option><option>Dynamisk</option><option>Offensiv</option>
                    </select>
                    <button onClick={() => oppdaterSammenligningProfil(sammenligningProfil)} className="text-xs text-purple-600 hover:text-purple-800 underline">Tilbakestill</button>
                    <span className="text-xs text-purple-600 ml-auto">Forv. avk: {formatPercent(sammenligningAvkastning)}</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <table className="w-full text-sm">
                      <thead><tr className="text-purple-700"><th className="text-left py-1 px-2 font-medium">Aktivaklasse</th><th className="text-center py-1 px-1 font-medium">Vekt</th><th className="text-center py-1 px-1 font-medium">Avk.</th></tr></thead>
                      <tbody>{sammenligningAllokering.map((item, idx) => <SammenligningRow key={item.navn} item={item} index={idx} />)}</tbody>
                      <tfoot><tr className="border-t border-purple-300"><td className="py-2 px-2 font-semibold text-purple-700">Sum</td><td className={"py-2 px-1 text-center font-semibold " + (Math.abs(sammenligningAllokering.reduce((s,a)=>s+a.vekt,0) - 100) < 0.5 ? "text-green-600" : "text-red-600")}>{formatPercent(sammenligningAllokering.reduce((s,a)=>s+a.vekt,0))}</td><td className="py-2 px-1 text-center font-semibold text-purple-700">{formatPercent(sammenligningAvkastning)}</td></tr></tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Porteføljeallokering</h3></div>
                  {Math.abs(totalVekt - 100) >= 0.5 && (
                    <div className={"px-6 py-3 flex items-center gap-2 " + (totalVekt < 100 ? "bg-yellow-50 border-b border-yellow-200" : "bg-red-50 border-b border-red-200")}>
                      <svg className={"w-5 h-5 " + (totalVekt < 100 ? "text-yellow-600" : "text-red-600")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span className={"text-sm font-medium " + (totalVekt < 100 ? "text-yellow-700" : "text-red-700")}>
                        {totalVekt < 100 
                          ? "Total vekting er " + formatPercent(totalVekt) + " (" + formatPercent(100 - totalVekt) + " uallokert)"
                          : "Total vekting er " + formatPercent(totalVekt) + " (overallokert med " + formatPercent(totalVekt - 100) + ")"
                        }
                      </span>
                    </div>
                  )}
                  <div className="p-6 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Aktivaklasse</th>
                          <th className="text-center py-3 px-2 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Vekting</th>
                          <th className="text-center py-3 px-2 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Beløp</th>
                          <th className="text-center py-3 px-2 font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Forv. avk.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <KategoriHeaderRow kategori={kategorierData.find(c => c.kategori === 'aksjer')} isExpanded={expandedCategories.aksjer} onToggle={() => toggleCategory('aksjer')} />
                        {expandedCategories.aksjer && allokering.filter(a => a.kategori === 'aksjer').map((item) => <AllokeringRow key={item.navn} item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={true} />)}
                        <KategoriHeaderRow kategori={kategorierData.find(c => c.kategori === 'renter')} isExpanded={expandedCategories.renter} onToggle={() => toggleCategory('renter')} />
                        {expandedCategories.renter && allokering.filter(a => a.kategori === 'renter').map((item) => <AllokeringRow key={item.navn} item={item} index={allokering.findIndex(a => a.navn === item.navn)} isSubItem={true} />)}
                        {allokering.find(a => a.navn === 'Private Equity') && <AllokeringRow item={allokering.find(a => a.navn === 'Private Equity')} index={allokering.findIndex(a => a.navn === 'Private Equity')} isSubItem={false} />}
                        {allokering.find(a => a.navn === 'Eiendom') && <AllokeringRow item={allokering.find(a => a.navn === 'Eiendom')} index={allokering.findIndex(a => a.navn === 'Eiendom')} isSubItem={false} />}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <td className="py-4 px-4 font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>Sum</td>
                          <td className={"py-4 px-2 text-center font-bold " + (Math.abs(totalVekt - 100) < 0.5 ? "text-green-600" : "text-red-600")}>{formatPercent(totalVekt)}</td>
                          <td className="py-4 px-2 text-center font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(totalKapital)}</td>
                          <td className="py-4 px-2 text-center font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(vektetAvkastning)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-2">
                <div className="grid grid-cols-1 gap-4">
                  {/* Porteføljesammensetning */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-sm font-semibold text-white">Porteføljesammensetning</h3></div>
                    <div className="p-3">
                      {showComparison ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <h4 className="text-center text-xs font-semibold mb-1" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</h4>
                            <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={45} dataKey="value">{pieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || '#888'} stroke="white" strokeWidth={1} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1) + '%'} /></PieChart></ResponsiveContainer>
                          </div>
                          <div>
                            <h4 className="text-center text-xs font-semibold mb-1" style={{ color: PENSUM_COLORS.purple }}>{sammenligningProfil}</h4>
                            <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={sammenligningPieData} cx="50%" cy="50%" outerRadius={45} dataKey="value">{sammenligningPieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS_LIGHT[e.name] || ASSET_COLORS[e.name] || '#888'} stroke="white" strokeWidth={1} />)}</Pie><Tooltip formatter={(v) => v.toFixed(1) + '%'} /></PieChart></ResponsiveContainer>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pieData} cx="50%" cy="45%" outerRadius={55} dataKey="value">{pieData.map((e) => <Cell key={e.name} fill={ASSET_COLORS[e.name] || CATEGORY_COLORS[kategorierData.find(c => c.navn === e.name)?.kategori] || '#888'} stroke="white" strokeWidth={2} />)}</Pie><Tooltip formatter={(v, n) => [v.toFixed(1) + '%', n]} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} /></PieChart></ResponsiveContainer>
                      )}
                    </div>
                  </div>
                  
                  {/* Likviditet og Aktiva side om side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Likviditet */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-4 py-2" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-sm font-semibold text-white">Likviditet</h3></div>
                      <div className="p-3">
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie data={likviditetData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={40} dataKey="value">
                              <Cell fill={PENSUM_COLORS.darkBlue} />
                              <Cell fill={PENSUM_COLORS.salmon} />
                            </Pie>
                            <Tooltip formatter={(v) => v.toFixed(1) + '%'} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                            <span className="text-xs text-gray-600">Likvid ({formatPercent(likviditetData[0].value)})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.salmon }}></div>
                            <span className="text-xs text-gray-600">Illikvid ({formatPercent(likviditetData[1].value)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Aktiva */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-4 py-2" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-sm font-semibold text-white">Aktiva</h3></div>
                      <div className="p-3">
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie data={renterAksjerData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={40} dataKey="value">
                              <Cell fill={PENSUM_COLORS.darkBlue} />
                              <Cell fill={PENSUM_COLORS.salmon} />
                            </Pie>
                            <Tooltip formatter={(v) => v.toFixed(1) + '%'} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}></div>
                            <span className="text-xs text-gray-600">Renter ({formatPercent(renterAksjerData[0].value)})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PENSUM_COLORS.salmon }}></div>
                            <span className="text-xs text-gray-600">Aksjer ({formatPercent(renterAksjerData[1].value)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rebalansering panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between cursor-pointer" style={{ backgroundColor: PENSUM_COLORS.darkBlue }} onClick={() => setRebalanseringAktiv(!rebalanseringAktiv)}>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">Årlig rebalansering</h3>
                  {!rebalanseringAktiv && <span className="text-xs text-blue-200">(klikk for å aktivere)</span>}
                </div>
                <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <span className="text-sm text-white">{rebalanseringAktiv ? 'Aktiv' : 'Inaktiv'}</span>
                  <div className="relative">
                    <input type="checkbox" checked={rebalanseringAktiv} onChange={(e) => setRebalanseringAktiv(e.target.checked)} className="sr-only" />
                    <div className={"w-11 h-6 rounded-full transition-colors " + (rebalanseringAktiv ? "bg-green-500" : "bg-gray-400")}></div>
                    <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform " + (rebalanseringAktiv ? "translate-x-5" : "")}></div>
                  </div>
                </label>
              </div>
              {rebalanseringAktiv && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Selg fra</label>
                      <select value={rebalansering.fraAktiva} onChange={(e) => setRebalansering(prev => ({ ...prev, fraAktiva: e.target.value }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm">
                        {allokering.map(a => <option key={a.navn} value={a.navn}>{a.navn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Kjøp til</label>
                      <select value={rebalansering.tilAktiva} onChange={(e) => setRebalansering(prev => ({ ...prev, tilAktiva: e.target.value }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm">
                        {allokering.filter(a => a.navn !== rebalansering.fraAktiva).map(a => <option key={a.navn} value={a.navn}>{a.navn}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Andel per år</label>
                      <div className="relative">
                        <input type="number" min="1" max="100" value={rebalansering.prosentPerAar} onChange={(e) => setRebalansering(prev => ({ ...prev, prosentPerAar: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) }))} className="w-full border border-gray-200 rounded-lg py-2.5 px-3 pr-10 text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <p className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Effekt:</p>
                      <p>{rebalansering.prosentPerAar}% av {rebalansering.fraAktiva} selges årlig og reinvesteres i {rebalansering.tilAktiva}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Allokering ved slutten av perioden ({horisont} år):</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {verdiutvikling[verdiutvikling.length - 1]?.allokeringSnapshot?.filter(a => a.vekt > 0.1).map(a => (
                        <span key={a.navn} className="inline-flex items-center gap-1.5 text-sm">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ASSET_COLORS[a.navn] || '#888' }}></span>
                          {a.navn}: {formatPercent(a.vekt)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Startkapital" value={formatCurrency(totalKapital)} />
              <StatCard label="Forventet avkastning" value={formatPercent(vektetAvkastning)} subtext="årlig" />
              <StatCard label="Sluttverdi" value={formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)} subtext={"etter " + horisont + " år"} />
              <StatCard label="Total avkastning" value={formatCurrency((verdiutvikling[verdiutvikling.length - 1]?.total || 0) - totalKapital - (nettoKontantstrom * horisont))} color={PENSUM_COLORS.green} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">{showComparison ? "Utvikling - Sammenligning" : "Utvikling i formuesverdi"}</h3></div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={kombinertVerdiutvikling} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap={showComparison ? "20%" : "40%"}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v, n) => [formatCurrency(v), n === 'total_alt' ? 'Total (' + sammenligningProfil + ')' : n]} />
                    <Legend iconType="circle" />
                    {aktiveAktiva.map((a) => <Bar key={a.navn} dataKey={a.navn} stackId="a" fill={ASSET_COLORS[a.navn] || CATEGORY_COLORS[a.kategori]} />)}
                    {showComparison && <Bar dataKey="total_alt" stackId="b" fill={PENSUM_COLORS.purple} name={"Total (" + sammenligningProfil + ")"} opacity={0.7} />}
                  </BarChart>
                </ResponsiveContainer>
                {showComparison && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div><p className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</p><p className="text-xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)}</p></div>
                      <div><p className="text-sm font-medium" style={{ color: PENSUM_COLORS.purple }}>{sammenligningProfil}</p><p className="text-xl font-bold" style={{ color: PENSUM_COLORS.purple }}>{formatCurrency(sammenligningVerdiutvikling[sammenligningVerdiutvikling.length - 1]?.total || 0)}</p></div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Differanse: <strong className={(sammenligningVerdiutvikling[sammenligningVerdiutvikling.length-1]?.total||0) > (verdiutvikling[verdiutvikling.length-1]?.total||0) ? "text-green-600" : "text-red-600"}>{formatCurrency(Math.abs((sammenligningVerdiutvikling[sammenligningVerdiutvikling.length-1]?.total||0) - (verdiutvikling[verdiutvikling.length-1]?.total||0)))}</strong></p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Detaljert verdiutvikling</h3></div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                      <th className="py-3 px-4 text-left text-white">År</th>
                      <th className="py-3 px-3 text-right text-white">Innskudd/uttak</th>
                      {aktiveAktiva.map(a => <th key={a.navn} className="py-3 px-3 text-right text-white">{a.navn}</th>)}
                      <th className="py-3 px-4 text-right text-white font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verdiutvikling.map((row, idx) => (
                      <tr key={row.year} className={"border-b border-gray-100 " + (idx % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                        <td className="py-3 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{row.year}</td>
                        <td className={"py-3 px-3 text-right " + (row.kontantstrom >= 0 ? "text-green-600" : "text-red-600")}>{idx === 0 ? '—' : formatCurrency(row.kontantstrom)}</td>
                        {aktiveAktiva.map(a => <td key={a.navn} className="py-3 px-3 text-right text-gray-600">{formatCurrency(row[a.navn] || 0)}</td>)}
                        <td className="py-3 px-4 text-right font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'losninger' && (
          <div className="space-y-6 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <div>
                  <h3 className="text-lg font-semibold text-white">Admin</h3>
                  <p className="text-xs text-blue-200">Kun UI-lås i nettleseren. Ikke ekte tilgangskontroll.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setVisAdminPanel(v => !v)} className="px-4 py-2 rounded-lg text-sm font-medium bg-white" style={{ color: PENSUM_COLORS.darkBlue }}>
                    {visAdminPanel ? 'Skjul admin' : 'Vis admin'}
                  </button>
                  {adminUnlocked && (
                    <button onClick={lockAdmin} className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-300 text-white hover:bg-blue-800">
                      Lås
                    </button>
                  )}
                </div>
              </div>
              {visAdminPanel && (
                <div className="p-6">
                  {!adminUnlocked ? (
                    <div className="max-w-md">
                      <label className="block text-sm font-medium mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Admin-passord</label>
                      <div className="flex gap-2">
                        <input type="password" value={adminUnlockValue} onChange={(e) => setAdminUnlockValue(e.target.value)} className="flex-1 border border-gray-200 rounded-lg py-2.5 px-4" placeholder="Skriv inn passord" />
                        <button onClick={unlockAdmin} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>Lås opp</button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Bytt gjerne ADMIN_PASSCODE direkte i koden.</p>
                      {adminStatus && <p className="text-sm mt-3" style={{ color: adminStatus.includes('Feil') ? PENSUM_COLORS.red : PENSUM_COLORS.green }}>{adminStatus}</p>}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-xl p-4">
                          <h4 className="font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Månedlig Excel-import</h4>
                          <p className="text-xs text-gray-500 mb-3">Last opp Excel-fil i samme format som datafeeden. Match skjer på produktnavn.</p>
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                            Last opp Excel
                            <input type="file" accept=".xlsx,.xls" onChange={importerPensumExcel} className="hidden" />
                          </label>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4">
                          <h4 className="font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Produktoppsett</h4>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={eksportPensumProdukter} className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50" style={{ color: PENSUM_COLORS.darkBlue }}>Eksporter JSON</button>
                            <label className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 cursor-pointer" style={{ color: PENSUM_COLORS.darkBlue }}>
                              Importer JSON
                              <input type="file" accept=".json" onChange={importerPensumProdukterJson} className="hidden" />
                            </label>
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4">
                          <h4 className="font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Tilbakestill</h4>
                          <button onClick={resetPensumProdukterTilDefault} className="px-3 py-2 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50">Gjenopprett standard</button>
                        </div>
                      </div>

                      {adminStatus && (
                        <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#F0FDF4', color: PENSUM_COLORS.green }}>
                          {adminStatus}
                        </div>
                      )}

                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <h4 className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Manuell vedlikehold av produkter</h4>
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                                <th className="py-2 px-3 text-left text-white">Navn</th>
                                <th className="py-2 px-3 text-left text-white">Kategori</th>
                                <th className="py-2 px-3 text-right text-white">Forv. avk</th>
                                <th className="py-2 px-3 text-right text-white">Årlig 3 år</th>
                                <th className="py-2 px-3 text-right text-white">Risiko 3 år</th>
                                <th className="py-2 px-3 text-left text-white">Sist oppdatert</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                ...pensumProdukter.enkeltfond.map((item) => ({ ...item, adminKategori: 'enkeltfond' })),
                                ...pensumProdukter.fondsportefoljer.map((item) => ({ ...item, adminKategori: 'fondsportefoljer' })),
                                ...pensumProdukter.alternative.map((item) => ({ ...item, adminKategori: 'alternative' }))
                              ].map((item, idx) => (
                                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="py-2 px-3">
                                    <input type="text" value={item.navn} onChange={(e) => updatePensumProduktField(item.adminKategori, item.id, 'navn', e.target.value)} className="w-full border border-gray-200 rounded py-1.5 px-2" />
                                  </td>
                                  <td className="py-2 px-3 text-gray-600">{item.adminKategori}</td>
                                  <td className="py-2 px-3">
                                    <input type="number" step="0.1" value={item.forventetAvkastning ?? ''} onChange={(e) => updatePensumProduktField(item.adminKategori, item.id, 'forventetAvkastning', e.target.value)} className="w-24 ml-auto block border border-gray-200 rounded py-1.5 px-2 text-right" />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input type="number" step="0.1" value={item.aarlig3ar ?? ''} onChange={(e) => updatePensumProduktField(item.adminKategori, item.id, 'aarlig3ar', e.target.value)} className="w-24 ml-auto block border border-gray-200 rounded py-1.5 px-2 text-right" />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input type="number" step="0.1" value={item.risiko3ar ?? ''} onChange={(e) => updatePensumProduktField(item.adminKategori, item.id, 'risiko3ar', e.target.value)} className="w-24 ml-auto block border border-gray-200 rounded py-1.5 px-2 text-right" />
                                  </td>
                                  <td className="py-2 px-3 text-gray-500">{item.sistOppdatert || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Header med standardporteføljer og innstillinger */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Pensum Porteføljesammensetning</h3>
                  <div className="flex items-center gap-4">
                    {/* Innstillinger */}
                    <div className="flex items-center gap-4 pr-4 border-r border-blue-400">
                      <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer">
                        <input type="checkbox" checked={brukBasis} onChange={(e) => setBrukBasis(e.target.checked)} className="w-4 h-4 rounded" />
                        <span>Inkluder Basis</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-blue-100 cursor-pointer">
                        <input type="checkbox" checked={visAlternative} onChange={(e) => setVisAlternative(e.target.checked)} className="w-4 h-4 rounded" />
                        <span>Alternative investeringer</span>
                      </label>
                    </div>
                    {/* Standardporteføljer */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-200">Standardportefølje:</span>
                      {Object.keys(pensumStandardPortefoljer).map(profil => (
                        <button key={profil} onClick={() => velgPensumStandardPortefolje(profil)} className={"px-3 py-1.5 rounded text-xs font-medium transition-colors " + (valgtPensumProfil === profil ? "bg-white text-blue-900" : "bg-blue-800 text-white hover:bg-blue-700")}>
                          {profil}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Venstre: Allokering */}
                  <div className="xl:col-span-2">
                    <h4 className="font-semibold mb-4 flex items-center justify-between" style={{ color: PENSUM_COLORS.darkBlue }}>
                      <span>Din portefølje</span>
                      <div className="flex items-center gap-3">
                        {pensumLikviditet.illikvid > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                            {pensumLikviditet.illikvid}% illikvid
                          </span>
                        )}
                        <span className={"text-sm px-3 py-1 rounded-full " + (pensumTotalVekt === 100 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          Total: {pensumTotalVekt}%
                        </span>
                      </div>
                    </h4>
                    
                    {/* Valgte produkter */}
                    <div className="space-y-2 mb-6">
                      {pensumAllokering.map(produkt => {
                        const alleProdukt = [...pensumProdukter.enkeltfond, ...pensumProdukter.fondsportefoljer, ...pensumProdukter.alternative];
                        const produktInfo = alleProdukt.find(p => p.id === produkt.id);
                        const erIllikvid = produktInfo?.likviditet === 'illikvid';
                        return (
                          <div key={produkt.id} className={"flex items-center gap-3 p-3 rounded-lg " + (erIllikvid ? "bg-amber-50 border border-amber-200" : "bg-gray-50")}>
                            <button onClick={() => fjernPensumProdukt(produkt.id)} className="text-red-500 hover:text-red-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="flex-1">
                              <p className="font-medium text-sm flex items-center gap-2" style={{ color: PENSUM_COLORS.darkBlue }}>
                                {produkt.navn}
                                {erIllikvid && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Illikvid</span>}
                              </p>
                              <p className="text-xs text-gray-500">{produkt.kategori === 'enkeltfond' ? 'Enkeltfond' : produkt.kategori === 'alternative' ? 'Alternativ investering' : 'Fondsportefølje'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="range" min="0" max="100" value={produkt.vekt} onChange={(e) => oppdaterPensumVekt(produkt.id, parseInt(e.target.value))} className="w-24" />
                              <input type="number" min="0" max="100" value={produkt.vekt} onChange={(e) => oppdaterPensumVekt(produkt.id, parseInt(e.target.value) || 0)} className="w-16 border border-gray-200 rounded py-1 px-2 text-sm text-right" />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legg til produkter */}
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Legg til produkt</h5>
                      <div className={"grid gap-4 " + (visAlternative ? "grid-cols-3" : "grid-cols-2")}>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">ENKELTFOND</p>
                          <div className="space-y-1">
                            {pensumProdukter.enkeltfond.filter(p => !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                              <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'enkeltfond')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-center justify-between">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">FONDSPORTEFØLJER</p>
                          <div className="space-y-1">
                            {pensumProdukter.fondsportefoljer.filter(p => !pensumAllokering.find(a => a.id === p.id) && (brukBasis || p.id !== 'basis')).map(produkt => (
                              <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'fondsportefoljer')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 border border-gray-200 flex items-center justify-between">
                                <span>{produkt.navn}</span>
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        {visAlternative && (
                          <div>
                            <p className="text-xs font-semibold text-amber-600 mb-2">ALTERNATIVE INVESTERINGER</p>
                            <div className="space-y-1">
                              {pensumProdukter.alternative.filter(p => !pensumAllokering.find(a => a.id === p.id)).map(produkt => (
                                <button key={produkt.id} onClick={() => leggTilPensumProdukt(produkt, 'alternative')} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-amber-50 border border-amber-200 flex items-center justify-between">
                                  <div>
                                    <span>{produkt.navn}</span>
                                    <span className="text-xs text-amber-600 ml-2">12% p.a.</span>
                                  </div>
                                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-amber-600 mt-2 italic">Alle alternative investeringer er illikvide</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Høyre: Kakediagrammer */}
                  <div className="space-y-6">
                    {/* Porteføljefordeling */}
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Porteføljefordeling</h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={pensumAllokering.filter(p => p.vekt > 0)} cx="50%" cy="50%" outerRadius={55} dataKey="vekt">
                            {pensumAllokering.filter(p => p.vekt > 0).map((entry, idx) => (
                              <Cell key={entry.id} fill={[PENSUM_COLORS.darkBlue, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green][idx % 7]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => v + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1">
                        {pensumAllokering.filter(p => p.vekt > 0).map((p, idx) => (
                          <div key={p.id} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: [PENSUM_COLORS.darkBlue, PENSUM_COLORS.lightBlue, PENSUM_COLORS.salmon, PENSUM_COLORS.teal, PENSUM_COLORS.gold, PENSUM_COLORS.purple, PENSUM_COLORS.green][idx % 7] }}></div>
                            <span className="flex-1 truncate">{p.navn}</span>
                            <span className="font-medium">{p.vekt}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aktivafordeling */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Aktivafordeling</h4>
                      <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                          <Pie data={pensumAktivafordeling.filter(p => p.value > 0)} cx="50%" cy="50%" outerRadius={45} dataKey="value">
                            {pensumAktivafordeling.filter(p => p.value > 0).map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => v + '%'} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {pensumAktivafordeling.filter(a => a.value > 0).map(a => (
                          <div key={a.name} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }}></div>
                            <span className="text-gray-600">{a.name}</span>
                            <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{a.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prognose */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Startkapital" value={formatCurrency(totalKapital)} />
              <StatCard label="Forventet avkastning" value={formatPercent(pensumForventetAvkastning)} subtext="årlig" color={PENSUM_COLORS.green} />
              <StatCard label="Sluttverdi" value={formatCurrency(pensumPrognose[pensumPrognose.length - 1]?.verdi || 0)} subtext={"etter " + horisont + " år"} />
              <StatCard label="Total avkastning" value={formatCurrency((pensumPrognose[pensumPrognose.length - 1]?.verdi || 0) - totalKapital)} color={PENSUM_COLORS.green} />
            </div>

            {/* Prognosegraf */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Utvikling i formuesverdi</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={pensumPrognose} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Verdi']} />
                    <Bar dataKey="verdi" fill={PENSUM_COLORS.darkBlue} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Historisk avkastning */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <h3 className="text-lg font-semibold text-white">Historisk avkastning</h3>
              </div>
              <div className="p-6">
                {/* Vektet porteføljeavkastning */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                  <h4 className="font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Din porteføljes historiske avkastning</h4>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    {[
                      { aar: '2024', key: 'aar2024' },
                      { aar: '2023', key: 'aar2023' },
                      { aar: '2022', key: 'aar2022' },
                      { aar: '2021', key: 'aar2021' },
                      { aar: '2020', key: 'aar2020' }
                    ].map(({ aar, key }) => (
                      <div key={aar}>
                        <p className="text-xs text-gray-500 mb-1">{aar}</p>
                        <p className={"text-lg font-bold " + (beregnPensumHistorikk[key] === null ? 'text-gray-400' : beregnPensumHistorikk[key] >= 0 ? 'text-green-600' : 'text-red-600')}>
                          {beregnPensumHistorikk[key] !== null ? (beregnPensumHistorikk[key] >= 0 ? '+' : '') + beregnPensumHistorikk[key].toFixed(1) + '%' : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabell med alle produkter */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                        <th className="py-3 px-4 text-left text-white">Navn</th>
                        <th className="py-3 px-3 text-right text-white">2024</th>
                        <th className="py-3 px-3 text-right text-white">2023</th>
                        <th className="py-3 px-3 text-right text-white">2022</th>
                        <th className="py-3 px-3 text-right text-white">2021</th>
                        <th className="py-3 px-3 text-right text-white">2020</th>
                        <th className="py-3 px-3 text-right text-white">Årlig 3 år</th>
                        <th className="py-3 px-3 text-right text-white">Risiko 3 år</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-100">
                        <td colSpan="8" className="py-2 px-4 font-semibold text-xs" style={{ color: PENSUM_COLORS.salmon }}>ENKELTFOND</td>
                      </tr>
                      {pensumProdukter.enkeltfond.map((p, idx) => (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2024 === null ? 'text-gray-400' : p.aar2024 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2024 !== null ? p.aar2024.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2023 === null ? 'text-gray-400' : p.aar2023 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2023 !== null ? p.aar2023.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2022 === null ? 'text-gray-400' : p.aar2022 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2022 !== null ? p.aar2022.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2021 === null ? 'text-gray-400' : p.aar2021 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2021 !== null ? p.aar2021.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2020 === null ? 'text-gray-400' : p.aar2020 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2020 !== null ? p.aar2020.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aarlig3ar === null ? 'text-gray-400' : p.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aarlig3ar !== null ? p.aarlig3ar.toFixed(1) + '%' : '—'}</td>
                          <td className="py-2 px-3 text-right text-gray-600">{p.risiko3ar !== null ? p.risiko3ar.toFixed(1) + '%' : '—'}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100">
                        <td colSpan="8" className="py-2 px-4 font-semibold text-xs" style={{ color: PENSUM_COLORS.salmon }}>FONDSPORTEFØLJER</td>
                      </tr>
                      {pensumProdukter.fondsportefoljer.map((p, idx) => (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2024 === null ? 'text-gray-400' : p.aar2024 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2024 !== null ? p.aar2024.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2023 === null ? 'text-gray-400' : p.aar2023 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2023 !== null ? p.aar2023.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2022 === null ? 'text-gray-400' : p.aar2022 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2022 !== null ? p.aar2022.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2021 === null ? 'text-gray-400' : p.aar2021 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2021 !== null ? p.aar2021.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aar2020 === null ? 'text-gray-400' : p.aar2020 >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aar2020 !== null ? p.aar2020.toFixed(1) + '%' : '—'}</td>
                          <td className={"py-2 px-3 text-right " + (p.aarlig3ar === null ? 'text-gray-400' : p.aarlig3ar >= 0 ? 'text-green-600' : 'text-red-600')}>{p.aarlig3ar !== null ? p.aarlig3ar.toFixed(1) + '%' : '—'}</td>
                          <td className="py-2 px-3 text-right text-gray-600">{p.risiko3ar !== null ? p.risiko3ar.toFixed(1) + '%' : '—'}</td>
                        </tr>
                      ))}
                      {visAlternative && (
                        <>
                          <tr className="bg-amber-100">
                            <td colSpan="8" className="py-2 px-4 font-semibold text-xs text-amber-700">ALTERNATIVE INVESTERINGER (ILLIKVIDE)</td>
                          </tr>
                          {pensumProdukter.alternative.map((p, idx) => (
                            <tr key={p.id} className={idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                              <td className="py-2 px-4 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{p.navn}</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                              <td className="py-2 px-3 text-right text-green-600">{p.forventetAvkastning.toFixed(1)}%</td>
                              <td className="py-2 px-3 text-right text-gray-400">—</td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-xs text-gray-500 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <strong>Viktig informasjon:</strong> Historisk avkastning er ingen garanti for fremtidig avkastning. Avkastningen kan bli negativ som følge av kurstap. Avkastning for enkeltfond er netto etter alle løpende kostnader. Avkastning for fondsporteføljer er beregnet etter et kostnadsestimat på 1,2% per år. Alternative investeringer har begrenset likviditet og lang bindingstid.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenario' && (
          <div className="space-y-6 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Scenario-parametere</h3></div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <input type="checkbox" checked={showPessimistic} onChange={(e) => setShowPessimistic(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-red-600" />
                  <label className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Vis pessimistisk scenario</label>
                </div>
                <div className={"grid gap-6 " + (showPessimistic ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
                  {showPessimistic && (
                    <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                      <label className="block text-sm font-semibold mb-3 text-red-700">Pessimistisk avkastning</label>
                      <input type="range" min="-10" max={vektetAvkastning} step="0.5" value={scenarioParams.pessimistisk} onChange={(e) => setScenarioParams(p => ({...p, pessimistisk: parseFloat(e.target.value)}))} className="w-full h-2 bg-red-200 rounded-lg cursor-pointer" />
                      <div className="text-center mt-2 font-bold text-red-700 text-xl">{formatPercent(scenarioParams.pessimistisk)}</div>
                    </div>
                  )}
                  <div className="p-5 rounded-xl border-2" style={{ backgroundColor: PENSUM_COLORS.lightGray, borderColor: PENSUM_COLORS.darkBlue }}>
                    <label className="block text-sm font-semibold mb-3" style={{ color: PENSUM_COLORS.darkBlue }}>Forventet avkastning</label>
                    <div className="text-center py-2"><span className="font-bold text-2xl" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(vektetAvkastning)}</span><span className="text-sm text-gray-500 block mt-1">basert på allokering</span></div>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                    <label className="block text-sm font-semibold mb-3 text-green-700">Optimistisk avkastning</label>
                    <input type="range" min={vektetAvkastning} max="25" step="0.5" value={scenarioParams.optimistisk} onChange={(e) => setScenarioParams(p => ({...p, optimistisk: parseFloat(e.target.value)}))} className="w-full h-2 rounded-lg cursor-pointer bg-green-200" />
                    <div className="text-center mt-2 font-bold text-green-700 text-xl">{formatPercent(scenarioParams.optimistisk)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}><h3 className="text-lg font-semibold text-white">Scenarioanalyse - Verdiutvikling</h3></div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={scenarioData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                    <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 12, fontWeight: 600 }} />
                    <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend iconType="circle" />
                    {showPessimistic && <Line type="monotone" dataKey="pessimistisk" name="Pessimistisk" stroke={PENSUM_COLORS.red} strokeWidth={2.5} strokeDasharray="5 5" dot={false} />}
                    <Line type="monotone" dataKey="forventet" name="Forventet" stroke={PENSUM_COLORS.darkBlue} strokeWidth={3.5} dot={false} />
                    <Line type="monotone" dataKey="optimistisk" name="Optimistisk" stroke={PENSUM_COLORS.green} strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={"grid gap-4 " + (showPessimistic ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
              {showPessimistic && <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><div className="text-red-600 font-semibold mb-2">Pessimistisk</div><div className="text-3xl font-bold text-red-700">{formatCurrency(scenarioData[scenarioData.length - 1]?.pessimistisk || 0)}</div><div className="text-sm text-red-500 mt-2">etter {horisont} år</div></div>}
              <div className="border-2 rounded-xl p-6 text-center" style={{ borderColor: PENSUM_COLORS.darkBlue, backgroundColor: PENSUM_COLORS.lightGray }}><div className="font-semibold mb-2" style={{ color: PENSUM_COLORS.darkBlue }}>Forventet</div><div className="text-3xl font-bold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(scenarioData[scenarioData.length - 1]?.forventet || 0)}</div><div className="text-sm text-gray-500 mt-2">etter {horisont} år</div></div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"><div className="text-green-600 font-semibold mb-2">Optimistisk</div><div className="text-3xl font-bold text-green-700">{formatCurrency(scenarioData[scenarioData.length - 1]?.optimistisk || 0)}</div><div className="text-sm text-green-500 mt-2">etter {horisont} år</div></div>
            </div>
          </div>
        )}

        {activeTab === 'rapport' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-gray-200">
                <img src={PENSUM_LOGO} alt="Pensum" className="h-20" />
                <div className="text-right">
                  <div className="text-base font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Investeringsprognose</div>
                  <div className="text-xs text-gray-500">{formatDateEuro(dato)}</div>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-100 pb-6">
                  <div><span className="text-gray-500">Utarbeidet for:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{kundeNavn || '—'}</strong></div>
                  <div className="text-right"><span className="text-gray-500">Rådgiver:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{radgiver || '—'}</strong></div>
                  <div><span className="text-gray-500">Risikoprofil:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{risikoprofil}</strong></div>
                  <div className="text-right"><span className="text-gray-500">Horisont:</span> <strong style={{ color: PENSUM_COLORS.darkBlue }}>{horisont} år</strong></div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Nøkkeltall</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><StatCard label="Startkapital" value={formatCurrency(totalKapital)} /><StatCard label="Horisont" value={horisont + " år"} /><StatCard label="Forv. avkastning" value={formatPercent(vektetAvkastning)} /><StatCard label="Sluttverdi" value={formatCurrency(verdiutvikling[verdiutvikling.length - 1]?.total || 0)} color={PENSUM_COLORS.green} /></div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Anbefalt allokering</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <table className="w-full text-sm"><thead><tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}><th className="py-3 px-4 text-left">Aktivaklasse</th><th className="py-3 px-4 text-center">Andel</th><th className="py-3 px-4 text-right">Beløp</th></tr></thead><tbody>{aktiveAktiva.map(a => <tr key={a.navn} className="border-b border-gray-100"><td className="py-3 px-4 flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[a.navn] }}></div>{a.navn}</td><td className="py-3 px-4 text-center">{formatPercent(a.vekt)}</td><td className="py-3 px-4 text-right">{formatCurrency((a.vekt/100)*totalKapital)}</td></tr>)}</tbody></table>
                    <div className="flex justify-center items-center"><ResponsiveContainer width={200} height={200}><PieChart><Pie data={aktiveAktiva.map(a => ({ name: a.navn, value: a.vekt }))} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value">{aktiveAktiva.map(a => <Cell key={a.navn} fill={ASSET_COLORS[a.navn]} stroke="white" strokeWidth={2} />)}</Pie></PieChart></ResponsiveContainer></div>
                  </div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Forventet verdiutvikling</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={verdiutvikling} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
                      <XAxis dataKey="year" axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => 'kr ' + formatNumber(v)} axisLine={{ stroke: PENSUM_COLORS.darkBlue, strokeWidth: 2 }} tickLine={false} tick={{ fill: PENSUM_COLORS.darkBlue, fontSize: 10 }} width={90} />
                      <Tooltip formatter={(v, n) => [formatCurrency(v), n]} />
                      <Legend iconType="circle" iconSize={8} />
                      {aktiveAktiva.map((a) => <Bar key={a.navn} dataKey={a.navn} stackId="a" fill={ASSET_COLORS[a.navn] || CATEGORY_COLORS[a.kategori]} />)}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Scenarioanalyse etter {horisont} år</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 rounded-xl" style={{ backgroundColor: PENSUM_COLORS.lightGray }}><div className="text-sm font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Forventet</div><div className="text-2xl font-bold mt-2" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(scenarioData[scenarioData.length - 1]?.forventet || 0)}</div></div>
                    <div className="text-center p-6 bg-green-50 rounded-xl"><div className="text-sm font-medium text-green-600">Optimistisk</div><div className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(scenarioData[scenarioData.length - 1]?.optimistisk || 0)}</div></div>
                  </div>
                </div>
                <div><h2 className="text-xl font-bold mb-6 pb-3 border-b-2" style={{ color: PENSUM_COLORS.darkBlue, borderColor: PENSUM_COLORS.darkBlue }}>Detaljert verdiutvikling</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: PENSUM_COLORS.lightGray }}>
                          <th className="py-2 px-2 text-left font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>År</th>
                          {aktiveAktiva.map(a => <th key={a.navn} className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{a.navn}</th>)}
                          <th className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verdiutvikling.map((row, idx) => (
                          <tr key={row.year} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="py-2 px-2 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{row.year}</td>
                            {aktiveAktiva.map(a => <td key={a.navn} className="py-2 px-2 text-right text-gray-600">{formatCurrency(row[a.navn] || 0)}</td>)}
                            <td className="py-2 px-2 text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(row.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-xs text-gray-500 border-t border-gray-200 pt-6"><p className="font-semibold mb-2">Viktig informasjon</p><p>Denne prognosen er kun veiledende og basert på historiske avkastningsforventninger. Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan både øke og synke.</p></div>
              </div>
              <div className="px-10 py-5 text-center text-sm border-t border-gray-100" style={{ backgroundColor: PENSUM_COLORS.lightGray }}><span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>Pensum Asset Management</span><span className="mx-3 text-gray-300">|</span><span className="text-gray-500">pensumgroup.no</span><span className="mx-3 text-gray-300">|</span><span className="text-gray-500">+47 23 89 68 44</span></div>
            </div>
            <div className="flex flex-col items-center gap-4 no-print">
              <button onClick={handleDownloadHTML} className="px-8 py-4 text-white rounded-xl font-semibold hover:opacity-90 shadow-lg flex items-center gap-3" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Last ned rapport
              </button>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">Lagre som PDF:</p>
                <p className="text-xs text-gray-600">1. Last ned filen og åpne den i nettleseren</p>
                <p className="text-xs text-gray-600">2. Trykk <span className="font-mono bg-gray-200 px-1 rounded">Ctrl+P</span> (Windows) eller <span className="font-mono bg-gray-200 px-1 rounded">Cmd+P</span> (Mac)</p>
                <p className="text-xs text-gray-600">3. Velg "Lagre som PDF" som skriver</p>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="mt-12 py-6 text-center border-t border-gray-200 bg-white no-print">
        <img src={PENSUM_LOGO} alt="Pensum" className="h-14 mx-auto mb-3" />
        <div className="text-xs text-gray-500">Frøyas gate 15, 0273 Oslo • (+47) 23 89 68 44 • pensumgroup.no</div>
      </footer>
    </div>
  );
}
