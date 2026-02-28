import { spawn } from 'child_process';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

// ── Claude API for AI-tekst ─────────────────────────────────────────────────
async function genererInvesteringsrationale(data) {
  const { kundeNavn, totalKapital, risikoProfil, horisont, vektetAvkastning, allokering, produkterIBruk } = data;

  const produktNavn = {
    'global-core-active': 'Global Core Active',
    'global-edge': 'Global Edge',
    'basis': 'Basis',
    'global-hoyrente': 'Global Høyrente',
    'nordisk-hoyrente': 'Nordisk Høyrente',
    'norge-a': 'Norske Aksjer',
    'energy-a': 'Global Energy',
    'banking-d': 'Nordic Banking Sector',
    'financial-d': 'Financial Opportunities',
  };

  const produktListe = (produkterIBruk || []).map(id => produktNavn[id] || id).join(', ');
  const aktiveAktiva = (allokering || [])
    .filter(a => a.vekt > 0)
    .map(a => `${a.navn} (${a.vekt.toFixed(1)}%, forventet ${a.avkastning}% p.a.)`)
    .join('\n- ');

  const formatNok = (v) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(v);

  const prompt = `Du er en norsk finansrådgiver hos Pensum Asset Management. Skriv et profesjonelt investeringsrationale på norsk (maks 4 setninger / ~120 ord) for dette investeringsforslaget. Vær konkret, personlig og tillitsskapende. Ikke bruk generiske fraser.

Kundeinfo:
- Navn: ${kundeNavn}
- Total kapital: ${formatNok(totalKapital)}
- Risikoprofil: ${risikoProfil}
- Investeringshorisont: ${horisont} år
- Forventet vektet avkastning: ${vektetAvkastning?.toFixed(1)}% p.a.

Aktivaallokering:
- ${aktiveAktiva}

Pensum-produkter i porteføljen: ${produktListe}

Skriv kun rationalet, ingen overskrift eller innledning.`;

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0]?.text || '';
  } catch (err) {
    console.error('Claude API error:', err);
    return `Basert på ${kundeNavn}s risikoprofil (${risikoProfil}) og en investeringshorisont på ${horisont} år, anbefaler Pensum Asset Management en portefølje med forventet avkastning på ${vektetAvkastning?.toFixed(1)}% p.a. Porteføljen er satt sammen for å gi optimal risikojustert avkastning tilpasset kundens mål og tidshorisont.`;
  }
}

// ── Hent produkter faktisk i bruk ──────────────────────────────────────────
function hentProdukterlBruk(allokering) {
  const mapAktivaTilProdukt = {
    'Globale Aksjer': ['global-core-active', 'global-edge'],
    'Norske Aksjer': ['norge-a'],
    'Høyrente': ['global-hoyrente', 'nordisk-hoyrente'],
    'Investment Grade': ['basis'],
    'Private Equity': [],
    'Eiendom': [],
  };

  const result = new Set();
  for (const a of (allokering || [])) {
    if (a.vekt > 0) {
      const ids = mapAktivaTilProdukt[a.navn] || [];
      ids.forEach(id => result.add(id));
    }
  }
  // Alltid inkluder basis om den er i allokering
  return Array.from(result);
}

// ── API Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Hent produkter som faktisk er i bruk (kan også komme fra frontend)
    if (!data.produkterIBruk || data.produkterIBruk.length === 0) {
      data.produkterIBruk = hentProdukterlBruk(data.allokering);
    }

    // Generer AI-rationale
    data.ai_rationale = await genererInvesteringsrationale(data);

    // Kall Python PDF-generator
    const pdf = await new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'lib', 'generate_pdf.py');
      const py = spawn('python3', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

      const chunks = [];
      py.stdout.on('data', chunk => chunks.push(chunk));
      py.stderr.on('data', d => console.error('PDF stderr:', d.toString()));

      py.on('close', code => {
        if (code === 0) resolve(Buffer.concat(chunks));
        else reject(new Error(`PDF generator exited with code ${code}`));
      });

      py.stdin.write(JSON.stringify(data));
      py.stdin.end();
    });

    const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
    res.setHeader('Content-Length', pdf.length);
    res.send(pdf);

  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' }, responseLimit: '10mb' },
};
