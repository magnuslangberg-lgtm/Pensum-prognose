import * as PptxModule from 'pptxgenjs';

const PRODUKT_NAVN = {
  'global-core-active': 'Pensum Global Core Active',
  'global-edge': 'Pensum Global Edge',
  basis: 'Pensum Basis',
  'global-hoyrente': 'Pensum Global Høyrente',
  'nordisk-hoyrente': 'Pensum Nordisk Høyrente',
  'norge-a': 'Pensum Norge A',
  'energy-a': 'Pensum Global Energy A',
  'banking-d': 'Pensum Nordic Banking Sector D',
  'financial-d': 'Pensum Financial Opportunity D'
};

const COLORS = {
  navy: '0D2240',
  blue: '5B9BD5',
  salmon: 'D4886B',
  green: '16A34A',
  amber: 'D97706',
  red: 'DC2626',
  text: '1E293B',
  muted: '64748B',
  line: 'E2E8F0',
  bg: 'F7FAFC'
};

function n(v, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
  }).format(n(value));
}

function formatPercent(value) {
  return `${n(value).toFixed(1)}%`;
}

function resolvePptxConstructor(mod) {
  if (typeof mod === 'function') return mod;
  if (mod && typeof mod.default === 'function') return mod.default;
  if (mod && mod.default && typeof mod.default.default === 'function') return mod.default.default;
  if (mod && typeof mod.PptxGenJS === 'function') return mod.PptxGenJS;
  return null;
}

function getPptxConstructor() {
  return resolvePptxConstructor(PptxModule);
}

function parsePageSpec(spec = '') {
  const out = new Set();
  const s = String(spec || '').trim();
  if (!s) return out;
  s.split(',').map((p) => p.trim()).filter(Boolean).forEach((part) => {
    if (/^\d+\+$/.test(part)) {
      const start = parseInt(part.replace('+', ''), 10);
      for (let i = start; i <= start + 8; i += 1) out.add(i);
      return;
    }
    if (/^\d+-\d+$/.test(part)) {
      const [a, b] = part.split('-').map((x) => parseInt(x, 10));
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      for (let i = lo; i <= hi; i += 1) out.add(i);
      return;
    }
    if (/^\d+$/.test(part)) out.add(parseInt(part, 10));
  });
  return out;
}

function parseDynamicDescriptions(txt = '') {
  const map = {};
  String(txt || '').split('\n').map((l) => l.trim()).filter(Boolean).forEach((line) => {
    const m = line.match(/^side\s*(\d+)\s*:\s*(.+)$/i);
    if (m) map[parseInt(m[1], 10)] = m[2].trim();
  });
  return map;
}

function addHeader(pptx, slide, subtitle = '') {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.5, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', pt: 0 } });
  slide.addText('Pensum Asset Management', { x: 0.6, y: 0.12, w: 6, h: 0.25, fontSize: 11, bold: true, color: COLORS.navy });
  if (subtitle) {
    slide.addText(subtitle, { x: 7.8, y: 0.12, w: 4.9, h: 0.25, align: 'right', fontSize: 10, color: COLORS.muted });
  }
}

