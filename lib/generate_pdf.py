#!/usr/bin/env python3
"""Pensum Investeringsforslag PDF Generator v2 — matcher faktiske Pensum-slides"""

import sys, json, io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import Flowable
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

# ── Fargepalett ──────────────────────────────────────────────────────────
NAVY      = colors.HexColor('#1B3A5F')
DARK_BLUE = colors.HexColor('#0D2240')
STEEL     = colors.HexColor('#5B8DB8')
TEAL      = colors.HexColor('#4A7E96')
GRAY_BG   = colors.HexColor('#F2F2F2')
GRAY_MED  = colors.HexColor('#CCCCCC')
GRAY_DARK = colors.HexColor('#6B7280')
GRAY_TEXT = colors.HexColor('#4B5563')
DARK_GRAY = colors.HexColor('#374151')
WHITE     = colors.white
SALMON    = colors.HexColor('#D4886B')
BORDER    = colors.HexColor('#D1D5DB')
GRAY_STAT = colors.HexColor('#8B9DAF')

PIE_COLORS = [
    colors.HexColor('#1B3A5F'), colors.HexColor('#3D6B9F'), colors.HexColor('#6BAEBF'),
    colors.HexColor('#9DC3D4'), colors.HexColor('#C4A882'), colors.HexColor('#8B9DAF'),
    colors.HexColor('#4A7E96'), colors.HexColor('#B8CDD8'), colors.HexColor('#2C6E7A'),
]

PAGE_W, PAGE_H = A4
MARGIN_L = 18*mm; MARGIN_R = 18*mm; MARGIN_T = 22*mm; MARGIN_B = 18*mm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# ── Produkt data ────────────────────────────────────────────────────────
PROD_MAP = {
    'global-core-active': 'Pensum Global Core Active',
    'global-edge': 'Pensum Global Edge',
    'basis': 'Pensum Basis',
    'global-hoyrente': 'Pensum Global Høyrente',
    'nordisk-hoyrente': 'Pensum Nordisk Høyrente',
    'norge-a': 'Pensum Norge A',
    'energy-a': 'Pensum Global Energy',
    'banking-d': 'Pensum Nordic Banking Sector D',
    'financial-d': 'Pensum Financial Opportunity Fund D',
}

PROD_INFO = {
    'Pensum Global Core Active': {
        'type': 'Globale aksjer — aktivt forvaltet',
        'desc': 'Aktivt forvaltet global aksjeportefølje som kombinerer et kjernemandat med aktiv aksjeplukking. Investerer i veldiversifiserte globale aksjer gjennom ledende fondshus med komplementære investeringsfilosofier.',
        'under': [('AB Select US Equity S1 USD',19.9),('Capital Group InvCoAmer (LUX) A4',19.8),('BGF European Value D2',10.3),('Guinness Global Equity Income Y EUR',10.2),('Acadian Global Equity UCITS A EUR',10.1),('Capital Group New Pers (LUX) ZL',10.0),('Acadian Emerg Mkts Eq II C USD',8.6),('DNB Teknologi A',5.8),('JPM Japan Strategic Value C JPY',5.3)],
        'reg': [('USA',59.8),('Japan',6.3),('UK',4.6),('Frankrike',3.6),('Taiwan',3.3),('Kina',2.9),('Sveits',2.7),('Sverige',2.3),('Andre',14.5)],
        'sek': [('Teknologi',26.9),('Finansielle tjenester',17.3),('Industri',13.5),('Helse',10.8),('Kommunikasjon',9.8),('Forbruksvarer',8.6),('Forbruksdef.',5.3),('Energi',2.5),('Andre',5.3)],
    },
    'Pensum Global Edge': {
        'type': 'Globale aksjer — faktorbasert',
        'desc': 'Regelbasert globalt aksjemandat med systematisk faktoreksponering. Kombinerer value, quality og momentum-faktorer for å skape meravkastning. Inkluderer spissede nisjestrategier innen small cap og spesifikke sektorer.',
        'under': [('Janus Henderson Hrzn Glb SC IU2 USD',16.8),('Capital Group InvCoAmer (LUX) Z',13.3),('DNB Teknologi A',12.2),('Acadian Emerg Mkts Eq II C USD',10.1),('BGF European Value D2',8.4),('ORIGO SELEQT A',7.6),('Arctic Aurora LifeScience I',7.5),('Bakersteel Glb Fds SICAV-Elctm I',7.1),('Granahan US Focused Growth A USD',6.4),('FIRST Impact',5.2)],
        'reg': [('USA',46.8),('Sverige',7.1),('UK',4.9),('Kina',4.3),('Canada',4.0),('Japan',3.7),('Frankrike',3.1),('Taiwan',2.5),('Andre',23.6)],
        'sek': [('Teknologi',22.8),('Industri',16.0),('Helse',14.6),('Finansielle tjenester',11.8),('Basismateriell',9.7),('Forbruksvarer',9.6),('Kommunikasjon',6.8),('Energi',2.4),('Andre',6.3)],
    },
    'Pensum Norge A': {
        'type': 'Norske aksjer',
        'desc': 'Aktivt forvaltet norsk aksjeportefølje med bred eksponering mot Oslo Børs. Inkluderer de mest attraktive norske selskapene på tvers av sektorer. Drar nytte av Norges sterke posisjon innen energi, finans og maritim sektor.',
        'under': [('DNB Bank ASA',7.0),('Protector Forsikring ASA',6.8),('Storebrand ASA',5.1),('Equinor ASA',4.2),('Aker ASA Class A',4.1),('DOF Group ASA',4.0),('Mowi ASA',4.0),('Public Property Invest ASA',3.5),('SpareBank 1 Sor Norge',3.5)],
        'reg': [('Norge',91.2),('Singapore',2.7),('Hellas',2.5),('USA',2.5),('Andre',1.1)],
        'sek': [('Industri',28.2),('Finansielle tjenester',27.9),('Forbruksvarer',13.7),('Energi',6.6),('Kommunikasjon',4.2),('Teknologi',3.9),('Eiendom',3.5),('Forsyning',2.1),('Andre',9.9)],
    },
    'Pensum Nordic Banking Sector D': {
        'type': 'Nordiske bankaksjer',
        'desc': 'Eksponering mot nordisk banksektor — en av de mest solide og lønnsomme i verden. Porteføljen inkluderer store nordiske banker og sparebanker med sterke kapitalbalanser og attraktive utbytteprofiler.',
        'under': [('DNB Bank ASA',15.6),('Nordea Bank Abp',13.6),('SpareBank 1 SMN Dep.',12.2),('Sparebank 1 Sorost-Norge',10.3),('Sparebanken Norge Dep.',8.9),('Danske Bank AS',4.7),('Swedbank AB Class A',4.4),('Sparebanken More',3.9)],
        'reg': [('Norge',66.6),('Sverige',26.5),('Danmark',6.9)],
        'sek': [('Finansielle tjenester',100.0)],
    },
    'Pensum Global Høyrente': {
        'type': 'Globale høyrentobligasjoner',
        'desc': 'Globalt diversifisert høyrenteportefølje som investerer i selskapsobligasjoner med høyere rente. Gir attraktiv løpende avkastning med diversifisert kredittrisiko på tvers av globale markeder.',
        'under': [('Arctic Nordic Corporate Bond Class D',25.3),('Barings Global High Yield Bond I NOK',23.2),('BlueBay Global High Yield Bd I NOK',20.2),('Storm Bond ICN NOK',16.2),('KLP Obligasjon Global S',15.2)],
        'reg': [('USA',45.0),('Europa',35.0),('Norden',15.0),('Andre',5.0)],
        'sek': [('Høyrente selskapsobl.',80.0),('Investment Grade',15.0),('Statsobligasjoner',5.0)],
    },
    'Pensum Nordisk Høyrente': {
        'type': 'Nordiske høyrentobligasjoner',
        'desc': 'Fokusert på nordiske høyrentobligasjoner, med eksponering mot solide nordiske selskaper med lavere valutarisiko enn globale alternativer. Attraktiv løpende avkastning i hjemmemarkedet.',
        'under': [('Storm Bond ICN NOK',33.7),('Arctic Nordic Corporate Bond Class D',33.7),('Alfred Berg Nordic HY C (NOK)',32.6)],
        'reg': [('Norge',50.0),('Sverige',30.0),('Danmark',15.0),('Andre',5.0)],
        'sek': [('Nordiske høyrentobligasjoner',100.0)],
    },
    'Pensum Basis': {
        'type': 'Balansert — aksjer og renter',
        'desc': 'Balansert portefølje som kombinerer globale aksjer og rentepapirer for stabil avkastning med moderat risiko. Passer for investorer som ønsker bred diversifisering med en defensiv buffer i rentedelen.',
        'under': [('Arctic Nordic Corporate Bond Class D',21.2),('Arctic Return Class I',17.5),('Acadian Global Equity UCITS A EUR',11.5),('Guinness Global Equity Income Y EUR',10.8),('KLP Obligasjon Global S',10.1),('Janus Henderson Hrzn Glb SC IU2 USD',5.9),('Acadian Emerg Mkts Eq II C USD',4.6)],
        'reg': [('USA',34.2),('Norge',19.6),('Sverige',7.8),('UK',4.8),('Sveits',4.1),('Andre',29.5)],
        'sek': [('Industri',19.0),('Teknologi',16.3),('Finansielle tjenester',14.4),('Forbruksvarer',13.8),('Helse',12.2),('Andre',24.3)],
    },
    'Pensum Global Energy': {
        'type': 'Global energisektor',
        'desc': 'Spesialisert energiportefølje med eksponering mot globale energiselskaper, inkludert olje, gass og fornybar energi. Høy konsentrasjon mot energisektoren gir potensial for høy avkastning i energioppgang.',
        'under': [('Var Energi ASA',5.7),('DNO ASA',5.7),('Aker BP ASA',5.6),('Valero Energy Corp',5.1),('Exxon Mobil Corp',5.1),('Equinor ASA',4.5),('Chevron Corp',4.3),('Frontline PLC',4.1)],
        'reg': [('USA',39.8),('Norge',36.9),('UK',7.4),('Canada',5.7),('Andre',10.2)],
        'sek': [('Energi',84.9),('Industri',7.6),('Forsyning',3.9),('Teknologi',3.6)],
    },
    'Pensum Financial Opportunity Fund D': {
        'type': 'Spesialfinans og alternativer',
        'desc': 'Spesialisert finansportefølje som investerer i særskilte finansielle muligheter, inkludert spesialobligasjoner, strukturerte produkter og alternative finansielle instrumenter utenfor tradisjonelle markeder.',
        'under': [('IuteCredit Finance S.a r.l.',26.5),('Stichting AK Rabobank Cert.',18.3),('Eleving Group SA',14.1),('Worldline SA',10.3),('Axactor ASA',9.9),('Multitude PLC',8.0),('Sherwood Financing PLC',7.8),('Landsbankinn hf.',5.2)],
        'reg': [('Europa',75.0),('Norden',25.0)],
        'sek': [('Selskapsobligasjoner',70.0),('Finansielle instrumenter',30.0)],
    },
}

