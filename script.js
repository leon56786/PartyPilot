let spieler = [];
let aktuelleKarte = null;
let timer = null;
let zeit = 60;
let gemischtDeck = [];
let gemischtAktiv = false;

const app = document.getElementById("app");

const benutzteKarten = {
  quiz: [],
  schaetzfragen: [],
  tabu: [],
  pantomime: [],
  echtOderLuege: [],
  werTrinkt: [],
  aufzaehlen: [],
  findeDenLuegner: [],
  imposterFilme: [],
  imposterSerien: [],
  imposterLänder: [],
  imposterEssen: [],
  imposterBerühmtePersonen: [],
  imposterVideospiele: [],
  imposterTiere: []
};

function zufaelligeKarte(modus, datenArray) {
  if (!benutzteKarten[modus]) {
    benutzteKarten[modus] = [];
  }

  if (benutzteKarten[modus].length >= datenArray.length) {
    benutzteKarten[modus] = [];
  }

  let index;

  do {
    index = Math.floor(Math.random() * datenArray.length);
  } while (benutzteKarten[modus].includes(index));

  benutzteKarten[modus].push(index);
  return datenArray[index];
}

function schlucke() {
  return Math.floor(Math.random() * 3) + 1; 
}

function weiterAktion(normaleAktion) {
  return gemischtAktiv ? "naechsterGemischtModus()" : normaleAktion;
}

function startScreen() {
  app.innerHTML = `
    <div class="card">
      <h1>🍻 PartyPilot</h1>
      <p>Dein eigenes Partyspiel</p>
      <button onclick="spielerScreen()">Spiel starten</button>
    </div>
  `;
}

function spielerScreen() {
  app.innerHTML = `
    <div class="card">
      <h2>Spieler eingeben</h2>
      <p>2 bis maximal 12 Spieler</p>
      <div id="inputs"></div>
      <button onclick="addSpieler()">Spieler hinzufügen</button>
      <button onclick="menuScreen()">Weiter</button>
      <button class="secondary" onclick="startScreen()">Zurück</button>
    </div>
  `;

  const inputs = document.getElementById("inputs");

  if (spieler.length > 0) {
    spieler.forEach(name => {
      inputs.innerHTML += `<input value="${name}" />`;
    });
  } else {
    addSpieler();
    addSpieler();
  }
}

function addSpieler() {
  const inputs = document.getElementById("inputs");

  if (inputs.children.length >= 12) {
    alert("Maximal 12 Spieler.");
    return;
  }

  const nr = inputs.children.length + 1;
  inputs.innerHTML += `<input placeholder="Spieler ${nr}" />`;
}

function getSpieler() {
  const inputs = document.querySelectorAll("#inputs input");
  spieler = [...inputs].map(i => i.value.trim()).filter(n => n);

  if (spieler.length < 2) {
    alert("Mindestens 2 Spieler eingeben.");
    return false;
  }

  return true;
}

function menuScreen() {
  clearInterval(timer);
  gemischtAktiv = false;
  gemischtDeck = [];

  const inputs = document.querySelectorAll("#inputs input");

  if (inputs.length > 0) {
    if (!getSpieler()) return;
  }

  app.innerHTML = `
    <div class="card">
      <h2>Modus wählen</h2>
      <div class="grid">
        <button onclick="kartenModus('werTrinkt')">🍺 Wer muss trinken?</button>
        <button onclick="quizModus('quiz')">🧠 Allgemeinwissen</button>
        <button onclick="quizModus('schaetzfragen')">📏 Schätzfragen</button>
        <button onclick="echtOderLuegeModus()">🤔 Echt oder Lüge</button>
        <button onclick="tabuModus()">🗣️ Tabu</button>
        <button onclick="pantomimeModus()">🎭 Pantomime</button>
        <button onclick="aufzaehlModus()">🔁 Aufzählen</button>
        <button onclick="imposterStart()">🕵️ Imposter</button>
        <button onclick="findeDenLuegnerStart()">🤥 Finde den Lügner</button>
        <button onclick="woerterketteModus()">🔗 Wörterkette</button>
        <button onclick="gemischt()">🎲 Gemischt</button>
      </div>
      <button class="secondary" onclick="spielerScreen()">Spieler ändern</button>
    </div>
  `;
}

