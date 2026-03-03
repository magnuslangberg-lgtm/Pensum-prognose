function formatCurrency(value) {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatPercent(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

function buildPptx(PptxGenJS, data) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag - ${data.kundeNavn || 'Kunde'}`;
  pptx.lang = 'nb-NO';

  const titleColor = '0D2240';
  const accentColor = 'D4886B';
  const muted = '5B6472';

  const allokering = Array.isArray(data.allokering) ? data.allokering : [];
  const toppAllokering = allokering.filter((a) => Number(a.vekt) > 0).slice(0, 8);

  const slide1 = pptx.addSlide();
  slide1.background = { color: 'F7FAFC' };
  slide1.addText('Pensum Asset Management', { x: 0.6, y: 0.45, w: 6.2, h: 0.45, fontSize: 16, color: muted });
  slide1.addText('Investeringsforslag', { x: 0.6, y: 1.2, w: 8.2, h: 0.8, fontSize: 36, color: titleColor, bold: true });
  slide1.addText(data.kundeNavn || 'Kunde', { x: 0.6, y: 2.05, w: 8.2, h: 0.6, fontSize: 24, color: accentColor, bold: true });
  slide1.addText(`Dato: ${new Date().toLocaleDateString('nb-NO')}`, { x: 0.6, y: 2.8, w: 4.5, h: 0.3, fontSize: 12, color: muted });
  slide1.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 3.4, w: 12.1, h: 3.1, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', pt: 1 }, radius: 0.08 });
  slide1.addText('Kort oppsummering', { x: 0.9, y: 3.65, w: 4, h: 0.4, fontSize: 16, bold: true, color: titleColor });
  slide1.addText(
    `• Total kapital: ${formatCurrency(data.totalKapital)}\n• Risikoprofil: ${data.risikoProfil || 'Ikke angitt'}\n• Horisont: ${Number(data.horisont) || 0} år\n• Forventet avkastning: ${formatPercent(data.vektetAvkastning)} p.a.`,
    { x: 0.95, y: 4.15, w: 5.5, h: 1.7, fontSize: 13, color: '1E293B', breakLine: true }
  );

  const malNavn = data.malConfig?.navn || data.malConfig?.filnavn || '';
  if (malNavn) {
    slide1.addText(`Designmal: ${malNavn}`, { x: 0.6, y: 6.95, w: 8, h: 0.2, fontSize: 9, color: muted, italic: true });
  }

  const slide2 = pptx.addSlide();
  slide2.addText('Anbefalt allokering', { x: 0.6, y: 0.45, w: 6, h: 0.6, fontSize: 28, color: titleColor, bold: true });
  slide2.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.05, w: 12.1, h: 0, line: { color: '1B3A5F', pt: 1 } });
  slide2.addTable(
    [['Aktivaklasse', 'Andel', 'Beløp'], ...toppAllokering.map((a) => [a.navn || '—', `${Number(a.vekt || 0).toFixed(1)}%`, formatCurrency((Number(a.vekt || 0) / 100) * (Number(data.totalKapital) || 0))])],
    { x: 0.7, y: 1.4, w: 7.8, colW: [4.2, 1.2, 2.4], fontSize: 11, border: { type: 'solid', color: 'E2E8F0', pt: 1 }, fill: 'FFFFFF', color: '1E293B', autoFit: false }
  );

  let y = 1.45;
  toppAllokering.forEach((a, idx) => {
    const barW = Math.max(0.5, (Number(a.vekt || 0) / 100) * 3.4);
    slide2.addText(a.navn || '—', { x: 8.9, y, w: 2.5, h: 0.22, fontSize: 9, color: muted });
    slide2.addShape(pptx.ShapeType.roundRect, { x: 11.4, y: y + 0.03, w: barW, h: 0.14, fill: { color: idx % 2 === 0 ? '0D2240' : '5B9BD5' }, line: { color: 'FFFFFF', pt: 0 } });
    y += 0.35;
  });

  const slide3 = pptx.addSlide();
  slide3.addText('Valgte produkter i forslaget', { x: 0.6, y: 0.45, w: 7, h: 0.6, fontSize: 28, color: titleColor, bold: true });
  slide3.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.05, w: 12.1, h: 0, line: { color: '1B3A5F', pt: 1 } });

  const produkter = Array.isArray(data.produkterIBruk) && data.produkterIBruk.length > 0 ? data.produkterIBruk : [];
  const navnMap = {
    'global-core-active': 'Pensum Global Core Active', 'global-edge': 'Pensum Global Edge', basis: 'Pensum Basis',
    'global-hoyrente': 'Pensum Global Høyrente', 'nordisk-hoyrente': 'Pensum Nordisk Høyrente', 'norge-a': 'Pensum Norge A',
    'energy-a': 'Pensum Global Energy A', 'banking-d': 'Pensum Nordic Banking Sector D', 'financial-d': 'Pensum Financial Opportunity D'
  };
  const produktLinjer = produkter.length > 0 ? produkter.map((id) => `• ${navnMap[id] || id}`).join('\n') : '• Ingen produkter valgt';
  slide3.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.45, w: 12.0, h: 5.7, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', pt: 1 }, radius: 0.08 });
  slide3.addText('Produkter som inngår i anbefalt allokering:', { x: 1.05, y: 1.75, w: 11.0, h: 0.4, fontSize: 14, bold: true, color: titleColor });
  slide3.addText(produktLinjer, { x: 1.05, y: 2.2, w: 11.4, h: 4.6, fontSize: 14, color: '1E293B', breakLine: true });

  return pptx;
}

function escapePdfText(text = '') {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdfBuffer(data) {
  const produkter = Array.isArray(data.produkterIBruk) ? data.produkterIBruk : [];
  const linesPerPage = [
    [
      'Pensum Asset Management',
      'Investeringsforslag',
      `Kunde: ${data.kundeNavn || 'Investor'}`,
      `Dato: ${new Date().toLocaleDateString('nb-NO')}`,
      '',
      `Total kapital: ${formatCurrency(data.totalKapital)}`,
      `Risikoprofil: ${data.risikoProfil || 'Ikke angitt'}`,
      `Horisont: ${Number(data.horisont) || 0} år`,
      `Forventet avkastning: ${formatPercent(data.vektetAvkastning)} p.a.`
    ],
    [
      'Anbefalt allokering',
      ...(Array.isArray(data.allokering) ? data.allokering : [])
        .filter((a) => Number(a.vekt) > 0)
        .map((a) => `${a.navn || '—'}: ${Number(a.vekt || 0).toFixed(1)}% (${formatCurrency((Number(a.vekt || 0) / 100) * (Number(data.totalKapital) || 0))})`)
    ],
    [
      'Valgte produkter i forslaget',
      ...(produkter.length ? produkter.map((id) => `- ${id}`) : ['- Ingen produkter valgt']),
    ]
  ];

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const kids = [];
  const fontObjId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  linesPerPage.forEach((lines) => {
    let y = 790;
    const commands = ['BT', '/F1 20 Tf', '50 810 Td', `( ${escapePdfText(lines[0] || '')} ) Tj`, 'ET'];
    y -= 40;
    for (let i = 1; i < lines.length; i += 1) {
      commands.push('BT');
      commands.push('/F1 12 Tf');
      commands.push(`50 ${y} Td`);
      commands.push(`(${escapePdfText(lines[i])}) Tj`);
      commands.push('ET');
      y -= 18;
    }
    const stream = commands.join('\n');
    const contentObjId = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
    const pageObjId = addObject(`<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>`);
    kids.push(pageObjId);
  });

  const pagesObjId = addObject(`<< /Type /Pages /Kids [${kids.map((id) => `${id} 0 R`).join(' ')}] /Count ${kids.length} >>`);
  kids.forEach((pageId) => {
    objects[pageId - 1] = objects[pageId - 1].replace('/Parent 0 0 R', `/Parent ${pagesObjId} 0 R`);
  });
  const catalogObjId = addObject(`<< /Type /Catalog /Pages ${pagesObjId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, idx) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body || {};
    const pptx = buildPptx(data);
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;

    try {
      const dynamicImport = new Function('m', 'return import(m)');
      const mod = await dynamicImport('pptxgenjs');
      const PptxGenJS = mod.default || mod;
      const pptx = buildPptx(PptxGenJS, data);
      const buffer = await pptx.write({ outputType: 'nodebuffer' });
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    } catch (pptErr) {
      console.warn('pptxgenjs ikke tilgjengelig, bruker PDF-fallback:', pptErr.message);
      const buffer = buildSimplePdfBuffer(data);
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
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