AVKASTNING = {
    'Pensum Global Core Active': {2016:3.7,2017:15.5,2018:-5.5,2019:25.1,2020:11.8,2021:23.1,2022:-7.4,2023:23.2,2024:32.9,2025:7.6},
    'Pensum Global Edge':        {2020:2.3,2021:2.2,2022:-12.1,2023:11.0,2024:9.8,2025:9.4},
    'Pensum Basis':              {2020:7.5,2021:11.0,2022:-2.9,2023:11.6,2024:13.2,2025:4.3},
    'Pensum Global Høyrente':    {2016:5.5,2017:4.5,2018:-1.2,2019:6.2,2020:2.5,2021:5.3,2022:-5.1,2023:7.6,2024:6.6,2025:5.9},
    'Pensum Nordisk Høyrente':   {2020:-0.6,2021:8.9,2022:4.3,2023:11.2,2024:8.6,2025:6.3},
    'Pensum Norge A':            {2016:29.5,2017:15.6,2018:-0.4,2019:25.5,2020:20.2,2021:26.7,2022:4.2,2023:13.6,2024:10.7,2025:17.8},
    'Pensum Global Energy':      {2020:91.3,2021:24.0,2022:55.6,2023:9.3,2024:-3.2,2025:5.7},
    'Pensum Nordic Banking Sector D': {2020:56.1,2021:49.4,2022:-9.3,2023:17.1,2024:26.2,2025:25.8},
    'Pensum Financial Opportunity Fund D': {2022:-12.4,2023:10.2,2024:11.0,2025:9.0},
}

ASSET_ALLOC_COLORS = {
    'Globale Aksjer': colors.HexColor('#1B3A5F'),
    'Norske Aksjer':  colors.HexColor('#5B8DB8'),
    'Høyrente':       colors.HexColor('#4A7E96'),
    'Investment Grade': colors.HexColor('#9DC3D4'),
    'Private Equity': colors.HexColor('#C4A882'),
    'Eiendom':        colors.HexColor('#8B9DAF'),
    'Pengemarked':    colors.HexColor('#B8CDD8'),
}

