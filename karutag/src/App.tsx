
import { useState} from 'react';
import './App.css';
// import Upload from './Upload' // Use this when the user has not yet uploaded their Karuta collection ever.
import NotYetUploaded from './NotYetUploaded';
import MainMenu from './MainMenu'; // Use this when the user has already uploaded their Karuta collection.
import { db } from './Upload';
// import getCollectionCount from './GetCollectionCount';

// import { liveQuery, Dexie } from 'dexie'
function App() {
  // const [hasUploaded, setHasUploaded] = useState(false);//change this to reflect status from localstorage if it exists
  const [hasUploaded, setHasUploaded] = useState(
    localStorage.getItem("uploaded") === "true"
  );

  // const [cardCount, setCardCount] = useState(0); // todo: put card count somewhere visible, idk if move to MainMenu.tsx

  // on-load only
  // useEffect(() => {
  //   getCollectionCount().then(setCardCount);
  // }, []);

  // todo? UseEffect when an upload actually happens, unless
  // const []

  // delete database, reset hasUploaded
  // todo: Add a singleton tag format for like 2 purposes
  async function resetUploaded() {
    await db.collection.clear();
    localStorage.setItem("uploaded", "false");
    setHasUploaded(false);
  }

  return (
    <>
    {hasUploaded && (
  <>
    <button onClick={resetUploaded}>Reset hasUploaded</button>
    {/* TEMP: comment this out while debugging */}
    {/* <MainMenu /> */}
  </>
)}

    <div style={{ marginBottom: 12 }}>
  hasUploaded state: <b>{String(hasUploaded)}</b>
  <br />
  localStorage uploaded: <b>{localStorage.getItem("uploaded")}</b>
</div>
      {/* welcome component here. */}
      {!hasUploaded && <NotYetUploaded setHasUploaded={setHasUploaded} />}

      {/* todo: remove the resetUploaded button */}
      {hasUploaded && (
        <span>
          <button onClick={resetUploaded}>
            Reset hasUploaded
          </button>
        </span>
      )}

      {/* problem: need to handle dupe data, plus fixing the actual uploading */}
      {/* once first upload completes, have this state persist so we don't ask for upload again */}
      {/* todo: have the state persist */}

      {hasUploaded && <MainMenu />}

      {/* todo: implement main menu */}
    </>
  );
}

export default App;

