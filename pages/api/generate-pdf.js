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

function addHeader(pptx, slide, subtitle = '') {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.5,
    fill: { color: 'FFFFFF' },
    line: { color: 'FFFFFF', pt: 0 }
  });
  slide.addText('Pensum Asset Management', {
    x: 0.6,
    y: 0.12,
    w: 6,
    h: 0.25,
    fontSize: 11,
    bold: true,
    color: COLORS.navy
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 7.8,
      y: 0.12,
      w: 4.9,
      h: 0.25,
      align: 'right',
      fontSize: 10,
      color: COLORS.muted
    });
  }
}

function addFooter(pptx, slide, pageNo, note = '') {
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6,
    y: 7.1,
    w: 12.1,
    h: 0,
    line: { color: COLORS.line, pt: 1 }
  });
  slide.addText(`Side ${pageNo}`, {
    x: 0.6,
    y: 7.14,
    w: 2,
    h: 0.2,
    fontSize: 9,
    color: COLORS.muted
  });
  if (note) {
    slide.addText(note, {
      x: 2.0,
      y: 7.14,
      w: 8.8,
      h: 0.2,
      fontSize: 9,
      color: COLORS.muted,
      align: 'center'
    });
  }
  slide.addText(new Date().toLocaleDateString('nb-NO'), {
    x: 10.8,
    y: 7.14,
    w: 1.9,
    h: 0.2,
    fontSize: 9,
    color: COLORS.muted,
    align: 'right'
  });
}

function calculateScenarios(data) {
  const total = n(data.totalKapital);
  const years = Math.max(1, Math.round(n(data.horisont, 10)));
  const expected = n(data.vektetAvkastning);
  const optimistic = expected + 2;
  const conservative = Math.max(expected - 3, -5);
  const project = (rate) => total * Math.pow(1 + rate / 100, years);
  return {
    years,
    expected,
    optimistic,
    conservative,
    expValue: project(expected),
    optValue: project(optimistic),
    consValue: project(conservative)
  };
}

