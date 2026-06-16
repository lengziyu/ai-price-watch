const fallbackCnyRates: Record<string, number> = {
  CNY: 1,
  USD: 6.77369,
  HKD: 0.863483,
  TWD: 0.214147,
  SGD: 5.26205,
  AUD: 4.74406,
  CAD: 4.84778,
  BRL: 1.31285,
  EUR: 7.82411,
  GBP: 9.06618,
  JPY: 0.0421941,
  KRW: 0.00443262,
  MXN: 0.38956,
  VND: 0.00025838,
  TRY: 0.14615,
  PHP: 0.110459,
  PKR: 0.0242612,
  NGN: 0.0049729,
  EGP: 0.130344,
  INR: 0.070811,
};

const quoteCurrencies = Object.keys(fallbackCnyRates).filter((code) => code !== "CNY");

type FrankfurterRate = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?base=CNY&quotes=${quoteCurrencies.join(",")}`,
      {
        headers: {
          accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`FX provider returned ${response.status}`);
    }

    const payload = (await response.json()) as FrankfurterRate[];
    const rates: Record<string, number> = { CNY: 1 };
    let updatedAt: string | undefined;

    for (const item of payload) {
      if (
        item.base === "CNY" &&
        typeof item.quote === "string" &&
        typeof item.rate === "number" &&
        item.rate > 0
      ) {
        rates[item.quote] = 1 / item.rate;
        updatedAt ??= item.date;
      }
    }

    return Response.json(
      {
        base: "CNY",
        fetchedAt,
        rates: { ...fallbackCnyRates, ...rates },
        source: "frankfurter",
        updatedAt,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return Response.json(
      {
        base: "CNY",
        error: "live_fx_unavailable",
        fetchedAt,
        rates: fallbackCnyRates,
        source: "snapshot",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