def fmtnok(v, short=False):
    if short:
        if abs(v) >= 1e9: return f'NOK {v/1e9:.1f} mrd'
        if abs(v) >= 1e6: return f'NOK {v/1e6:.0f} mill'
        if abs(v) >= 1e3: return f'NOK {v/1e3:.0f} k'
        return f'NOK {v:.0f}'
    return 'NOK {:,.0f}'.format(v).replace(',', ' ')

def heatmap_cell(v):
    if v is None: return colors.HexColor('#F3F4F6'), DARK_GRAY
    if v > 20:  return colors.HexColor('#15803d'), WHITE
    if v > 10:  return colors.HexColor('#22c55e'), WHITE
    if v > 0:   return colors.HexColor('#bbf7d0'), DARK_GRAY
    if v > -10: return colors.HexColor('#fecaca'), DARK_GRAY
    return colors.HexColor('#dc2626'), WHITE

def S(name='x', **kw):
    return ParagraphStyle(name, **kw)


# ── Custom Flowables ────────────────────────────────────────────────────────

class ColorBlock(Flowable):
    def __init__(self, w, h, bg, text='', fg=WHITE, font='Helvetica-Bold', fs=10, pad_l=8):
        super().__init__()
        self.width, self.height = w, h
        self.bg, self.text, self.fg = bg, text, fg
        self.font, self.fs, self.pad_l = font, fs, pad_l
    def draw(self):
        self.canv.setFillColor(self.bg)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        if self.text:
            self.canv.setFillColor(self.fg)
            self.canv.setFont(self.font, self.fs)
            self.canv.drawString(self.pad_l, (self.height - self.fs)/2 + 1, self.text)
    def wrap(self, aw, ah): return self.width, self.height


class PieChart(Flowable):
    def __init__(self, vals, cols, w=70*mm, h=70*mm):
        super().__init__()
        self.vals, self.cols = vals, cols
        self.width, self.height = w, h
    def draw(self):
        d = Drawing(self.width, self.height)
        pie = Pie()
        pie.x = 2; pie.y = 2
        pie.width = self.width - 4; pie.height = self.height - 4
        pie.data = self.vals
        pie.labels = [''] * len(self.vals)
        pie.simpleLabels = 1
        pie.startAngle = 90
        pie.direction = 'clockwise'
        for i, c in enumerate(self.cols[:len(self.vals)]):
            pie.slices[i].fillColor = c
            pie.slices[i].strokeWidth = 0.8
            pie.slices[i].strokeColor = WHITE
        d.add(pie)
        renderPDF.draw(d, self.canv, 0, 0)
    def wrap(self, aw, ah): return self.width, self.height


class LineChart(Flowable):
    """Avkastningsgraf — ligner Pensum slide 4"""
    def __init__(self, series, w=CONTENT_W, h=80*mm):
        super().__init__()
        self.series = series  # [{name, data:[(x,y)], color, dash}]
        self.width, self.height = w, h
    def draw(self):
        c = self.canv
        PL, PR, PT, PB = 48, 8, 8, 28
        cw = self.width - PL - PR
        ch = self.height - PT - PB

        all_y = [y for s in self.series for _, y in s['data']]
        all_x = sorted(set(x for s in self.series for x, _ in s['data']))
        if not all_y or len(all_x) < 2: return

        y_min = min(0, min(all_y)) * 1.05
        y_max = max(all_y) * 1.15
        x_min, x_max = all_x[0], all_x[-1]

        def tx(x): return PL + (x - x_min) / (x_max - x_min) * cw
        def ty(y): return PB + (y - y_min) / (y_max - y_min) * ch

        # White bg
        c.setFillColor(WHITE)
        c.rect(PL, PB, cw, ch, fill=1, stroke=0)

        # Grid
        for i in range(6):
            y = y_min + i * (y_max - y_min) / 5
            cy = ty(y)
            c.setStrokeColor(colors.HexColor('#E5E7EB'))
            c.setLineWidth(0.25)
            c.line(PL, cy, PL + cw, cy)
            c.setFont('Helvetica', 6.5)
            c.setFillColor(GRAY_DARK)
            c.drawRightString(PL - 2, cy - 3, f'{y:.0f}%')

        # Zero line
        if y_min < 0 < y_max:
            cy0 = ty(0)
            c.setStrokeColor(GRAY_MED)
            c.setLineWidth(0.5)
            c.line(PL, cy0, PL + cw, cy0)

        # X labels
        step = max(1, len(all_x) // 8)
        for i, x in enumerate(all_x):
            if i % step == 0:
                c.setFont('Helvetica', 6.5)
                c.setFillColor(GRAY_DARK)
                c.drawCentredString(tx(x), PB - 9, str(int(x)) if x == int(x) else f'{x:.1f}')

        # Border
        c.setStrokeColor(GRAY_MED)
        c.setLineWidth(0.4)
        c.rect(PL, PB, cw, ch, fill=0, stroke=1)

        # Lines
        for s in self.series:
            pts = sorted(s['data'])
            if len(pts) < 2: continue
            col = s.get('color', NAVY)
            lw = s.get('lw', 1.5)
            dash = s.get('dash')
            c.setStrokeColor(col)
            c.setLineWidth(lw)
            c.setDash(*(dash if dash else []))
            p = c.beginPath()
            p.moveTo(tx(pts[0][0]), ty(pts[0][1]))
            for x, y in pts[1:]:
                p.lineTo(tx(x), ty(y))
            c.drawPath(p, stroke=1, fill=0)
            c.setDash()

        # Legend
        lx = PL
        for s in self.series:
            c.setStrokeColor(s.get('color', NAVY))
            c.setLineWidth(1.5)
            dash = s.get('dash')
            if dash: c.setDash(*dash)
            c.line(lx, 9, lx+18, 9)
            c.setDash()
            c.setFont('Helvetica', 6.5)
            c.setFillColor(DARK_GRAY)
            c.drawString(lx+20, 6, s['name'][:35])
            lx += 22 + c.stringWidth(s['name'][:35], 'Helvetica', 6.5) + 14

    def wrap(self, aw, ah): return self.width, self.height


# ── Page template ────────────────────────────────────────────────────────────

class PT:
    def __init__(self, kunde):
        self.kunde = kunde
    def __call__(self, canv, doc):
        if doc.page == 1: return
        canv.saveState()
        # PENSUM top right
        canv.setFont('Helvetica-Bold', 7)
        canv.setFillColor(NAVY)
        canv.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 11*mm, 'PENSUM')
        canv.setFont('Helvetica', 6)
        canv.setFillColor(GRAY_DARK)
        canv.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 15*mm, 'ASSET MANAGEMENT')
        canv.setStrokeColor(GRAY_MED)
        canv.setLineWidth(0.4)
        canv.line(MARGIN_L, PAGE_H - 18*mm, PAGE_W - MARGIN_R, PAGE_H - 18*mm)
        # Page number
        canv.setFont('Helvetica', 7.5)
        canv.setFillColor(GRAY_DARK)
        canv.drawRightString(PAGE_W - MARGIN_R, 12*mm, str(doc.page))
        canv.restoreState()


