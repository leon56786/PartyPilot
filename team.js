let teamModusAktiv = false;
let teams = [];
let teamDranIndex = 0;
let teamErstellenIndex = 1;
let teamAuswahl = [];

/* =========================
   TEAM-GEMISCHT STATUS
========================= */

let teamGemischtDeck = [];
let teamGemischtAktiv = false;

/* =========================
   TEAM-GRUNDLAGE
========================= */

function kannTeamModusStarten() {
  return spieler.length >= 4 && spieler.length % 2 === 0;
}

function aktuellesTeam() {
  if (teams.length === 0) return null;
  return teams[teamDranIndex % teams.length];
}

function naechstesTeam() {
  if (teams.length === 0) return;

  teamDranIndex++;

  if (teamDranIndex >= teams.length) {
    teamDranIndex = 0;
  }
}

function teamAnzeige() {
  return teams
    .map(team => `
      <div class="answer-box">
        <b>${team.name}</b><br>
        ${team.spieler.join(" & ")}<br>
        Punkte: ${team.punkte}
      </div>
    `)
    .join("");
}

function teamWeiterButton(normaleAktion, label) {
  if (teamGemischtAktiv) {
    return `<button onclick="naechsterTeamGemischtModus()">Weiter</button>`;
  }

  return `<button onclick="${normaleAktion}">${label}</button>`;
}

function teamZurueckButton() {
  if (teamGemischtAktiv) {
    return `<button class="secondary" onclick="teamGemischtBeenden()">Gemischt beenden</button>`;
  }

  return `<button class="secondary" onclick="teamMenuScreen()">Team-Menü</button>`;
}

function spielartScreen() {
  app.innerHTML = `
    <div class="card">
      <h2>Spielart wählen</h2>

      <p>Du hast <b>${spieler.length}</b> Spieler.</p>
      <p>Teammodus ist möglich, weil mindestens 4 Spieler dabei sind und die Anzahl gerade ist.</p>

      <button onclick="normalenModusStarten()">Normaler Modus</button>
      <button onclick="teamVorbereitungStarten()">Teammodus</button>

      <button class="secondary" onclick="spielerScreen()">Zurück</button>
    </div>
  `;
}

function normalenModusStarten() {
  teamModusAktiv = false;
  teamGemischtAktiv = false;
  teamGemischtDeck = [];
  teams = [];
  teamDranIndex = 0;

  menuScreen();
}

function teamVorbereitungStarten() {
  teamModusAktiv = true;
  teamGemischtAktiv = false;
  teamGemischtDeck = [];
  teams = [];
  teamDranIndex = 0;
  teamErstellenIndex = 1;
  teamAuswahl = [];

  teamErstellenScreen();
}

/* =========================
   TEAMS ERSTELLEN
========================= */

