function loadOptionalModule(name) {
  try {
    const req = eval('require');
    return req(name);
  } catch (_) {
    return null;
  }
}

function getPptxModule() {
  return loadOptionalModule('pptxgenjs');
}

function getJSZipModule() {
  return loadOptionalModule('jszip');
}

const COLORS = {
  navy: '0D2240',
  blue: '4C84C4',
  salmon: 'D4886B',
  text: '1E293B',
  muted: '64748B',
  line: 'D9E2EC',
  bg: 'F3F4F6',
  white: 'FFFFFF'
};

const PRODUCT_NAME = {
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
const TOTAL_SLIDES = 21;

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function formatCurrency(v) {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(num(v));
}

function pct(v) {
  return `${num(v).toFixed(1)}%`;
}

function resolvePptxConstructor(mod) {
  if (typeof mod === 'function') return mod;
  if (mod && typeof mod.default === 'function') return mod.default;
  if (mod && mod.default && typeof mod.default.default === 'function') return mod.default.default;
  if (mod && typeof mod.PptxGenJS === 'function') return mod.PptxGenJS;
  return null;
}

function parsePageSpec(spec = '', maxPage = TOTAL_SLIDES) {
  const set = new Set();
  String(spec).split(',').map((p) => p.trim()).filter(Boolean).forEach((token) => {
    if (/^\d+\+$/.test(token)) {
      const start = Number(token.replace('+', ''));
      for (let i = start; i <= maxPage; i += 1) set.add(i);
    } else if (/^\d+-\d+$/.test(token)) {
      const [a, b] = token.split('-').map(Number);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i += 1) set.add(i);
    } else if (/^\d+$/.test(token)) {
      set.add(Number(token));
    }
  });
  return set;
}

function addHeader(pptx, slide, titleRight = '') {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.65, y: 0.14, w: 5, h: 0.25, fontSize: 10, bold: true, color: COLORS.navy });
  if (titleRight) slide.addText(titleRight, { x: 8, y: 0.14, w: 4.7, h: 0.25, fontSize: 10, align: 'right', color: COLORS.muted });
}