# ── Forside ──────────────────────────────────────────────────────────────────

class Forside(Flowable):
    def __init__(self, data, dato):
        super().__init__()
        self.data, self.dato = data, dato
        self.width, self.height = PAGE_W, PAGE_H
    def draw(self):
        c = self.canv
        d = self.data
        w, h = PAGE_W, PAGE_H
        ox, oy = -MARGIN_L, -MARGIN_B

        # ── Nedre halvdel: lys grå
        c.setFillColor(colors.HexColor('#F5F5F5'))
        c.rect(ox, oy, w, h * 0.5, fill=1, stroke=0)

        # ── Øvre halvdel: mørkeblå gradert
        c.setFillColor(DARK_BLUE)
        c.rect(ox, oy + h*0.5 - 1, w, h*0.5 + MARGIN_T + 5*mm + 1, fill=1, stroke=0)

        # Overlapping blokk
        c.setFillColor(colors.HexColor('#254D7A'))
        c.rect(ox + w*0.42, oy + h*0.5, w*0.58, h*0.5 + MARGIN_T + 5*mm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor('#1B3A5F'))
        c.rect(ox + w*0.6, oy + h*0.55, w*0.4, h*0.45 + MARGIN_T + 5*mm, fill=1, stroke=0)

        # ── Stor rundet hvit boks (nøkkelelement)
        bx = ox + 22*mm; bw = w * 0.55; bh = h * 0.38; by = oy + h*0.32
        c.setFillColor(WHITE)
        c.roundRect(bx, by, bw, bh, 18, fill=1, stroke=0)

        # Tekst i boksen
        ty_title = by + bh - 32*mm
        c.setFont('Helvetica-Bold', 20)
        c.setFillColor(NAVY)
        c.drawString(bx + 14*mm, ty_title, 'Investeringsforslag fra Pensum')

        c.setFont('Helvetica', 14)
        c.setFillColor(NAVY)
        c.drawString(bx + 14*mm, ty_title - 11*mm, d.get('kundeNavn', 'Investor'))

        c.setFont('Helvetica', 10)
        c.setFillColor(GRAY_DARK)
        c.drawString(bx + 14*mm, ty_title - 24*mm, self.dato)

        # ── PENSUM logo øverst høyre
        c.setFont('Helvetica-Bold', 9)
        c.setFillColor(WHITE)
        c.drawRightString(w - MARGIN_R - MARGIN_L, h - MARGIN_T - 1*mm, 'PENSUM')
        c.setFont('Helvetica', 7)
        c.setFillColor(colors.HexColor('#93C5FD'))
        c.drawRightString(w - MARGIN_R - MARGIN_L, h - MARGIN_T - 7*mm, 'ASSET MANAGEMENT')

        # ── Salmon stripe mellom over/under
        c.setFillColor(SALMON)
        c.rect(ox, oy + h*0.5 - 2*mm, w, 4*mm, fill=1, stroke=0)

        # ── KPI-rad nedre
        kpis = [
            ('INVESTERINGSBELØP', fmtnok(d.get('totalKapital', 0), short=True)),
            ('RISIKOPROFIL', d.get('risikoProfil', '')),
            ('TIDSHORISONT', f"{d.get('horisont', 10)} år"),
            ('FORVENTET AVKASTNING', f"{d.get('vektetAvkastning', 0):.1f}% p.a."),
        ]
        kpi_w = (w - 2*MARGIN_L) / len(kpis)
        kpi_y = oy + h*0.28
        for i, (lbl, val) in enumerate(kpis):
            kx = ox + MARGIN_L + i * kpi_w + 4*mm
            c.setFont('Helvetica', 7)
            c.setFillColor(GRAY_DARK)
            c.drawString(kx, kpi_y + 8, lbl)
            c.setFont('Helvetica-Bold', 14)
            c.setFillColor(NAVY)
            c.drawString(kx, kpi_y - 5, val)

    def wrap(self, w, h): return w, h


# ── Om Pensum ────────────────────────────────────────────────────────────────

def build_om_pensum(story):
    story.append(Paragraph('Om oss',
        S('h1', fontName='Helvetica-Bold', fontSize=22, textColor=NAVY, leading=28)))
    story.append(HRFlowable(width='100%', thickness=1.5, color=NAVY, spaceAfter=5*mm))
    story.append(Paragraph('<b>Pensum har røtter tilbake til 2002 og har i dag fire ulike virksomhetsområder, hvor kjernen ligger innen forvaltningstjenester.</b>',
        S('omi', fontName='Helvetica', fontSize=10, textColor=DARK_GRAY, leading=15)))
    story.append(Spacer(1, 5*mm))

    bw = CONTENT_W / 4 - 2*mm
    boxes = [
        ('HELHETLIG\nFORVALTNING', 'Skreddersydd og helhetlig rådgivning til institusjoner og «private banking»-markedet.', NAVY),
        ('FORVALTNING AV\nENKELTPRODUKTER', 'Forvaltning av aktivt forvaltede mandater, AIFer, UCITS fond, fondsporteføljer og eiendom.', STEEL),
        ('CORPORATE\nFINANCE', 'Rådgivning knyttet til M&A, verdivurderinger, kapitalstruktur og kapitalinnhenting.', TEAL),
        ('REGNSKAP', 'Autorisert regnskapsfører med tjenester mot Pensums kunder samt eksterne kunder.', colors.HexColor('#9DC3D4')),
    ]

    box_cells = []
    for title, desc, bg in boxes:
        inner = Table([
            [Paragraph(title.replace('\n','<br/>'), S('bh', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE, leading=11))],
            [Spacer(1, 2*mm)],
            [Paragraph(desc, S('bd', fontName='Helvetica', fontSize=8, textColor=WHITE, leading=12))],
        ], colWidths=[bw - 4*mm])
        inner.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg),
            ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        box_cells.append(inner)

    story.append(Table([box_cells], colWidths=[CONTENT_W/4]*4, style=TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 3*mm),
        ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ])))

    story.append(HRFlowable(width='100%', thickness=0.4, color=GRAY_MED, spaceAfter=4*mm, spaceBefore=5*mm))

    # Stats
    stats = [('ANTALL\nANSATTE','39',''), ('FORVALTNINGS-\nKAPITAL','NOK 12,3','Mrd'),
             ('ÅRLIG VEKST\nFORVALTNINGS-\nKAPITAL','29,1','%'), ('ÅRLIG VEKST\nINNTEKTER','22,1','%')]
    stat_cells = []
    for lbl, big, unit in stats:
        cell = Table([
            [Paragraph(lbl.replace('\n','<br/>'), S('sl', fontName='Helvetica-Bold', fontSize=7, textColor=WHITE, leading=9, alignment=TA_CENTER))],
            [Paragraph(big + (' ' + unit if unit else ''), S('sv', fontName='Helvetica-Bold', fontSize=18, textColor=WHITE, leading=24, alignment=TA_CENTER))],
        ], colWidths=[CONTENT_W/4 - 3*mm])
        cell.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), GRAY_STAT),
            ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ]))
        stat_cells.append(cell)
    story.append(Table([stat_cells], colWidths=[CONTENT_W/4]*4, style=TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 3*mm),
        ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ])))
    story.append(PageBreak())


