// Costante per la chiave di localStorage per i giri
const STORAGE_KEY_LAPS = 'raceSimulatorLaps';

// Costanti per i tempi casuali (fissi)
const MIN_LAP_TIME = 70; // Tempo minimo di default
const MAX_LAP_TIME = 100; // Tempo massimo di default

// Classe AutoDaCorsa per gestire la logica del simulatore
class AutoDaCorsa {
    constructor(model, pilota, velocitaMax) {
        this.model = model;
        this.pilota = pilota;
        this.tempiGiro = []; // Array per i tempi sul giro
        this.velocitaMax = velocitaMax; // in km/h (valore base, non usato per calcoli diretti di velocità media)
    }

    /**
     * Aggiunge un nuovo tempo sul giro all'array.
     * @param {number} tempo - Il tempo del giro in secondi.
     */
    aggiungiTempo(tempo) {
        if (typeof tempo === 'number' && tempo > 0) {
            this.tempiGiro.push(tempo);
            this.saveLaps(); // Salva i giri dopo l'aggiunta
            return true;
        } else {
            showMessage("Tempo non valido. Deve essere un numero positivo.", "error");
            return false;
        }
    }

    /**
     * Calcola la media dei tempi sul giro.
     * @returns {number} La media dei tempi sul giro, o 0 se non ci sono giri.
     */
    calcolaMedia() {
        if (this.tempiGiro.length === 0) {
            return 0;
        }
        const sommaTempi = this.tempiGiro.reduce((acc, curr) => acc + curr, 0);
        return sommaTempi / this.tempiGiro.length;
    }

    /**
     * Trova il tempo migliore (più basso) tra i giri registrati.
     * @returns {number|null} Il tempo migliore, o null se non ci sono giri.
     */
    tempoMigliore() {
        if (this.tempiGiro.length === 0) {
            return null;
        }
        return Math.min(...this.tempiGiro);
    }

    /**
     * Trova il tempo peggiore (più alto) tra i giri registrati.
     * @returns {number|null} Il tempo peggiore, o null se non ci sono giri.
     */
    tempoPeggiore() {
        if (this.tempiGiro.length === 0) {
            return null;
        }
        return Math.max(...this.tempiGiro);
    }

    /**
     * Calcola la velocità media basata sulla media dei tempi sul giro e una distanza fissa.
     * Assumiamo una distanza del giro di 1 km per semplicità.
     * @returns {number} La velocità media in km/h.
     */
    calcolaVelocitaMedia() {
        const mediaTempoSecondi = this.calcolaMedia();
        if (mediaTempoSecondi === 0) {
            return 0;
        }
        // Velocità = Distanza / Tempo. Assumiamo 1 km per giro.
        // Converti tempo da secondi a ore: mediaTempoSecondi / 3600
        // Velocità = 1 km / (mediaTempoSecondi / 3600 ore) = 3600 / mediaTempoSecondi km/h
        return (3600 / mediaTempoSecondi);
    }

    /**
     * Resetta tutti i tempi sul giro e rimuove i dati da localStorage.
     */
    resetTempi() {
        this.tempiGiro = [];
        localStorage.removeItem(STORAGE_KEY_LAPS);
    }

    /**
     * Salva i tempi sul giro in localStorage.
     */
    saveLaps() {
        localStorage.setItem(STORAGE_KEY_LAPS, JSON.stringify(this.tempiGiro));
    }

    /**
     * Carica i tempi sul giro da localStorage.
     */
    loadLaps() {
        const storedLaps = localStorage.getItem(STORAGE_KEY_LAPS);
        if (storedLaps) {
            this.tempiGiro = JSON.parse(storedLaps);
        }
    }
}

// Inizializzazione dell'oggetto AutoDaCorsa con valori fissi
const myRaceCar = new AutoDaCorsa("Ferrari F1", "Lewis Hamilton", 350);

// Riferimenti agli elementi HTML
const addLapBtn = document.getElementById('addLapBtn');
const resetRaceBtn = document.getElementById('resetRaceBtn');
const totalLapsSpan = document.getElementById('totalLaps');
const averageSpeedSpan = document.getElementById('averageSpeed');
const bestLapTimeSpan = document.getElementById('bestLapTime');
const worstLapTimeSpan = document.getElementById('worstLapTime');
const lapTimesList = document.getElementById('lapTimesList');
const displayCarModel = document.getElementById('displayCarModel');
const displayDriverName = document.getElementById('displayDriverName');