function teamErstellenScreen() {
  const freieSpieler = spieler.filter(name => {
    return !teams.some(team => team.spieler.includes(name));
  });

  if (freieSpieler.length === 0) {
    teamMenuScreen();
    return;
  }

  const spielerButtons = freieSpieler
    .map(name => {
      const aktiv = teamAuswahl.includes(name) ? "✅ " : "";
      const sichererName = encodeURIComponent(name);

      return `
        <button onclick="teamSpielerAuswaehlen('${sichererName}')">
          ${aktiv}${name}
        </button>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Team ${teamErstellenIndex} erstellen</h2>

      <p>Wähle genau <b>2 Spieler</b> für dieses Team.</p>
      <p>Ausgewählt: <b>${teamAuswahl.length}/2</b></p>

      ${spielerButtons}

      <button onclick="teamSpeichern()">Team speichern</button>
      <button class="secondary" onclick="teamVorbereitungStarten()">Teams zurücksetzen</button>
      <button class="secondary" onclick="spielerScreen()">Spieler ändern</button>
    </div>
  `;
}

function teamSpielerAuswaehlen(nameEncoded) {
  const name = decodeURIComponent(nameEncoded);

  if (teamAuswahl.includes(name)) {
    teamAuswahl = teamAuswahl.filter(s => s !== name);
  } else {
    if (teamAuswahl.length >= 2) {
      alert("Ein Team darf nur 2 Spieler haben.");
      return;
    }

    teamAuswahl.push(name);
  }

  teamErstellenScreen();
}

function teamSpeichern() {
  if (teamAuswahl.length !== 2) {
    alert("Bitte genau 2 Spieler auswählen.");
    return;
  }

  teams.push({
    name: `Team ${teamErstellenIndex}`,
    spieler: [...teamAuswahl],
    punkte: 0
  });

  teamErstellenIndex++;
  teamAuswahl = [];

  teamErstellenScreen();
}

/* =========================
   TEAM-MENÜ
========================= */

function teamMenuScreen() {
  teamGemischtAktiv = false;
  teamGemischtDeck = [];

  clearInterval(timer);

  if (typeof rundenTimer !== "undefined") {
    clearInterval(rundenTimer);
  }

  if (typeof bombeTimer !== "undefined") {
    clearTimeout(bombeTimer);
  }

  if (typeof teamDuellTimer !== "undefined") {
    clearInterval(teamDuellTimer);
  }

  if (typeof teamBombeTimer !== "undefined") {
    clearTimeout(teamBombeTimer);
  }
  if (typeof teamErklaerDuellTimer !== "undefined"){
    clearInterval(teamErklaerDuellTimer);
  } 

  app.innerHTML = `
    <div class="card">
      <h2>👥 Teammodus</h2>

      ${teamAnzeige()}

      <div class="grid">
        <button onclick="teamQuizModus('quiz')">🧠 Allgemeinwissen</button>
        <button onclick="teamQuizModus('schaetzfragen')">📏 Schätzfragen</button>
        <button onclick="teamBombeModus()">💣 Bombe</button>
        <button onclick="teamQuizModus('idiotentest')">🤓 Idiotentest</button>
        <button onclick="teamAufzaehlStart()">🔁 Aufzählen</button>
        <button onclick="teamTabuDuellStart()">🗣️ Tabu</button>
        <button onclick="teamPantomimeDuellStart()">🎭 Pantomime</button>
        <button onclick="teamAlphabetStart()">🔤 Alphabet-Spiel</button>
        <button onclick="teamReimeStart()">🎤 Reime</button>
        <button onclick="teamGleicheAntwortStart()">🤝 Gleiche Antwort</button>
        <button onclick="teamGedankenlesenStart()">🧠 Gedankenlesen</button>
        <button onclick="teamMemoryStart()">🧠 Team-Memory</button>
        <button onclick="teamKenntTeamStart()">👀 Wer kennt sein Team?</button>
        <button onclick="meinTeamKannStart()">💪 Mein Team kann</button>
        <button onclick="teamErklaerDuellStart()">🗣️ Erklär-Duell</button>
        <button onclick="teamGemischt()">🎲 Gemischt</button>
      </div>

      <button class="secondary" onclick="normalenModusStarten()">Normaler Modus</button>
      <button class="secondary" onclick="teamVorbereitungStarten()">Teams neu machen</button>
      <button class="secondary" onclick="spielerScreen()">Spieler ändern</button>
    </div>
  `;
}

/* =========================
   ERKLÄR-DUELL
========================= */

let teamErklaerDuellTeamIndex = 0;
let teamErklaerDuellZeit = 60;
let teamErklaerDuellTimer = null;
let teamErklaerDuellPunkte = [];
let teamErklaerDuellWort = "";
let teamErklaerDuellBenutzteWorte = [];
let teamErklaerDuellErklaerer = "";
let teamErklaerDuellRater = [];

function teamErklaerDuellStart() {
  teamErklaerDuellTeamIndex = 0;
  teamErklaerDuellPunkte = teams.map(() => 0);
  teamErklaerDuellBenutzteWorte = [];

  teamErklaerDuellVorbereitung();
}

function teamErklaerDuellSpielerFestlegen() {
  const team = teams[teamErklaerDuellTeamIndex];

  teamErklaerDuellErklaerer =
    team.spieler[Math.floor(Math.random() * team.spieler.length)];

  teamErklaerDuellRater = team.spieler.filter(spieler => spieler !== teamErklaerDuellErklaerer);

  if (teamErklaerDuellRater.length === 0) {
    teamErklaerDuellRater = [teamErklaerDuellErklaerer];
  }
}

function teamErklaerDuellWortZiehen() {
  let verfuegbareWorte = DATEN.erklaerDuell.filter(wort => {
    return !teamErklaerDuellBenutzteWorte.includes(wort);
  });

  if (verfuegbareWorte.length === 0) {
    teamErklaerDuellBenutzteWorte = [];
    verfuegbareWorte = [...DATEN.erklaerDuell];
  }

  const wort = verfuegbareWorte[Math.floor(Math.random() * verfuegbareWorte.length)];

  teamErklaerDuellBenutzteWorte.push(wort);

  return wort;
}

function teamErklaerDuellVorbereitung() {
  clearInterval(teamErklaerDuellTimer);
  teamErklaerDuellTimer = null;

  const team = teams[teamErklaerDuellTeamIndex];

  if (!team) {
    teamErklaerDuellAuswertung();
    return;
  }

  teamErklaerDuellSpielerFestlegen();

  app.innerHTML = `
    <div class="card">
      <h2>🗣️ Erklär-Duell</h2>

      <p>Jetzt dran:</p>
      <div class="big">${team.name}</div>

      <div class="answer-box">
        Erklärt: <b>${teamErklaerDuellErklaerer}</b><br>
        Rät: <b>${teamErklaerDuellRater.join(" & ")}</b>
      </div>

      <p>Ihr habt <b>60 Sekunden</b>.</p>
      <p>Erkläre so viele Wörter wie möglich.</p>

      <p><b>Wichtig:</b> Das Wort selbst und direkte Wortteile dürfen nicht gesagt werden.</p>
      <p>Beispiel: Bei Hundefutter darf man nicht Hund oder Futter sagen.</p>

      <button onclick="teamErklaerDuellRundeStart()">Timer starten</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamErklaerDuellRundeStart() {
  teamErklaerDuellZeit = 60;
  teamErklaerDuellWort = teamErklaerDuellWortZiehen();

  clearInterval(teamErklaerDuellTimer);

  teamErklaerDuellScreenZeichnen();

  teamErklaerDuellTimer = setInterval(() => {
    teamErklaerDuellZeit--;

    if (teamErklaerDuellZeit <= 0) {
      clearInterval(teamErklaerDuellTimer);
      teamErklaerDuellTimer = null;
      teamErklaerDuellRundeEnde();
      return;
    }

    teamErklaerDuellScreenZeichnen();
  }, 1000);
}

function teamErklaerDuellScreenZeichnen() {
  const team = teams[teamErklaerDuellTeamIndex];

  app.innerHTML = `
    <div class="card">
      <h2>🗣️ Erklär-Duell</h2>

      <p>Team: <b>${team.name}</b></p>

      <p>Zeit:</p>
      <div class="big">${teamErklaerDuellZeit}</div>

      <p>Aktuelles Wort:</p>
      <div class="big">${teamErklaerDuellWort}</div>

      <div class="answer-box">
        Erklärt: <b>${teamErklaerDuellErklaerer}</b><br>
        Rät: <b>${teamErklaerDuellRater.join(" & ")}</b>
      </div>

      <p>Richtige Wörter: <b>${teamErklaerDuellPunkte[teamErklaerDuellTeamIndex]}</b></p>

      <button onclick="teamErklaerDuellRichtig()">Richtig</button>
      <button class="secondary" onclick="teamErklaerDuellWeiter()">Überspringen</button>
      <button class="secondary" onclick="teamErklaerDuellRundeEnde()">Runde beenden</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamErklaerDuellRichtig() {
  teamErklaerDuellPunkte[teamErklaerDuellTeamIndex]++;
  teamErklaerDuellWort = teamErklaerDuellWortZiehen();
  teamErklaerDuellScreenZeichnen();
}

function teamErklaerDuellWeiter() {
  teamErklaerDuellWort = teamErklaerDuellWortZiehen();
  teamErklaerDuellScreenZeichnen();
}

function teamErklaerDuellRundeEnde() {
  clearInterval(teamErklaerDuellTimer);
  teamErklaerDuellTimer = null;

  const team = teams[teamErklaerDuellTeamIndex];

  app.innerHTML = `
    <div class="card">
      <h2>Runde vorbei</h2>

      <p><b>${team.name}</b> hat geschafft:</p>
      <div class="big">${teamErklaerDuellPunkte[teamErklaerDuellTeamIndex]}</div>

      <p>richtige Wörter</p>

      <button onclick="teamErklaerDuellNaechstesTeam()">Weiter</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamErklaerDuellNaechstesTeam() {
  teamErklaerDuellTeamIndex++;

  if (teamErklaerDuellTeamIndex >= teams.length) {
    teamErklaerDuellAuswertung();
    return;
  }

  teamErklaerDuellVorbereitung();
}

function teamErklaerDuellAuswertung() {
  clearInterval(teamErklaerDuellTimer);
  teamErklaerDuellTimer = null;

  const hoechstePunkte = Math.max(...teamErklaerDuellPunkte);

  const gewinnerIndexes = teamErklaerDuellPunkte
    .map((punkte, index) => ({ punkte, index }))
    .filter(eintrag => eintrag.punkte === hoechstePunkte && hoechstePunkte > 0)
    .map(eintrag => eintrag.index);

  let auswertungText = "";

  if (gewinnerIndexes.length === 0) {
    auswertungText = `
      <div class="big">Kein Gewinner</div>
      <p>Kein Team hat ein Wort erraten.</p>
      <p>Alle trinken ${schlucke()} Schlücke.</p>
    `;
  } else if (gewinnerIndexes.length === 1) {
    const gewinnerTeam = teams[gewinnerIndexes[0]];
    gewinnerTeam.punkte += 2;

    auswertungText = `
      <div class="big">${gewinnerTeam.name} gewinnt!</div>
      <p>${gewinnerTeam.name} bekommt <b>+2 Punkte</b>.</p>
      <p>Alle anderen Teams trinken ${schlucke()} Schlücke.</p>
    `;
  } else {
    gewinnerIndexes.forEach(index => {
      teams[index].punkte++;
    });

    const namen = gewinnerIndexes.map(index => teams[index].name).join(", ");

    auswertungText = `
      <div class="big">Gleichstand!</div>
      <p>${namen} bekommen jeweils <b>+1 Punkt</b>.</p>
      <p>Alle anderen Teams trinken ${schlucke()} Schlücke.</p>
    `;
  }

  const punkteHtml = teams
    .map((team, index) => `
      <div class="answer-box">
        <b>${team.name}</b><br>
        Erklärte Wörter: ${teamErklaerDuellPunkte[index]}
      </div>
    `)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>🗣️ Erklär-Duell Ergebnis</h2>

      ${punkteHtml}

      ${auswertungText}

      ${teamAnzeige()}

      ${teamWeiterButton("teamErklaerDuellStart()", "Neue Runde")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   MEIN TEAM KANN
========================= */

let meinTeamKannKarte = null;

let meinTeamKannTeamAIndex = 0;
let meinTeamKannTeamBIndex = 1;

let meinTeamKannGebotA = 0;
let meinTeamKannGebotB = 0;

let meinTeamKannAktivesTeamIndex = 0;
let meinTeamKannGegnerTeamIndex = 1;

let meinTeamKannPokerSpielerA = "";
let meinTeamKannPokerSpielerB = "";

let meinTeamKannMacherA = [];
let meinTeamKannMacherB = [];

function meinTeamKannStart() {
  if (teams.length < 2) {
    alert("Für Mein Team kann brauchst du mindestens 2 Teams.");
    return;
  }

  meinTeamKannKarte = zufaelligeKarte("meinTeamKann", DATEN.meinTeamKann);

  meinTeamKannTeamAIndex = teamDranIndex % teams.length;
  meinTeamKannTeamBIndex = (teamDranIndex + 1) % teams.length;

  meinTeamKannGebotA = 0;
  meinTeamKannGebotB = 0;

  meinTeamKannSpielerFestlegen();

  meinTeamKannPokerScreen();
}

function meinTeamKannSpielerFestlegen() {
  const teamA = teams[meinTeamKannTeamAIndex];
  const teamB = teams[meinTeamKannTeamBIndex];

  meinTeamKannPokerSpielerA = teamA.spieler[Math.floor(Math.random() * teamA.spieler.length)];
  meinTeamKannPokerSpielerB = teamB.spieler[Math.floor(Math.random() * teamB.spieler.length)];

  meinTeamKannMacherA = teamA.spieler.filter(spieler => spieler !== meinTeamKannPokerSpielerA);
  meinTeamKannMacherB = teamB.spieler.filter(spieler => spieler !== meinTeamKannPokerSpielerB);

  if (meinTeamKannMacherA.length === 0) {
    meinTeamKannMacherA = [meinTeamKannPokerSpielerA];
  }

  if (meinTeamKannMacherB.length === 0) {
    meinTeamKannMacherB = [meinTeamKannPokerSpielerB];
  }
}

function meinTeamKannPokerScreen() {
  const teamA = teams[meinTeamKannTeamAIndex];
  const teamB = teams[meinTeamKannTeamBIndex];

  app.innerHTML = `
    <div class="card">
      <h2>💪 Mein Team kann</h2>

      <p>Challenge:</p>
      <div class="big">${meinTeamKannKarte.aufgabe}</div>

      <p><b>Maximum:</b> ${meinTeamKannKarte.max}</p>
      <p><b>Einheit:</b> ${meinTeamKannKarte.einheit}</p>

      <div class="answer-box">
        <b>${teamA.name}</b><br>
        Poker-Spieler: <b>${meinTeamKannPokerSpielerA}</b><br>
        Aufgabe macht: <b>${meinTeamKannMacherA.join(" & ")}</b>
      </div>

      <div class="answer-box">
        <b>${teamB.name}</b><br>
        Poker-Spieler: <b>${meinTeamKannPokerSpielerB}</b><br>
        Aufgabe macht: <b>${meinTeamKannMacherB.join(" & ")}</b>
      </div>

      <p>Die Poker-Spieler schätzen nur ein und dürfen die Aufgabe nicht machen.</p>

      <label>${teamA.name} bietet:</label>
      <input id="meinTeamKannGebotA" type="number" min="0" placeholder="z. B. 10">

      <label>${teamB.name} bietet:</label>
      <input id="meinTeamKannGebotB" type="number" min="0" placeholder="z. B. 12">

      <button onclick="meinTeamKannGeboteSpeichern()">Gebote speichern</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function meinTeamKannGeboteSpeichern() {
  const inputA = document.getElementById("meinTeamKannGebotA");
  const inputB = document.getElementById("meinTeamKannGebotB");

  meinTeamKannGebotA = Number(inputA.value);
  meinTeamKannGebotB = Number(inputB.value);

  if (!meinTeamKannGebotA || !meinTeamKannGebotB || meinTeamKannGebotA <= 0 || meinTeamKannGebotB <= 0) {
    alert("Beide Teams müssen eine Zahl größer als 0 bieten.");
    return;
  }

  if (meinTeamKannGebotA === meinTeamKannGebotB) {
    alert("Beide Teams haben gleich viel geboten. Einer muss höher pokern.");
    return;
  }

  if (meinTeamKannGebotA > meinTeamKannGebotB) {
    meinTeamKannAktivesTeamIndex = meinTeamKannTeamAIndex;
    meinTeamKannGegnerTeamIndex = meinTeamKannTeamBIndex;
  } else {
    meinTeamKannAktivesTeamIndex = meinTeamKannTeamBIndex;
    meinTeamKannGegnerTeamIndex = meinTeamKannTeamAIndex;
  }

  meinTeamKannChallengeScreen();
}

function meinTeamKannChallengeScreen() {
  const aktivesTeam = teams[meinTeamKannAktivesTeamIndex];
  const gegnerTeam = teams[meinTeamKannGegnerTeamIndex];

  const gebot = meinTeamKannAktivesTeamIndex === meinTeamKannTeamAIndex
    ? meinTeamKannGebotA
    : meinTeamKannGebotB;

  const pokerSpieler = meinTeamKannAktivesTeamIndex === meinTeamKannTeamAIndex
    ? meinTeamKannPokerSpielerA
    : meinTeamKannPokerSpielerB;

  const macher = meinTeamKannAktivesTeamIndex === meinTeamKannTeamAIndex
    ? meinTeamKannMacherA
    : meinTeamKannMacherB;

  app.innerHTML = `
    <div class="card">
      <h2>💪 Challenge</h2>

      <p>Challenge:</p>
      <div class="big">${meinTeamKannKarte.aufgabe}</div>

      <p><b>Maximum:</b> ${meinTeamKannKarte.max}</p>

      <p><b>${aktivesTeam.name}</b> hat höher gepokert.</p>
      <p>Ziel: <b>${gebot} ${meinTeamKannKarte.einheit}</b></p>

      <div class="answer-box">
        <b>${aktivesTeam.name}</b><br>
        Poker-Spieler: <b>${pokerSpieler}</b><br>
        Der Poker-Spieler darf NICHT mitmachen.<br><br>
        Aufgabe macht: <b>${macher.join(" & ")}</b>
      </div>

      <p>Gegnerteam: <b>${gegnerTeam.name}</b></p>

      <button onclick="meinTeamKannGeschafft()">Geschafft</button>
      <button class="secondary" onclick="meinTeamKannNichtGeschafft()">Nicht geschafft</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function meinTeamKannGeschafft() {
  const aktivesTeam = teams[meinTeamKannAktivesTeamIndex];

  aktivesTeam.punkte += 2;

  meinTeamKannErgebnisScreen(true);
}

function meinTeamKannNichtGeschafft() {
  const gegnerTeam = teams[meinTeamKannGegnerTeamIndex];

  gegnerTeam.punkte += 1;

  meinTeamKannErgebnisScreen(false);
}

function meinTeamKannErgebnisScreen(geschafft) {
  const aktivesTeam = teams[meinTeamKannAktivesTeamIndex];
  const gegnerTeam = teams[meinTeamKannGegnerTeamIndex];

  const gebot = meinTeamKannAktivesTeamIndex === meinTeamKannTeamAIndex
    ? meinTeamKannGebotA
    : meinTeamKannGebotB;

  const pokerSpieler = meinTeamKannAktivesTeamIndex === meinTeamKannTeamAIndex
    ? meinTeamKannPokerSpielerA
    : meinTeamKannPokerSpielerB;

  const macher = meinTeamKannAktivesTeamIndex === meinTeamKannTeamAIndex
    ? meinTeamKannMacherA
    : meinTeamKannMacherB;

  let text = "";

  if (geschafft) {
    text = `
      <div class="big">${aktivesTeam.name} hat es geschafft!</div>
      <p>${aktivesTeam.name} bekommt <b>+2 Punkte</b>.</p>
      <p>${gegnerTeam.name} trinkt ${schlucke()} Schlücke.</p>
    `;
  } else {
    text = `
      <div class="big">${aktivesTeam.name} hat es nicht geschafft!</div>
      <p>${gegnerTeam.name} bekommt <b>+1 Punkt</b>.</p>
      <p>${aktivesTeam.name} trinkt ${schlucke()} Schlücke.</p>
    `;
  }

  teamDranIndex++;
  if (teamDranIndex >= teams.length) {
    teamDranIndex = 0;
  }

  app.innerHTML = `
    <div class="card">
      <h2>💪 Ergebnis</h2>

      <p>Challenge:</p>
      <div class="big">${meinTeamKannKarte.aufgabe}</div>

      <p>Gebot: <b>${gebot} ${meinTeamKannKarte.einheit}</b></p>

      <div class="answer-box">
        <b>${aktivesTeam.name}</b><br>
        Poker-Spieler war: <b>${pokerSpieler}</b><br>
        Aufgabe gemacht von: <b>${macher.join(" & ")}</b>
      </div>

      ${text}

      ${teamAnzeige()}

      ${teamWeiterButton("meinTeamKannStart()", "Neue Challenge")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   WER KENNT DEIN TEAM?
========================= */

let teamKenntTeamFrage = "";
let teamKenntTeamAuswahl = [];

function teamKenntTeamStart() {
  teamKenntTeamFrage = zufaelligeKarte("teamKenntTeam", DATEN.teamKenntTeam);
  teamKenntTeamAuswahl = [];

  app.innerHTML = `
    <div class="card">
      <h2>👀 Wer kennt dein Team?</h2>

      <p>Frage:</p>
      <div class="big">${teamKenntTeamFrage}</div>

      <p>Jedes Team entscheidet intern gleichzeitig.</p>
      <p>Beide Spieler zeigen auf eine Person aus ihrem eigenen Team.</p>
      <p>Wenn beide im Team auf dieselbe Person zeigen, hat das Team es geschafft.</p>

      <button onclick="teamKenntTeamAuswahlScreen()">Antworten prüfen</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamKenntTeamAuswahlScreen() {
  teamKenntTeamAuswahl = [];
  teamKenntTeamAuswahlNeuZeichnen();
}

function teamKenntTeamAuswahlNeuZeichnen() {
  const buttonsHtml = teams
    .map((team, index) => {
      const aktiv = teamKenntTeamAuswahl.includes(index) ? "✅ " : "";

      return `
        <button onclick="teamKenntTeamToggle(${index})">
          ${aktiv}${team.name} richtig
        </button>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Wer war sich einig?</h2>

      <p>Frage:</p>
      <div class="big">${teamKenntTeamFrage}</div>

      <p>Wähle alle Teams aus, bei denen beide Spieler dieselbe Person gewählt haben.</p>

      ${buttonsHtml}

      <button onclick="teamKenntTeamSpeichern()">Punkte speichern</button>
      <button class="secondary" onclick="teamKenntTeamAlleRichtig()">Alle richtig</button>
      <button class="secondary" onclick="teamKenntTeamKeinerRichtig()">Keiner richtig</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamKenntTeamToggle(index) {
  if (teamKenntTeamAuswahl.includes(index)) {
    teamKenntTeamAuswahl = teamKenntTeamAuswahl.filter(i => i !== index);
  } else {
    teamKenntTeamAuswahl.push(index);
  }

  teamKenntTeamAuswahlNeuZeichnen();
}

function teamKenntTeamAlleRichtig() {
  teamKenntTeamAuswahl = teams.map((team, index) => index);
  teamKenntTeamSpeichern();
}

function teamKenntTeamKeinerRichtig() {
  teamKenntTeamAuswahl = [];
  teamKenntTeamSpeichern();
}

function teamKenntTeamSpeichern() {
  teamKenntTeamAuswahl.forEach(index => {
    teams[index].punkte++;
  });

  const nichtGeschafft = teams
    .map((team, index) => ({ team, index }))
    .filter(eintrag => !teamKenntTeamAuswahl.includes(eintrag.index));

  const geschafftHtml = teamKenntTeamAuswahl
    .map(index => `
      <div class="answer-box">
        <b>${teams[index].name}</b><br>
        gleiche Person gewählt → +1 Punkt
      </div>
    `)
    .join("");

  const nichtGeschafftHtml = nichtGeschafft
    .map(eintrag => `
      <div class="answer-box">
        <b>${eintrag.team.name}</b><br>
        unterschiedlich gewählt → trinken
      </div>
    `)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>👀 Ergebnis</h2>

      <p>Frage:</p>
      <div class="big">${teamKenntTeamFrage}</div>

      <p><b>Geschafft:</b></p>
      ${geschafftHtml || "<p>Kein Team hat es geschafft.</p>"}

      <p><b>Nicht geschafft:</b></p>
      ${nichtGeschafftHtml || "<p>Alle Teams haben es geschafft.</p>"}

      <p>Teams, die unterschiedlich gewählt haben, trinken ${schlucke()} Schlücke.</p>

      ${teamAnzeige()}

      ${teamWeiterButton("teamKenntTeamStart()", "Neue Frage")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   TEAM-MEMORY
========================= */

let teamMemoryWorte = [];
let teamMemoryZeit = 10;
let teamMemoryTimer = null;
let teamMemoryTeamIndex = 0;
let teamMemoryPunkte = [];
let teamMemoryGesagteRichtige = 0;

function teamMemoryStart() {
  teamMemoryWorte = [
    ...teamMemoryZieheWorte("leicht", 3),
    ...teamMemoryZieheWorte("mittel", 4),
    ...teamMemoryZieheWorte("schwer", 3)
  ];

  teamMemoryWorte.sort(() => Math.random() - 0.5);

  teamMemoryZeit = 10;
  teamMemoryTeamIndex = 0;
  teamMemoryGesagteRichtige = 0;
  teamMemoryPunkte = teams.map(() => 0);

  teamMemoryVorbereitung();
}

function teamMemoryZieheWorte(schwierigkeit, anzahl) {
  const passendeWorte = DATEN.teamMemory
    .filter(eintrag => eintrag.schwierigkeit === schwierigkeit)
    .sort(() => Math.random() - 0.5);

  return passendeWorte.slice(0, anzahl).map(eintrag => eintrag.wort);
}

function teamMemoryVorbereitung() {
  const wortHtml = teamMemoryWorte
    .map(wort => `<div class="answer-box"><b>${wort}</b></div>`)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>🧠 Team-Memory</h2>

      <p>Merkt euch diese <b>10 Wörter</b>.</p>
      <p>Ihr habt <b>10 Sekunden</b> Zeit.</p>

      <div class="grid">
        ${wortHtml}
      </div>

      <button onclick="teamMemoryAnzeigen()">Timer starten</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamMemoryAnzeigen() {
  clearInterval(teamMemoryTimer);
  teamMemoryZeit = 10;

  teamMemoryScreenZeichnen();

  teamMemoryTimer = setInterval(() => {
    teamMemoryZeit--;

    if (teamMemoryZeit <= 0) {
      clearInterval(teamMemoryTimer);
      teamMemoryTimer = null;
      teamMemoryRateStart();
      return;
    }

    teamMemoryScreenZeichnen();
  }, 1000);
}

function teamMemoryScreenZeichnen() {
  const wortHtml = teamMemoryWorte
    .map(wort => `<div class="answer-box"><b>${wort}</b></div>`)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>🧠 Team-Memory</h2>

      <p>Zeit: <b>${teamMemoryZeit}</b> Sekunden</p>

      <div class="grid">
        ${wortHtml}
      </div>
    </div>
  `;
}

function teamMemoryRateStart() {
  teamMemoryTeamIndex = 0;

  app.innerHTML = `
    <div class="card">
      <h2>Wörter weg!</h2>

      <div class="big">Jetzt abwechselnd erinnern.</div>

      <p>Die Teams sagen nacheinander immer <b>1 Wort</b>.</p>
      <p>Du entscheidest, ob das Wort in der Liste war.</p>

      <button onclick="teamMemoryRateScreen()">Weiter</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamMemoryRateScreen() {
  const team = teams[teamMemoryTeamIndex];

  app.innerHTML = `
    <div class="card">
      <h2>🧠 Team-Memory</h2>

      <p>Jetzt sagt ein Wort:</p>
      <div class="big">${team.name}</div>
      <p>${team.spieler.join(" & ")}</p>

      <p>Richtige Wörter insgesamt: <b>${teamMemoryGesagteRichtige}/10</b></p>

      ${teamMemoryPunkteAnzeige()}

      <button onclick="teamMemoryRichtig()">Richtig</button>
      <button class="secondary" onclick="teamMemoryFalsch()">Falsch / Schon genannt</button>
      <button class="secondary" onclick="teamMemoryAuswertung()">Fertig auswerten</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamMemoryPunkteAnzeige() {
  return teams
    .map((team, index) => `
      <div class="answer-box">
        <b>${team.name}</b><br>
        Gemerkte Wörter: ${teamMemoryPunkte[index]}
      </div>
    `)
    .join("");
}

function teamMemoryRichtig() {
  teamMemoryPunkte[teamMemoryTeamIndex]++;
  teamMemoryGesagteRichtige++;

  if (teamMemoryGesagteRichtige >= 10) {
    teamMemoryAuswertung();
    return;
  }

  teamMemoryNaechstesTeam();
}

function teamMemoryFalsch() {
  teamMemoryNaechstesTeam();
}

function teamMemoryNaechstesTeam() {
  teamMemoryTeamIndex++;

  if (teamMemoryTeamIndex >= teams.length) {
    teamMemoryTeamIndex = 0;
  }

  teamMemoryRateScreen();
}

function teamMemoryAuswertung() {
  clearInterval(teamMemoryTimer);
  teamMemoryTimer = null;

  const hoechstePunkte = Math.max(...teamMemoryPunkte);
  const gewinnerIndexes = teamMemoryPunkte
    .map((punkte, index) => ({ punkte, index }))
    .filter(eintrag => eintrag.punkte === hoechstePunkte && hoechstePunkte > 0)
    .map(eintrag => eintrag.index);

  let auswertungText = "";

  if (gewinnerIndexes.length === 0) {
    auswertungText = `
      <div class="big">Kein Gewinner</div>
      <p>Kein Team hat ein Wort richtig genannt.</p>
      <p>Alle trinken ${schlucke()} Schlücke.</p>
    `;
  } else if (gewinnerIndexes.length === 1) {
    const gewinnerTeam = teams[gewinnerIndexes[0]];
    gewinnerTeam.punkte += 2;

    auswertungText = `
      <div class="big">${gewinnerTeam.name} gewinnt!</div>
      <p>${gewinnerTeam.name} bekommt <b>+2 Punkte</b>.</p>
      <p>Alle anderen Teams trinken ${schlucke()} Schlücke.</p>
    `;
  } else {
    gewinnerIndexes.forEach(index => {
      teams[index].punkte++;
    });

    const namen = gewinnerIndexes.map(index => teams[index].name).join(", ");

    auswertungText = `
      <div class="big">Gleichstand!</div>
      <p>${namen} bekommen jeweils <b>+1 Punkt</b>.</p>
      <p>Alle anderen Teams trinken ${schlucke()} Schlücke.</p>
    `;
  }

  const richtigeWorteHtml = teamMemoryWorte
    .map(wort => `<div class="answer-box">${wort}</div>`)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>🧠 Team-Memory Ergebnis</h2>

      ${teamMemoryPunkteAnzeige()}

      ${auswertungText}

      <p><b>Die 10 Wörter waren:</b></p>
      <div class="grid">
        ${richtigeWorteHtml}
      </div>

      ${teamAnzeige()}

      ${teamWeiterButton("teamMemoryStart()", "Neue Runde")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   GEDANKENLESEN
========================= */

let teamGedankenlesenSchwierigkeit = "";
let teamGedankenlesenTeamIndex = 0;
let teamGedankenlesenErgebnisse = [];
let teamGedankenlesenAktuellesWort = "";
let teamGedankenlesenVersuch = 1;
let teamGedankenlesenBenutzteWorte = [];

function teamGedankenlesenStart() {
  const schwierigkeiten = ["leicht", "mittel", "schwer"];

  teamGedankenlesenSchwierigkeit =
    schwierigkeiten[Math.floor(Math.random() * schwierigkeiten.length)];

  teamGedankenlesenTeamIndex = 0;
  teamGedankenlesenErgebnisse = [];
  teamGedankenlesenBenutzteWorte = [];

  teamGedankenlesenVorbereitung();
}

function teamGedankenlesenWortZiehen() {
  let passendeWorte = DATEN.gedankenlesen.filter(eintrag => {
    return (
      eintrag.schwierigkeit === teamGedankenlesenSchwierigkeit &&
      !teamGedankenlesenBenutzteWorte.includes(eintrag.wort)
    );
  });

  if (passendeWorte.length === 0) {
    passendeWorte = DATEN.gedankenlesen.filter(eintrag => {
      return eintrag.schwierigkeit === teamGedankenlesenSchwierigkeit;
    });
  }

  const zufall = passendeWorte[Math.floor(Math.random() * passendeWorte.length)];

  teamGedankenlesenBenutzteWorte.push(zufall.wort);

  return zufall.wort;
}

function teamGedankenlesenVorbereitung() {
  const team = teams[teamGedankenlesenTeamIndex];

  if (!team) {
    teamGedankenlesenAuswertung();
    return;
  }

  teamGedankenlesenAktuellesWort = teamGedankenlesenWortZiehen();
  teamGedankenlesenVersuch = 1;

  app.innerHTML = `
    <div class="card">
      <h2>🧠 Gedankenlesen</h2>

      <p>Jetzt dran:</p>
      <div class="big">${team.name}</div>
      <p>${team.spieler.join(" & ")}</p>

      <p>Schwierigkeit: <b>${teamGedankenlesenSchwierigkeit}</b></p>

      <p>Startwort:</p>
      <div class="big">${teamGedankenlesenAktuellesWort}</div>

      <p>Beide Spieler aus dem Team sagen gleichzeitig ein Wort, das dazu passt.</p>
      <p>Ziel: Beide müssen irgendwann dasselbe Wort sagen.</p>
      <p>Maximal <b>7 Versuche</b>.</p>

      <button onclick="teamGedankenlesenRundeScreen()">Starten</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamGedankenlesenRundeScreen() {
  const team = teams[teamGedankenlesenTeamIndex];

  app.innerHTML = `
    <div class="card">
      <h2>🧠 Gedankenlesen</h2>

      <p>Dran: <b>${team.name}</b></p>
      <p>${team.spieler.join(" & ")}</p>

      <p>Startwort:</p>
      <div class="big">${teamGedankenlesenAktuellesWort}</div>

      <p>Versuch: <b>${teamGedankenlesenVersuch}/7</b></p>

      <p>Beide zählen runter und sagen gleichzeitig ein passendes Wort.</p>

      <button onclick="teamGedankenlesenGeschafft()">Gleiche Antwort getroffen</button>
      <button class="secondary" onclick="teamGedankenlesenNaechsterVersuch()">Nächster Versuch</button>
      <button class="secondary" onclick="teamGedankenlesenNichtGeschafft()">Nicht geschafft</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamGedankenlesenNaechsterVersuch() {
  teamGedankenlesenVersuch++;

  if (teamGedankenlesenVersuch > 7) {
    teamGedankenlesenNichtGeschafft();
    return;
  }

  teamGedankenlesenRundeScreen();
}

function teamGedankenlesenGeschafft() {
  const team = teams[teamGedankenlesenTeamIndex];

  teamGedankenlesenErgebnisse.push({
    teamIndex: teamGedankenlesenTeamIndex,
    name: team.name,
    spieler: team.spieler,
    wort: teamGedankenlesenAktuellesWort,
    geschafft: true,
    versuche: teamGedankenlesenVersuch
  });

  teamGedankenlesenTeamIndex++;

  if (teamGedankenlesenTeamIndex >= teams.length) {
    teamGedankenlesenAuswertung();
    return;
  }

  teamGedankenlesenZwischenScreen();
}

function teamGedankenlesenNichtGeschafft() {
  const team = teams[teamGedankenlesenTeamIndex];

  teamGedankenlesenErgebnisse.push({
    teamIndex: teamGedankenlesenTeamIndex,
    name: team.name,
    spieler: team.spieler,
    wort: teamGedankenlesenAktuellesWort,
    geschafft: false,
    versuche: 7
  });

  teamGedankenlesenTeamIndex++;

  if (teamGedankenlesenTeamIndex >= teams.length) {
    teamGedankenlesenAuswertung();
    return;
  }

  teamGedankenlesenZwischenScreen();
}

function teamGedankenlesenZwischenScreen() {
  const naechstesTeam = teams[teamGedankenlesenTeamIndex];

  app.innerHTML = `
    <div class="card">
      <h2>Nächstes Team</h2>

      <p>Jetzt ist dran:</p>
      <div class="big">${naechstesTeam.name}</div>
      <p>${naechstesTeam.spieler.join(" & ")}</p>

      <p>Das nächste Team bekommt ein anderes Wort mit ungefähr gleicher Schwierigkeit.</p>

      <button onclick="teamGedankenlesenVorbereitung()">Weiter</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamGedankenlesenAuswertung() {
  const ergebnisHtml = teamGedankenlesenErgebnisse
    .map(eintrag => {
      if (eintrag.geschafft) {
        teams[eintrag.teamIndex].punkte++;

        return `
          <div class="answer-box">
            <b>${eintrag.name}</b><br>
            Wort: ${eintrag.wort}<br>
            Geschafft in Versuch ${eintrag.versuche}<br>
            +1 Punkt
          </div>
        `;
      }

      return `
        <div class="answer-box">
          <b>${eintrag.name}</b><br>
          Wort: ${eintrag.wort}<br>
          Nicht geschafft<br>
          Trinkt ${schlucke()} Schlücke
        </div>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>🧠 Gedankenlesen Ergebnis</h2>

      <p>Alle Teams hatten Wörter mit ungefähr gleicher Schwierigkeit.</p>

      ${ergebnisHtml}

      ${teamAnzeige()}

      ${teamWeiterButton("teamGedankenlesenStart()", "Neue Runde")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   FRAGEN-MODI
   Allgemeinwissen, Schätzfragen, Idiotentest
========================= */

let teamAktuelleKarte = null;
let teamAktuellerTyp = "";
let teamRichtigeAuswahl = [];

function teamQuizModus(typ) {
  teamAktuellerTyp = typ;
  teamAktuelleKarte = zufaelligeKarte(typ, DATEN[typ]);
  teamRichtigeAuswahl = [];

  let titel = "🧠 Allgemeinwissen";

  if (typ === "schaetzfragen") {
    titel = "📏 Schätzfragen";
  }

  if (typ === "idiotentest") {
    titel = "🤓 Idiotentest";
  }

  app.innerHTML = `
    <div class="card">
      <h2>${titel}</h2>

      <p>Alle Teams beraten sich leise mit ihrem Team.</p>
      <p>Danach wird die Antwort angezeigt.</p>

      <div class="big">${teamAktuelleKarte.frage}</div>

      <button onclick="teamQuizAntwort()">Antwort anzeigen</button>
      <button class="secondary" onclick="teamQuizModus('${typ}')">Überspringen</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamQuizAntwort() {
  teamRichtigeAuswahl = [];
  teamQuizAuswahlScreen();
}

function teamQuizAuswahlScreen() {
  const buttonsHtml = teams
    .map((team, index) => {
      const aktiv = teamRichtigeAuswahl.includes(index) ? "✅ " : "";

      return `
        <button onclick="teamQuizTeamToggle(${index})">
          ${aktiv}${team.name} richtig
        </button>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Antwort</h2>

      <div class="big">${teamAktuelleKarte.antwort}</div>

      <p>Wähle alle Teams aus, die richtig lagen.</p>

      ${buttonsHtml}

      <button onclick="teamQuizPunkteSpeichern()">Punkte speichern</button>
      <button class="secondary" onclick="teamQuizAlleRichtig()">Alle richtig</button>
      <button class="secondary" onclick="teamQuizKeinerRichtig()">Keiner richtig</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamQuizTeamToggle(index) {
  if (teamRichtigeAuswahl.includes(index)) {
    teamRichtigeAuswahl = teamRichtigeAuswahl.filter(i => i !== index);
  } else {
    teamRichtigeAuswahl.push(index);
  }

  teamQuizAuswahlScreen();
}

function teamQuizPunkteSpeichern() {
  teamRichtigeAuswahl.forEach(index => {
    teams[index].punkte++;
  });

  let text = "Kein Team bekommt einen Punkt.";

  if (teamRichtigeAuswahl.length > 0) {
    const namen = teamRichtigeAuswahl.map(index => teams[index].name).join(", ");
    text = `${namen} bekommen +1 Punkt.`;
  }

  teamQuizPunkteScreen(text);
}

function teamQuizAlleRichtig() {
  teams.forEach(team => {
    team.punkte++;
  });

  teamQuizPunkteScreen("Alle Teams bekommen +1 Punkt.");
}

function teamQuizKeinerRichtig() {
  teamQuizPunkteScreen("Kein Team bekommt einen Punkt.");
}

function teamQuizPunkteScreen(text) {
  app.innerHTML = `
    <div class="card">
      <h2>Punkte vergeben</h2>

      <div class="big">${text}</div>

      ${teamAnzeige()}

      ${teamWeiterButton(`teamQuizModus('${teamAktuellerTyp}')`, "Nächste Frage")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   TABU / PANTOMIME TEAM-DUELL
========================= */

let teamDuellTyp = "";
let teamDuellTeamIndex = 0;
let teamDuellErgebnisse = [];
let teamDuellZeit = 60;
let teamDuellPunkte = 0;
let teamDuellTimer = null;
let teamDuellKarte = null;

function teamTabuDuellStart() {
  teamDuellStart("tabu");
}

function teamPantomimeDuellStart() {
  teamDuellStart("pantomime");
}

function teamDuellStart(typ) {
  clearInterval(teamDuellTimer);
  teamDuellTimer = null;

  teamDuellTyp = typ;
  teamDuellTeamIndex = 0;
  teamDuellErgebnisse = [];

  teamDuellVorbereitung();
}

function teamDuellVorbereitung() {
  clearInterval(teamDuellTimer);
  teamDuellTimer = null;

  const team = teams[teamDuellTeamIndex];

  if (!team) {
    teamMenuScreen();
    return;
  }

  teamDuellZeit = teamDuellTyp === "tabu" ? 60 : 90;
  teamDuellPunkte = 0;

  const titel = teamDuellTyp === "tabu" ? "🗣️ Team-Tabu" : "🎭 Team-Pantomime";

  app.innerHTML = `
    <div class="card">
      <h2>${titel}</h2>

      <p>Jetzt dran:</p>
      <div class="big">${team.name}</div>
      <p>${team.spieler.join(" & ")}</p>

      <p>
        ${
          teamDuellTyp === "tabu"
            ? "Erklärt so viele Wörter wie möglich. Die verbotenen Wörter dürfen nicht gesagt werden."
            : "Stellt so viele Begriffe wie möglich ohne Worte dar."
        }
      </p>

      <p>Pro richtig erratenem Begriff zählt 1 Punkt für diese Runde.</p>

      <button onclick="teamDuellRundeStarten()">Timer starten</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamDuellRundeStarten() {
  clearInterval(teamDuellTimer);
  teamDuellTimer = null;

  teamDuellNaechsteKarte();

  teamDuellTimer = setInterval(function () {
    teamDuellZeit--;

    const timerElement = document.getElementById("teamDuellTimer");

    if (timerElement) {
      timerElement.innerText = teamDuellZeit;
    }

    if (teamDuellZeit <= 0) {
      teamDuellRundeEnde();
    }
  }, 1000);
}

function teamDuellNaechsteKarte() {
  const team = teams[teamDuellTeamIndex];

  if (!team) {
    teamDuellAuswertung();
    return;
  }

  if (teamDuellTyp === "tabu") {
    teamDuellKarte = zufaelligeKarte("tabu", DATEN.tabu);

    app.innerHTML = `
      <div class="card">
        <h2>🗣️ Team-Tabu</h2>

        <p>Dran: <b>${team.name}</b></p>
        <p>${team.spieler.join(" & ")}</p>

        <p>Zeit: <b id="teamDuellTimer">${teamDuellZeit}</b> Sekunden</p>
        <p>Richtig erraten: <b>${teamDuellPunkte}</b></p>

        <div class="big">${teamDuellKarte.wort}</div>

        <p><b>Verboten:</b> ${teamDuellKarte.verboten.join(", ")}</p>

        <button onclick="teamDuellRichtig()">Richtig erraten</button>
        <button class="secondary" onclick="teamDuellNaechsteKarte()">Skippen</button>
        <button class="secondary" onclick="teamDuellRundeEnde()">Runde beenden</button>
      </div>
    `;

    return;
  }

  if (teamDuellTyp === "pantomime") {
    teamDuellKarte = zufaelligeKarte("pantomime", DATEN.pantomime);

    app.innerHTML = `
      <div class="card">
        <h2>🎭 Team-Pantomime</h2>

        <p>Dran: <b>${team.name}</b></p>
        <p>${team.spieler.join(" & ")}</p>

        <p>Zeit: <b id="teamDuellTimer">${teamDuellZeit}</b> Sekunden</p>
        <p>Richtig erraten: <b>${teamDuellPunkte}</b></p>

        <div class="big">${teamDuellKarte}</div>

        <p>Stellt den Begriff ohne Worte dar.</p>

        <button onclick="teamDuellRichtig()">Richtig erraten</button>
        <button class="secondary" onclick="teamDuellNaechsteKarte()">Skippen</button>
        <button class="secondary" onclick="teamDuellRundeEnde()">Runde beenden</button>
      </div>
    `;

    return;
  }

  teamMenuScreen();
}

function teamDuellRichtig() {
  teamDuellPunkte++;
  teamDuellNaechsteKarte();
}

function teamDuellRundeEnde() {
  clearInterval(teamDuellTimer);
  teamDuellTimer = null;

  const team = teams[teamDuellTeamIndex];

  if (!team) {
    teamDuellAuswertung();
    return;
  }

  teamDuellErgebnisse.push({
    teamIndex: teamDuellTeamIndex,
    name: team.name,
    spieler: team.spieler,
    punkte: teamDuellPunkte
  });

  teamDuellTeamIndex++;

  if (teamDuellTeamIndex >= teams.length) {
    teamDuellAuswertung();
    return;
  }

  teamDuellZwischenScreen();
}

function teamDuellZwischenScreen() {
  const naechstes = teams[teamDuellTeamIndex];

  app.innerHTML = `
    <div class="card">
      <h2>Nächstes Team</h2>

      <p>Jetzt ist dran:</p>
      <div class="big">${naechstes.name}</div>
      <p>${naechstes.spieler.join(" & ")}</p>

      <button onclick="teamDuellVorbereitung()">Weiter</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamDuellAuswertung() {
  clearInterval(teamDuellTimer);
  teamDuellTimer = null;

  if (teamDuellErgebnisse.length === 0) {
    teamMenuScreen();
    return;
  }

  const hoechstePunkte = Math.max(...teamDuellErgebnisse.map(e => e.punkte));
  const gewinner = teamDuellErgebnisse.filter(e => e.punkte === hoechstePunkte);

  const ergebnisHtml = teamDuellErgebnisse
    .map(e => `
      <div class="answer-box">
        <b>${e.name}</b><br>
        ${e.spieler.join(" & ")}<br>
        Richtig erraten: ${e.punkte}
      </div>
    `)
    .join("");

  let auswertungText = "";

  if (gewinner.length === 1) {
    const gewinnerTeam = teams[gewinner[0].teamIndex];
    gewinnerTeam.punkte++;

    auswertungText = `
      <div class="big">${gewinnerTeam.name} gewinnt!</div>
      <p>${gewinnerTeam.name} bekommt <b>+1 Punkt</b>.</p>
      <p>Die anderen Teams trinken ${schlucke()} Schlücke.</p>
    `;
  } else {
    auswertungText = `
      <div class="big">Unentschieden!</div>
      <p>Kein Team bekommt einen Punkt.</p>
      <p>Alle trinken 1 Schluck.</p>
    `;
  }

  const titel = teamDuellTyp === "tabu"
    ? "🗣️ Team-Tabu Ergebnis"
    : "🎭 Team-Pantomime Ergebnis";

  app.innerHTML = `
    <div class="card">
      <h2>${titel}</h2>

      ${ergebnisHtml}

      ${auswertungText}

      ${teamAnzeige()}

      ${teamWeiterButton(`teamDuellStart('${teamDuellTyp}')`, "Neue Runde")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   AUFZÄHLEN / REIME / ALPHABET
========================= */

let teamKettenTyp = "";
let teamKettenKategorie = "";
let teamKettenRundeNummer = 1;
let teamKettenBuchstaben = [];
let teamKettenBuchstabenIndex = 0;
let teamKettenAuswahl = [];

function teamAufzaehlStart() {
  teamKettenTyp = "aufzaehlen";
  teamKettenKategorie = zufaelligeKarte("aufzaehlen", DATEN.aufzaehlen);
  teamKettenRundeNummer = 1;
  teamKettenAuswahl = [];

  teamKettenAufgabeScreen();
}

function teamReimeStart() {
  teamKettenTyp = "reime";
  teamKettenKategorie = zufaelligeKarte("reime", DATEN.reime);
  teamKettenRundeNummer = 1;
  teamKettenAuswahl = [];

  teamKettenAufgabeScreen();
}

function teamAlphabetStart() {
  teamKettenTyp = "alphabet";
  teamKettenKategorie = zufaelligeKarte("alphabetSpiel", DATEN.alphabetSpiel);
  teamKettenRundeNummer = 1;
  teamKettenBuchstabenIndex = 0;
  teamKettenAuswahl = [];

  teamKettenBuchstaben = [
    "A", "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M", "N",
    "O", "P", "Q", "R", "S", "T", "U",
    "V", "W", "X", "Y", "Z"
  ];

  teamKettenAufgabeScreen();
}

function teamKettenAufgabeScreen() {
  let titel = "🔁 Team-Aufzählen";
  let aufgabe = teamKettenKategorie;
  let regel = "Jedes Team nennt eine passende Antwort. Danach wählst du aus, welche Teams es geschafft haben.";

  if (teamKettenTyp === "reime") {
    titel = "🎤 Team-Reime";
    aufgabe = `Reime auf: ${teamKettenKategorie}`;
    regel = "Jedes Team nennt ein passendes Reimwort. Danach wählst du aus, welche Teams es geschafft haben.";
  }

  if (teamKettenTyp === "alphabet") {
    titel = "🔤 Team-Alphabet";
    aufgabe = `${teamKettenKategorie} mit ${teamKettenBuchstaben[teamKettenBuchstabenIndex]}`;
    regel = "Jedes Team nennt ein passendes Wort mit dem Buchstaben. Danach wählst du aus, welche Teams es geschafft haben.";
  }

  app.innerHTML = `
    <div class="card">
      <h2>${titel}</h2>

      <p>Runde: <b>${teamKettenRundeNummer}</b></p>

      <p>Aufgabe:</p>
      <div class="big">${aufgabe}</div>

      <p>${regel}</p>

      <button onclick="teamKettenAuswahlScreen()">Antworten prüfen</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamKettenAuswahlScreen() {
  teamKettenAuswahl = [];
  teamKettenAuswahlNeuZeichnen();
}

function teamKettenAuswahlNeuZeichnen() {
  const buttonsHtml = teams
    .map((team, index) => {
      const aktiv = teamKettenAuswahl.includes(index) ? "✅ " : "";

      return `
        <button onclick="teamKettenTeamToggle(${index})">
          ${aktiv}${team.name} geschafft
        </button>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Wer hat es geschafft?</h2>

      <p>Wähle alle Teams aus, die eine richtige Antwort hatten.</p>

      ${buttonsHtml}

      <button onclick="teamKettenSpeichern()">Speichern</button>
      <button class="secondary" onclick="teamKettenAlleGeschafft()">Alle geschafft</button>
      <button class="secondary" onclick="teamKettenKeinerGeschafft()">Keiner geschafft</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamKettenTeamToggle(index) {
  if (teamKettenAuswahl.includes(index)) {
    teamKettenAuswahl = teamKettenAuswahl.filter(i => i !== index);
  } else {
    teamKettenAuswahl.push(index);
  }

  teamKettenAuswahlNeuZeichnen();
}

function teamKettenAlleGeschafft() {
  teamKettenAuswahl = teams.map((team, index) => index);
  teamKettenSpeichern();
}

function teamKettenKeinerGeschafft() {
  teamKettenAuswahl = [];
  teamKettenSpeichern();
}

function teamKettenSpeichern() {
  const nichtGeschafft = teams
    .map((team, index) => ({ team, index }))
    .filter(eintrag => !teamKettenAuswahl.includes(eintrag.index));

  if (teamKettenAuswahl.length === teams.length) {
    teamKettenNaechsteRunde();
    return;
  }

  teamKettenErgebnisScreen(nichtGeschafft);
}

function teamKettenNaechsteRunde() {
  teamKettenRundeNummer++;

  if (teamKettenTyp === "alphabet") {
    teamKettenBuchstabenIndex++;

    if (teamKettenBuchstabenIndex >= teamKettenBuchstaben.length) {
      teamKettenKomplettGeschafft();
      return;
    }
  }

  teamKettenAufgabeScreen();
}

function teamKettenErgebnisScreen(nichtGeschafft) {
  const verlorenHtml = nichtGeschafft
    .map(eintrag => `
      <div class="answer-box">
        <b>${eintrag.team.name}</b><br>
        hat es nicht geschafft
      </div>
    `)
    .join("");

  const geschafftHtml = teamKettenAuswahl
    .map(index => `
      <div class="answer-box">
        <b>${teams[index].name}</b><br>
        bekommt +1 Punkt
      </div>
    `)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Ergebnis</h2>

      <p><b>Geschafft:</b></p>
      ${geschafftHtml || "<p>Kein Team hat es geschafft.</p>"}

      <p><b>Nicht geschafft:</b></p>
      ${verlorenHtml || "<p>Keiner ist raus.</p>"}

      <p>Teams, die es geschafft haben, bekommen +1 Punkt.</p>
      <p>Teams, die es nicht geschafft haben, trinken ${schlucke()} Schlücke.</p>

      <button onclick="teamKettenPunkteSpeichern()">Punkte speichern</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamKettenPunkteSpeichern() {
  teamKettenAuswahl.forEach(index => {
    teams[index].punkte++;
  });

  app.innerHTML = `
    <div class="card">
      <h2>Punkte gespeichert</h2>

      ${teamAnzeige()}

      ${teamWeiterButton("teamKettenNeuStart()", "Neue Runde")}
      ${teamZurueckButton()}
    </div>
  `;
}

function teamKettenNeuStart() {
  if (teamKettenTyp === "aufzaehlen") {
    teamAufzaehlStart();
    return;
  }

  if (teamKettenTyp === "reime") {
    teamReimeStart();
    return;
  }

  if (teamKettenTyp === "alphabet") {
    teamAlphabetStart();
    return;
  }

  teamMenuScreen();
}

function teamKettenKomplettGeschafft() {
  app.innerHTML = `
    <div class="card">
      <h2>Geschafft</h2>

      <div class="big">Ihr habt die komplette Runde geschafft!</div>

      <p>Alle Teams bekommen +1 Punkt.</p>

      <button onclick="teamKettenAllePunkte()">Punkte speichern</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamKettenAllePunkte() {
  teams.forEach(team => {
    team.punkte++;
  });

  app.innerHTML = `
    <div class="card">
      <h2>Punkte gespeichert</h2>

      ${teamAnzeige()}

      ${teamWeiterButton("teamKettenNeuStart()", "Neue Runde")}
      ${teamZurueckButton()}
    </div>
  `;
}

/* =========================
   TEAM-BOMBE
========================= */

let teamBombeTimer = null;
let teamBombeZeit = 0;
let teamBombeKategorie = "";

function teamBombeModus() {
  teamBombeKategorie = zufaelligeKarte("bombe", DATEN.bombe);
  teamBombeZeit = Math.floor(Math.random() * 46) + 15;

  clearTimeout(teamBombeTimer);
  teamBombeTimer = null;

  app.innerHTML = `
    <div class="card">
      <h2>💣 Team-Bombe</h2>

      <p>Alle Teams spielen reihum.</p>
      <p>Wenn die Bombe explodiert, wählst du aus, welches Team gerade verloren hat.</p>

      <p>Kategorie:</p>
      <div class="big">${teamBombeKategorie}</div>

      <p>Timer läuft geheim zwischen 15 und 60 Sekunden.</p>

      <button onclick="teamBombeStart()">Bombe starten</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamBombeStart() {
  clearTimeout(teamBombeTimer);
  teamBombeTimer = null;

  app.innerHTML = `
    <div class="card">
      <h2>💣 Bombe läuft!</h2>

      <p>Kategorie:</p>
      <div class="big">${teamBombeKategorie}</div>

      <p>Gebt das Handy weiter oder spielt mündlich reihum.</p>
      <p>Der Timer ist versteckt.</p>

      <button class="secondary" onclick="teamBombeAbbrechen()">Abbrechen</button>
    </div>
  `;

  teamBombeTimer = setTimeout(() => {
    teamBombeExplodiert();
  }, teamBombeZeit * 1000);
}

function teamBombeExplodiert() {
  clearTimeout(teamBombeTimer);
  teamBombeTimer = null;

  const teamButtons = teams
    .map((team, index) => `
      <button onclick="teamBombeVerlierer(${index})">
        ${team.name} hat verloren
      </button>
    `)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>💥 BOOM!</h2>

      <div class="big">Die Bombe ist explodiert!</div>

      <p>Welches Team hat verloren?</p>

      ${teamButtons}

      ${teamZurueckButton()}
    </div>
  `;
}

function teamBombeVerlierer(index) {
  const verliererTeam = teams[index];

  teams.forEach((team, teamIndex) => {
    if (teamIndex !== index) {
      team.punkte++;
    }
  });

  app.innerHTML = `
    <div class="card">
      <h2>💥 Ergebnis</h2>

      <div class="big">${verliererTeam.name} hat verloren.</div>

      <p>${verliererTeam.name} trinkt ${schlucke()} Schlücke.</p>
      <p>Alle anderen Teams bekommen +1 Punkt.</p>

      ${teamAnzeige()}

      ${teamWeiterButton("teamBombeModus()", "Neue Bombe")}
      ${teamZurueckButton()}
    </div>
  `;
}

function teamBombeAbbrechen() {
  clearTimeout(teamBombeTimer);
  teamBombeTimer = null;

  teamBombeModus();
}

/* =========================
   TEAM-GEMISCHT
========================= */

function teamGemischt() {
  teamGemischtAktiv = true;
  teamGemischtDeck = [];
  naechsterTeamGemischtModus();
}

function naechsterTeamGemischtModus() {
  clearTimeout(teamBombeTimer);

  if (typeof teamDuellTimer !== "undefined") {
    clearInterval(teamDuellTimer);
  }

  if (typeof teamErklaerDuellTimer !== "undefined") {
    clearInterval(teamErklaerDuellTimer);
  }

  if (typeof teamMemoryTimer !== "undefined") {
    clearInterval(teamMemoryTimer);
  }

  if (teamGemischtDeck.length === 0) {
    teamGemischtDeck = [
      "quiz",
      "schaetzfragen",
      "idiotentest",
      "gleicheAntwort",
      "bombe",
      "aufzaehlen",
      "reime",
      "alphabet",
      "tabu",
      "pantomime",
      "gedankenlesen",
      "teamMemory",
      "teamKenntTeam",
      "meinTeamKann",
      "erklaerDuell"
    ];

    teamGemischtDeck.sort(() => Math.random() - 0.5);
  }

  const modus = teamGemischtDeck.pop();

  switch (modus) {
    case "quiz":
      teamQuizModus("quiz");
      break;

    case "schaetzfragen":
      teamQuizModus("schaetzfragen");
      break;

    case "idiotentest":
      teamQuizModus("idiotentest");
      break;

    case "gleicheAntwort":
      teamGleicheAntwortStart();
      break;

    case "gedankenlesen":
      teamGedankenlesenStart();
      break;

    case "teamMemory":
      teamMemoryStart();
      break;

    case "teamKenntTeam":
      teamKenntTeamStart();
      break;

    case "meinTeamKann":
      meinTeamKannStart();
      break;

    case "erklaerDuell":
      teamErklaerDuellStart();
      break;

    case "bombe":
      teamBombeModus();
      break;

    case "aufzaehlen":
      teamAufzaehlStart();
      break;

    case "reime":
      teamReimeStart();
      break;

    case "alphabet":
      teamAlphabetStart();
      break;

    case "tabu":
      teamTabuDuellStart();
      break;

    case "pantomime":
      teamPantomimeDuellStart();
      break;
  }
}

function teamGemischtBeenden() {
  teamGemischtAktiv = false;
  teamGemischtDeck = [];
  teamMenuScreen();
}

/* =========================
   PLATZHALTER
========================= */

/* =========================
   GLEICHE ANTWORT
========================= */

let teamGleicheAntwortKategorie = "";
let teamGleicheAntwortAuswahl = [];

function teamGleicheAntwortStart() {
  teamGleicheAntwortKategorie = zufaelligeKarte("gleicheAntwort", DATEN.gleicheAntwort);
  teamGleicheAntwortAuswahl = [];

  app.innerHTML = `
    <div class="card">
      <h2>🤝 Gleiche Antwort</h2>

      <p>Kategorie:</p>
      <div class="big">${teamGleicheAntwortKategorie}</div>

      <p>Jedes Team muss intern versuchen, dieselbe Antwort zu sagen.</p>
      <p>Beispiel Kategorie Automarken: Beide sagen BMW → geschafft.</p>

      <button onclick="teamGleicheAntwortAuswahlScreen()">Antworten prüfen</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamGleicheAntwortAuswahlScreen() {
  teamGleicheAntwortAuswahl = [];
  teamGleicheAntwortNeuZeichnen();
}

function teamGleicheAntwortNeuZeichnen() {
  const buttonsHtml = teams
    .map((team, index) => {
      const aktiv = teamGleicheAntwortAuswahl.includes(index) ? "✅ " : "";

      return `
        <button onclick="teamGleicheAntwortToggle(${index})">
          ${aktiv}${team.name} gleiche Antwort
        </button>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Wer hatte dieselbe Antwort?</h2>

      <p>Wähle alle Teams aus, bei denen beide Spieler dieselbe Antwort gesagt haben.</p>

      ${buttonsHtml}

      <button onclick="teamGleicheAntwortSpeichern()">Punkte speichern</button>
      <button class="secondary" onclick="teamGleicheAntwortAlle()">Alle geschafft</button>
      <button class="secondary" onclick="teamGleicheAntwortKeiner()">Keiner geschafft</button>
      ${teamZurueckButton()}
    </div>
  `;
}

function teamGleicheAntwortToggle(index) {
  if (teamGleicheAntwortAuswahl.includes(index)) {
    teamGleicheAntwortAuswahl = teamGleicheAntwortAuswahl.filter(i => i !== index);
  } else {
    teamGleicheAntwortAuswahl.push(index);
  }

  teamGleicheAntwortNeuZeichnen();
}

function teamGleicheAntwortAlle() {
  teamGleicheAntwortAuswahl = teams.map((team, index) => index);
  teamGleicheAntwortSpeichern();
}

function teamGleicheAntwortKeiner() {
  teamGleicheAntwortAuswahl = [];
  teamGleicheAntwortSpeichern();
}

function teamGleicheAntwortSpeichern() {
  teamGleicheAntwortAuswahl.forEach(index => {
    teams[index].punkte++;
  });

  const nichtGeschafft = teams
    .map((team, index) => ({ team, index }))
    .filter(eintrag => !teamGleicheAntwortAuswahl.includes(eintrag.index));

  const geschafftHtml = teamGleicheAntwortAuswahl
    .map(index => `
      <div class="answer-box">
        <b>${teams[index].name}</b><br>
        gleiche Antwort → +1 Punkt
      </div>
    `)
    .join("");

  const nichtGeschafftHtml = nichtGeschafft
    .map(eintrag => `
      <div class="answer-box">
        <b>${eintrag.team.name}</b><br>
        keine gleiche Antwort → trinken
      </div>
    `)
    .join("");

  app.innerHTML = `
    <div class="card">
      <h2>Ergebnis</h2>

      <p><b>Geschafft:</b></p>
      ${geschafftHtml || "<p>Kein Team hat es geschafft.</p>"}

      <p><b>Nicht geschafft:</b></p>
      ${nichtGeschafftHtml || "<p>Alle Teams haben es geschafft.</p>"}

      <p>Teams ohne gleiche Antwort trinken ${schlucke()} Schlücke.</p>

      ${teamAnzeige()}

      ${teamWeiterButton("teamGleicheAntwortStart()", "Neue Kategorie")}
      ${teamZurueckButton()}
    </div>
  `;
}