let spieler = [];
let aktuelleKarte = null;
let timer = null;
let zeit = 60;
let gemischtDeck = [];
let gemischtAktiv = false;
let rundenTimer = null;
let rundenZeit = 60;
let rundenPunkte = 0;
let rundenTyp = "";
let spielerDranIndex = 0;
let alphabetKategorie = "";
let alphabetIndex = 0;
let alphabetBuchstaben = [];

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
  falscherBegriff: [],
  woerterkette: [],
  zweiLuegenEineWahrheit: [],
  bombe: [],
  werWuerdeEher: [],
  duemmsteFliegt: [],
  reime: [],
  imposterBerühmtePersonen: [],
  idiotentest: [],
  alphabetSpiel: [],
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
spielerDranIndex = 0;

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
        <button onclick="falscherBegriffStart()">🧩 Falscher Begriff</button>
        <button onclick="idiotentestModus()">🤓 Idiotentest</button>
        <button onclick="bombeModus()">💣 Bombe</button>
        <button onclick="duemmsteFliegtStart()">🏆 Der Dümmste fliegt</button>
        <button onclick="reimeModus()">🎤 Reime</button>
        <button onclick="zweiLuegenEineWahrheitModus()">🕵️ 2 Lügen 1 Wahrheit</button>
        <button onclick="alphabetSpielStart()">🔤 Alphabet-Spiel</button>
        <button onclick="werWuerdeEherModus()">🙋 Wer würde eher?</button>
        <button onclick="gemischt()">🎲 Gemischt</button>
      </div>
      <button class="secondary" onclick="spielerScreen()">Spieler ändern</button>
    </div>
  `;
}
function weiterAktion(normaleAktion) {
  return gemischtAktiv ? "naechsterGemischtModus()" : normaleAktion;
}

function spielerDran() {
  if (spieler.length === 0) return "Spieler";
  return spieler[spielerDranIndex % spieler.length];
}

function naechsterSpielerDran() {
  if (spieler.length === 0) return;

  spielerDranIndex++;

  if (spielerDranIndex >= spieler.length) {
    spielerDranIndex = 0;
  }
}

function weiterMitSpieler(normaleAktion) {
  const aktion = gemischtAktiv ? "naechsterGemischtModus()" : normaleAktion;
  return `spielerWeiterUndAktion('${aktion}')`;
}

function spielerWeiterUndAktion(aktion) {
  naechsterSpielerDran();

  if (aktion === "naechsterGemischtModus()") {
    naechsterGemischtModus();
  } else if (aktion === "woerterketteModus()") {
    woerterketteModus();
  } else if (aktion === "reimeModus()") {
    reimeModus();
  } else if (aktion === "aufzaehlModus()") {
    aufzaehlModus();
  } else if (aktion === "bombeModus()") {
    bombeModus();
  } else if (aktion === "tabuModus()") {
    tabuModus();
  } else if (aktion === "pantomimeModus()") {
    pantomimeModus();
  }
}

function werWuerdeEherModus() {
  aktuelleKarte = zufaelligeKarte("werWuerdeEher", DATEN.werWuerdeEher);

  app.innerHTML = `
    <div class="card">
      <h2>🙋 Wer würde eher?</h2>

      <div class="big">${aktuelleKarte}</div>

      <p>Alle stimmen privat ab, auf welchen Spieler das am ehesten passt.</p>
      <p>Die Spieler mit der Minderheit verlieren.</p>
      <p>Minderheit trinkt ${schlucke()} Schlücke.</p>

      <button onclick="${weiterAktion("werWuerdeEherModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterAktion("werWuerdeEherModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function alphabetSpielStart() {
  alphabetKategorie = zufaelligeKarte("alphabetSpiel", DATEN.alphabetSpiel);
  alphabetIndex = 0;

  alphabetBuchstaben = [
    "A", "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M", "N",
    "O", "P", "Q", "R", "S", "T", "U",
    "V", "W", "X", "Y", "Z"
  ];

  alphabetSpielRunde();
}

