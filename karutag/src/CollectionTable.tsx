import { useState,useEffect } from "react";
import type { Card } from "./Upload";

type CollectionTableProps = {
  cards: Card[];
  selected: Set<string>;
  onToggleOne: (code: string) => void;
  allSelected: boolean;
  onToggleSelectAll: () => void;
};

export default function CollectionTable({
  cards,
  selected,
  onToggleOne,
  allSelected,
  onToggleSelectAll,
}: CollectionTableProps) {
    //pagination component state
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 20;//change when ready to implement dynamic cards per page
  // const [cardsPerPage, setCardsPerPage] = useState(20);
  const [displayedCards, setDisplayedCards] = useState<Card[]>([]);//cards to show on current page, unsure if wanted this way


  useEffect(() => {
    //take current page and cards per page to set displayed cards
    const firstCardIndex = (currentPage - 1) * cardsPerPage;
    const lastCardIndex = firstCardIndex + cardsPerPage;
    setDisplayedCards(cards.slice(firstCardIndex, lastCardIndex));
    
  },[currentPage,cards]);
  const maxPage = Math.ceil(cards.length / cardsPerPage);
  useEffect(() => {
  if (maxPage === 0) return;
  if (currentPage > maxPage) setCurrentPage(maxPage);
  if (currentPage < 1) setCurrentPage(1);
}, [maxPage, currentPage]);

  



  //todo: implement pagination logic here
  
  
  return (
  <div>
    <table>
      <thead>
        <tr>
          <th scope="col">
            <input
              type="checkbox"
              aria-label="Select all cards"
              checked={allSelected}
              onChange={onToggleSelectAll}
            />
          </th>
          <th>Code</th>
          <th>Wishlists</th>
          <th>Character</th>
          <th>Series</th>
          <th>Edition</th>
          <th>Print</th>
          <th>Tag</th>
        </tr>
      </thead>

      <tbody>
        {
          displayedCards.map((card) => (
            <tr key={card.code}>
              <td>
                <input
                  type="checkbox"
                  aria-label={`Select ${card.character}`}
                  checked={selected.has(card.code)}
                  onChange={() => onToggleOne(card.code)}
                />
              </td>
              <td>{card.code}</td>
              <td>{card.wishlists}</td>
              <td>{card.character}</td>
              <td>{card.series}</td>
              <td>{card.edition}</td>
              <td>{card.number}</td>
              <td>{card.tag}</td>
            </tr>
          ))
        }
        {/* {cards.map((card) => (
          <tr key={card.code}>
            <td>
              <input
                type="checkbox"
                aria-label={`Select ${card.character}`}
                checked={selected.has(card.code)}
                onChange={() => onToggleOne(card.code)}
              />
            </td>

            <td>{card.code}</td>
            <td>{card.wishlists}</td>
            <td>{card.character}</td>
            <td>{card.series}</td>
            <td>{card.edition}</td>
            <td>{card.number}</td>
            <td>{card.tag}</td>
          </tr>
        ))} */}
      </tbody>
    </table>

    <div>
      {/* {Array.from({ length: maxPage }, (_, i) => i + 1).map(pageNumber => (
        <PageButton
          key={pageNumber}
          pageNumber={pageNumber}
          isActive={currentPage === pageNumber}
          setCurrentPage={setCurrentPage}
        />
      ))} */}
    <PageDiv
      pageNumber={currentPage}
      setCurrentPage={setCurrentPage}
      maxPage={maxPage}
    />
    </div>

  </div>
  );
}
// todo: delete this when pagediv is done
const PageButton = ({ pageNumber, isActive, setCurrentPage }: { pageNumber: number, isActive: boolean, setCurrentPage: (page: number) => void }) => (
  <button
    onClick={() => setCurrentPage(pageNumber)}
    disabled={isActive}
  >
    {pageNumber}
  </button>
);

const PageDiv = ({
  pageNumber,
  setCurrentPage,
  maxPage}: {
    pageNumber: number,
    setCurrentPage: (page:number) => void,
     maxPage: number}) => {
  const [jumpPage, setJumpPage] = useState<number | ''>('');
  return(
  <div>
    {/* First page */}
    {maxPage <= 3 &&
      <button 
        onClick={() => setCurrentPage(1)} 
        disabled={pageNumber === maxPage || pageNumber == 1}>
        1 
      </button>
    }

    {/* If only 2 pages... */}
    {maxPage === 2 &&
      <button 
        onClick={() => setCurrentPage(1)} 
        disabled={pageNumber === 1}>
        2
      </button>
    }
    {/* If more than 2 pages... / Prev Page*/}
    {maxPage > 2 &&
      <button 
        onClick={() => setCurrentPage(Math.min(maxPage,pageNumber - 1))} 
        disabled={pageNumber === 1}>
        {pageNumber - 1}
      </button>
    }
  {/* Current Page / Page 3 */} 
    {/* {maxPage >= 3 &&
      <button 
        onClick={() => setCurrentPage(2)} 
        disabled={!(pageNumber !== 2) || pageNumber >= 3}>
        {pageNumber}
      </button>
    } */}
  {/* Page 4 / Next Page  */}
    {maxPage > 3 &&
      <button 
        onClick={() => setCurrentPage(Math.max(1,pageNumber + 1))}
        // todo: check maxPage logic is consistent
        disabled={pageNumber === maxPage || (pageNumber === 3 && maxPage === 4)}>
        {pageNumber + 1}
      </button>
    }
    {/* Last Page */}
    {maxPage > 4 &&
      <button
        onClick={() => setCurrentPage(maxPage)}
        disabled={pageNumber === maxPage}>
        {maxPage}
      </button>
    }
    {/* TextBar + Button Component to Jump Pages */}
    {maxPage > 5 &&
      <div>
        <input 
        type="number" 
        min={1} 
        max={maxPage} 
        value={jumpPage}
        onChange={(e)=>{
          const value = Number(e.target.value);
          setJumpPage(Number.isNaN(value) ? '':value);
        }}/>
        
        {/* todo: bind button/setCurrentPage state to input's value */}
        <button
          onClick={() => {
            if (typeof jumpPage === 'number' && jumpPage >= 1 && jumpPage <= maxPage) {
              setCurrentPage(jumpPage);
            }
          }}
        >
          Go
        </button>
      </div>
    }
  </div>
  );
}
  