# ── Dine ønsker og mål ────────────────────────────────────────────────────────

def build_maal(story, data):
    story.append(Paragraph('Dine ønsker og mål',
        S('h1m', fontName='Helvetica-Bold', fontSize=22, textColor=NAVY, leading=28)))
    story.append(HRFlowable(width='100%', thickness=1.5, color=NAVY, spaceAfter=5*mm))

    items = [
        ('Formål med investeringene', data.get('formaal', 'Utvikle finansiell formue')),
        ('Avkastningskrav/mål', f"{data.get('vektetAvkastning', 8):.0f}-{min(data.get('vektetAvkastning', 8)+3, 15):.0f}% p.a."),
        ('Tidshorisont', f"Langsiktig, {data.get('horisont', 10)} år +"),
        ('Risikovillighet', data.get('risikoProfil', 'Middels')),
        ('Investeringsbeløp', fmtnok(data.get('totalKapital', 0))),
        ('Likviditetsbehov', data.get('likviditetsbehov', 'Ingen løpende behov per i dag, men vil holde porteføljen med daglig likviditet')),
    ]

    rows = []
    for lbl, val in items:
        btn = Table([[Paragraph(lbl, S('ml', fontName='Helvetica', fontSize=10, textColor=DARK_GRAY, leading=14, alignment=TA_CENTER))]],
                    colWidths=[62*mm])
        btn.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.8, NAVY),
            ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ]))
        rows.append([btn, Paragraph(val, S('mv', fontName='Helvetica', fontSize=10, textColor=DARK_GRAY, leading=14))])

    tbl = Table(rows, colWidths=[65*mm, CONTENT_W - 65*mm])
    tbl.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (0,-1), 8),
        ('LEFTPADDING', (1,0), (1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, GRAY_MED),
    ]))
    story.append(tbl)
    story.append(PageBreak())


# ── Forslag til Allokering ────────────────────────────────────────────────────