/**
 * Funzione per mostrare messaggi temporanei all'utente.
 * @param {string} message - Il messaggio da visualizzare.
 * @param {string} type - Il tipo di messaggio ('success' o 'error').
 */
function showMessage(message, type = 'info') {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.classList.add('message-box', type);
    document.body.appendChild(messageBox);

    // Rimuovi il messaggio dopo 3 secondi
    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}

/**
 * Genera un tempo casuale per il giro tra un minimo e un massimo specificati.
 * Usa le costanti MIN_LAP_TIME e MAX_LAP_TIME.
 * @returns {number} Un tempo casuale arrotondato a due decimali.
 */
function generateRandomLapTime() {
    return (Math.random() * (MAX_LAP_TIME - MIN_LAP_TIME) + MIN_LAP_TIME);
}

/**
 * Aggiorna la dashboard con i dati più recenti.
 */
function updateDashboard() {
    const totalLaps = myRaceCar.tempiGiro.length;
    const averageSpeed = myRaceCar.calcolaVelocitaMedia();
    const bestLap = myRaceCar.tempoMigliore();
    const worstLap = myRaceCar.tempoPeggiore();

    totalLapsSpan.textContent = totalLaps;
    averageSpeedSpan.textContent = averageSpeed.toFixed(2) + " km/h";
    bestLapTimeSpan.textContent = bestLap !== null ? bestLap.toFixed(2) + "s" : "N/A";
    worstLapTimeSpan.textContent = worstLap !== null ? worstLap.toFixed(2) + "s" : "N/A";

    // Aggiorna i dettagli dell'auto e del pilota (ora fissi)
    displayCarModel.textContent = myRaceCar.model;
    displayDriverName.textContent = myRaceCar.pilota;

    // Aggiorna la lista dei giri
    renderLapTimes();
}

/**
 * Renderizza la lista dei tempi sul giro, evidenziando il migliore e il peggiore.
 */
function renderLapTimes() {
    lapTimesList.innerHTML = ''; // Pulisce la lista esistente
    const bestLap = myRaceCar.tempoMigliore();
    const worstLap = myRaceCar.tempoPeggiore();

    myRaceCar.tempiGiro.forEach((tempo, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Giro ${index + 1}: ${tempo.toFixed(2)}s`;
        listItem.classList.add('p-2', 'rounded-md', 'bg-gray-800', 'flex', 'justify-between', 'items-center', 'lap-item');

        // Evidenzia solo se ci sono più di un giro per avere un confronto significativo
        if (myRaceCar.tempiGiro.length > 1) {
            if (tempo === bestLap) {
                listItem.classList.add('best-time');
            } else if (tempo === worstLap) {
                listItem.classList.add('worst-time');
            }
        }

        // Aggiungi la classe per l'animazione solo per il nuovo elemento
        if (index === myRaceCar.tempiGiro.length - 1 && myRaceCar.tempiGiro.length > 0) {
            listItem.classList.add('new-lap');
        }

        lapTimesList.appendChild(listItem);
    });

    // Scorre automaticamente verso il basso per mostrare l'ultimo giro
    lapTimesList.scrollTop = lapTimesList.scrollHeight;
}

// Event Listener per aggiungere un giro casuale
addLapBtn.addEventListener('click', () => {
    const randomTime = generateRandomLapTime(); // Usa le costanti globali
    myRaceCar.aggiungiTempo(randomTime);
    updateDashboard(); // Aggiorna la UI
});

// Event Listener per resettare la gara
resetRaceBtn.addEventListener('click', () => {
    myRaceCar.resetTempi();
    updateDashboard(); // Aggiorna la UI
    showMessage("Gara resettata!", "info");
});

// Inizializza la dashboard al caricamento della pagina
// Usa DOMContentLoaded per assicurarsi che il DOM sia completamente caricato prima di eseguire lo script
document.addEventListener('DOMContentLoaded', () => {
    myRaceCar.loadLaps();     // Carica i giri
    updateDashboard(); // Aggiorna la UI con tutti i dati caricati
});
