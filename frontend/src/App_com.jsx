import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // useState für die gesamte Liste
    const [tasks, setTasks] = useState([]);
  // useState für eine einzelne Aufgabe
    const [title, setTitle] = useState('');

  // Effekt, der nur nach unmount ausgeführt wird wegen ",[]"
  // ??? die Liste wird nur neu gerendert, wenn die "App"-Komponente neu gerendert wird? Wieso?
    useEffect(() => {
    // Fetch-API dient in JavaScript um Requests zu formulieren und mit Responses umzugehen
    // fetch-Funktion erhält eine URL oder ein Objekt
    // in diesem Fall die Adresse des Backend-Servers mit dem entsprechenden Endpunkt (idF /liste_abrufen)
    // fetch-Funktion gibt ein Promise zurück
        fetch('http://localhost:3050/liste_abrufen')
      // dieses Promise wird in ein JSON-Objekt umgewandelt
            .then((res) => res.json())
      // die setTasks-Funktion wird ausgeführt
      // ??? woher hat setTasks sein Argument (die Liste)?
      // ??? wie geht die '.then()'-Methode mit dem Objekt um auf dem sie aufgerufen wurde iVm der Funktion als Parameter?
      // ??? es scheint als ob setTasks(res.json()) aufgerufen wird (?)
            .then(setTasks);
    }, []);


  // Funktion, um der Liste eine neue Aufgabe hinzuzufügen
    const itemHinzufuegen = () => {
    // Hier wird er Fall abgefangen, dass keine Aufgabe eingegeben wurde (title==false)
        if (!title) {
            return;
        }
    // mit dem Fetch-API wird ein Request an den Endpunkt "/add" auf dem Backend-Server gesendet
    // das zweite Argument ist ein Options-Argument
        fetch('http://localhost:3050/add', {
      // es handelt sich um ein POST-Request
      // ??? Was ist der Rückgabewert eines fetch-POST-Requests?
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
      // der Body enthält die Aufgabe, die in ein JSON-Objekt umgewandelt wurde
      // ??? Warum wird 'title' hier escaped, ist das "HTML"?
            body: JSON.stringify({ title }),
        })
            // wandelt die Antwort in ein JSON-Objekt um
            .then((res) => res.json())
      // führe die setTasks-Funktion mit der alten Liste + der neuen Aufgabe hinzu
      // ??? Warum wird an dieser Stelle 'setTasks' ausgeführt?
      // ??? Wo ist der Unterschied zu Zeile 24?
            .then((neueAufgabe) => setTasks([...tasks, neueAufgabe]));
    // Setze den Titel der aktuellen Aufgabe wieder auf einen leeren String
        setTitle('');
    };

  // Funktion, um eine Aufgabe von der Liste zu entfernen
    const itemLoeschen = (id_nummer) => {
    // an dieser Stelle wird die URL als String Literal (Backticks) übergeben
    // das wird gemacht, um die ID-Nummer als Variable in die URL einfügen zu können
    // ??? Was gibt der fetch-DELETE-Aufruf zurück?
    // ??? Wie funktiioniert die Übergabe mit Dollarzeichen?
    // ??? Warum wird "id_nummer" an dieser Stelle escaped?
        fetch(`http://localhost:3050/delete/${id_nummer}`, {
      // es handelt sich um einen DELETE-Request
            method: 'DELETE',
        })
      // die Rückgabe wird in ein JSON-Objekt umgewandelt
            .then((res) => res.json())
      // hier wird eine neue Liste erstellt, die diejenigen Elemente enthält, die nicht dem zu löschendem Element entsprechen
            .then((resjson) =>
                tasks.filter((singleTask) => singleTask.id != resjson.id)
            )
      // die setTasks-Funktion wird mit dieser neuen Liste aufgerufen.
            .then((filteredTasks) => setTasks(filteredTasks));
    };

  // - die Rückgabe besteht aus dem zu rendernden HTML mit JSX / React-Elementen
    return (
        <>
      {/* Überschrift */}
            <h1>To-Do List</h1> 
      {/* Eingabefeld für neue Aufgaben */}
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
      {/* Button, um Aufgabe hinzuzufügen */}
            <button disabled={!title.trim()} onClick={itemHinzufuegen}>
                Add
            </button>{' '}
      {/* Liste mit Aufgaben */}
            <ul>
        {/* die Liste wird durch JSX befüllt */}
                {
          // für jedes Element der aktuellen Liste wird die übergebene Funktion aufgerufen (map-Funktion)
          // ??? Warum werden (id, title, completed) an dieser Stelle escaped?
          // ??? es ist doch JavaScript (?)
                    tasks.map(({ id, title, completed }) => (
            // es wird ein Listen-Element erstellt
            // dieses Element erhält ein key-Attribut mit der aktuellen ID aus der Liste
                        <li key={id}>
              {/* Checkbox-Element um erledigte Aufgaben zu markieren */}
                            <input type="checkbox" />
              {/* Name der Aufgabe */}
                            {title}
              {/* Button um eine Aufgabe von der Liste zu löschen */}
              {/* der Funktion zum Löschen wird die aktuelle ID aus der Liste übergeben */}
                            <button onClick={() => itemLoeschen(id)}>X</button>
                        </li>
                    ))
                }
            </ul>
        </>
    );
}

export default App;