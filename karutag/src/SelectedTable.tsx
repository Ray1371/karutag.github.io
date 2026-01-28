import type { Card } from "./Upload";
import { useState } from "react";
// import Dexie from "dexie";
import {db} from './Upload';

type SelectedTableProps = {
  cards: Card[];
  selected: Set<string>;
  onToggleOne: (code: string) => void;
};

// const TagMessage = (props: {message: string, tag: string}) => {
const TagMessage = (props: { message: string; tag: string; codes: string[]; onDiscard: () => void }) => {
  const[clicked, setClicked] = useState(false);
  const[applied, setApplied] = useState(false);
  //todo?: Maybe let the most recent TM be green. How to do that?
  const handleClick = () => {
    setClicked(true);
    //delay for 5 seconds then reset clicked to false
    setTimeout(() => {
      setClicked(false);
    }, 5000);
  }
  //idk if need async yet,cpt suggested 
  const applyChange = async() => {
    //split message into array of codes
    const codes = props.message.split(' ');
    //exclude first 2 elements (kt and tag)
    // const cardCodes = codes.slice(2);
    //update each card in indexedDB to have the new tag
    // const toUpdate = db;


console.log("Matched rows:");
    await db.transaction('rw', db.collection, async() => {
      await db.collection
        .where('code')
        .anyOf(codes)
        .modify({ tag: props.tag });
    });
    //todo: Verify that changes applied, ensure UI picks this up too.
    
  }

  return (
    <div className="tagMessageDiv">
      <button onClick={() => {
        navigator.clipboard.writeText(`kt ${props.tag} ${props.message}`);
        handleClick();
      }}>
        <div>
          <p>kt {props.tag} {props.message}</p>
          {clicked === true ?
            <p>Copied!</p>
            :
            <p>Click to copy above message</p>
          }
        </div>
      </button>
      <div>
        {/* todo: Implement apply change event */}
        <button 
        onClick={() => {
          applyChange();
          setApplied(true);
          setTimeout(() => {
            setApplied(false);
          }, 5000);
        }}
        disabled={applied}
        >Apply Change</button>
        {/* todo: Implement discard change event = just close this box. */}
        <button onClick={props.onDiscard}>Discard Change / Close This Box</button>
      </div>
    </div>
  );
}
//Component that is generated.

export default function SelectedTable({
  cards,
  selected,
  onToggleOne,
}: SelectedTableProps) {
  if (cards.length === 0) {
    return <div>No cards selected.</div>;
  }
  //state to hold tag message components. Would like these to persist across user sessions until cleared or user re-uploads collection.
type TagPrompt = { id: string; tag: string; codes: string[]; message: string };
  const [tagMessages, setTagMessages] = useState<TagPrompt[]>([]);

  // const [tagMessages, setTagMessages] = useState<typeof TagMessage[]>([]);//need to fix
  const [tagName, setTagName] = useState('');
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setTagName(event.target.value);
};
  const generatePrompts = () => {
    //get all card codes from selected set
    let selectedCards: string[] = [];
    selected.forEach((code) => {
      selectedCards.push(code);
    });
    //split into chunks of 50
    const prompts:TagPrompt[] = [];
    let chunk: string[] = [];
    
    while (selectedCards.length > 0) {//while or do while?
      chunk.push(selectedCards.shift()!);
      //if maxed out chunk, force push the tag message component,
      //flush chunk, keep going if applicable
      if(chunk.length === 50) {
        prompts.push({
          id: crypto.randomUUID(),
          tag: tagName,
          codes: [...chunk],               // ✅ the real source of truth
          message: chunk.join(" "),        // whatever you want to display/copy
        });
  
        chunk = [];   
      }
    };
    //handle leftover chunk
      if (chunk.length > 0) {
        prompts.push({
          id: crypto.randomUUID(),
          tag: tagName,
          codes: [...chunk],               // ✅ the real source of truth
          message: chunk.join(" "),        // whatever you want to display/copy
        });

    }
    setTagMessages(prev => [...prev, ...prompts]);
  };


  return (
    <div>
    <table>
      <thead>
        <tr>
          <th scope="col">Selected</th>
          <th>Code</th>
          <th>Wishlists</th>
          <th>Character</th>
          <th>Series</th>
          <th>Edition</th>
          <th>Print</th>
          <th>Tag</th>
          <th>
            <p>Tag Selected As:</p>
            <input type="text" placeholder="Enter tag name" 
            value={tagName} onChange={handleChange}
            />
            <button onClick={generatePrompts}>Tag Selected</button>
          </th>
          
        </tr>
      </thead>

      <tbody>
        {cards.map((card) => (
          <tr key={card.code}>
            <td>
              <input
                type="checkbox"
                aria-label={`Deselect ${card.character}`}
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
        ))}
      </tbody>
    </table>
    {tagMessages.length > 0 && (
      <div>
        {tagMessages.map((p) => (
          <TagMessage
            key={p.id}
            message={p.message}
            tag={p.tag}
            codes={p.codes}
            onDiscard={() =>
              setTagMessages((prev) => prev.filter((x) => x.id !== p.id))
            }
          />
        ))}
      </div>
    )}
    </div>
    
  );
}