def build_allokering(story, data):
    aktive = [a for a in data.get('allokering', []) if a.get('vekt', 0) > 0]
    if not aktive: return

    total = data.get('totalKapital', 0)
    mnok = total / 1e6

    story.append(Paragraph('Forslag til Allokering',
        S('h1a', fontName='Helvetica-Bold', fontSize=22, textColor=NAVY, leading=28)))
    story.append(HRFlowable(width='100%', thickness=1.5, color=NAVY, spaceAfter=4*mm))

    # Kategoriser
    aksje_n = ['Globale Aksjer', 'Norske Aksjer', 'Private Equity']
    rente_n  = ['Høyrente', 'Investment Grade', 'Pengemarked']
    a_aksjer = [a for a in aktive if a['navn'] in aksje_n]
    a_renter  = [a for a in aktive if a['navn'] in rente_n]
    a_andre   = [a for a in aktive if a not in a_aksjer + a_renter]

    aksje_sum = sum(a['vekt'] for a in a_aksjer)
    rente_sum = sum(a['vekt'] for a in a_renter + a_andre)

    # ── Allokeringstabell (venstre)
    def section_rows(assets, header):
        rows = [[
            Paragraph(header, S('ah', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13)),
            Paragraph('MNOK', S('ahv', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
            Paragraph('Vekt', S('ahp', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
        ]]
        for a in assets:
            rows.append([
                Paragraph(a['navn'], S('an', fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=13, leftIndent=8)),
                Paragraph(f"{mnok * a['vekt']/100:.0f}", S('av', fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
                Paragraph(f"{a['vekt']:.0f},0 %", S('ap', fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
            ])
        return rows

    table_rows = [[
        Paragraph(f'Investeringsbeløp i mill NOK', S('ih', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13)),
        Paragraph(f'{mnok:.0f}', S('iv', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
        Paragraph('', S('ix', fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=13)),
    ]]
    if a_aksjer: table_rows += section_rows(a_aksjer, 'Aksjer')
    if a_renter: table_rows += section_rows(a_renter, 'Renter')
    if a_andre:  table_rows += section_rows(a_andre, 'Øvrige')
    table_rows.append([
        Paragraph('<b>Totalt</b>', S('tot', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13)),
        Paragraph(f'<b>{mnok:.0f}</b>', S('totv', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
        Paragraph('<b>100 %</b>', S('totp', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
    ])

    allok_tbl = Table(table_rows, colWidths=[52*mm, 13*mm, 17*mm])
    ts = [
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('LINEBELOW', (0,0), (-1,0), 0.8, DARK_GRAY),
        ('LINEBELOW', (0,-1), (-1,-1), 0.8, DARK_GRAY),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [WHITE, colors.HexColor('#F9FAFB')]),
        ('LINEBELOW', (0,1), (-1,-2), 0.2, GRAY_MED),
    ]
    allok_tbl.setStyle(TableStyle(ts))

    # ── Kakediagram
    pie_vals = [a['vekt'] for a in aktive]
    pie_cols = [ASSET_ALLOC_COLORS.get(a['navn'], PIE_COLORS[i % len(PIE_COLORS)]) for i, a in enumerate(aktive)]
    pie = PieChart(pie_vals, pie_cols, w=75*mm, h=75*mm)
    pie_lbl = Paragraph(
        f'<b>{int(aksje_sum)}% Aksjer / {int(rente_sum)}% Renter</b>' if (aksje_sum and rente_sum) else '',
        S('pl', fontName='Helvetica', fontSize=8, textColor=GRAY_DARK, leading=12, alignment=TA_CENTER))

    # ── Tekst høyre
    ai_aksje = data.get('ai_aksjerationale',
        'I aksjedelen fordeler vi kapitalen mellom globale og nordiske aksjer. '
        'Størstedelen plasseres globalt gjennom aktivt forvaltede fondsporteføljer '
        'som gir bred eksponering mot verdens aksjemarkeder. Den globale allokeringen '
        'kombinerer kvalitetsforvaltere med ulike tilnærminger – både brede, fundamentale '
        'strategier og mer spissede nisjestrategier innen small cap, regioner og sektorer.<br/><br/>'
        'Den resterende delen plasseres i nordiske aksjer med eksponering mot det brede norske '
        'markedet og den nordiske banksektoren, som historisk har levert sterk avkastning. '
        'I sum gir aksjedelen en god balanse mellom global og nordisk eksponering.')
    ai_rente = data.get('ai_renterationale',
        'Rentedelen består av en kombinasjon av høykvalitetsobligasjoner og høyrenteobligasjoner. '
        'En betydelig del plasseres i korte obligasjoner med høy kredittkvalitet, som gir stabilitet '
        'og likviditet til porteføljen. Resten allokeres til høyrentemarkedet der aktiv forvaltning '
        'og grundig kredittanalyse skaper grunnlag for meravkastning.<br/><br/>'
        'Samlet gir rentedelen løpende avkastning og fungerer som en stabiliserende buffer i porteføljen.')

    body_s = S('body', fontName='Helvetica', fontSize=9.5, textColor=GRAY_TEXT, leading=14, alignment=TA_JUSTIFY)
    h4_s   = S('h4', fontName='Helvetica-Bold', fontSize=10, textColor=NAVY, leading=14)

    right_items = []
    if a_aksjer:
        right_items += [Paragraph('<b>Aksjedelen</b>', h4_s), Spacer(1, 1.5*mm),
                        Paragraph(ai_aksje, body_s), Spacer(1, 4*mm)]
    if a_renter or a_andre:
        right_items += [Paragraph('<b>Rentedelen</b>', h4_s), Spacer(1, 1.5*mm),
                        Paragraph(ai_rente, body_s)]

    right_col = [[item] for item in right_items]
    right_tbl = Table(right_col, colWidths=[CONTENT_W - 90*mm - 4*mm])
    right_tbl.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))

    left = Table([[allok_tbl], [Spacer(1,3*mm)], [pie], [pie_lbl]], colWidths=[90*mm])
    left.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('ALIGN', (0,2), (0,3), 'CENTER'),
    ]))

    main = Table([[left, right_tbl]], colWidths=[90*mm, CONTENT_W-90*mm-4*mm])
    main.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (1,0), (1,0), 8*mm),
    ]))
    story.append(main)
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=0.4, color=GRAY_MED, spaceAfter=3*mm))

    # ── Porteføljeforslag med produkter
    produkt_ids = data.get('produkterIBruk', [])
    if produkt_ids:
        pct_label = f'Porteføljeforslag {int(aksje_sum)}% aksjer {int(rente_sum)}% renter' if (aksje_sum and rente_sum) else 'Porteføljeforslag'
        story.append(Paragraph(pct_label, S('pfh', fontName='Helvetica-Bold', fontSize=12, textColor=DARK_GRAY, leading=16)))
        story.append(Spacer(1, 3*mm))

        prod_names = [PROD_MAP.get(pid, pid) for pid in produkt_ids]
        n = len(prod_names)
        pct_each = 100.0 / n if n else 0
        p2 = PieChart([pct_each]*n, PIE_COLORS[:n], w=72*mm, h=72*mm)

        # Legend
        leg_rows = [[Paragraph('', S('ph0', fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=13)),
                     Paragraph('%', S('phv', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT))]]
        for i, pn in enumerate(prod_names):
            col = PIE_COLORS[i % len(PIE_COLORS)]
            hex_c = '#{:02X}{:02X}{:02X}'.format(int(col.red*255), int(col.green*255), int(col.blue*255))
            leg_rows.append([
                Paragraph(f'<font color="{hex_c}">&#9679;</font> {pn}',
                    S(f'pl{i}', fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=13)),
                Paragraph(f'{pct_each:.1f}', S(f'pv{i}', fontName='Helvetica', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
            ])
        leg_rows.append([
            Paragraph('<b>Total</b>', S('plt', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13)),
            Paragraph('<b>100,0</b>', S('plvt', fontName='Helvetica-Bold', fontSize=9, textColor=DARK_GRAY, leading=13, alignment=TA_RIGHT)),
        ])
        leg_tbl = Table(leg_rows, colWidths=[CONTENT_W - 80*mm - 8*mm, 15*mm])
        leg_tbl.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('LINEBELOW', (0,0), (-1,0), 0.5, DARK_GRAY),
            ('LINEBELOW', (0,-1), (-1,-1), 0.5, DARK_GRAY),
        ]))

        pie2_layout = Table([[p2, leg_tbl]], colWidths=[80*mm, CONTENT_W-80*mm-4*mm])
        pie2_layout.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING', (1,0), (1,0), 6*mm),
        ]))
        story.append(pie2_layout)

        disc = data.get('ai_portefoljetekst',
            'Denne eksempelporteføljen består av et knippe «kjerneposisjoner», som utgjør grunnmuren i porteføljen, '
            'i tillegg til at vi har inkludert en vesentlig andel mot mer spissede plasseringer. Grunnmuren, '
            'eller «kjerneposisjonene», utgjør 85% av porteføljen og består av Pensum Global Core Active og '
            'Pensum Norge A. De mer spesifikke plasseringene utgjør 15% og inkluderer sektorfond og spesialstrategier.')
        story.append(Spacer(1, 3*mm))
        story.append(Paragraph(disc, S('disc', fontName='Helvetica', fontSize=8.5, textColor=GRAY_TEXT, leading=12)))
        story.append(Spacer(1, 2*mm))
        story.append(Paragraph('Source: Morningstar Direct',
            S('src', fontName='Helvetica', fontSize=7.5, textColor=GRAY_DARK, leading=10)))
    story.append(PageBreak())


# ── Eksponering ──────────────────────────────────────────────────────────────