function addFooter(pptx, slide, pageNo, note = '') {
  slide.addShape(pptx.ShapeType.line, { x: 0.6, y: 7.1, w: 12.1, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Side ${pageNo}`, { x: 0.6, y: 7.14, w: 2, h: 0.2, fontSize: 9, color: COLORS.muted });
  if (note) slide.addText(note, { x: 2.0, y: 7.14, w: 8.8, h: 0.2, fontSize: 9, color: COLORS.muted, align: 'center' });
  slide.addText(new Date().toLocaleDateString('nb-NO'), { x: 10.8, y: 7.14, w: 1.9, h: 0.2, fontSize: 9, color: COLORS.muted, align: 'right' });
}

function calculateScenarios(data) {
  const total = n(data.totalKapital);
  const years = Math.max(1, Math.round(n(data.horisont, 10)));
  const expected = n(data.vektetAvkastning);
  const optimistic = expected + 2;
  const conservative = Math.max(expected - 3, -5);
  const project = (rate) => total * Math.pow(1 + rate / 100, years);
  return { years, expected, optimistic, conservative, expValue: project(expected), optValue: project(optimistic), consValue: project(conservative) };
}

function prepareData(data) {
  const kunde = data.kundeNavn || 'Investor';
  const total = n(data.totalKapital);
  const risiko = data.risikoProfil || 'Ikke angitt';
  const horisont = Math.max(1, Math.round(n(data.horisont, 10)));
  const avkastning = n(data.vektetAvkastning);
  const allokering = (Array.isArray(data.allokering) ? data.allokering : [])
    .map((a) => ({ navn: a.navn || 'Ukjent', vekt: n(a.vekt) }))
    .filter((a) => a.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  const topAlloc = allokering.slice(0, 8);
  const products = (Array.isArray(data.produkterIBruk) ? data.produkterIBruk : []).map((id) => ({ id, navn: PRODUKT_NAVN[id] || id }));
  const malConfig = data.malConfig || {};
  const dynamicDescriptions = parseDynamicDescriptions(malConfig.dynamiskBeskrivelse || '');
  const dynamicPages = [...parsePageSpec(malConfig.dynamiskeSider || '4-9')].sort((a, b) => a - b).filter((p) => p >= 4 && p <= 9);
  const fixedPages = [...parsePageSpec(malConfig.fasteSider || '1-3,10+')].sort((a, b) => a - b);

  return {
    kunde,
    total,
    risiko,
    horisont,
    avkastning,
    allokering,
    topAlloc,
    products,
    scenario: calculateScenarios({ totalKapital: total, horisont, vektetAvkastning: avkastning }),
    malConfig,
    dynamicDescriptions,
    dynamicPages: dynamicPages.length > 0 ? dynamicPages : [4, 5, 6, 7, 8, 9],
    fixedPages
  };
}

function renderFixedSlides(pptx, prepared) {
  const { kunde, total, risiko, horisont, avkastning, malConfig } = prepared;

  const s1 = pptx.addSlide();
  addHeader(pptx, s1, 'Investeringsforslag');
  s1.addText('Investeringsforslag', { x: 0.8, y: 1.0, w: 8, h: 0.8, fontSize: 38, bold: true, color: COLORS.navy });
  s1.addText(kunde, { x: 0.8, y: 1.95, w: 8, h: 0.5, fontSize: 24, bold: true, color: COLORS.salmon });
  s1.addText(`Dato: ${new Date().toLocaleDateString('nb-NO')}`, { x: 0.8, y: 2.5, w: 4, h: 0.3, fontSize: 12, color: COLORS.muted });
  s1.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 3.2, w: 12.0, h: 2.6, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.06 });
  s1.addText('Kort oppsummering', { x: 1.1, y: 3.45, w: 4, h: 0.4, fontSize: 18, bold: true, color: COLORS.navy });
  s1.addText(`• Total kapital: ${formatCurrency(total)}\n• Risikoprofil: ${risiko}\n• Horisont: ${horisont} år\n• Forventet avkastning: ${formatPercent(avkastning)} p.a.`, { x: 1.15, y: 3.95, w: 6.5, h: 1.8, fontSize: 14, color: COLORS.text, breakLine: true });
  addFooter(pptx, s1, 1, malConfig?.navn ? `Mal: ${malConfig.navn}` : '');

  const s2 = pptx.addSlide();
  addHeader(pptx, s2, 'Investeringscase');
  s2.addText('Anbefaling i ett blikk', { x: 0.8, y: 0.9, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s2.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });
  s2.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 1.8, w: 12, h: 4.9, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
  s2.addText([
    `• Porteføljen foreslås tilpasset ${risiko.toLowerCase()} risikoprofil med ${horisont} års horisont.`,
    `• Forventet annualisert avkastning estimeres til ${formatPercent(avkastning)} basert på allokering og produktvalg.`,
    '• Løsningen er bygget for løpende oppfølging i Pensum-plattformen med tydelig risikorapportering.',
    '• Forslaget skal brukes som beslutningsstøtte og kvalitetssikres før implementering.'
  ].join('\n'), { x: 1.2, y: 2.2, w: 10.8, h: 3.8, fontSize: 16, color: COLORS.text, breakLine: true });
  addFooter(pptx, s2, 2);

  const s3 = pptx.addSlide();
  addHeader(pptx, s3, 'Malstatus');
  s3.addText('Maloppsett (admin)', { x: 0.8, y: 0.9, w: 8, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s3.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });
  s3.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 1.9, w: 12, h: 4.9, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
  s3.addText(`Malnavn: ${malConfig?.navn || 'Ikke angitt'}\nFil: ${malConfig?.filnavn || 'Ikke angitt'}\nFaste sider: ${malConfig?.fasteSider || '—'}\nDynamiske sider: ${malConfig?.dynamiskeSider || '—'}`, { x: 1.2, y: 2.3, w: 11.2, h: 1.9, fontSize: 14, color: COLORS.text, breakLine: true });
  s3.addText('Denne generatoren fyller de dynamiske sidene i tråd med sidekartet over.', { x: 1.2, y: 5.1, w: 11.2, h: 0.4, fontSize: 12, color: COLORS.muted });
  addFooter(pptx, s3, 3);
}

function renderDynamicPage(pptx, pageNumber, prepared) {
  const { topAlloc, total, products, scenario, dynamicDescriptions } = prepared;
  const userTitle = dynamicDescriptions[pageNumber];

  const slide = pptx.addSlide();
  addHeader(pptx, slide, `Dynamisk side ${pageNumber}`);
  const defaultTitle = {
    4: 'Porteføljen i dag',
    5: 'Aksjeandel vs verdensindeks',
    6: 'Verdensindeksen',
    7: 'Pensums porteføljeforslag',
    8: 'Avkastning',
    9: 'Risiko og månedsoppsummering'
  }[pageNumber] || `Side ${pageNumber}`;
  const title = userTitle || defaultTitle;

  slide.addText(title, { x: 0.8, y: 0.9, w: 9.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  slide.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });

  if (pageNumber === 4 || pageNumber === 7) {
    slide.addTable(
      [['Aktivaklasse', 'Andel', 'Beløp'], ...topAlloc.map((a) => [a.navn, `${a.vekt.toFixed(1)}%`, formatCurrency((a.vekt / 100) * total)])],
      { x: 0.8, y: 1.9, w: 7.4, colW: [4.2, 1.1, 2.1], fontSize: 11, border: { type: 'solid', color: COLORS.line, pt: 1 }, fill: 'FFFFFF', color: COLORS.text }
    );
    if (topAlloc.length > 0) {
      slide.addChart(pptx.ChartType.bar, [{ name: 'Andel', labels: topAlloc.map((a) => a.navn), values: topAlloc.map((a) => a.vekt) }], {
        x: 8.5, y: 2.0, w: 4.2, h: 4.5,
        barDir: 'bar', showLegend: false, valAxisMaxVal: 100, valAxisMinVal: 0, valAxisMajorUnit: 10,
        chartColors: [COLORS.navy], showValue: true
      });
    }
  } else if (pageNumber === 5 || pageNumber === 6 || pageNumber === 8) {
    const labels = ['Konservativ', 'Forventet', 'Optimistisk'];
    const values = [scenario.consValue, scenario.expValue, scenario.optValue].map((v) => Math.round(v / 1000));
    slide.addChart(pptx.ChartType.bar, [{ name: 'Estimert sluttverdi (kNOK)', labels, values }], {
      x: 1.0, y: 2.0, w: 11.5, h: 3.8,
      showLegend: false, valGridLine: { color: 'EEF2F7', style: 'dash' },
      chartColors: [COLORS.red, COLORS.navy, COLORS.green], showValue: true
    });
    slide.addText(`Horisont: ${scenario.years} år | Forv. avkastning: ${formatPercent(scenario.expected)} p.a.`, { x: 1.0, y: 6.0, w: 11.3, h: 0.4, fontSize: 12, color: COLORS.muted, align: 'center' });
  } else if (pageNumber === 9) {
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 1.9, w: 12.0, h: 4.9, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
    const names = products.length ? products.map((p) => p.navn) : ['Ingen produkter valgt'];
    slide.addText(`Valgte produkter:\n${names.map((x) => `• ${x}`).join('\n')}\n\nRisikonivå: ${prepared.risiko}\nForventet avkastning: ${formatPercent(prepared.avkastning)} p.a.`, { x: 1.2, y: 2.3, w: 11.2, h: 4.1, fontSize: 14, color: COLORS.text, breakLine: true });
  } else {
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 1.9, w: 12.0, h: 4.9, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
    slide.addText('Ingen standardinnhold definert for denne siden i nåværende generator.', { x: 1.2, y: 2.6, w: 11.0, h: 1.0, fontSize: 14, color: COLORS.muted });
  }

  addFooter(pptx, slide, pageNumber, userTitle ? `Admin-tekst: ${userTitle}` : '');
}

function buildPptx(PptxGenJS, data) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag - ${data.kundeNavn || 'Kunde'}`;
  pptx.lang = 'nb-NO';

  const prepared = prepareData(data);
  renderFixedSlides(pptx, prepared);
  prepared.dynamicPages.forEach((p) => renderDynamicPage(pptx, p, prepared));
  return pptx;
}

function escapePdfText(text = '') {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdfBuffer(data) {
  const rows = [
    'Pensum Asset Management',
    'Investeringsforslag',
    `Kunde: ${data.kundeNavn || 'Investor'}`,
    `Dato: ${new Date().toLocaleDateString('nb-NO')}`,
    '',
    `Total kapital: ${formatCurrency(data.totalKapital)}`,
    `Risikoprofil: ${data.risikoProfil || 'Ikke angitt'}`,
    `Horisont: ${Math.max(1, Math.round(n(data.horisont, 10)))} år`,
    `Forventet avkastning: ${formatPercent(data.vektetAvkastning)} p.a.`
  ];
  const streamCmd = rows.map((line, i) => {
    const y = 810 - (i * 20);
    return `BT /F1 ${i < 2 ? 20 : 12} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
  }).join('\n');

  const objects = [];
  const addObject = (content) => { objects.push(content); return objects.length; };
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const contentId = addObject(`<< /Length ${Buffer.byteLength(streamCmd, 'utf8')} >>\nstream\n${streamCmd}\nendstream`);
  const pageId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  const pagesId = addObject(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`);
  objects[pageId - 1] = objects[pageId - 1].replace('/Parent 0 0 R', `/Parent ${pagesId} 0 R`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body || {};
    try {
      const PptxGenJS = getPptxConstructor();
      if (!PptxGenJS) throw new Error('pptxgenjs ikke tilgjengelig eller ugyldig eksport');
      const pptx = buildPptx(PptxGenJS, data);
      const buffer = await pptx.write({ outputType: 'nodebuffer' });
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      res.setHeader('X-Pensum-Output-Format', 'pptx');
      res.setHeader('X-Pensum-Template-Applied', data?.malConfig?.filnavn ? 'metadata-mode' : 'no-template');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    } catch (pptErr) {
      console.warn('PPTX-generering feilet, bruker PDF-fallback:', pptErr.message);
      const buffer = buildSimplePdfBuffer(data);
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      res.setHeader('X-Pensum-Output-Format', 'pdf-fallback');
      res.setHeader('X-Pensum-Generator-Message', encodeURIComponent('PPTX utilgjengelig i miljøet - leverer PDF fallback'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' }, responseLimit: '20mb' }
};