function woerterketteModus() {
  aktuelleKarte = zufaelligeKarte("woerterkette", DATEN.woerterkette);

  app.innerHTML = `
    <div class="card">
      <h2>🔗 Wörterkette</h2>
      <p>Jeder nennt ein Wort, das mit dem vorherigen zusammenhängt.</p>
      <p>Beispiel:</p>
      <p>Auto → Reifen → Gummi → Band</p>
      <div class="big">${aktuelleKarte}</div>
      <p>Wer nichts mehr weiß oder hängen bleibt trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("woerterketteModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterAktion("woerterketteModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function kartenModus(typ) {
  aktuelleKarte = zufaelligeKarte(typ, DATEN[typ]);

  app.innerHTML = `
    <div class="card">
      <h2>🍺 Wer muss trinken?</h2>
      <div class="big">${aktuelleKarte}</div>
      <p>${schlucke()} Schlücke</p>
      <button onclick="${weiterAktion(`kartenModus('${typ}')`)}">Weiter</button>
      <button class="secondary" onclick="${weiterAktion(`kartenModus('${typ}')`)}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function quizModus(typ) {
  aktuelleKarte = zufaelligeKarte(typ, DATEN[typ]);

  app.innerHTML = `
    <div class="card">
      <h2>${typ === "quiz" ? "🧠 Allgemeinwissen" : "📏 Schätzfrage"}</h2>
      <div class="big">${aktuelleKarte.frage}</div>
      <button onclick="antwortScreen('${typ}')">Antwort anzeigen</button>
      <button class="secondary" onclick="${weiterAktion(`quizModus('${typ}')`)}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function antwortScreen(typ) {
  app.innerHTML = `
    <div class="card">
      <h2>Antwort</h2>
      <div class="big">${aktuelleKarte.antwort}</div>
      <p>Wer falsch lag: ${schlucke()} Schlücke</p>
      <button onclick="${weiterAktion(`quizModus('${typ}')`)}">Weiter</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function echtOderLuegeModus() {
  aktuelleKarte = zufaelligeKarte("echtOderLuege", DATEN.echtOderLuege);

  app.innerHTML = `
    <div class="card">
      <h2>🤔 Echt oder Lüge?</h2>
      <div class="big">${aktuelleKarte.text}</div>
      <button onclick="echtOderLuegeAntwort()">Auflösung anzeigen</button>
      <button class="secondary" onclick="${weiterAktion("echtOderLuegeModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function echtOderLuegeAntwort() {
  app.innerHTML = `
    <div class="card">
      <h2>Auflösung</h2>
      <div class="big">${aktuelleKarte.echt ? "✅ Echt" : "❌ Lüge"}</div>
      <p>Wer falsch lag: ${schlucke()} Schlücke</p>
      <button onclick="${weiterAktion("echtOderLuegeModus()")}">Weiter</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function tabuModus() {
  aktuelleKarte = zufaelligeKarte("tabu", DATEN.tabu);
  zeit = 60;
  clearInterval(timer);

  app.innerHTML = `
    <div class="card">
      <h2>🗣️ Tabu</h2>
      <p>Erkläre das Wort ohne die verbotenen Begriffe.</p>
      <div class="big">${aktuelleKarte.wort}</div>
      <p>Verboten: ${aktuelleKarte.verboten.join(", ")}</p>
      <div class="timer" id="timer">60</div>
      <button onclick="startTimer()">Timer starten</button>
      <button onclick="${weiterAktion("tabuModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterAktion("tabuModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function pantomimeModus() {
  aktuelleKarte = zufaelligeKarte("pantomime", DATEN.pantomime);
  zeit = 90;
  clearInterval(timer);

  app.innerHTML = `
    <div class="card">
      <h2>🎭 Pantomime</h2>
      <p>Stelle den Begriff ohne Worte dar.</p>
      <div class="big">${aktuelleKarte}</div>
      <div class="timer" id="timer">90</div>
      <button onclick="startTimer()">Timer starten</button>
      <button onclick="${weiterAktion("pantomimeModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterAktion("pantomimeModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    zeit--;

    const timerElement = document.getElementById("timer");

    if (timerElement) {
      timerElement.innerText = zeit;
    }

    if (zeit <= 0) {
      clearInterval(timer);
      alert("Zeit vorbei! Verlierer trinkt " + schlucke() + " Schlücke.");
    }
  }, 1000);
}

function aufzaehlModus() {
  aktuelleKarte = zufaelligeKarte("aufzaehlen", DATEN.aufzaehlen);

  app.innerHTML = `
    <div class="card">
      <h2>🔁 Aufzähl-Modus</h2>
      <p>Reihum aufzählen. Wer doppelt sagt oder nichts weiß, verliert.</p>
      <div class="big">${aktuelleKarte}</div>
      <p>Gewinner verteilt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("aufzaehlModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterAktion("aufzaehlModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

let imposterDaten = {};
let imposterIndex = 0;

function imposterStart() {
  const kategorien = Object.keys(DATEN.imposter);
  const kategorie = kategorien[Math.floor(Math.random() * kategorien.length)];
  const modusKey = "imposter" + kategorie.replace(/\s/g, "").replace("ü", "ue").replace("ä", "ae").replace("ö", "oe").replace("ß", "ss");
  const wort = zufaelligeKarte(modusKey, DATEN.imposter[kategorie]);
  const imposter = Math.floor(Math.random() * spieler.length);

  imposterDaten = { kategorie, wort, imposter };
  imposterIndex = 0;

  imposterVerdeckt();
}

function imposterVerdeckt() {
  app.innerHTML = `
    <div class="card">
      <h2>🕵️ Imposter</h2>
      <p>Kategorie: ${imposterDaten.kategorie}</p>
      <div class="big">Bereit, ${spieler[imposterIndex]}?</div>
      <p>Drücke erst aufdecken, wenn nur du den Bildschirm siehst.</p>
      <button onclick="imposterAufdecken()">Aufdecken</button>
    </div>
  `;
}

function imposterAufdecken() {
  const text =
    imposterIndex === imposterDaten.imposter
      ? "Du bist der Imposter"
      : imposterDaten.wort;

  app.innerHTML = `
    <div class="card">
      <h2>${spieler[imposterIndex]}</h2>
      <p>Kategorie: ${imposterDaten.kategorie}</p>
      <div class="big">${text}</div>
      <button onclick="imposterWeiter()">Nächster Spieler</button>
    </div>
  `;
}

function imposterWeiter() {
  imposterIndex++;

  if (imposterIndex >= spieler.length) {
    app.innerHTML = `
      <div class="card">
        <h2>Diskussion</h2>
        <p>Findet heraus, wer der Imposter ist.</p>
        <button onclick="imposterAufloesung()">Auflösung</button>
      </div>
    `;
  } else {
    imposterVerdeckt();
  }
}

function imposterAufloesung() {
  app.innerHTML = `
    <div class="card">
      <h2>Auflösung</h2>
      <div class="big">${spieler[imposterDaten.imposter]} war der Imposter</div>
      <p>Wort war: ${imposterDaten.wort}</p>
      <p>Verlierer trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("imposterStart()")}">Weiter</button>
      <button class="secondary" onclick="imposterStart()">Neue Imposter-Runde</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

let luegnerDaten = {};
let luegnerIndex = 0;
let luegnerAntworten = [];

function findeDenLuegnerStart() {
  const set = zufaelligeKarte("findeDenLuegner", DATEN.findeDenLuegner);
  const luegnerSpieler = Math.floor(Math.random() * spieler.length);

  luegnerDaten = {
    normal: set.normal,
    luegnerFrage: set.luegner,
    luegnerSpieler: luegnerSpieler
  };

  luegnerIndex = 0;
  luegnerAntworten = [];

  findeDenLuegnerVerdeckt();
}

function findeDenLuegnerVerdeckt() {
  app.innerHTML = `
    <div class="card">
      <h2>🤥 Finde den Lügner</h2>
      <div class="big">Bereit, ${spieler[luegnerIndex]}?</div>
      <p>Niemand darf deine Frage sehen.</p>
      <button onclick="findeDenLuegnerFrage()">Aufdecken</button>
    </div>
  `;
}

function findeDenLuegnerFrage() {
  const frage =
    luegnerIndex === luegnerDaten.luegnerSpieler
      ? luegnerDaten.luegnerFrage
      : luegnerDaten.normal;

  app.innerHTML = `
    <div class="card">
      <h2>${spieler[luegnerIndex]}</h2>
      <div class="big">${frage}</div>
      <input id="antwortInput" placeholder="Antwort eingeben" />
      <button onclick="findeDenLuegnerSpeichern()">Antwort speichern</button>
    </div>
  `;
}

function findeDenLuegnerSpeichern() {
  const input = document.getElementById("antwortInput");
  const antwort = input.value.trim();

  if (!antwort) {
    alert("Bitte Antwort eingeben.");
    return;
  }

  luegnerAntworten.push({
    spieler: spieler[luegnerIndex],
    antwort: antwort
  });

  luegnerIndex++;

  if (luegnerIndex >= spieler.length) {
    findeDenLuegnerAuswertung();
  } else {
    findeDenLuegnerVerdeckt();
  }
}

function findeDenLuegnerAuswertung() {
  const antwortenHtml = luegnerAntworten
    .map(a => `<div class="answer-box"><b>${a.spieler}:</b> ${a.antwort}</div>`)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Diskussion</h2>
      <p><b>Normale Frage:</b> ${luegnerDaten.normal}</p>
      ${antwortenHtml}
      <p>Findet heraus, wer die andere Frage hatte.</p>
      <button onclick="findeDenLuegnerAufloesung()">Auflösung</button>
    </div>
  `;
}

function findeDenLuegnerAufloesung() {
  app.innerHTML = `
    <div class="card">
      <h2>Auflösung</h2>
      <div class="big">${spieler[luegnerDaten.luegnerSpieler]} war der Lügner</div>
      <p><b>Normale Frage:</b> ${luegnerDaten.normal}</p>
      <p><b>Lügner-Frage:</b> ${luegnerDaten.luegnerFrage}</p>
      <p>Verlierer trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("findeDenLuegnerStart()")}">Weiter</button>
      <button class="secondary" onclick="findeDenLuegnerStart()">Neue Lügner-Runde</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function naechsterGemischtModus() {
  if (gemischtDeck.length === 0) {
    gemischtDeck = [
      "werTrinkt",
      "quiz",
      "schaetzfragen",
      "echtOderLuege",
      "tabu",
      "woerterkette",
      "pantomime",
      "aufzaehlen",
      "imposter",
      "findeDenLuegner"
    ];

    gemischtDeck.sort(() => Math.random() - 0.5);
  }

  const modus = gemischtDeck.pop();

  switch (modus) {
    case "werTrinkt":
      kartenModus("werTrinkt");
      break;
    case "quiz":
      quizModus("quiz");
      break;
    case "schaetzfragen":
      quizModus("schaetzfragen");
      break;
    case "echtOderLuege":
      echtOderLuegeModus();
      break;
      case "woerterkette":
    woerterketteModus();
    break;
    case "tabu":
      tabuModus();
      break;
    case "pantomime":
      pantomimeModus();
      break;
    case "aufzaehlen":
      aufzaehlModus();
      break;
    case "imposter":
      imposterStart();
      break;
    case "findeDenLuegner":
      findeDenLuegnerStart();
      break;
  }
}

function gemischt() {
  gemischtAktiv = true;
  naechsterGemischtModus();
}

startScreen();