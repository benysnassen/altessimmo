'use client';

import React, { useEffect, useState, useRef } from 'react';

type Item = {
  id: string;
  label: string;
  value: number | null;
  prev: number | null;
  display: string; // formatted string to show
};

export default function MarketTicker() {
  const [items, setItems] = useState<Item[]>([
    { id: 'eur', label: 'EUR → MAD', value: null, prev: null, display: '—' },
    { id: 'usd', label: 'USD → MAD', value: null, prev: null, display: '—' },
    { id: 'gbp', label: 'GBP → MAD', value: null, prev: null, display: '—' },
    { id: 'gold', label: 'OR (g) → MAD', value: null, prev: null, display: '—' },
    { id: 'btc', label: 'BTC → MAD', value: null, prev: null, display: '—' },
    // KPI immobilier au centre — valeur initiale indicative, remplacable dynamiquement
    { id: 'sqm', label: "Prix m² Tétouan", value: 15000, prev: 14900, display: '15 000 MAD' }
  ]);

  const [updatedAt, setUpdatedAt] = useState<string>('--:--');
  const mounted = useRef(false);

  const numberFmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n);

  async function fetchExchangeAndAssets() {
    try {
      // 1) Currencies via exchangerate.host (gratuit)
      const resp = await fetch('https://api.exchangerate.host/latest?base=EUR&symbols=MAD,USD,GBP');
      const json = await resp.json();

      // rates relative to EUR
      const eurToMad = json?.rates?.MAD ? Number(json.rates.MAD) : null;
      const usdPerEur = json?.rates?.USD ? Number(json.rates.USD) : null;
      const gbpPerEur = json?.rates?.GBP ? Number(json.rates.GBP) : null;

      // compute USD->MAD and GBP->MAD if possible
      const usdToMad = eurToMad !== null && usdPerEur ? eurToMad / usdPerEur : null;
      const gbpToMad = eurToMad !== null && gbpPerEur ? eurToMad / gbpPerEur : null;

      // 2) BTC via CoinGecko (free, no key)
      let btcToMad: number | null = null;
      try {
        const btcResp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=mad');
        const btcJson = await btcResp.json();
        btcToMad = btcJson?.bitcoin?.mad ? Number(btcJson.bitcoin.mad) : null;
      } catch (e) {
        btcToMad = null;
      }

      // 3) Gold — tenter via exchangerate.host using XAU base (peut échouer); fallback null
      let goldPerGramMad: number | null = null;
      try {
        // exchangerate.host sometimes exposes XAU; this attempts to get XAU→MAD (XAU = troy ounce)
        const goldResp = await fetch('https://api.exchangerate.host/latest?base=XAU&symbols=MAD,USD');
        const goldJson = await goldResp.json();
        // If XAU→MAD is provided, convert troy ounce → gram (1 troy ounce = 31.1034768 grams)
        const xauToMad = goldJson?.rates?.MAD ? Number(goldJson.rates.MAD) : null;
        if (xauToMad) {
          goldPerGramMad = xauToMad / 31.1034768;
        } else {
          goldPerGramMad = null;
        }
      } catch {
        goldPerGramMad = null;
      }

      // Build new items array by mapping previous values to compute up/down
      setItems(prev => {
        // Create a map of previous values for ease
        const prevMap = new Map(prev.map(p => [p.id, p]));

        const next: Item[] = [
          {
            id: 'eur',
            label: 'EUR → MAD',
            value: eurToMad,
            prev: prevMap.get('eur')?.value ?? null,
            display: eurToMad !== null ? `${numberFmt(eurToMad)} MAD` : '—'
          },
          {
            id: 'usd',
            label: 'USD → MAD',
            value: usdToMad,
            prev: prevMap.get('usd')?.value ?? null,
            display: usdToMad !== null ? `${numberFmt(usdToMad)} MAD` : '—'
          },
          {
            id: 'gbp',
            label: 'GBP → MAD',
            value: gbpToMad,
            prev: prevMap.get('gbp')?.value ?? null,
            display: gbpToMad !== null ? `${numberFmt(gbpToMad)} MAD` : '—'
          },
          {
            id: 'gold',
            label: 'OR (g) → MAD',
            value: goldPerGramMad,
            prev: prevMap.get('gold')?.value ?? null,
            display: goldPerGramMad !== null ? `${numberFmt(goldPerGramMad)} MAD/g` : '—'
          },
          {
            id: 'btc',
            label: 'BTC → MAD',
            value: btcToMad,
            prev: prevMap.get('btc')?.value ?? null,
            display: btcToMad !== null ? `${numberFmt(btcToMad)} MAD` : '—'
          },
          // KPI immobilier preserved from prev state (user can update dynamically)
          {
            id: 'sqm',
            label: 'Prix m² Tétouan',
            value: prevMap.get('sqm')?.value ?? 15000,
            prev: prevMap.get('sqm')?.prev ?? (prevMap.get('sqm')?.value ?? null),
            display:
              prevMap.get('sqm')?.value !== undefined
                ? `${numberFmt(prevMap.get('sqm')!.value!)} MAD/m²`
                : '—'
          }
        ];

        return next;
      });

      setUpdatedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('MarketTicker fetch error', err);
    }
  }

  // initial mount + periodic refresh
  useEffect(() => {
    mounted.current = true;
    fetchExchangeAndAssets();
    const interval = setInterval(fetchExchangeAndAssets, 5 * 60 * 1000); // 5 minutes
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, []);

  // Render duplicated content for continuous marquee
  // Arrow SVG component
  const Arrow = ({ up }: { up: boolean }) => (
    <svg
      className={`arrow ${up ? 'arrow-up' : 'arrow-down'}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
      focusable={false}
    >
      <path
        fill="currentColor"
        d={
          up
            ? 'M12 2l7 7h-4v7h-6V9H5z' // up
            : 'M12 22l-7-7h4V8h6v7h4z' // down
        }
      />
    </svg>
  );

  // Duplicate items content string to display center KPI more pronounced:
  // We'll render items twice for marquee continuity and add a special center item slot in the first pass.
  return (
    <div className="mt-1 w-full">
      <div className="market-ticker" role="region" aria-label="Cours des devises et KPI immobilier">
        <div className="ticker-gloss" />
        <div className="ticker-marquee" aria-hidden="false">
          {/* first track (original) */}
          <div className="ticker-track">
            {items.map((it, idx) => {
              const up = it.prev !== null && it.value !== null && it.value > it.prev;
              const down = it.prev !== null && it.value !== null && it.value < it.prev;

              // center KPI styling for sqm
              const isKpi = it.id === 'sqm';

              return (
                <div className={`ticker-item ${isKpi ? 'ticker-item-kpi' : ''}`} key={it.id + '-orig'}>
                  <div className="label">{it.label}</div>

                  <div className="value-row">
                    <div className={`value ${up ? 'value-up' : down ? 'value-down' : ''}`}>
                      {it.display}
                    </div>
                    {it.value !== null && it.prev !== null && it.value !== it.prev && (
                      <div className="arrow-wrap">
                        <Arrow up={up} />
                      </div>
                    )}
                  </div>

                  <div className="sep" />
                </div>
              );
            })}

            {/* timestamp at end of track */}
            <div className="ticker-item ticker-item-time" key="timestamp">
              <div className="label">Mis à jour</div>
              <div className="value">{updatedAt}</div>
            </div>
          </div>

          {/* second track (duplicate) */}
          <div className="ticker-track" aria-hidden="true">
            {items.map((it) => (
              <div className={`ticker-item ${it.id === 'sqm' ? 'ticker-item-kpi' : ''}`} key={it.id + '-dup'}>
                <div className="label">{it.label}</div>

                <div className="value-row">
                  <div className={`value`}>
                    {it.display}
                  </div>
                  {/* no arrows in duplicate to avoid double visuals; keep consistent by not computing prev */}
                </div>

                <div className="sep" />
              </div>
            ))}

            <div className="ticker-item ticker-item-time" key="timestamp-dup">
              <div className="label">Mis à jour</div>
              <div className="value">{updatedAt}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