def build_eksponering(story, data):
    produkt_ids = data.get('produkterIBruk', [])
    if not produkt_ids: return

    story.append(Paragraph('Porteføljeforslag – Regioner og sektorer',
        S('h1e', fontName='Helvetica-Bold', fontSize=18, textColor=DARK_GRAY, leading=24)))
    story.append(Spacer(1, 3*mm))

    # Aggreger
    n = len(produkt_ids)
    agg_reg = {}; agg_sek = {}
    for pid in produkt_ids:
        pn = PROD_MAP.get(pid, pid)
        info = PROD_INFO.get(pn, {})
        for r, v in info.get('reg', []):
            agg_reg[r] = agg_reg.get(r, 0) + v / n
        for s, v in info.get('sek', []):
            agg_sek[s] = agg_sek.get(s, 0) + v / n

    reg = sorted(agg_reg.items(), key=lambda x: -x[1])
    sek = sorted(agg_sek.items(), key=lambda x: -x[1])

    acwi_reg = [('USA',61.4),('Japan',5.8),('UK',3.3),('Canada',3.1),('Kina',2.9),('Taiwan',2.5),('Sveits',2.2),('Tyskland',2.0),('Frankrike',2.0),('Andre',14.8)]
    acwi_sek = [('Teknologi',25.8),('Finansielle tjenester',16.6),('Industri',11.7),('Forbruksvarer',10.1),('Helse',9.1),('Kommunikasjon',8.5),('Forbruksdef.',5.0),('Basismat.',4.3),('Energi',3.8),('Andre',5.1)]

    portfolio_date = '31.01.2026'

    def mini_table(title, items):
        rows = [
            [Paragraph(title, S('et', fontName='Helvetica-Bold', fontSize=10, textColor=DARK_GRAY, leading=13))],
            [Paragraph(f'Portfolio Date: {portfolio_date}', S('ep', fontName='Helvetica', fontSize=7, textColor=GRAY_DARK, leading=10))],
            [Spacer(1, 1*mm)],
        ]
        header = Table([[
            Paragraph('', S('eh0', fontName='Helvetica', fontSize=8, textColor=DARK_GRAY, leading=11)),
            Paragraph('%', S('ehv', fontName='Helvetica-Bold', fontSize=8, textColor=DARK_GRAY, leading=11, alignment=TA_RIGHT)),
        ]], colWidths=[48*mm, 14*mm])
        rows.append([header])

        for lbl, v in items[:10]:
            if v < 0.05: continue
            row_tbl = Table([[
                Paragraph(f'• {lbl}', S('er', fontName='Helvetica', fontSize=8, textColor=DARK_GRAY, leading=11)),
                Paragraph(f'{v:.1f}', S('ev', fontName='Helvetica', fontSize=8, textColor=DARK_GRAY, leading=11, alignment=TA_RIGHT)),
            ]], colWidths=[48*mm, 14*mm])
            rows.append([row_tbl])

        rows.append([Table([[
            Paragraph('<b>Total</b>', S('etot', fontName='Helvetica-Bold', fontSize=8, textColor=DARK_GRAY, leading=11)),
            Paragraph('<b>100,0</b>', S('etotv', fontName='Helvetica-Bold', fontSize=8, textColor=DARK_GRAY, leading=11, alignment=TA_RIGHT)),
        ]], colWidths=[48*mm, 14*mm])])

        t = Table(rows, colWidths=[62*mm])
        t.setStyle(TableStyle([('TOPPADDING', (0,0), (-1,-1), 1.5), ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
                                ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
        return t

    # Rad 1: Regioner eksempelportefølje | Sektorer eksempelportefølje | Regioner Verdensindeksen
    r1 = Table([[
        mini_table('Regioner - Eksempelportefølje', reg),
        mini_table('Sektorer - Eksempelportefølje', sek),
        mini_table('Regioner - Verdensindeksen', acwi_reg),
    ]], colWidths=[CONTENT_W/3]*3)
    r1.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 3*mm),
        ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(r1)
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=0.3, color=GRAY_MED, spaceAfter=3*mm))

    # Rad 2: Sektorer Verdensindeksen | tom | tom
    r2 = Table([[
        mini_table('Sektorer - Verdensindeksen', acwi_sek),
        Spacer(CONTENT_W/3, 1), Spacer(CONTENT_W/3, 1),
    ]], colWidths=[CONTENT_W/3]*3)
    r2.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 3*mm),
        ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(r2)
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('Source: Morningstar Direct',
        S('src2', fontName='Helvetica', fontSize=7.5, textColor=GRAY_DARK, leading=10)))
    story.append(PageBreak())


# ── Avkastning ──────────────────────────────────────────────────────────────