function alphabetSpielRunde() {
  const buchstabe = alphabetBuchstaben[alphabetIndex];

  app.innerHTML = `
    <div class="card">
      <h2>🔤 Alphabet-Spiel</h2>

      <p>Kategorie:</p>
      <div class="big">${alphabetKategorie}</div>

      <p>Dran ist: <b>${spielerDran()}</b></p>

      <p>Nenne ein Wort mit:</p>
      <div class="big">${buchstabe}</div>

      <p>Beispiel bei Essen: A = Apfel, B = Banane.</p>
      <p>Wer nichts weiß oder etwas Falsches sagt, verliert und trinkt ${schlucke()} Schlücke.</p>

      <button onclick="alphabetSpielRichtig()">Geschafft</button>
      <button class="secondary" onclick="alphabetSpielVerloren()">Verloren</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function alphabetSpielRichtig() {
  naechsterSpielerDran();

  alphabetIndex++;

  if (alphabetIndex >= alphabetBuchstaben.length) {
    alphabetSpielGewonnen();
    return;
  }

  alphabetSpielRunde();
}

function alphabetSpielVerloren() {
  app.innerHTML = `
    <div class="card">
      <h2>Verloren</h2>

      <div class="big">${spielerDran()} hat verloren.</div>

      <p>${spielerDran()} trinkt ${schlucke()} Schlücke.</p>

      <button onclick="alphabetSpielStart()">Neue Runde</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function alphabetSpielGewonnen() {
  app.innerHTML = `
    <div class="card">
      <h2>🔤 Alphabet geschafft</h2>

      <div class="big">Ihr habt A bis Z geschafft!</div>

      <p>Alle anderen trinken 1 Schluck oder ihr startet direkt eine neue Runde.</p>

      <button onclick="alphabetSpielStart()">Neue Runde</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function zweiLuegenEineWahrheitModus() {
  aktuelleKarte = zufaelligeKarte("zweiLuegenEineWahrheit", DATEN.zweiLuegenEineWahrheit);

  const optionen = [
    { text: aktuelleKarte.wahrheit, richtig: true },
    { text: aktuelleKarte.luegen[0], richtig: false },
    { text: aktuelleKarte.luegen[1], richtig: false }
  ];

  optionen.sort(() => Math.random() - 0.5);

  aktuelleKarte.optionen = optionen;

  const optionenHtml = optionen
    .map((option, index) => `
      <button onclick="zweiLuegenEineWahrheitAntwort(${index})">
        ${index + 1}. ${option.text}
      </button>
    `)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>🕵️ 2 Lügen 1 Wahrheit</h2>
      <p>Welche Story ist wahr?</p>
      ${optionenHtml}
      <button class="secondary" onclick="${weiterAktion("zweiLuegenEineWahrheitModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function zweiLuegenEineWahrheitAntwort(index) {
  const option = aktuelleKarte.optionen[index];

  app.innerHTML = `
    <div class="card">
      <h2>Auflösung</h2>
      <div class="big">${option.richtig ? "✅ Richtig" : "❌ Falsch"}</div>
      <p><b>Wahr war:</b></p>
      <p>${aktuelleKarte.wahrheit}</p>
      <p>Wer falsch lag trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("zweiLuegenEineWahrheitModus()")}">Weiter</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

let falscherBegriffDaten = {};
let falscherBegriffIndex = 0;

function falscherBegriffStart() {
  const set = zufaelligeKarte("falscherBegriff", DATEN.falscherBegriff);
  const falscherSpieler = Math.floor(Math.random() * spieler.length);

  falscherBegriffDaten = {
    normal: set.normal,
    falsch: set.falsch,
    falscherSpieler: falscherSpieler
  };

  falscherBegriffIndex = 0;
  falscherBegriffVerdeckt();
}

function falscherBegriffVerdeckt() {
  app.innerHTML = `
    <div class="card">
      <h2>🧩 Falscher Begriff</h2>
      <div class="big">Bereit, ${spieler[falscherBegriffIndex]}?</div>
      <p>Niemand darf dein Wort sehen.</p>
      <button onclick="falscherBegriffAufdecken()">Aufdecken</button>
    </div>
  `;
}

function falscherBegriffAufdecken() {
  const wort =
    falscherBegriffIndex === falscherBegriffDaten.falscherSpieler
      ? falscherBegriffDaten.falsch
      : falscherBegriffDaten.normal;

  app.innerHTML = `
    <div class="card">
      <h2>${spieler[falscherBegriffIndex]}</h2>
      <div class="big">${wort}</div>
      <button onclick="falscherBegriffWeiter()">Nächster Spieler</button>
    </div>
  `;
}

function falscherBegriffWeiter() {
  falscherBegriffIndex++;

  if (falscherBegriffIndex >= spieler.length) {
    app.innerHTML = `
      <div class="card">
        <h2>Diskussion</h2>
        <p>Findet heraus, wer den falschen Begriff hatte.</p>
        <button onclick="falscherBegriffAufloesung()">Auflösung</button>
      </div>
    `;
  } else {
    falscherBegriffVerdeckt();
  }
}

function falscherBegriffAufloesung() {
  app.innerHTML = `
    <div class="card">
      <h2>Auflösung</h2>
      <div class="big">${spieler[falscherBegriffDaten.falscherSpieler]} hatte den falschen Begriff</div>
      <p><b>Normal:</b> ${falscherBegriffDaten.normal}</p>
      <p><b>Falsch:</b> ${falscherBegriffDaten.falsch}</p>
      <p>Verlierer trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("falscherBegriffStart()")}">Weiter</button>
      <button class="secondary" onclick="falscherBegriffStart()">Neue Runde</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function reimeModus() {
  aktuelleKarte = zufaelligeKarte("reime", DATEN.reime);

  app.innerHTML = `
    <div class="card">
      <h2>🎤 Reime</h2>
      <p>Dran ist: <b>${spielerDran()}</b></p>
      <p>Reihum muss jeder ein Wort sagen, das sich reimt.</p>
      <p>Beispiel: Haus → Maus → raus → Applaus</p>
      <div class="big">Reime auf: ${aktuelleKarte}</div>
      <p>Wer nichts mehr weiß, zu lange braucht oder ein falsches Wort sagt, trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterMitSpieler("reimeModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterMitSpieler("reimeModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function woerterketteModus() {
  aktuelleKarte = zufaelligeKarte("woerterkette", DATEN.woerterkette);

  app.innerHTML = `
    <div class="card">
      <h2>🔗 Wörterkette</h2>
      <p>Dran ist: <b>${spielerDran()}</b></p>
      <p>Jeder nennt ein Wort, das mit dem vorherigen zusammenhängt.</p>
      <p>Beispiel:</p>
      <p>Auto → Reifen → Gummi → Band</p>
      <div class="big">${aktuelleKarte}</div>
      <p>Wer nichts mehr weiß oder hängen bleibt trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterMitSpieler("woerterketteModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterMitSpieler("woerterketteModus()")}">Überspringen</button>
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
  rundenTyp = "tabu";
  rundenZeit = 60;
  rundenPunkte = 0;

  clearInterval(timer);
  clearInterval(rundenTimer);
  rundenTimer = null;

  app.innerHTML = `
    <div class="card">
      <h2>🗣️ Tabu</h2>

      <p>Dran ist: <b>${spielerDran()}</b></p>

      <p>Erkläre so viele Wörter wie möglich in 60 Sekunden.</p>
      <p>Du darfst die verbotenen Wörter nicht sagen.</p>
      <p>Pro richtig erratenem Wort dürft ihr 1 Schluck verteilen.</p>

      <button onclick="tabuRundeStarten()">Timer starten</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function tabuRundeStarten() {
  clearInterval(rundenTimer);

  tabuNaechstesWort();

  rundenTimer = setInterval(() => {
    rundenZeit--;

    const timerElement = document.getElementById("rundenTimer");

    if (timerElement) {
      timerElement.innerText = rundenZeit;
    }

    if (rundenZeit <= 0) {
      tabuPantomimeEnde();
    }
  }, 1000);
}

function tabuNaechstesWort() {
  aktuelleKarte = zufaelligeKarte("tabu", DATEN.tabu);

  app.innerHTML = `
    <div class="card">
      <h2>🗣️ Tabu</h2>

      <p>Dran ist: <b>${spielerDran()}</b></p>
      <p>Zeit: <b id="rundenTimer">${rundenZeit}</b> Sekunden</p>
      <p>Richtig erraten: <b>${rundenPunkte}</b></p>

      <div class="big">${aktuelleKarte.wort}</div>

      <p><b>Verboten:</b> ${aktuelleKarte.verboten.join(", ")}</p>

      <button onclick="tabuRichtig()">Richtig erraten</button>
      <button class="secondary" onclick="tabuNaechstesWort()">Skippen</button>
      <button class="secondary" onclick="tabuPantomimeEnde()">Runde beenden</button>
    </div>
  `;
}

function tabuRichtig() {
  rundenPunkte++;
  tabuNaechstesWort();
}

function pantomimeModus() {
  rundenTyp = "pantomime";
  rundenZeit = 90;
  rundenPunkte = 0;

  clearInterval(timer);
  clearInterval(rundenTimer);
  rundenTimer = null;

  app.innerHTML = `
    <div class="card">
      <h2>🎭 Pantomime</h2>

      <p>Dran ist: <b>${spielerDran()}</b></p>

      <p>Stelle so viele Begriffe wie möglich in 90 Sekunden dar.</p>
      <p>Du darfst nicht sprechen.</p>
      <p>Pro richtig erratenem Begriff dürft ihr 1 Schluck verteilen.</p>

      <button onclick="pantomimeRundeStarten()">Timer starten</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function pantomimeRundeStarten() {
  clearInterval(rundenTimer);

  pantomimeNaechstesWort();

  rundenTimer = setInterval(() => {
    rundenZeit--;

    const timerElement = document.getElementById("rundenTimer");

    if (timerElement) {
      timerElement.innerText = rundenZeit;
    }

    if (rundenZeit <= 0) {
      tabuPantomimeEnde();
    }
  }, 1000);
}

function pantomimeNaechstesWort() {
  aktuelleKarte = zufaelligeKarte("pantomime", DATEN.pantomime);

  app.innerHTML = `
    <div class="card">
      <h2>🎭 Pantomime</h2>

      <p>Dran ist: <b>${spielerDran()}</b></p>
      <p>Zeit: <b id="rundenTimer">${rundenZeit}</b> Sekunden</p>
      <p>Richtig erraten: <b>${rundenPunkte}</b></p>

      <div class="big">${aktuelleKarte}</div>

      <p>Stelle den Begriff ohne Worte dar.</p>

      <button onclick="pantomimeRichtig()">Richtig erraten</button>
      <button class="secondary" onclick="pantomimeNaechstesWort()">Skippen</button>
      <button class="secondary" onclick="tabuPantomimeEnde()">Runde beenden</button>
    </div>
  `;
}

function pantomimeRichtig() {
  rundenPunkte++;
  pantomimeNaechstesWort();
}

function tabuPantomimeEnde() {
  clearInterval(rundenTimer);
  rundenTimer = null;

  const titel = rundenTyp === "tabu" ? "🗣️ Tabu" : "🎭 Pantomime";
  const neustart = rundenTyp === "tabu" ? "tabuModus()" : "pantomimeModus()";

  app.innerHTML = `
    <div class="card">
      <h2>${titel} vorbei</h2>

      <p>Dran war: <b>${spielerDran()}</b></p>

      <div class="big">${rundenPunkte} richtig erraten</div>

      <p>Du darfst insgesamt <b>${rundenPunkte} Schlücke</b> verteilen.</p>

      <button onclick="tabuPantomimeWeiter('${neustart}')">Weiter</button>
      <button class="secondary" onclick="${neustart}">Gleicher Spieler nochmal</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function tabuPantomimeWeiter(neustart) {
  naechsterSpielerDran();

  if (gemischtAktiv) {
    naechsterGemischtModus();
    return;
  }

  if (neustart === "tabuModus()") {
    tabuModus();
  }

  if (neustart === "pantomimeModus()") {
    pantomimeModus();
  }
}

function aufzaehlModus() {
  aktuelleKarte = zufaelligeKarte("aufzaehlen", DATEN.aufzaehlen);

  app.innerHTML = `
    <div class="card">
      <h2>🔁 Aufzähl-Modus</h2>
      <p>Dran ist: <b>${spielerDran()}</b></p>
      <p>Reihum aufzählen. Wer doppelt sagt oder nichts weiß, verliert.</p>
      <div class="big">${aktuelleKarte}</div>
      <p>Gewinner verteilt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterMitSpieler("aufzaehlModus()")}">Weiter</button>
      <button class="secondary" onclick="${weiterMitSpieler("aufzaehlModus()")}">Überspringen</button>
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
function idiotentestModus() {
  aktuelleKarte = zufaelligeKarte("idiotentest", DATEN.idiotentest);

  app.innerHTML = `
    <div class="card">
      <h2>🤓 Idiotentest</h2>
      <div class="big">${aktuelleKarte.frage}</div>
      <button onclick="idiotentestAntwort()">Antwort anzeigen</button>
      <button class="secondary" onclick="${weiterAktion("idiotentestModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function idiotentestAntwort() {
  app.innerHTML = `
    <div class="card">
      <h2>Antwort</h2>
      <div class="big">${aktuelleKarte.antwort}</div>
      <p>Wer falsch lag trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("idiotentestModus()")}">Weiter</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

let bombeTimer = null;
let bombeZeit = 0;

function bombeModus() {
  aktuelleKarte = zufaelligeKarte("bombe", DATEN.bombe);

  bombeZeit = Math.floor(Math.random() * 81) + 10;

  clearInterval(bombeTimer);

  app.innerHTML = `
    <div class="card">
      <h2>💣 Bombe</h2>
      <p>Dran ist: <b>${spielerDran()}</b></p>
      <p>Reihum Begriffe nennen. Wer dran ist, wenn die Bombe explodiert, trinkt.</p>
      <div class="big">${aktuelleKarte}</div>
      <p>Timer läuft geheim zwischen 10 und 90 Sekunden.</p>
      <button onclick="bombeStart()">Bombe starten</button>
      <button class="secondary" onclick="${weiterMitSpieler("bombeModus()")}">Überspringen</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}

function bombeStart() {
  clearInterval(bombeTimer);

  app.innerHTML = `
    <div class="card">
      <h2>💣 Bombe läuft!</h2>
      <p>Dran ist: <b>${spielerDran()}</b></p>
      <p>Sagt reihum Begriffe zur Kategorie:</p>
      <div class="big">${aktuelleKarte}</div>
      <p>Gebt das Handy weiter. Timer ist versteckt.</p>
      <button class="secondary" onclick="bombeAbbrechen()">Abbrechen</button>
    </div>
  `;

  bombeTimer = setTimeout(() => {
    app.innerHTML = `
      <div class="card">
        <h2>💥 BOOM!</h2>
        <div class="big">Die Bombe ist explodiert!</div>
        <p><b>${spielerDran()}</b> war dran.</p>
        <p>${spielerDran()} trinkt ${schlucke()} Schlücke.</p>
        <button onclick="${weiterMitSpieler("bombeModus()")}">Weiter</button>
        <button class="secondary" onclick="${weiterMitSpieler("bombeModus()")}">Neue Bombe</button>
        <button class="secondary" onclick="menuScreen()">Menü</button>
      </div>
    `;
  }, bombeZeit * 1000);
}

function bombeAbbrechen() {
  clearInterval(bombeTimer);
  bombeModus();
}

let duemmsteTimer = null;
let duemmsteZeit = 120;
let duemmsteSpielerIndex = 0;
let duemmsteRundenFragen = [];

function duemmsteFliegtStart() {
  clearInterval(timer);
  clearInterval(duemmsteTimer);

  duemmsteZeit = 120;
  duemmsteSpielerIndex = 0;
  duemmsteRundenFragen = [];

  duemmsteFliegtNaechsteFrage();
}

function duemmsteFliegtNaechsteFrage() {
  aktuelleKarte = zufaelligeKarte("duemmsteFliegt", DATEN.duemmsteFliegt);

  const aktuellerSpieler = spieler[duemmsteSpielerIndex];

  duemmsteRundenFragen.push({
    spieler: aktuellerSpieler,
    frage: aktuelleKarte.frage,
    antwort: aktuelleKarte.antwort
  });

  app.innerHTML = `
    <div class="card">
      <h2>🏆 Der Dümmste fliegt</h2>
      <p>Zeit: <b id="duemmsteTimer">${duemmsteZeit}</b> Sekunden</p>
      <p>Spieler: <b>${aktuellerSpieler}</b></p>
      <div class="big">${aktuelleKarte.frage}</div>
      <button onclick="duemmsteFliegtAntwort()">Antwort anzeigen</button>
      <button class="secondary" onclick="duemmsteFliegtWeiter()">Weiter ohne Antwort</button>
      <button class="secondary" onclick="duemmsteFliegtEnde()">Runde beenden</button>
    </div>
  `;

  if (!duemmsteTimer) {
    duemmsteTimer = setInterval(() => {
      duemmsteZeit--;

      const timerElement = document.getElementById("duemmsteTimer");

      if (timerElement) {
        timerElement.innerText = duemmsteZeit;
      }

      if (duemmsteZeit <= 0) {
        duemmsteFliegtEnde();
      }
    }, 1000);
  }
}

function duemmsteFliegtAntwort() {
  app.innerHTML = `
    <div class="card">
      <h2>Antwort</h2>
      <p>Zeit: <b id="duemmsteTimer">${duemmsteZeit}</b> Sekunden</p>
      <div class="big">${aktuelleKarte.antwort}</div>
      <p>War die Antwort komplett dumm? Merkt es euch.</p>
      <button onclick="duemmsteFliegtWeiter()">Nächste Frage</button>
      <button class="secondary" onclick="duemmsteFliegtEnde()">Runde beenden</button>
    </div>
  `;
}

function duemmsteFliegtWeiter() {
  duemmsteSpielerIndex++;

  if (duemmsteSpielerIndex >= spieler.length) {
    duemmsteSpielerIndex = 0;
  }

  duemmsteFliegtNaechsteFrage();
}

function duemmsteFliegtEnde() {
  clearInterval(duemmsteTimer);
  duemmsteTimer = null;

  const fragenHtml = duemmsteRundenFragen
    .map(eintrag => `
      <div class="answer-box">
        <b>${eintrag.spieler}</b><br>
        Frage: ${eintrag.frage}<br>
        Lösung: ${eintrag.antwort}
      </div>
    `)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>🏆 Runde vorbei</h2>
      <p>Schaut euch nochmal an, welche Fragen dran kamen.</p>
      ${fragenHtml}
      <p><b>Diskutiert jetzt:</b> Wer hatte die dümmste Antwort?</p>
      <p>Der Verlierer trinkt ${schlucke()} Schlücke.</p>
      <button onclick="${weiterAktion("duemmsteFliegtStart()")}">Weiter</button>
      <button class="secondary" onclick="duemmsteFliegtStart()">Neue Runde</button>
      <button class="secondary" onclick="menuScreen()">Menü</button>
    </div>
  `;
}
function zufaelligerSpieler() {
  return spieler[Math.floor(Math.random() * spieler.length)];
}

function gemischtAktionModus() {
  const spieler1 = zufaelligerSpieler();
  const spieler2 = zufaelligerSpieler();

  const aktionen = [
    `${spieler1} trinkt 2 Schlücke.`,
    `${spieler1} trinkt ${schlucke()} Schlücke.`,
    `${spieler1} darf ${schlucke()} Schlücke verteilen.`,
    `${spieler1} darf aussuchen, wer trinken muss.`,
    `${spieler1} darf eine Person bestimmen, die 2 Schlücke trinkt.`,
    `${spieler1} und ${spieler2} trinken beide ${schlucke()} Schlücke.`,
    `Alle trinken 1 Schluck.`,
    `Alle trinken 2 Schlücke.`,
    `Alle außer ${spieler1} trinken 1 Schluck.`,
    `${spieler1} ist sicher. Alle anderen trinken 1 Schluck.`,
    `${spieler1} verteilt 3 Schlücke.`,
    `${spieler1} sucht jemanden aus. Diese Person trinkt ${schlucke()} Schlücke.`
  ];

  const aktion = aktionen[Math.floor(Math.random() * aktionen.length)];

  app.innerHTML = `
    <div class="card">
      <h2>🎲 Gemischt-Aktion</h2>
      <div class="big">${aktion}</div>
      <button onclick="naechsterGemischtModus()">Weiter</button>
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
      "falscherBegriff",
      "pantomime",
      "aufzaehlen",
      "imposter",
      "bombe",
      "findeDenLuegner",
       "reime",
       "alphabetSpiel",
       "werWuerdeEher",
       "zweiLuegenEineWahrheit",
      "duemmsteFliegt",
      "gemischtAktion",
      "gemischtAktion",
      "gemischtAktion",
      "idiotentest"
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
      case "alphabetSpiel":
  alphabetSpielStart();
  break;
    case "schaetzfragen":
      quizModus("schaetzfragen");
      break;
      case "werWuerdeEher":
  werWuerdeEherModus();
  break;
      case "gemischtAktion":
    gemischtAktionModus();
    break;
    case "zweiLuegenEineWahrheit":
  zweiLuegenEineWahrheitModus();
  break;
    case "echtOderLuege":
      echtOderLuegeModus();
      break;
      case "woerterkette":
    woerterketteModus();
    break;
    case "falscherBegriff":
     falscherBegriffStart();
     break;
     case "bombe":
  bombeModus();
  break;
  case "duemmsteFliegt":
  duemmsteFliegtStart();
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
      case "reime":
  reimeModus();
  break;
      case "idiotentest":
       idiotentestModus();
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