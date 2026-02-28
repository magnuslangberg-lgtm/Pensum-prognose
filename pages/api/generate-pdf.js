import { spawn } from 'child_process';
import path from 'path';

// ── Lokal tekstgenerator uten ekstern AI-avhengighet ───────────────────────
function genererInvesteringsrationale(data) {
  const {
    kundeNavn,
    totalKapital,
    risikoProfil,
    horisont,
    vektetAvkastning,
    allokering,
    produkterIBruk,
  } = data;

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

  const formatNok = (v) =>
    new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    }).format(Number(v) || 0);

  const aktiveAktiva = (allokering || []).filter((a) => Number(a.vekt) > 0);
  const størsteAktiva = aktiveAktiva
    .slice()
    .sort((a, b) => Number(b.vekt || 0) - Number(a.vekt || 0))
    .slice(0, 2)
    .map((a) => a.navn?.toLowerCase())
    .filter(Boolean);

  const produktListe = (produkterIBruk || [])
    .map((id) => produktNavn[id] || id)
    .filter(Boolean);

  const hovedEksponering =
    størsteAktiva.length > 0
      ? `med hovedvekt i ${størsteAktiva.join(' og ')}`
      : 'med en bred diversifisering på tvers av aktivaklasser';

  const produktTekst =
    produktListe.length > 0
      ? ` Porteføljen benytter ${produktListe.join(', ')} for å gjennomføre anbefalingen.`
      : '';

  return `Basert på ${kundeNavn || 'kundens'} risikoprofil (${risikoProfil || 'ikke angitt'}) og en investeringshorisont på ${Number(horisont) || 0} år, anbefaler Pensum Asset Management en diversifisert portefølje ${hovedEksponering}. Med en investerbar kapital på ${formatNok(totalKapital)} og en forventet vektet avkastning på ${(Number(vektetAvkastning) || 0).toFixed(1)} % p.a., er forslaget satt sammen for å balansere vekstmuligheter og risikostyring på en strukturert måte.${produktTekst}`;
}

// ── Hent produkter faktisk i bruk ──────────────────────────────────────────
function hentProdukterIBruk(allokering) {
  const mapAktivaTilProdukt = {
    'Globale Aksjer': ['global-core-active', 'global-edge'],
    'Norske Aksjer': ['norge-a'],
    'Høyrente': ['global-hoyrente', 'nordisk-hoyrente'],
    'Investment Grade': ['basis'],
    'Private Equity': [],
    'Eiendom': [],
  };

  const result = new Set();
  for (const a of allokering || []) {
    if (Number(a.vekt) > 0) {
      const ids = mapAktivaTilProdukt[a.navn] || [];
      ids.forEach((id) => result.add(id));
    }
  }

  return Array.from(result);
}

// ── API Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body || {};

    if (!data.produkterIBruk || data.produkterIBruk.length === 0) {
      data.produkterIBruk = hentProdukterIBruk(data.allokering);
    }

    data.ai_rationale = genererInvesteringsrationale(data);

    const pdf = await new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'lib', 'generate_pdf.py');
      const py = spawn('python3', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });

      const chunks = [];
      py.stdout.on('data', (chunk) => chunks.push(chunk));
      py.stderr.on('data', (d) => console.error('PDF stderr:', d.toString()));

      py.on('close', (code) => {
        if (code === 0) resolve(Buffer.concat(chunks));
        else reject(new Error(`PDF generator exited with code ${code}`));
      });

      py.stdin.write(JSON.stringify(data));
      py.stdin.end();
    });

    const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

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