def build_avkastning(story, data):
    produkt_ids = data.get('produkterIBruk', [])
    relevante = [PROD_MAP.get(pid, pid) for pid in produkt_ids if PROD_MAP.get(pid) in AVKASTNING]
    if not relevante: return

    story.append(Paragraph('Avkastning',
        S('h1av', fontName='Helvetica-Bold', fontSize=22, textColor=NAVY, leading=28)))
    story.append(HRFlowable(width='100%', thickness=1.5, color=NAVY, spaceAfter=3*mm))

    # Finn felles oppstartsår
    all_yrs = set()
    for p in relevante:
        all_yrs.update(AVKASTNING[p].keys())
    min_yr = min(all_yrs); max_yr = max(all_yrs)
    years = list(range(min_yr, max_yr + 1))

    story.append(Paragraph(f'Time Period: Since Common Inception ({min_yr}.01.{min_yr} to 31.01.2026)',
        S('gts', fontName='Helvetica', fontSize=8, textColor=GRAY_DARK, leading=12)))
    story.append(Spacer(1, 2*mm))

    # Bygg kumulative avkastningsserier (halvårlig granularitet = per år OK)
    def cum_series(avk_dict, yrs):
        result = []; cum = 0
        for yr in yrs:
            v = avk_dict.get(yr)
            if v is not None:
                cum = (1 + cum/100) * (1 + v/100) * 100 - 100
            result.append((yr, cum))
        return result

    portfolio_avk = {}
    for yr in years:
        vals = [AVKASTNING[p][yr] for p in relevante if yr in AVKASTNING[p]]
        if vals: portfolio_avk[yr] = sum(vals) / len(vals)

    msci_avk = {2015:1.8,2016:7.9,2017:24.0,2018:-9.4,2019:26.6,2020:16.3,2021:18.5,2022:-18.4,2023:22.2,2024:18.7,2025:7.0}
    ob_avk   = {2015:5.9,2016:12.1,2017:19.4,2018:-1.7,2019:16.5,2020:4.6,2021:24.2,2022:7.5,2023:10.1,2024:4.3,2025:17.0}

    p_cum  = cum_series(portfolio_avk, years)
    m_cum  = cum_series({y:v for y,v in msci_avk.items() if y in years}, years)
    ob_cum = cum_series({y:v for y,v in ob_avk.items() if y in years}, years)

    chart = LineChart([
        {'name': 'Fondsportefølje, Feb26', 'data': p_cum, 'color': NAVY, 'lw': 2.0},
        {'name': '── MSCI ACWI All Cap NR USD', 'data': m_cum, 'color': STEEL, 'dash': [5,2], 'lw': 1.2},
        {'name': '✕ Oslo Børs Benchmark TR NOK', 'data': ob_cum, 'color': colors.HexColor('#E53E3E'), 'dash': [2,3], 'lw': 1.0},
    ], w=CONTENT_W, h=78*mm)
    story.append(chart)
    story.append(Spacer(1, 2*mm))

    # Sluttverdier rad
    pf = p_cum[-1][1]; mf = m_cum[-1][1]; of = ob_cum[-1][1]
    story.append(Table([[
        Paragraph('Fondsportefølje, Feb26', S('fsl', fontName='Helvetica', fontSize=8, textColor=DARK_GRAY, leading=12)),
        Paragraph(f'<b>{pf:+.1f}%</b>', S('fsv', fontName='Helvetica-Bold', fontSize=9, textColor=NAVY, leading=12)),
        Paragraph('▪▪ MSCI ACWI All Cap NR USD', S('fml', fontName='Helvetica', fontSize=8, textColor=STEEL, leading=12)),
        Paragraph(f'<b>{mf:+.1f}%</b>', S('fmv', fontName='Helvetica-Bold', fontSize=9, textColor=STEEL, leading=12)),
        Paragraph('✕ Oslo Børs Benchmark TR NOK', S('fol', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#E53E3E'), leading=12)),
        Paragraph(f'<b>{of:+.1f}%</b>', S('fov', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#E53E3E'), leading=12)),
    ]], colWidths=[48*mm, 20*mm, 56*mm, 20*mm, 55*mm, 20*mm]))

    story.append(Spacer(1, 3*mm))

    # Info box
    info_lines = [
        'De ulike avkastningene er oppgitt på ulike tidspunkter og beregningene for oppstart er ordnet som følger:',
    ]
    for pn in relevante:
        avk = AVKASTNING[pn]
        aar = sorted(avk.keys())
        if aar:
            cum = 0
            for yr in aar:
                cum = (1 + cum/100) * (1 + avk[yr]/100) * 100 - 100
            info_lines.append(f'{pn}: Avkastning siden {aar[0]} til 2025 er estimert til {cum:+.1f}%.')

    info_tbl = Table([[Paragraph('<b>Viktig informasjon om avkastningsestimater:</b><br/>' + '<br/>'.join(info_lines),
        S('ib', fontName='Helvetica', fontSize=7.5, textColor=GRAY_DARK, leading=11))]],
        colWidths=[CONTENT_W])
    info_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_BG),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(info_tbl)
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=0.4, color=GRAY_MED, spaceAfter=3*mm))

    # ── Årsavkastning heatmap
    avk_years = list(range(2016, 2026))
    hdr = [Paragraph('', S('avkh0', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE, leading=12))]
    hdr += [Paragraph(str(y), S(f'ayh{y}', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE, leading=12, alignment=TA_CENTER)) for y in avk_years]
    avk_rows = [hdr]
    for pn in relevante:
        avk = AVKASTNING.get(pn, {})
        row = [Paragraph(pn.replace('Pensum ', ''), S('apn', fontName='Helvetica', fontSize=8, textColor=DARK_GRAY, leading=12))]
        for yr in avk_years:
            v = avk.get(yr)
            bg, tc = heatmap_cell(v)
            txt = f'{v:+.1f}%' if v is not None else '—'
            row.append(Paragraph(txt, S(f'ac{yr}', fontName='Helvetica-Bold', fontSize=7.5, textColor=tc, leading=11, alignment=TA_CENTER)))
        avk_rows.append(row)

    col_w = [52*mm] + [(CONTENT_W - 52*mm) / len(avk_years)] * len(avk_years)
    avk_tbl = Table(avk_rows, colWidths=col_w)
    ts = [
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (0,-1), 4), ('RIGHTPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (1,0), (-1,-1), 1),
        ('ROWBACKGROUNDS', (0,1), (0,-1), [WHITE, colors.HexColor('#F9FAFB')]),
        ('GRID', (0,0), (-1,-1), 0.2, BORDER),
    ]
    for ri, row in enumerate(avk_rows[1:], 1):
        for ci, cell in enumerate(row[1:], 1):
            try:
                v = float(cell.text.replace('+','').replace('%',''))
                bg, _ = heatmap_cell(v)
                ts.append(('BACKGROUND', (ci, ri), (ci, ri), bg))
            except: pass
    avk_tbl.setStyle(TableStyle(ts))
    story.append(avk_tbl)
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph('Historisk avkastning er ingen garanti for fremtidig avkastning. Avkastning i NOK der annet ikke er angitt. Source: Morningstar Direct',
        S('avkd', fontName='Helvetica', fontSize=7.5, textColor=GRAY_DARK, leading=11)))
    story.append(PageBreak())


# ── Disclaimer ────────────────────────────────────────────────────────────────

def build_disclaimer(story, data):
    story.append(Paragraph('Disclaimer',
        S('h1d', fontName='Helvetica-Bold', fontSize=16, textColor=DARK_GRAY, leading=22)))
    story.append(Spacer(1, 3*mm))

    disc_s = S('disc2', fontName='Helvetica', fontSize=9, textColor=GRAY_TEXT, leading=14, alignment=TA_JUSTIFY)
    tekster = [
        'Historisk avkastning er ingen garanti for fremtidig avkastning. Fremtidig avkastning vil blant annet avhenge av markedsutviklingen, forvalternes dyktighet, fondenes risiko samt kostnader ved forvaltning. Avkastningen kan bli negativ som følge av kurstap. Pensum Asset Management anser at informasjonen i denne presentasjonen kommer fra kilder som er pålitelige, men kan likevel ikke garantere at informasjonen til enhver tid er fullstendig, korrekt eller tilgjengelig. Pensum Asset Management fraskriver seg således ethvert ansvar for feil og mangler.',
        'Informasjonen i denne presentasjonen er ikke ment som en kjøps- eller salgsanbefaling, og Pensum Asset Management fraskriver seg dermed ethvert ansvar for eventuelle tap fra handler utført som følge av denne presentasjonen.',
        f'Utarbeidet av Pensum Asset Management AS for {data.get("kundeNavn","investor")}. Dato: {datetime.now().strftime("%d.%m.%Y")}. Source: Morningstar Direct',
    ]
    for t in tekster:
        story.append(Paragraph(t, disc_s))
        story.append(Spacer(1, 4*mm))


# ── Hoved ─────────────────────────────────────────────────────────────────────

def build_pdf(data):
    buf = io.BytesIO()
    kunde = data.get('kundeNavn', 'Investor')
    dato = datetime.now().strftime('%d.%m.%Y')

    doc = SimpleDocTemplate(buf, pagesize=A4,
        leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T + 8*mm, bottomMargin=MARGIN_B + 8*mm,
        title=f'Investeringsforslag – {kunde}',
        author='Pensum Asset Management AS')

    pt = PT(kunde)
    story = []

    story.append(Forside(data, dato))
    story.append(PageBreak())
    build_om_pensum(story)
    build_maal(story, data)
    build_allokering(story, data)
    build_eksponering(story, data)
    build_avkastning(story, data)
    build_disclaimer(story, data)

    doc.build(story, onFirstPage=pt, onLaterPages=pt)
    return buf.getvalue()


def main():
    data = json.loads(sys.stdin.read())
    sys.stdout.buffer.write(build_pdf(data))

if __name__ == '__main__':
    main()
