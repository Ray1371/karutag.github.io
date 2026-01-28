// import { useEffect, useState } from 'react';
// import { db } from './db'; // Make sure this import is correct and that db.ts is in place

// export default function MainMenu() {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     // Inline the logic to get the collection count
//     db.cards.count().then(setCount);
//   }, []);

//   return (
//     <div>
//       <h2>Collection</h2>
//       <p>Total cards: {count}</p>
//     </div>
//   );
// }

// MainMenu.tsx
// Primary UI + orchestration component
// Handles uploads, search input, and displaying cards

//todo: Check out the following chat log topic names:
/*
From the chat log titles I can see on my side, the most relevant threads were:

“Bulk vs piecemeal adding” (2025-12-17) — this is where we were explicitly talking about upload approach/structure (bulk vs incremental).

“React Project Progress” (2025-12-30) — this is where we were working on the table/UI + Dexie collection updates, which ties directly into upload + refresh behavior.

“Downloadable Files and Codebases” (2026-01-15) — this is more about the dev-server/react version issue, but it’s part of the same “project restoration” arc.

*/
import CollectionTable from "./CollectionTable";
import SelectedTable from "./SelectedTable";

import './App.css';
import { useEffect, useState } from 'react';
// import Papa from 'papaparse';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from './Upload';
import type { Card } from './Upload';
import type { progressSignal } from './progressSignals';

import { searchCards,
         TEXT_KEYS,
         NUMERIC_KEYS,
 } from './regexStuff';

// -----------------------------

export default function MainMenu() {


  // Upload-related state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [cardsUpdated, setCardsUpdated] = useState(0);

  // Search-related state
  const [searchFilter, setSearchFilter] = useState('');
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  


  //Select-related state
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Full collection (live)
  const fullCollection = useLiveQuery(
    () => db.collection.toArray(),
    [],
    []
  );

  const selectedCards =
  (fullCollection ?? []).filter((c) => selected.has(c.code));

  // Progress signals passed into upload logic
  const signals: progressSignal = {
    updateRowCount: (count) => setRowCount(count),
    updateCompletedRows: (count) => setCardsUpdated(count),
    updateValid: (valid: boolean) => {
  if (valid) setIsUploading(false);
},
  };

  // -----------------------------
  // Filtering logic (older style)
  // -----------------------------
  useEffect(() => {
    if (!fullCollection) return;

    // Empty search = show everything
    if (!searchFilter.trim()) {
      setFilteredCards(fullCollection);
      return;
    }

    const parsed = searchCards(searchFilter);
    console.log(parsed);

    //Filters still not working as intended
    const query = db.collection.filter(card => {

      for (const clause of parsed.clauses) {
        const field = clause.field as keyof Card;

        if(TEXT_KEYS.has(clause.field)) {

          if (field === 'character') {
            const hay = (card.character ?? '').toLowerCase();
            const needle = clause.value.toString().toLowerCase();
            if (!hay.includes(needle)) return false;
          }
          else if (field === 'series') {
            const hay = (card.series ?? '').toLowerCase();
            const needle = clause.value.toString().toLowerCase();
            if (!hay.includes(needle)) return false;
          }

          else if(field === 'tag'){
            //if field is tag, then check if tag exactly matches (lowercase)
            //todo:handle tag is none / tag:none case
            //idk about const tag below atm
            const tag = card.tag ?? '';
            if(clause.value.toString().toLowerCase() === 'none') {
              if(tag !== '' || tag.toString().toLowerCase() !== 'none') 
                return false;
            }
            //normal tag check
            else{
              if(tag.toLowerCase() !== clause.value.toString().toLowerCase())
                return false;
            }
          }
        }
        else if (NUMERIC_KEYS.has(clause.field)) {
            const cardVal = card[field];
            if (typeof cardVal !== 'number') return false;

            switch (clause.operator) {
              case '<':
                if (!(cardVal < clause.value)) return false;
                break;
              case '<=':
                if (!(cardVal <= clause.value)) return false;
                break;
              case '=':
                if (!(cardVal === clause.value)) return false;
                break;
              case '>':
                if (!(cardVal > clause.value)) return false;
                break;
              case '>=':
                if (!(cardVal >= clause.value)) return false;
                break;
            }
        }
        //Clause field was invalid
        else {
          return false;
        }
      }
      //idk
      return true;
    });
      
    query.toArray().then(setFilteredCards);
  }, [searchFilter, fullCollection]);


  //Select all cards and toggle
      const allSelected =
      filteredCards.length > 0 &&
      filteredCards.every(c => selected.has(c.code));

    function toggleSelectAll() {
      setSelected(prev => {
        const next = new Set(prev);
        const codes = filteredCards.map(c => c.code);
        const prevAll = codes.length > 0 && codes.every(code => next.has(code));

        if (prevAll) {
          codes.forEach(code => next.delete(code));
        } else {
          codes.forEach(code => next.add(code));
        }
        return next;
      });
    }

  function toggleOne(code: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="main-menu">
      <h1>Karuta Collection</h1>

      {/* Upload */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
      />

      {/* Search */}
      <input
        type="text"
        placeholder="Search cards..."
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
      />

      {/* Table */}
      <CollectionTable
        cards={filteredCards}
        selected={selected}
        onToggleOne={toggleOne}
        allSelected={allSelected}
        onToggleSelectAll={toggleSelectAll}
      />


{/* todo: left align the collection div */}
      <div>
        Total Cards in Collection: {fullCollection?.length ?? 0}
      </div>

{/* Table for Selected Cards */}
    <h2>Selected Cards ({selectedCards.length})</h2>
    <SelectedTable
      cards={selectedCards}
      selected={selected}
      onToggleOne={toggleOne}
    />

      {/* Upload progress */}
      {isUploading && (
        <div>
          Uploaded {cardsUpdated} / {rowCount}
        </div>
      )}
    </div>
  );
}
