// //temp
// import { db } from './db';
// import type { Card } from './db';
// import { uploadProgress } from './processSignals';

// /**
//  * Handles uploading an array of cards to the Dexie database.
//  * It updates the upload progress signal so that the UI can show progress feedback.
//  */
// export async function handleUpload(cards: Card[]) {
//   const total = cards.length;
//   let uploaded = 0;

//   for (const card of cards) {
//     await db.cards.put(card);
//     uploaded++;
//     // Update progress as a percentage
//     uploadProgress.set(Math.round((uploaded / total) * 100));
//   }
// }

// Upload.ts
import './App.css';
import Papa from 'papaparse';
import Dexie, { type EntityTable } from 'dexie';

import type { progressSignal } from './progressSignals';

// --------------------
// Types
// --------------------

interface Card {
  code: string;              // primary key / ID
  character: string;
  series: string;
  number: number;            // print
  edition: number;
  dropper?: number;
  grabber: number;
  obtainedTimestamp: number; // timestamp (convert later if needed)
  wishlists: number;
  tag?: string;
  burnvalue?: number;

  // tokens for partial match searching
  charaTokens: string[];
  seriesTokens: string[];
}

// --------------------
// Dexie DB
// --------------------

const db = new Dexie('Collection') as Dexie & {
  collection: EntityTable<Card, 'code'>;
  toUpload: EntityTable<Card, 'code'>;
};

// NOTE: you mentioned needing to bump version when adding tokens.
// This reflects the version as you pasted it (v1).
db.version(1).stores({
  collection: '&code, number, edition, series, grabber, obtainedTimestamp, charaTokens*, seriesTokens*',
  toUpload: '&code, number, edition, series, grabber, obtainedTimestamp, charaTokens*, seriesTokens*',
});

// --------------------
// Token helpers
// --------------------

// remove accents from series names (Just for tokens; names should remain normal after)
function normalizeAccents(text: string) {
  return text
    .normalize('NFD') // decompose accented characters
    .replace(/[\u0300-\u036f]/g, ''); // remove accents
}

// token builder (prefix tokens for partial matching)
// function makeTokens(text: string): string[] {
//   const normalized = normalizeAccents((text ?? '').toLowerCase());

//   // Replace some special chars with spaces
//   const tokens = normalized
//     .replace(/[-/@_]/g, ' ')
//     .split(/\s+/)
//     .filter(Boolean);

//   // prefix tokens: fate -> f, fa, fat, fate
//   const prefixes = tokens.flatMap(t =>
//     t.split('').map((_, i) => t.slice(0, i + 1))
//   );

//   return Array.from(new Set([...tokens, ...prefixes]));
// }
function makeTokens(text: unknown): string[] {
  const s = String(text ?? "").toLowerCase();
  return s
    .split(/[^a-z0-9@]+/g)   // keep @ if you want
    .filter(Boolean);
}

// --------------------
// Upload handler
// --------------------

export const handleUpload = async (
  file: File | null,
  signals?: progressSignal
): Promise<boolean> => {
  if (!file) return false;
  if (!file.name.endsWith('.csv')) return false;

  const rowCount = await countRows(file);
  signals?.updateRowCount?.(rowCount);

  const buffer: Card[] = [];
  const BATCH_SIZE = 500;

  let writePromise = Promise.resolve();

  Papa.parse<Card>(file, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    worker: false,//do we?

    step: (row) => {
      // IMPORTANT: token generation needs to happen before bulkPut
      const card = row.data;

      buffer.push({
        ...card,
        charaTokens: makeTokens(card.character),
        seriesTokens: makeTokens(card.series),
      });

      if (buffer.length >= BATCH_SIZE) {
        const batch = buffer.splice(0);
        writePromise = writePromise.then(async () => {
          await db.toUpload.bulkPut(batch);
        });
        buffer.length = 0;
      }
    },

    complete: async () => {
      await writePromise;

      // if more buffer cards exist, push them
      if (buffer.length) {
        await db.toUpload.bulkPut(buffer);
      }

      // atomic commit from backup to collection
      await db.transaction('rw', db.collection, db.toUpload, async () => {
        await db.collection.clear();
        const staged = await db.toUpload.toArray();
        await db.collection.bulkPut(staged);
        await db.toUpload.clear();
      });

      signals?.updateValid?.(true);

      const count = await db.collection.count();
      console.log('Cards in DB:', count);
    },

    error: (err) => {
      console.error(err);
    }
  });

  return true;
};

// --------------------
// Utility: count rows
// --------------------

async function countRows(file: File | null): Promise<number> {
  if (!file) return 0;

  return new Promise((resolve, reject) => {
    let rowCount = 0;

    Papa.parse(file, {
      skipEmptyLines: true,
      step: () => rowCount++,
      complete: () => resolve(rowCount),
      error: reject
    });
  });
}

export type { Card };
export { db };
export default handleUpload;

