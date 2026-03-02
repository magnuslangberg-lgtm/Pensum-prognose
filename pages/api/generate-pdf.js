import PptxGenJS from 'pptxgenjs';

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


function buildPptx(data) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
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

  // Slide 1: Forside
  const slide1 = pptx.addSlide();
  slide1.background = { color: 'F7FAFC' };
  slide1.addText('Pensum Asset Management', { x: 0.6, y: 0.45, w: 6.2, h: 0.45, fontSize: 16, color: muted, bold: false });
  slide1.addText('Investeringsforslag', { x: 0.6, y: 1.2, w: 8.2, h: 0.8, fontSize: 36, color: titleColor, bold: true });
  slide1.addText(data.kundeNavn || 'Kunde', { x: 0.6, y: 2.05, w: 8.2, h: 0.6, fontSize: 24, color: accentColor, bold: true });
  slide1.addText(`Dato: ${new Date().toLocaleDateString('nb-NO')}`, { x: 0.6, y: 2.8, w: 4.5, h: 0.3, fontSize: 12, color: muted });
  slide1.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 3.4, w: 12.1, h: 3.1, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', pt: 1 }, radius: 0.08 });
  slide1.addText('Kort oppsummering', { x: 0.9, y: 3.65, w: 4, h: 0.4, fontSize: 16, bold: true, color: titleColor });
  slide1.addText(
    `• Total kapital: ${formatCurrency(data.totalKapital)}\n• Risikoprofil: ${data.risikoProfil || 'Ikke angitt'}\n• Horisont: ${Number(data.horisont) || 0} år\n• Forventet avkastning: ${formatPercent(data.vektetAvkastning)} p.a.`,
    { x: 0.95, y: 4.15, w: 5.5, h: 1.7, fontSize: 13, color: '1E293B', breakLine: true }
  );

  // Slide 2: Allokering
  const slide2 = pptx.addSlide();
  slide2.addText('Anbefalt allokering', { x: 0.6, y: 0.45, w: 6, h: 0.6, fontSize: 28, color: titleColor, bold: true });
  slide2.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.05, w: 12.1, h: 0, line: { color: '1B3A5F', pt: 1 } });

  slide2.addTable(
    [['Aktivaklasse', 'Andel', 'Beløp'], ...toppAllokering.map((a) => [a.navn || '—', `${Number(a.vekt || 0).toFixed(1)}%`, formatCurrency((Number(a.vekt || 0) / 100) * (Number(data.totalKapital) || 0))])],
    {
      x: 0.7, y: 1.4, w: 7.8,
      colW: [4.2, 1.2, 2.4],
      fontSize: 11,
      border: { type: 'solid', color: 'E2E8F0', pt: 1 },
      fill: 'FFFFFF',
      color: '1E293B',
      autoFit: false
    }
  );

  // pseudo chart boxes
  let y = 1.45;
  toppAllokering.forEach((a, idx) => {
    const barW = Math.max(0.5, (Number(a.vekt || 0) / 100) * 3.4);
    slide2.addText(a.navn || '—', { x: 8.9, y, w: 2.5, h: 0.22, fontSize: 9, color: muted });
    slide2.addShape(pptx.ShapeType.roundRect, { x: 11.4, y: y + 0.03, w: barW, h: 0.14, fill: { color: idx % 2 === 0 ? '0D2240' : '5B9BD5' }, line: { color: 'FFFFFF', pt: 0 } });
    y += 0.35;
  });

  // Slide 3: Produkteksponering
  const slide3 = pptx.addSlide();
  slide3.addText('Valgte produkter i forslaget', { x: 0.6, y: 0.45, w: 7, h: 0.6, fontSize: 28, color: titleColor, bold: true });
  slide3.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.05, w: 12.1, h: 0, line: { color: '1B3A5F', pt: 1 } });

  const produkter = Array.isArray(data.produkterIBruk) && data.produkterIBruk.length > 0 ? data.produkterIBruk : [];
  const navnMap = {
    'global-core-active': 'Pensum Global Core Active',
    'global-edge': 'Pensum Global Edge',
    'basis': 'Pensum Basis',
    'global-hoyrente': 'Pensum Global Høyrente',
    'nordisk-hoyrente': 'Pensum Nordisk Høyrente',
    'norge-a': 'Pensum Norge A',
    'energy-a': 'Pensum Global Energy A',
    'banking-d': 'Pensum Nordic Banking Sector D',
    'financial-d': 'Pensum Financial Opportunity D'
  };

  const produktLinjer = produkter.length > 0
    ? produkter.map((id) => `• ${navnMap[id] || id}`).join('\n')
    : '• Ingen produkter valgt';

  slide3.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.55, w: 12.0, h: 4.9, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', pt: 1 }, radius: 0.08 });
  slide3.addText(produktLinjer, { x: 1.05, y: 1.9, w: 11.4, h: 4.1, fontSize: 14, color: '1E293B', breakLine: true });
  slide3.addText('Maloppsett', { x: 0.9, y: 6.55, w: 2, h: 0.25, fontSize: 10, bold: true, color: muted });
  slide3.addText(
    `Mal: ${data.malConfig?.navn || 'Ikke angitt'} | Faste sider: ${data.malConfig?.fasteSider || '—'} | Dynamiske sider: ${data.malConfig?.dynamiskeSider || '—'}`,
    { x: 2.05, y: 6.55, w: 10.6, h: 0.25, fontSize: 10, color: muted }
  );

  return pptx;
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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' }, responseLimit: '20mb' }
};
