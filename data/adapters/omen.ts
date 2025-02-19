import { FeeData } from '../types';
import { getBlockDaysAgo } from '../lib/time';

export async function getOmenData(): Promise<FeeData> {
  const request = await fetch('https://api.thegraph.com/subgraphs/name/gnosis/omen', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `query volumeOverTime($today: Int!, $yesterday: Int!, $weekAgo: Int!){
        today: fixedProductMarketMakers(block: {number: $today}, first: 1000) {
          id
          fee
          usdVolume
        }
        yesterday: fixedProductMarketMakers(block: {number: $yesterday}, first: 1000) {
          id
          fee
          usdVolume
        }
        weekAgo: fixedProductMarketMakers(block: {number: $weekAgo}, first: 1000) {
          id
          fee
          usdVolume
        }
      }`,
      variables: {
        today: getBlockDaysAgo(0),
        yesterday: getBlockDaysAgo(1),
        weekAgo: getBlockDaysAgo(7),
      },
      operationName: 'volumeOverTime',
    }),
    method: 'POST',
  });

  const { data } = await request.json();

  const markets: {
    [id: string]: {
      today?: number;
      yesterday?: number;
      weekAgo?: number;
      fee?: number;
    };
  } = {};
  for (const market of data.today) {
    markets[market.id] = {
      today: parseFloat(market.usdVolume),
      fee: parseInt(market.fee) / 1000000000000000000,
    };
  }
  for (const market of data.yesterday) {
    markets[market.id] = {
      ...markets[market.id],
      yesterday: parseFloat(market.usdVolume),
    };
  }
  for (const market of data.weekAgo) {
    markets[market.id] = {
      ...markets[market.id],
      weekAgo: parseFloat(market.usdVolume),
    };
  }

  let oneDay = 0;
  let sevenDayMA = 0;

  for (const id in markets) {
    if (markets[id].yesterday) {
      oneDay += (markets[id].today - markets[id].yesterday) * markets[id].fee;
    }
    if (markets[id].weekAgo) {
      sevenDayMA += (markets[id].today - markets[id].weekAgo) * markets[id].fee;
    }
  }
  sevenDayMA /= 7;

  return {
    id: 'omen',
    name: 'Omen',
    category: 'dex',
    sevenDayMA,
    oneDay,
    description: 'Omen is a prediction market.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'omen',
  };
}