function addFooter(pptx, slide, pageNo) {
  slide.addShape(pptx.ShapeType.line, { x: 0.65, y: 7.1, w: 12.05, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Side ${pageNo}`, { x: 0.65, y: 7.13, w: 1.8, h: 0.2, fontSize: 9, color: COLORS.muted });
}

function normalizeData(data) {
  const total = num(data.totalKapital);
  const expected = num(data.vektetAvkastning, 7.5);
  const years = Math.max(1, Math.round(num(data.horisont, 10)));
  const alloc = (Array.isArray(data.allokering) ? data.allokering : []).map((a) => ({ navn: a.navn || 'Ukjent', vekt: num(a.vekt) })).filter((a) => a.vekt > 0);
  const products = (Array.isArray(data.produkterIBruk) ? data.produkterIBruk : []).map((id) => PRODUCT_NAME[id] || id);
  return {
    kundeNavn: data.kundeNavn || 'Investor',
    risikoProfil: data.risikoProfil || 'Moderat',
    total,
    expected,
    years,
    alloc,
    products,
    expValue: total * Math.pow(1 + expected / 100, years),
    seriesYears: [2023, 2024, 2025, 2026],
    yearlyBase: [5.2, 8.1, 10.9, 2.3],
    yearlyPensum: [6.1, 9.4, 11.8, 2.6],
    yearlyWorld: [8.9, 12.4, 14.3, 3.1],
    monthlyRows: [
      { year: '2025', vals: [2.5, -0.4, 4.6, -0.2, 2.9, 3.0, 1.7, 0.4, 1.9, 1.7, -0.5, 1.3] },
      { year: '2024', vals: [1.1, 3.2, 2.7, -0.2, -0.1, 1.4, 2.7, 0.2, 2.3, 0.4, 1.0, -0.2] }
    ],
    malConfig: data.malConfig || {}
  };
}

function buildPage(pptx, d, pageNo) {
  const s = pptx.addSlide();
  addHeader(pptx, s, pageNo <= 5 ? `Fast ${pageNo}/5` : pageNo <= 13 ? `Dynamisk ${pageNo}/13` : 'Standard');
  s.addText(`Side ${pageNo}`, { x: 0.8, y: 1.0, w: 4, h: 0.5, fontSize: 20, color: COLORS.navy, bold: true });

  if (pageNo === 1) {
    s.addText('Investeringsforslag', { x: 0.8, y: 1.7, w: 8.5, h: 0.7, fontSize: 34, color: COLORS.navy, bold: true });
    s.addText(d.kundeNavn, { x: 0.8, y: 2.5, w: 8.5, h: 0.45, fontSize: 24, color: COLORS.salmon, bold: true });
  }
  if (pageNo === 6 && d.alloc.length > 0) {
    s.addChart(pptx.ChartType.pie, [{ name: 'Andel', labels: d.alloc.map((a) => a.navn), values: d.alloc.map((a) => a.vekt) }], { x: 0.9, y: 1.8, w: 4.6, h: 3.4, showLegend: false });
  }
  if (pageNo === 10) {
    s.addChart(pptx.ChartType.line, [
      { name: 'Eksisterende', labels: d.seriesYears, values: d.yearlyBase },
      { name: 'Forslag', labels: d.seriesYears, values: d.yearlyPensum },
      { name: 'Verdensindeks', labels: d.seriesYears, values: d.yearlyWorld }
    ], { x: 0.9, y: 1.8, w: 11.9, h: 3.8, showLegend: true, legendPos: 'b' });
  }
  if (pageNo === 12) {
    s.addTable([['År', ...MONTHS, 'År'], ...d.monthlyRows.map((r) => [r.year, ...r.vals.map((v) => v.toFixed(1)), r.vals.reduce((a, b) => a + b, 0).toFixed(1)])], { x: 0.8, y: 1.9, w: 12, colW: [0.8, ...Array(12).fill(0.75), 1.0], fontSize: 9 });
  }
  if (pageNo >= 14) {
    s.addText('Standardside fra generatoren (fallback ved manglende mal-placeholder).', { x: 0.9, y: 2.0, w: 11.2, h: 0.6, fontSize: 14, color: COLORS.text });
  }
  addFooter(pptx, s, pageNo);
}

function buildPptx(PptxGenJS, payload) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  const d = normalizeData(payload);
  for (let i = 1; i <= TOTAL_SLIDES; i += 1) buildPage(pptx, d, i);
  return pptx;
}

function parseDataUrlToBuffer(dataUrl = '') {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
}

function dynamicSlideText(pageNo, d) {
  const lines = {
    6: [`Allokering: ${d.alloc.map((a) => `${a.navn} ${a.vekt.toFixed(1)}%`).join(', ')}`],
    7: ['Aksjeandel vs verdensindeks: modellert sammenligning.'],
    8: ['Verdensindeks: region/land/sektor-fordeling.'],
    9: [`Produkter: ${d.products.join(', ') || 'Ingen valgt'}`],
    10: [`Avkastning siste år: Forslag ${d.yearlyPensum.map((v) => pct(v)).join(', ')}`],
    11: ['Nedsiderisiko: se graf og risikomål i verktøyet.'],
    12: [`Månedstabell: ${d.monthlyRows.map((r) => `${r.year}=${r.vals.reduce((a, b) => a + b, 0).toFixed(1)}%`).join(' | ')}`],
    13: [`Forventet sluttverdi ${d.years} år: ${formatCurrency(d.expValue)}`]
  };
  return (lines[pageNo] || []).join('\n');
}

async function applyTemplatePptx(templateBuffer, payload) {
  const d = normalizeData(payload);
  const JSZipMod = getJSZipModule();
  const JSZip = JSZipMod?.default || JSZipMod;
  if (!JSZip || !JSZip.loadAsync) throw new Error('jszip ikke tilgjengelig i runtime');
  const zip = await JSZip.loadAsync(templateBuffer);
  const fixedSet = parsePageSpec(d?.malConfig?.fasteSider || '1-5,14+', TOTAL_SLIDES);
  const dynamicSet = parsePageSpec(d?.malConfig?.dynamiskeSider || '6-13', TOTAL_SLIDES);

  const globalTokens = {
    '{{KUNDE_NAVN}}': d.kundeNavn,
    '{{DATO}}': new Date().toLocaleDateString('nb-NO'),
    '{{TOTAL_KAPITAL}}': formatCurrency(d.total),
    '{{RISIKOPROFIL}}': d.risikoProfil,
    '{{HORISONT}}': `${d.years} år`,
    '{{FORVENTET_AVKASTNING}}': pct(d.expected),
    '{{ALLOKERING_TABELL}}': d.alloc.map((a) => `${a.navn}: ${a.vekt.toFixed(1)}%`).join('\n'),
    '{{PRODUKTLISTE}}': d.products.join(', ')
  };

  let replacements = 0;
  const slideFiles = Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p));

  for (const slidePath of slideFiles) {
    const pageNo = Number(slidePath.match(/slide(\d+)\.xml$/)?.[1] || 0);
    let xml = await zip.file(slidePath).async('text');

    Object.entries(globalTokens).forEach(([token, value]) => {
      if (xml.includes(token)) {
        const before = xml;
        xml = xml.split(token).join(value);
        if (xml !== before) replacements += 1;
      }
    });

    if (dynamicSet.has(pageNo)) {
      const dynToken = `{{DYNAMIC_${pageNo}}}`;
      if (xml.includes(dynToken)) {
        const before = xml;
        xml = xml.split(dynToken).join(dynamicSlideText(pageNo, d));
        if (xml !== before) replacements += 1;
      }
    }

    if (!fixedSet.has(pageNo) && !dynamicSet.has(pageNo) && pageNo > 0) {
      const removeToken = '{{SKIP_SLIDE}}';
      if (xml.includes(removeToken)) {
        const before = xml;
        xml = xml.split(removeToken).join('');
        if (xml !== before) replacements += 1;
      }
    }

    zip.file(slidePath, xml);
  }

  const out = await zip.generateAsync({ type: 'nodebuffer' });
  return { buffer: out, replacements };
}

function escapePdfText(text = '') {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdfBuffer(data) {
  const rows = ['Pensum Asset Management', 'Investeringsforslag', `Kunde: ${data.kundeNavn || 'Investor'}`, `Total kapital: ${formatCurrency(data.totalKapital)}`];
  const streamCmd = rows.map((line, i) => `BT /F1 12 Tf 50 ${810 - (i * 20)} Td (${escapePdfText(line)}) Tj ET`).join('\n');
  return Buffer.from(`%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>endobj\n4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n5 0 obj<< /Length ${Buffer.byteLength(streamCmd, 'utf8')} >>stream\n${streamCmd}\nendstream endobj\ntrailer<< /Root 1 0 R >>\n%%EOF`, 'utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body || {};
    const templateData = parseDataUrlToBuffer(data?.malConfig?.filDataUrl || '');

    if (templateData && /presentationml|ms-powerpoint/.test(templateData.mime)) {
      try {
        const { buffer, replacements } = await applyTemplatePptx(templateData.buffer, data);
        if (replacements === 0) {
          throw new Error('Ingen placeholders funnet i malen (0 erstatninger).');
        }
        const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
        res.setHeader('X-Pensum-Output-Format', 'pptx-template');
        res.setHeader('X-Pensum-Template-Applied', `${data?.malConfig?.fasteSider || '1-5,14+'}|${data?.malConfig?.dynamiskeSider || '6-13'}`);
        res.setHeader('X-Pensum-Template-Replacements', String(replacements));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
        return res.send(buffer);
      } catch (templateErr) {
        console.warn('Template merge feilet, faller tilbake til kodegenerert PPTX:', templateErr.message);
        res.setHeader('X-Pensum-Template-Warning', encodeURIComponent(templateErr.message));
      }
    }

    try {
      const PptxModule = getPptxModule();
      const PptxGenJS = resolvePptxConstructor(PptxModule);
      if (!PptxGenJS) throw new Error('pptxgenjs ikke tilgjengelig');
      const pptx = buildPptx(PptxGenJS, data);
      const buffer = await pptx.write({ outputType: 'nodebuffer' });
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      res.setHeader('X-Pensum-Output-Format', 'pptx-generated');
      res.setHeader('X-Pensum-Template-Applied', 'no-template-merge');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
      return res.send(buffer);
    } catch (pptErr) {
      const buffer = buildSimplePdfBuffer(data);
      res.setHeader('X-Pensum-Output-Format', 'pdf-fallback');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Pensum_Investeringsforslag.pdf"`);
      return res.send(buffer);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' }, responseLimit: '20mb' }
};