function buildPptx(PptxGenJS, data) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag - ${data.kundeNavn || 'Kunde'}`;
  pptx.lang = 'nb-NO';

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
  const products = (Array.isArray(data.produkterIBruk) ? data.produkterIBruk : [])
    .map((id) => ({ id, navn: PRODUKT_NAVN[id] || id }));
  const scenario = calculateScenarios({ totalKapital: total, horisont, vektetAvkastning: avkastning });

  // 1: Cover
  const s1 = pptx.addSlide();
  s1.background = { color: COLORS.bg };
  addHeader(pptx, s1, 'Investeringsforslag');
  s1.addText('Investeringsforslag', { x: 0.8, y: 1.0, w: 8, h: 0.8, fontSize: 38, bold: true, color: COLORS.navy });
  s1.addText(kunde, { x: 0.8, y: 1.95, w: 8, h: 0.5, fontSize: 24, bold: true, color: COLORS.salmon });
  s1.addText(`Dato: ${new Date().toLocaleDateString('nb-NO')}`, { x: 0.8, y: 2.5, w: 4, h: 0.3, fontSize: 12, color: COLORS.muted });
  s1.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 3.2, w: 12.0, h: 2.6, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.06 });
  s1.addText('Kort oppsummering', { x: 1.1, y: 3.45, w: 4, h: 0.4, fontSize: 18, bold: true, color: COLORS.navy });
  s1.addText(
    `• Total kapital: ${formatCurrency(total)}\n• Risikoprofil: ${risiko}\n• Horisont: ${horisont} år\n• Forventet avkastning: ${formatPercent(avkastning)} p.a.`,
    { x: 1.15, y: 3.95, w: 6.5, h: 1.8, fontSize: 14, color: COLORS.text, breakLine: true }
  );
  addFooter(pptx, s1, 1, data.malConfig?.navn ? `Mal: ${data.malConfig.navn}` : '');

  // 2: Investment thesis
  const s2 = pptx.addSlide();
  addHeader(pptx, s2, 'Investeringscase');
  s2.addText('Anbefaling i ett blikk', { x: 0.8, y: 0.9, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s2.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });
  const bullets = [
    `Porteføljen foreslås tilpasset en ${risiko.toLowerCase()} risikoprofil med ${horisont} års horisont.`,
    `Forventet annualisert avkastning estimeres til ${formatPercent(avkastning)} basert på aktivafordeling og produktutvalg.`,
    `Anbefalingen balanserer likvide byggesteiner og spesialiserte fond for robust diversifisering.`,
    `Løsningen er bygget for løpende oppfølging i Pensum-plattformen med tydelig risikorapportering.`
  ];
  s2.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 1.8, w: 12, h: 4.9, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
  s2.addText(bullets.map((b) => `• ${b}`).join('\n'), { x: 1.2, y: 2.2, w: 10.8, h: 3.8, fontSize: 16, color: COLORS.text, breakLine: true });
  addFooter(pptx, s2, 2);

  // 3: Allocation
  const s3 = pptx.addSlide();
  addHeader(pptx, s3, 'Allokering');
  s3.addText('Anbefalt allokering', { x: 0.8, y: 0.9, w: 6.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s3.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });

  s3.addTable(
    [['Aktivaklasse', 'Andel', 'Beløp'], ...topAlloc.map((a) => [a.navn, `${a.vekt.toFixed(1)}%`, formatCurrency((a.vekt / 100) * total)])],
    {
      x: 0.8,
      y: 1.8,
      w: 7.5,
      colW: [4.3, 1.1, 2.1],
      fontSize: 11,
      border: { type: 'solid', color: COLORS.line, pt: 1 },
      color: COLORS.text,
      fill: 'FFFFFF'
    }
  );

  if (topAlloc.length > 0) {
    s3.addChart(pptx.ChartType.bar, [{ name: 'Andel', labels: topAlloc.map((a) => a.navn), values: topAlloc.map((a) => a.vekt) }], {
      x: 8.6,
      y: 1.9,
      w: 4.1,
      h: 4.7,
      barDir: 'bar',
      catAxisLabelRotate: -20,
      showLegend: false,
      valAxisMaxVal: 100,
      valAxisMinVal: 0,
      valAxisMajorUnit: 10,
      chartColors: [COLORS.navy],
      showValue: true,
      valGridLine: { color: 'EEF2F7', style: 'dash' }
    });
  }
  addFooter(pptx, s3, 3);

  // 4: Scenario
  const s4 = pptx.addSlide();
  addHeader(pptx, s4, 'Scenarioanalyse');
  s4.addText(`Scenarioanalyse (${scenario.years} år)`, { x: 0.8, y: 0.9, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s4.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });

  const cards = [
    { title: 'Konservativ', rate: scenario.conservative, value: scenario.consValue, color: COLORS.red, bg: 'FEF2F2' },
    { title: 'Forventet', rate: scenario.expected, value: scenario.expValue, color: COLORS.navy, bg: 'EFF6FF' },
    { title: 'Optimistisk', rate: scenario.optimistic, value: scenario.optValue, color: COLORS.green, bg: 'ECFDF5' }
  ];

  cards.forEach((c, i) => {
    const x = 0.95 + i * 4.1;
    s4.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 3.7, h: 3.4, fill: { color: c.bg }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
    s4.addText(c.title, { x: x + 0.2, y: 2.2, w: 3.3, h: 0.4, fontSize: 14, bold: true, color: c.color, align: 'center' });
    s4.addText(`Avkastning: ${formatPercent(c.rate)} p.a.`, { x: x + 0.2, y: 2.75, w: 3.3, h: 0.3, fontSize: 11, color: COLORS.text, align: 'center' });
    s4.addText(formatCurrency(c.value), { x: x + 0.2, y: 3.4, w: 3.3, h: 0.6, fontSize: 20, bold: true, color: c.color, align: 'center' });
  });

  s4.addText('Scenarioene er deterministiske estimater basert på dagens forutsetninger og skal brukes som beslutningsstøtte.', {
    x: 1,
    y: 5.85,
    w: 11.7,
    h: 0.5,
    fontSize: 11,
    color: COLORS.muted,
    align: 'center'
  });
  addFooter(pptx, s4, 4);

  // 5: Product selection
  const s5 = pptx.addSlide();
  addHeader(pptx, s5, 'Produktutvalg');
  s5.addText('Valgte produkter i forslaget', { x: 0.8, y: 0.9, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s5.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });

  const names = products.length > 0 ? products.map((p) => p.navn) : ['Ingen produkter valgt'];
  s5.addShape(pptx.ShapeType.roundRect, { x: 0.95, y: 1.9, w: 12.0, h: 4.9, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
  s5.addText(names.map((name) => `• ${name}`).join('\n'), { x: 1.2, y: 2.25, w: 11.4, h: 4.2, fontSize: 14, color: COLORS.text, breakLine: true });
  addFooter(pptx, s5, 5);

  // 6: Implementation plan
  const s6 = pptx.addSlide();
  addHeader(pptx, s6, 'Gjennomføring');
  s6.addText('Foreslått implementeringsplan', { x: 0.8, y: 0.9, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s6.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });

  const steps = [
    '1. Endelig investeringsramme bekreftes med investor.',
    '2. Portefølje bygges iht. anbefalt allokering og valgte fond.',
    '3. Trinnvis innfasing gjennomføres for å redusere timing-risiko.',
    '4. Kvartalsvis oppfølging: avkastning, risiko og eventuelle rebalanseringer.'
  ];
  s6.addShape(pptx.ShapeType.roundRect, { x: 0.95, y: 1.95, w: 12.0, h: 4.8, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.05 });
  s6.addText(steps.join('\n\n'), { x: 1.2, y: 2.25, w: 11.4, h: 4.1, fontSize: 14, color: COLORS.text, breakLine: true });
  addFooter(pptx, s6, 6);

  // 7: Disclaimer
  const s7 = pptx.addSlide();
  addHeader(pptx, s7, 'Forbehold');
  s7.addText('Viktig informasjon', { x: 0.8, y: 0.9, w: 8.5, h: 0.6, fontSize: 28, bold: true, color: COLORS.navy });
  s7.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.45, w: 11.8, h: 0, line: { color: COLORS.navy, pt: 1 } });
  s7.addShape(pptx.ShapeType.roundRect, { x: 0.95, y: 1.95, w: 12.0, h: 4.9, fill: { color: 'FFF7ED' }, line: { color: 'FCD34D', pt: 1 }, radius: 0.05 });
  s7.addText(
    'Dette investeringsforslaget er utarbeidet som beslutningsstøtte. Historisk avkastning er ingen garanti for fremtidig avkastning. ' +
    'Verdien av investeringer kan både stige og falle. Tallene i presentasjonen bygger på data i Pensum-plattformen per rapportdato og angitte forutsetninger i modellen.',
    { x: 1.2, y: 2.3, w: 11.4, h: 2.1, fontSize: 13, color: COLORS.text, breakLine: true }
  );
  if (data.malConfig?.navn || data.malConfig?.fasteSider || data.malConfig?.dynamiskeSider) {
    s7.addText(
      `Malmetadata: ${data.malConfig?.navn || '—'} | Faste sider: ${data.malConfig?.fasteSider || '—'} | Dynamiske sider: ${data.malConfig?.dynamiskeSider || '—'}`,
      { x: 1.2, y: 5.15, w: 11.4, h: 0.4, fontSize: 10, color: COLORS.muted }
    );
  }
  addFooter(pptx, s7, 7);

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body || {};

    try {
      const PptxGenJS = getPptxConstructor();
      if (!PptxGenJS) throw new Error('pptxgenjs ikke tilgjengelig eller ugyldig eksport');
      const pptx = buildPptx(PptxGenJS, data);
      const buffer = await pptx.write({ outputType: 'nodebuffer' });
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      res.setHeader('X-Pensum-Output-Format', 'pptx');
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
