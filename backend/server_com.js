// - Express ist ein NodeJS-Framework
const express = require('express');
// - Bodyparser ist eine Node-Middleware um den Body von HTTP-Nachrichten zu parsen
const bodyParser = require('body-parser');
// - Einbinden von "Cross Origin Ressource Sharing"
const cors = require('cors');
// - Einbinden des Pool-Objekts aus dem postgre-Modul, um "connection pooling" zu ermöglichen
const { Pool } = require('pg');
require('dotenv').config();

// - Express-Server einbinden
const app = express();

// - Erstellen eines Pool von Verbindungen
// - Aus diesem Pool können Verbindungen entnommen, benutzt und wieder zurück in den Pool gegeben werden.
// - Motiv des "Connection Pooling" ist, den zeitraubenden Verbindungsaufbau zur Datenbank in möglichst 
//    vielen Fällen überflüssig zu manchen.
const pool = new Pool({
    // - Verbindungsinformationen
    // - Nutzung des "dotenv"-Moduls, um die Informationen nicht im Quellcode ersichtlich zu machen.
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
// - Aktivieren von "Cross Origin Ressource Sharing"
app.use(cors());
// - Aktivieren des bodyParser-Moduls
app.use(bodyParser.json());

// - hier werden GET-Anfragen an den Endpunkt "/liste_abrufen" bearbeitet
app.get('/liste_abrufen', async (req, res) => {
    // - alle Zeilen der Tabelle "tasks" werden in der Variable "result" gespeichert.
    const result = await pool.query('SELECT * FROM tasks');
    // ??? Was macht .rows? 
          // !!! Every result will have a rows array. If no rows are returned the array 
          // !!!   will be empty. Otherwise the array will contain one item for each row returned 
          // !!!   from the query. By default node-postgres creates a map from the name to value 
          // !!!   of each column, giving you a json-like object back for each row.
    // - ohne ".rows" wird das gesamte "queryResult"-Objekt ausgegeben
          // !!! .json() returns a new Response object for returning the provided JSON encoded data.
          // !!! Note that despite the method being named json(), the result is not JSON but 
          // !!!   is instead the result of taking JSON as input and parsing it to produce a JavaScript object.
    res.json(result.rows);
});

// - hier werden POST-Anfragen an den Endpunkt "/add" empfangen
// - das "async"-Kennwort kündigt an, dass in der entsprechenden Funktion eine "await"-Variable
//   enthalten ist, auf deren Berechnung gewartet werden muss (Prozess-Synchronisierung)
app.post('/add', async (req, res) => {
    // - das Ergebnis der Anfrage wird in der Variablen "result" gespeichert
    const result = await pool.query(
        // - SQL-Befehl um eine neue Aufgabe in der Datenbank hinzuzufügen
        //     "tasks" ist die entsprechenden Tabelle
        //     "(title)" ist die entsprechende Spalte
        //     "($1)" bezeichnet die erste Variable, die nach dem String übergeben wird (Parameter Binding)
        //          ähnlich in sqlite mit "?", woanders auch "%"
        //          Sinn und Zweck ist das Vermeiden von "SQL-Injections"
        //     "RETURNING * " gibt alle ("*") Spalten aller geänderter Einträge zurück
        //          ohne diese Angabe gibt "INSERT INTO" nur die IDs der geänderten Einträge zurück
        'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
        // - im Body der Anfrage befindet sich der Titel der Aufgabe
        //      dieser wird zum Platzhalter in der SQL-Anfrage aufgelöst
        //      die einzufügenden Variablen werden in einem Array übergeben, auch wenn es sich nur um EINE Variable handelt
        [req.body.title]
    );
    // ??? Wie bestimme ich WANN "res" zurück gesendet wird? Gibt es so etwas wie "res.send()" oÄ?
    //      !!! "res.json()" ruft implizit am Ende auch "res.send()" auf, bietet aber noch mehr Optionen, um das JSON-Objekt
    //      !!!     zu ver#ndern
    // - "result" ist ein Objekt, das unter dem Attribut "rows" ein Array mit allen geänderten Einträgen enthält
    // - "result.rows[0]" gibt den ersten Eintrag (JSON) dieses Arrays zurück
    // - "res.json(result.rows[0])" wandelt diesen JSON-Eintrag in ein JavaScript-Objekt um und erstellt ein neue Antwort
          // !!! .json() returns a new Response object for returning the provided JSON encoded data.
          // !!! Note that despite the method being named json(), the result is not JSON but 
          // !!!   is instead the result of taking JSON as input and parsing it to produce a JavaScript object.
    res.json(result.rows[0]);
});

// - hier werden DELETE-Anfrage an den Endpunkt "/delete" empfangen
// - der hinter "delete/"" befindliche Wert wird in der Variable "id" gespeichert
// - in diesem Fall ist es die ID der zu löschenden Aufgabe, die vom Frontend gesendet wird
app.delete('/delete/:id', async (req, res) => {
    // - da bei Datenbankabfragen Fehler auftreten können, wird der Code in einem "try/catch"-Block ausgeführt
    try {
        // - über den Verbindungs-Pool wird eine DELETE-Anfrage an die Datenbank gesendet
        // - die eingebundene ID ist diejenige, die vom Frontend bei der Anfrage übergeben wurde
        const result = await pool.query('DELETE FROM tasks WHERE id = $1', [
            req.params.id,
        ]);
        // - hier wird der Fall abgefangen, dass die Antwort nicht nur eine Zeile enthält
        // - entweder die Zeile wird nicht gefunden (rowCount == 0) oder es werden 2 oder mehr Zeilen zurückgegeben
        //     (letzterer Fall dürfte konstruktionsbedingt eigentlich nicht auftreten)
        // - ".rowCount" ist ein Attribut des Typs "queryResult" und enthält die Anzahl der zurückgegebenen Zeilen
        if (result.rowCount !== 1) {
            // - res.status(404) gibt ein Objekt zurück und setzt dessen Status-Attribut auf den HTTP-Statuscode "404"
            // - res.status(404).json({}) sendet ein JavaScript-Objekt mit entsprechendem Inhalt an das Frontend
            return res.status(404).json({ error: 'Error Row Count' });
        }
        // - läuft alles normal wird die vom Frontend übergebene ID wieder ans Frontend zurück gesandt
        res.json({ id: req.params.id });
    // - hier wird der Fall abgefanden, dass im try-Block irgendein Fehler aufgetreten ist    
    } catch (err) {
        // - in diesem Fall wird der Fehler auf der Konsole ausgegeben
        console.log(err);
        // - und ein JavaScript-Objekt mit HTTP-Statuscode erstellt und an das Frontend gesendet
        res
            .status(500)
            .json({ error: 'An error occurred while deleting the task' });
    }
});
// - Anweisung die den Server auf Port 3050 unter der URL localhost erreichbar macht
app.listen(3050, 'localhost', () => {
    // - ist der Server fehlerfrei gestartet wird Text auf der Konsole ausgegeben
    console.log('bald wird es Mittagspause');
});