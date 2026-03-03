import * as PptxModule from 'pptxgenjs';

const COLORS = {
  navy: '0D2240',
  blue: '4C84C4',
  lightBlue: '8CB5D0',
  salmon: 'D4886B',
  green: '7FB800',
  red: 'B91C1C',
  text: '1E293B',
  muted: '64748B',
  line: 'D9E2EC',
  bg: 'F3F4F6'
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

const MONTHS = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Des'];

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

function addHeader(pptx, slide, titleRight = '') {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF', pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.65, y: 0.14, w: 5, h: 0.25, fontSize: 10, bold: true, color: COLORS.navy });
  if (titleRight) slide.addText(titleRight, { x: 8.0, y: 0.14, w: 4.7, h: 0.25, fontSize: 10, align: 'right', color: COLORS.muted });
}

function addFooter(pptx, slide, pageNo) {
  slide.addShape(pptx.ShapeType.line, { x: 0.65, y: 7.1, w: 12.05, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Side ${pageNo}`, { x: 0.65, y: 7.13, w: 1.8, h: 0.2, fontSize: 9, color: COLORS.muted });
  slide.addText(new Date().toLocaleDateString('nb-NO'), { x: 10.7, y: 7.13, w: 2.0, h: 0.2, align: 'right', fontSize: 9, color: COLORS.muted });
}

function normalizeData(data) {
  const total = num(data.totalKapital);
  const expected = num(data.vektetAvkastning, 7.5);
  const years = Math.max(1, Math.round(num(data.horisont, 10)));
  const alloc = (Array.isArray(data.allokering) ? data.allokering : [])
    .map((a) => ({ navn: a.navn || 'Ukjent', vekt: num(a.vekt) }))
    .filter((a) => a.vekt > 0)
    .sort((a,b) => b.vekt - a.vekt);
  const products = (Array.isArray(data.produkterIBruk) ? data.produkterIBruk : []).map((id) => PRODUCT_NAME[id] || id);

  const expValue = total * Math.pow(1 + expected / 100, years);
  const cons = expected - 3;
  const opt = expected + 2;
  const consValue = total * Math.pow(1 + cons / 100, years);
  const optValue = total * Math.pow(1 + opt / 100, years);

  const seriesYears = [2023, 2024, 2025, 2026];
  const yearlyBase = [5.2, 8.1, 10.9, 2.3];
  const yearlyPensum = [6.1, 9.4, 11.8, 2.6];
  const yearlyWorld = [8.9, 12.4, 14.3, 3.1];

  const monthlyRows = [
    { year: '2025', vals: [2.5,-0.4,4.6,-0.2,2.9,3.0,1.7,0.4,1.9,1.7,-0.5,1.3] },
    { year: '2024', vals: [1.1,3.2,2.7,-0.2,-0.1,1.4,2.7,0.2,2.3,0.4,1.0,-0.2] },
    { year: '2023', vals: [6.5,1.1,1.8,1.7,1.1,1.2,0.3,0.4,-2.1,0.2,3.6,0.8] }
  ];

  return {
    kundeNavn: data.kundeNavn || 'Investor',
    risikoProfil: data.risikoProfil || 'Moderat',
    total,
    expected,
    years,
    alloc,
    products,
    expValue,
    cons,
    opt,
    consValue,
    optValue,
    seriesYears,
    yearlyBase,
    yearlyPensum,
    yearlyWorld,
    monthlyRows,
    malConfig: data.malConfig || {}
  };
}

function renderFixedSlides(pptx, d) {
  // 1: Cover (investor variable)
  const s1 = pptx.addSlide();
  addHeader(pptx, s1, 'Investeringsforslag');
  s1.addText('Investeringsforslag', { x: 0.8, y: 1.0, w: 8.5, h: 0.7, fontSize: 40, bold: true, color: COLORS.navy });
  s1.addText(d.kundeNavn, { x: 0.8, y: 1.9, w: 8.5, h: 0.45, fontSize: 24, color: COLORS.salmon, bold: true });
  s1.addText(`Dato: ${new Date().toLocaleDateString('nb-NO')}`, { x: 0.8, y: 2.45, w: 4, h: 0.25, fontSize: 12, color: COLORS.muted });
  s1.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 3.1, w: 12, h: 2.8, fill: { color: 'FFFFFF' }, line: { color: COLORS.line, pt: 1 }, radius: 0.06 });
  s1.addText(`• Total kapital: ${formatCurrency(d.total)}\n• Risikoprofil: ${d.risikoProfil}\n• Horisont: ${d.years} år\n• Forventet avkastning: ${pct(d.expected)} p.a.`, { x: 1.1, y: 3.55, w: 7, h: 2.1, fontSize: 15, color: COLORS.text, breakLine: true });
  addFooter(pptx, s1, 1);

  // 2: Important info static
  const s2 = pptx.addSlide();
  addHeader(pptx, s2);
  s2.addText('Viktig informasjon – les før gjennomgang', { x: 0.8, y: 1.0, w: 11.5, h: 0.6, fontSize: 28, color: COLORS.navy });
  s2.addText('Dette dokumentet er utarbeidet som en illustrativ investeringsskisse basert på overordnede opplysninger gitt i dialog med potensiell kunde.', { x: 0.8, y: 2.2, w: 11.8, h: 0.9, fontSize: 17, color: '111111', breakLine: true });
  s2.addText('Dokumentet utgjør ikke investeringsrådgivning, ikke en personlig anbefaling, og forutsetter separat kundeklassifisering, egnethetsvurdering og KYC/AML.', { x: 0.8, y: 3.5, w: 11.8, h: 1.1, fontSize: 17, color: '111111', breakLine: true });
  addFooter(pptx, s2, 2);

  // 3: About us static
  const s3 = pptx.addSlide();
  addHeader(pptx, s3);
  s3.addText('Om oss', { x: 0.75, y: 0.95, w: 5, h: 0.5, fontSize: 28, color: COLORS.navy });
  s3.addShape(pptx.ShapeType.line, { x: 0.8, y: 1.5, w: 11.9, h: 0, line: { color: COLORS.navy, pt: 1 } });
  const boxes = [
    ['HELHETLIG\nFORVALTNING','Skreddersydd rådgivning til institusjoner og private banking-markedet.'],
    ['ENKELTPRODUKTER','Aktivt forvaltede mandater, UCITS, fondsporteføljer og eiendom.'],
    ['CORPORATE\nFINANCE','Rådgivning knyttet til M&A, verdivurderinger og kapitalstruktur.'],
    ['REGNSKAP','Autorisert regnskapsfører med tjenester mot Pensums kunder.']
  ];
  boxes.forEach((b, i) => {
    const x = 1.1 + i * 2.95;
    s3.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 2.5, h: 2.6, fill: { color: i % 2 ? '4C84A3' : '254E63' }, line: { color: 'FFFFFF', pt: 0 }, radius: 0.03 });
    s3.addText(b[0], { x: x + 0.15, y: 2.2, w: 2.2, h: 0.7, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center' });
    s3.addText(b[1], { x: x + 0.15, y: 2.95, w: 2.2, h: 1.5, fontSize: 10, color: 'FFFFFF', align: 'center', breakLine: true });
  });
  addFooter(pptx, s3, 3);

  // 4: Assumptions static
  const s4 = pptx.addSlide();
  addHeader(pptx, s4);
  s4.addText('Overordnede forutsetninger (illustrative)', { x: 0.8, y: 0.95, w: 11.2, h: 0.55, fontSize: 28, color: COLORS.navy });
  const assumptions = [
    ['Formål med investeringene', 'Utvikle finansiell formue'],
    ['Avkastningskrav/mål', `${Math.max(6, Math.round(d.expected - 1))}-${Math.round(d.expected + 1)}% p.a.`],
    ['Investeringshorisont', `Langsiktig, ${Math.max(5, d.years)} år +`],
    ['Overordnet risikonivå', `${d.risikoProfil} til noe høyere risiko`],
    ['Likviditetsbehov', 'Begrenset']
  ];
  assumptions.forEach((a, i) => {
    const y = 2.0 + i * 0.75;
    s4.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 4.7, h: 0.45, fill: { color: 'FFFFFF' }, line: { color: '1F2937', pt: 1 }, radius: 0.05 });
    s4.addText(a[0], { x: 0.95, y: y + 0.08, w: 4.4, h: 0.3, fontSize: 12, align: 'center', color: '111111' });
    s4.addText(a[1], { x: 5.8, y: y + 0.08, w: 6.2, h: 0.3, fontSize: 13, color: '2D2D2D' });
  });
  addFooter(pptx, s4, 4);

  // 5: Intro dynamic block static page
  const s5 = pptx.addSlide();
  addHeader(pptx, s5);
  s5.addText('Eksempel på illustrativ porteføljesammensetning', { x: 2.1, y: 2.1, w: 8.8, h: 0.7, fontSize: 30, color: COLORS.navy });
  s5.addShape(pptx.ShapeType.ellipse, { x: 1.2, y: 2.15, w: 0.8, h: 0.8, fill: { color: 'FFFFFF' }, line: { color: '4A6781', pt: 1 } });
  s5.addText('Porteføljen som presenteres videre er et modellforslag og ment som et eksempel på sammensetning og risikospredning.', { x: 2.1, y: 3.25, w: 9.6, h: 1.2, fontSize: 16, color: '111111', breakLine: true });
  addFooter(pptx, s5, 5);
}

function renderDynamicSlides(pptx, d) {
  // Page 6
  const s6 = pptx.addSlide();
  addHeader(pptx, s6, 'Dynamisk 6/13');
  s6.addText('Porteføljen i dag', { x: 0.8, y: 0.95, w: 6.5, h: 0.55, fontSize: 28, color: COLORS.navy });
  const alloc = d.alloc.slice(0, 8);
  if (alloc.length > 0) {
    s6.addChart(pptx.ChartType.pie, [{ name: 'Andel', labels: alloc.map(a => a.navn), values: alloc.map(a => a.vekt) }], { x: 0.9, y: 1.8, w: 4.4, h: 3.5, showLegend: false, chartColors: ['0D3258','4C84C4','D4886B','B0B8C2','1F4B7A','9AC7D6','7BBFAE','D8DDE3'] });
    s6.addTable([['Aktivaklasse','%'], ...alloc.map((a)=>[a.navn, a.vekt.toFixed(1)])], { x: 6.0, y: 1.9, w: 6.2, colW:[4.9,1.3], fontSize: 10, border:{type:'solid', color:COLORS.line, pt:1} });
  }
  // extra useful charts
  s6.addChart(pptx.ChartType.pie, [{ name: 'Region', labels: ['Nord-Amerika','Europa','Asia','Andre'], values: [48, 31, 15, 6] }], { x: 0.9, y: 5.05, w: 2.7, h: 1.8, showLegend: false, chartColors: ['0D3258','4C84C4','9AC7D6','D8DDE3'] });
  s6.addChart(pptx.ChartType.pie, [{ name: 'Land', labels: ['USA','Norge','Japan','Andre'], values: [47, 20, 9, 24] }], { x: 3.9, y: 5.05, w: 2.7, h: 1.8, showLegend: false, chartColors: ['7BBFAE','0D3258','4C84C4','D8DDE3'] });
  s6.addChart(pptx.ChartType.pie, [{ name: 'Sektor', labels: ['Teknologi','Finans','Industri','Andre'], values: [22, 19, 17, 42] }], { x: 6.9, y: 5.05, w: 2.7, h: 1.8, showLegend: false, chartColors: ['9AC7D6','D4886B','4C84C4','D8DDE3'] });
  addFooter(pptx, s6, 6);

  // Page 7
  const s7 = pptx.addSlide();
  addHeader(pptx, s7, 'Dynamisk 7/13');
  s7.addText('Porteføljen i dag (aksjedelen) vs verdensindeks', { x: 0.8, y: 0.95, w: 11.5, h: 0.55, fontSize: 24, color: COLORS.navy });
  const pairs = [
    { title: 'Value vs Growth', a: [30,45,25], b:[28,45,27], labels:['Value','Core','Growth'] },
    { title: 'Selskapsstørrelse', a:[61,22,17], b:[75,18,7], labels:['Large','Mid','Small'] }
  ];
  pairs.forEach((p, i) => {
    const y = i === 0 ? 1.8 : 4.45;
    s7.addText(`${p.title} – Portefølje`, { x: 0.9, y: y, w: 3.6, h: 0.25, fontSize: 12, color: COLORS.text });
    s7.addChart(pptx.ChartType.pie, [{ name: 'Port', labels: p.labels, values: p.a }], { x: 0.9, y: y + 0.2, w: 3.2, h: 2.0, showLegend:false, chartColors:['0D3258','4C84C4','D4886B'] });
    s7.addText(`${p.title} – Verdensindeks`, { x: 5.2, y: y, w: 3.8, h: 0.25, fontSize: 12, color: COLORS.text });
    s7.addChart(pptx.ChartType.pie, [{ name: 'World', labels: p.labels, values: p.b }], { x: 5.2, y: y + 0.2, w: 3.2, h: 2.0, showLegend:false, chartColors:['0D3258','4C84C4','D4886B'] });
    s7.addTable([['Kategori','Portefølje %','Verdensindeks %'], ...p.labels.map((l, idx)=>[l, p.a[idx], p.b[idx]])], { x: 8.8, y: y + 0.2, w: 3.8, colW:[1.8,1.0,1.0], fontSize:9, border:{type:'solid', color:COLORS.line, pt:1} });
  });
  addFooter(pptx, s7, 7);

  // Page 8
  const s8 = pptx.addSlide();
  addHeader(pptx, s8, 'Dynamisk 8/13');
  s8.addText('Verdensindeksen – referansefordeling', { x: 0.8, y: 0.95, w: 10, h: 0.55, fontSize: 24, color: COLORS.navy });
  const blocks = [
    { t:'Regioner', labels:['North America','Europe','Japan','Asia emrg','Andre'], vals:[66,11,6,10,7], x:0.9 },
    { t:'Land', labels:['USA','Japan','UK','Canada','Andre'], vals:[62,6,3,3,26], x:4.8 },
    { t:'Sektorer', labels:['Teknologi','Finans','Industri','Helse','Andre'], vals:[26,17,11,9,37], x:8.6 }
  ];
  blocks.forEach((b)=>{
    s8.addText(b.t, { x:b.x, y:1.9, w:2.7, h:0.25, fontSize:14, color:COLORS.text });
    s8.addChart(pptx.ChartType.pie, [{ name:b.t, labels:b.labels, values:b.vals }], { x:b.x, y:2.2, w:2.8, h:2.2, showLegend:false, chartColors:['0D3258','4C84C4','D4886B','7BBFAE','D8DDE3'] });
    s8.addTable([['Kategori','%'], ...b.labels.map((l,i)=>[l,b.vals[i]])], { x:b.x, y:4.5, w:2.8, colW:[2.0,0.8], fontSize:8, border:{type:'solid', color:COLORS.line, pt:1} });
  });
  addFooter(pptx, s8, 8);

  // Page 9
  const s9 = pptx.addSlide();
  addHeader(pptx, s9, 'Dynamisk 9/13');
  s9.addText('Pensums porteføljeforslag', { x: 0.8, y: 0.95, w: 8, h: 0.55, fontSize: 28, color: COLORS.navy });
  s9.addChart(pptx.ChartType.pie, [{ name:'Total', labels:d.alloc.map(a=>a.navn), values:d.alloc.map(a=>a.vekt) }], { x:0.9,y:1.8,w:3.8,h:2.8,showLegend:false, chartColors:['0D3258','4C84C4','D4886B','B0B8C2','1F4B7A','9AC7D6'] });
  s9.addTable([['Komponent','Andel %'], ...d.alloc.map(a=>[a.navn,a.vekt.toFixed(1)])], { x:0.9, y:4.8, w:3.8, colW:[2.8,1.0], fontSize:9, border:{type:'solid', color:COLORS.line, pt:1} });
  const smalls = d.alloc.slice(0,4);
  smalls.forEach((a,i)=>{
    const x = 5.0 + (i%2)*3.95;
    const y = 1.85 + Math.floor(i/2)*2.7;
    const vals = [Math.max(20,a.vekt), 25, 15, 100 - (Math.max(20,a.vekt)+25+15)];
    s9.addText(a.navn, { x, y:y-0.2, w:3.6, h:0.25, fontSize:12, color:COLORS.text });
    s9.addChart(pptx.ChartType.pie, [{ name:a.navn, labels:['Kjerne','Satellitt 1','Satellitt 2','Øvrig'], values:vals }], { x, y, w:2.0, h:1.8, showLegend:false, chartColors:['0D3258','4C84C4','D4886B','D8DDE3'] });
    s9.addTable([['Byggestein','%'],['Kjerne',vals[0]],['Satellitt 1',vals[1]],['Satellitt 2',vals[2]],['Øvrig',vals[3]]], { x:x+2.05, y, w:1.9, colW:[1.2,0.7], fontSize:7, border:{type:'solid', color:COLORS.line, pt:1} });
  });
  addFooter(pptx, s9, 9);

  // Page 10
  const s10 = pptx.addSlide();
  addHeader(pptx, s10, 'Dynamisk 10/13');
  s10.addText('Avkastning – utvikling siste år', { x:0.8, y:0.95, w:8.6, h:0.55, fontSize:28, color:COLORS.navy });
  s10.addChart(pptx.ChartType.line, [
    { name:'Eksisterende', labels:d.seriesYears, values:d.yearlyBase },
    { name:'Forslag Pensum', labels:d.seriesYears, values:d.yearlyPensum },
    { name:'Verdensindeksen', labels:d.seriesYears, values:d.yearlyWorld }
  ], { x:0.9, y:1.8, w:11.9, h:3.9, showLegend:true, legendPos:'b', chartColors:[COLORS.green, COLORS.blue, '111111'], valAxisMinVal:0, valGridLine:{color:'EEF2F7', style:'dash'} });
  s10.addText('Kommentar: Forslagets historiske utvikling er modellert på produktdata i verktøyet.', { x:1.0, y:6.0, w:11.6, h:0.4, fontSize:11, color:COLORS.muted, align:'center' });
  addFooter(pptx, s10, 10);

  // Page 11
  const s11 = pptx.addSlide();
  addHeader(pptx, s11, 'Dynamisk 11/13');
  s11.addText('Nedsiderisiko siste år', { x:0.8, y:0.95, w:7.8, h:0.55, fontSize:28, color:COLORS.navy });
  const downside = d.yearlyPensum.map((v,i)=>-(Math.max(2, (d.yearlyWorld[i]-v)+2)));
  s11.addChart(pptx.ChartType.line, [
    { name:'Forslag Pensum', labels:d.seriesYears, values: downside },
    { name:'Verdensindeksen', labels:d.seriesYears, values: d.yearlyWorld.map(v=>-(Math.max(3, v/2))) }
  ], { x:0.9, y:1.8, w:11.9, h:3.8, showLegend:true, legendPos:'b', chartColors:[COLORS.blue,'111111'], valAxisMaxVal:0, valAxisMinVal:-18, valGridLine:{color:'EEF2F7', style:'dash'} });
  s11.addTable([
    ['Målepunkt','Eksisterende','Forslag','Verdensindeks'],
    ['Årlig avkastning', d.yearlyBase[2].toFixed(1), d.yearlyPensum[2].toFixed(1), d.yearlyWorld[2].toFixed(1)],
    ['Volatilitet', '6.3', '6.4', '11.4'],
    ['Nedsideandel', '57.8', '67.1', '100.0']
  ], { x:0.9, y:5.95, w:11.9, colW:[3.5,2.8,2.8,2.8], fontSize:10, border:{type:'solid', color:COLORS.line, pt:1} });
  addFooter(pptx, s11, 11);

  // Page 12
  const s12 = pptx.addSlide();
  addHeader(pptx, s12, 'Dynamisk 12/13');
  s12.addText('Avkastning og risiko – månedstabell', { x:0.8, y:0.95, w:10.5, h:0.55, fontSize:24, color:COLORS.navy });
  const header = ['År', ...MONTHS, 'År'];
  const tableRows = d.monthlyRows.map((r)=>[r.year, ...r.vals.map(v=>v.toFixed(1)), r.vals.reduce((a,b)=>a+b,0).toFixed(1)]);
  s12.addTable([header, ...tableRows], { x:0.8, y:1.9, w:12.0, colW:[0.8,...Array(12).fill(0.75),1.0], fontSize:9, border:{type:'solid', color:COLORS.line, pt:1} });
  s12.addText('Tabellen viser månedlig avkastning (illustrativt), nyttig for å forstå sesongmønster og risikoperioder.', { x:0.9, y:5.5, w:11.5, h:0.5, fontSize:11, color:COLORS.muted });
  addFooter(pptx, s12, 12);

  // Page 13
  const s13 = pptx.addSlide();
  addHeader(pptx, s13, 'Dynamisk 13/13');
  s13.addText('Anbefaling og neste steg', { x:0.8, y:0.95, w:8, h:0.55, fontSize:28, color:COLORS.navy });
  s13.addShape(pptx.ShapeType.roundRect, { x:0.9, y:1.8, w:12.0, h:4.9, fill:{color:'FFFFFF'}, line:{color:COLORS.line, pt:1}, radius:0.05 });
  s13.addText([
    `1) Godkjenn målallokering og risikonivå (${d.risikoProfil}).`,
    '2) Etabler implementeringsplan og innfasing i markedet.',
    '3) Start kvartalsvis risikorapportering og rebalansering.',
    `4) Følg opp forventet utvikling mot mål (${pct(d.expected)} p.a.).`,
    '',
    `Forventet sluttverdi ved ${d.years} år: ${formatCurrency(d.expValue)}`
  ].join('\n'), { x:1.2, y:2.2, w:11.2, h:4.2, fontSize:14, color:COLORS.text, breakLine:true });
  addFooter(pptx, s13, 13);
}

function renderStandardSlides14Plus(pptx) {
  // 14 tax standard
  const s14 = pptx.addSlide();
  addHeader(pptx, s14, 'Standard side');
  s14.addText('Beskatning av aksjer og fond i 2026', { x:0.8, y:0.95, w:10.5, h:0.55, fontSize:28, color:COLORS.navy });
  s14.addTable([
    ['Type', 'Privat eie', 'ASK', 'Aksjeselskap'],
    ['Norske aksjer / fond EU/EØS', '37,84% skatt på gevinster etter fradrag for skjermingsrente', 'Ingen løpende skatt, skatt ved realisasjon', 'Fritaksmetoden gjelder i hovedsak'],
    ['Aksjer utenfor EU/EØS', 'Skatt på gevinster / fradrag for tap', 'Kan ikke benyttes på ASK', '22% skatt på gevinster/utbytter i relevante tilfeller'],
    ['Rentefond / obligasjoner', '22% skatt på gevinster, fradrag for tap', 'Kan ikke benyttes på ASK', '22% skatt på gevinster']
  ], { x:0.8, y:1.9, w:12.0, colW:[2.6,3.2,3.0,3.2], fontSize:9, border:{type:'solid', color:COLORS.line, pt:1} });
  s14.addText('Skatteregler kan endres. Denne siden er generell informasjon og ikke individuell skatterådgivning.', { x:0.9, y:6.4, w:11.8, h:0.45, fontSize:10, color:COLORS.muted });
  addFooter(pptx, s14, 14);

  // 15 team standard
  const s15 = pptx.addSlide();
  addHeader(pptx, s15, 'Standard side');
  s15.addText('Forvaltningsteam – bakgrunn og erfaring', { x:0.8, y:0.95, w:11.4, h:0.55, fontSize:28, color:COLORS.navy });
  s15.addShape(pptx.ShapeType.line, { x:0.8, y:1.5, w:11.9, h:0, line:{color:COLORS.navy, pt:1} });
  const team = [
    ['Kåre Pettersen', 'Investeringsdirektør', 'Ansvar: Global makro / norske aksjer'],
    ['Nora Damås', 'Porteføljeforvalter', 'Ansvar: Globale aksjer og renter'],
    ['Trond Omdal', 'Porteføljeforvalter', 'Ansvar: Energi'],
    ['Bjørn Rise', 'Porteføljeforvalter', 'Ansvar: Energi'],
    ['Sigmund Håland', 'Porteføljeforvalter', 'Ansvar: Bank/finans'],
    ['Eyvind Width', 'Porteføljeforvalter', 'Ansvar: Sparbanker'],
    ['Inger Anne Vikre', 'Trader', 'Ansvar: Trading'],
    ['Knut Fredrik Aspelin', 'Porteføljeforvalter', 'Ansvar: Spesialfond']
  ];
  team.forEach((t,i)=>{
    const col = i%4;
    const row = Math.floor(i/4);
    const x = 0.9 + col*3.0;
    const y = 2.0 + row*2.35;
    s15.addText(`${t[0]}\n${t[1]}`, { x, y, w:2.8, h:0.6, fontSize:12, bold:true, color:COLORS.navy, breakLine:true });
    s15.addShape(pptx.ShapeType.line, { x, y: y+0.66, w:2.8, h:0, line:{color:COLORS.blue, pt:1} });
    s15.addText(t[2], { x, y:y+0.78, w:2.8, h:0.6, fontSize:10, color:COLORS.text, breakLine:true });
  });
  addFooter(pptx, s15, 15);
}

function buildPptx(PptxGenJS, payload) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag - ${payload.kundeNavn || 'Kunde'}`;
  pptx.lang = 'nb-NO';

  const d = normalizeData(payload);

  // Per request: 1-5 fixed, 6-13 dynamic, 14+ standard
  renderFixedSlides(pptx, d);
  renderDynamicSlides(pptx, d);
  renderStandardSlides14Plus(pptx);

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
    `Horisont: ${Math.max(1, Math.round(num(data.horisont, 10)))} år`,
    `Forventet avkastning: ${pct(data.vektetAvkastning)} p.a.`
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
      const PptxGenJS = resolvePptxConstructor(PptxModule);
      if (!PptxGenJS) throw new Error('pptxgenjs ikke tilgjengelig eller ugyldig eksport');
      const pptx = buildPptx(PptxGenJS, data);
      const buffer = await pptx.write({ outputType: 'nodebuffer' });
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      res.setHeader('X-Pensum-Output-Format', 'pptx');
      res.setHeader('X-Pensum-Template-Applied', data?.malConfig?.filnavn ? 'fixed-1-5_dynamic-6-13_standard-14plus' : 'no-template');
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
