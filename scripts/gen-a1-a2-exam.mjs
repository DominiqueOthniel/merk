import fs from "node:fs";
import path from "node:path";

function match(id, title, section, level, exam, pairs, distractors = []) {
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill: "lesen",
    level,
    exam,
    format: "MATCH",
    options: [...pairs.map((p) => p.title), ...distractors],
    pairs,
    gaps: [],
  };
}

function reading(id, title, section, level, exam, passage, gaps) {
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill: "lesen",
    level,
    exam,
    format: "READING_MCQ",
    options: [],
    pairs: [],
    passage,
    gaps,
  };
}

function tf(id, title, section, skill, level, exam, passage, gaps, listenScript = null) {
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill,
    level,
    exam,
    format: "TF",
    options: gaps[0]?.choices ?? ["richtig", "falsch"],
    pairs: [],
    passage,
    gaps,
    ...(skill === "horen" ? { audioUrl: null, listenScript } : {}),
  };
}

function cloze(id, title, level, exam, passage, gaps) {
  return {
    sourceId: id,
    sourceTitle: title,
    section: "Sprachbausteine",
    skill: "sprachbausteine",
    level,
    exam,
    format: "CLOZE_MCQ",
    options: [],
    pairs: [],
    passage,
    gaps,
  };
}

function writeEx(id, title, level, exam, passage, prompt) {
  return {
    sourceId: id,
    sourceTitle: title,
    section: "Schreiben",
    skill: "schreiben",
    level,
    exam,
    format: "WRITE",
    options: [],
    pairs: [],
    passage,
    gaps: [
      {
        n: 1,
        answer: "done",
        choices: ["done"],
        prompt,
      },
    ],
  };
}

function speak(id, title, level, exam, passage) {
  return {
    sourceId: id,
    sourceTitle: title,
    section: "Sprechen",
    skill: "sprechen",
    level,
    exam,
    format: "SPEAK",
    options: [],
    pairs: [],
    passage,
    gaps: [
      {
        n: 1,
        answer: "done",
        choices: ["done"],
        prompt: "Prepare tes notes, enregistre-toi, puis marque comme pret.",
      },
    ],
  };
}

function buildA1(exam, prefix) {
  const L = "A1";
  return [
    match(
      `${prefix}-a1-l1-01`,
      "Kurze Anzeigen",
      "Lesen Teil 1",
      L,
      exam,
      [
        {
          title: "Wohnung zu vermieten",
          passage:
            "Helle 2-Zimmer-Wohnung in der Stadtmitte. 650 Euro warm. Ab 1. September frei. Tel. 030-112233.",
        },
        {
          title: "Kurs fuer Anfaenger",
          passage:
            "Deutschkurs A1 startet am Montag um 18 Uhr. Bitte melden Sie sich im Buero an.",
        },
        {
          title: "Fahrrad gefunden",
          passage: "Rotes Fahrrad am Bahnhof gefunden. Abholen beim Fundbuero.",
        },
        {
          title: "Arzttermin",
          passage:
            "Frau Meier, Ihr Termin ist am Dienstag um 10 Uhr. Bitte kommen Sie 10 Minuten frueher.",
        },
      ],
      ["Restaurant geoeffnet", "Zug faellt aus"],
    ),
    match(
      `${prefix}-a1-l1-02`,
      "Alltagstexte",
      "Lesen Teil 1",
      L,
      exam,
      [
        {
          title: "Supermarkt geoeffnet",
          passage:
            "Mo-Sa 8-20 Uhr. Sonntag geschlossen. Frisches Obst und Brot jeden Tag.",
        },
        {
          title: "Buslinie 12",
          passage:
            "Bus 12 faehrt alle 15 Minuten zum Krankenhaus. Endstation: Rathaus.",
        },
        {
          title: "Schwimmbad",
          passage:
            "Heute geoeffnet von 10 bis 18 Uhr. Eintritt 4 Euro. Kinder unter 6 frei.",
        },
        {
          title: "Bibliothek",
          passage:
            "Bitte geben Sie Buecher nach 3 Wochen zurueck. Karte an der Info holen.",
        },
      ],
      ["Kino geschlossen", "Parkplatz kostenlos"],
    ),
    reading(
      `${prefix}-a1-l2-01`,
      "Mein Tag",
      "Lesen Teil 2",
      L,
      exam,
      "Hallo, ich heisse Sara. Ich wohne in Berlin. Am Morgen stehe ich um sieben Uhr auf. Ich fruehstuecke und gehe zur Arbeit. Ich arbeite in einem Cafe. Am Abend lerne ich Deutsch. Am Wochenende treffe ich Freunde oder gehe spazieren.",
      [
        {
          n: 1,
          prompt: "Wo wohnt Sara?",
          answer: "In Berlin.",
          choices: ["In Berlin.", "In Hamburg.", "In Muenchen."],
        },
        {
          n: 2,
          prompt: "Wann steht sie auf?",
          answer: "Um sieben Uhr.",
          choices: ["Um sieben Uhr.", "Um neun Uhr.", "Um zwoelf Uhr."],
        },
        {
          n: 3,
          prompt: "Wo arbeitet sie?",
          answer: "In einem Cafe.",
          choices: ["In einem Cafe.", "In einer Schule.", "Im Krankenhaus."],
        },
        {
          n: 4,
          prompt: "Was macht sie am Abend?",
          answer: "Sie lernt Deutsch.",
          choices: [
            "Sie lernt Deutsch.",
            "Sie kocht nie.",
            "Sie fahrt nach Hause in Frankreich.",
          ],
        },
      ],
    ),
    reading(
      `${prefix}-a1-l2-02`,
      "Im Supermarkt",
      "Lesen Teil 2",
      L,
      exam,
      "Tom kauft heute ein. Er braucht Milch, Brot und Aepfel. Die Milch kostet 1,20 Euro. Das Brot ist frisch. An der Kasse zahlt er mit Karte. Dann geht er nach Hause und kocht.",
      [
        {
          n: 1,
          prompt: "Was braucht Tom?",
          answer: "Milch, Brot und Aepfel.",
          choices: ["Milch, Brot und Aepfel.", "Nur Wasser.", "Nur Fleisch."],
        },
        {
          n: 2,
          prompt: "Wie zahlt Tom?",
          answer: "Mit Karte.",
          choices: ["Mit Karte.", "Nur bar.", "Er zahlt nicht."],
        },
        {
          n: 3,
          prompt: "Was macht er danach?",
          answer: "Er geht nach Hause und kocht.",
          choices: [
            "Er geht nach Hause und kocht.",
            "Er bleibt im Laden.",
            "Er faehrt in Urlaub.",
          ],
        },
      ],
    ),
    tf(
      `${prefix}-a1-l3-01`,
      "Hinweise lesen",
      "Lesen Teil 3",
      "lesen",
      L,
      exam,
      "Hinweis: Der Aufzug ist heute kaputt. Bitte nehmen Sie die Treppe. Das Buero ist im 2. Stock. Von 12 bis 13 Uhr ist Mittagspause.",
      [
        {
          n: 1,
          prompt: "Der Aufzug funktioniert heute.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Man soll die Treppe nehmen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Das Buero ist im 2. Stock.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Es gibt eine Mittagspause.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
    ),
    cloze(
      `${prefix}-a1-sb-01`,
      "Vorstellung",
      L,
      exam,
      "Guten Tag, ich {{1}} Anna. Ich {{2}} aus Frankreich. Ich {{3}} in Koeln. Ich {{4}} Deutsch. Am Wochenende {{5}} ich gerne spazieren.",
      [
        { n: 1, answer: "heisse", choices: ["heisse", "heiss", "heissen", "heisst"] },
        { n: 2, answer: "komme", choices: ["komme", "kommst", "kommt", "kommen"] },
        { n: 3, answer: "wohne", choices: ["wohne", "wohnst", "wohnt", "wohnen"] },
        { n: 4, answer: "lerne", choices: ["lerne", "lernt", "lernest", "gelernt"] },
        { n: 5, answer: "gehe", choices: ["gehe", "geht", "gehen", "ging"] },
      ],
    ),
    cloze(
      `${prefix}-a1-sb-02`,
      "Im Cafe",
      L,
      exam,
      "Ich {{1}} gerne einen Kaffee. Was {{2}} das? Haben Sie auch Tee? Ja, hier ist die {{3}}. Ich {{4}} bar. Danke und {{5}} Tag!",
      [
        {
          n: 1,
          answer: "moechte",
          choices: ["moechte", "moecht", "moechten", "willst"],
        },
        { n: 2, answer: "kostet", choices: ["kostet", "kosten", "kost", "kauf"] },
        {
          n: 3,
          answer: "Speisekarte",
          choices: ["Speisekarte", "Fahrkarte", "Kreditkarte", "Visitenkarte"],
        },
        { n: 4, answer: "zahle", choices: ["zahle", "zahlst", "zahlt", "gezahlt"] },
        {
          n: 5,
          answer: "schoenen",
          choices: ["schoenen", "schoen", "gute", "besser"],
        },
      ],
    ),
    tf(
      `${prefix}-a1-h-01`,
      "Am Telefon",
      "Hören",
      "horen",
      L,
      exam,
      "Telefonat · Termin vereinbaren",
      [
        {
          n: 1,
          prompt: "Lisa moechte einen Termin.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Der Termin ist am Freitag.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Der Termin ist um 9 Uhr.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Lisa braucht eine Adresse.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Hallo, hier ist Lisa. Ich moechte einen Termin beim Arzt. Freitag um elf Uhr geht das gut. Die Adresse ist Hauptstrasse 12. Danke, tschuess.",
    ),
    tf(
      `${prefix}-a1-h-02`,
      "Im Bahnhof",
      "Hören",
      "horen",
      L,
      exam,
      "Durchsage am Bahnhof",
      [
        {
          n: 1,
          prompt: "Der Zug nach Hamburg hat Verspaetung.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Die Verspaetung betraegt 20 Minuten.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Der Zug faehrt von Gleis 3.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Achtung, bitte. Der Zug nach Hamburg hat heute 20 Minuten Verspaetung. Er faehrt von Gleis fuenf. Wir bitten um Verstaendnis.",
    ),
    writeEx(
      `${prefix}-a1-w-01`,
      "E-Mail an einen Freund",
      L,
      exam,
      "Schreiben (ca. 30 Minuten, ca. 30-40 Woerter):\n\nSchreiben Sie eine E-Mail an Ihren Freund. Sagen Sie: wer Sie sind, wo Sie wohnen, was Sie gerne machen, und fragen Sie nach seinem Wochenende.",
      "Redige environ 30-40 mots, puis marque comme pret.",
    ),
    writeEx(
      `${prefix}-a1-w-02`,
      "Formular ausfuellen",
      L,
      exam,
      "Schreiben:\n\nFuellen Sie ein Formular aus (Name, Adresse, Telefon, Beruf, warum Sie Deutsch lernen). Schreiben Sie kurze Saetze.",
      "Remplis le formulaire en phrases courtes, puis marque comme pret.",
    ),
    speak(
      `${prefix}-a1-s-01`,
      "Sich vorstellen",
      L,
      exam,
      "Sprechen Teil 1:\n\nStellen Sie sich vor (1-2 Minuten): Name, Herkunft, Wohnort, Beruf oder Schule, Hobbys. Sprechen Sie klar und langsam.",
    ),
    speak(
      `${prefix}-a1-s-02`,
      "Einkaufen",
      L,
      exam,
      "Sprechen Teil 2:\n\nSie sind im Supermarkt. Fragen Sie nach dem Preis, nach Obst und nach der Kasse. Spielen Sie die Situation (ca. 1-2 Minuten).",
    ),
  ];
}

function buildA2(exam, prefix) {
  const L = "A2";
  return [
    match(
      `${prefix}-a2-l1-01`,
      "Anzeigen und Infos",
      "Lesen Teil 1",
      L,
      exam,
      [
        {
          title: "Wohnungsboerse",
          passage:
            "Wir suchen eine Mitbewohnerin ab Oktober. Ruhige Wohnung, gute Busverbindung. Nichtraucher bevorzugt. Melden Sie sich per E-Mail.",
        },
        {
          title: "Nachhilfekurs",
          passage:
            "Mathe-Nachhilfe fuer Schueler der 7. Klasse. Jeden Mittwoch 16-17 Uhr. Kosten: 15 Euro pro Stunde.",
        },
        {
          title: "Flohmarkt",
          passage:
            "Am Samstag findet ein Flohmarkt im Stadtpark statt. Von 9 bis 15 Uhr. Plaetze kosten 5 Euro.",
        },
        {
          title: "Reparaturdienst",
          passage:
            "Waschmaschine kaputt? Unser Techniker kommt am gleichen Tag. Anruf unter 0800-445566.",
        },
        {
          title: "Sportverein",
          passage:
            "Neue Mitglieder willkommen. Yoga montags, Fussball dienstags. Probetraining gratis.",
        },
      ],
      ["Kinoabend abgesagt", "Parkhaus voll"],
    ),
    match(
      `${prefix}-a2-l1-02`,
      "Kurze Mitteilungen",
      "Lesen Teil 1",
      L,
      exam,
      [
        {
          title: "Zugausfall",
          passage:
            "Wegen Bauarbeiten faellt der Zug um 14:20 Uhr aus. Bitte nutzen Sie den Busersatzverkehr.",
        },
        {
          title: "Bibliotheksschliessung",
          passage:
            "Die Stadtbibliothek bleibt naechste Woche wegen Renovierung geschlossen. Online-Ausleihe ist moeglich.",
        },
        {
          title: "Impftermin",
          passage:
            "Erinnerung: Ihr Impftermin ist am Donnerstag um 9:30 Uhr. Bitte Impfpass mitbringen.",
        },
        {
          title: "Jobangebot",
          passage:
            "Cafe sucht Aushilfe am Wochenende. Deutsch A2 und Puenktlichkeit wichtig. Bewerbung bis Freitag.",
        },
      ],
      ["Konzert verschoben", "Wetterwarnung"],
    ),
    reading(
      `${prefix}-a2-l2-01`,
      "Wochenende in Leipzig",
      "Lesen Teil 2",
      L,
      exam,
      "Am Samstag fahre ich nach Leipzig. Ich besuche meine Cousine Maya. Wir wollen ins Museum gehen und danach in einem kleinen Restaurant essen. Am Sonntag machen wir einen Spaziergang am Fluss. Ich nehme den Zug um 8 Uhr. Die Fahrkarte habe ich schon online gekauft. Ich freue mich sehr, weil wir uns seit einem Jahr nicht gesehen haben.",
      [
        {
          n: 1,
          prompt: "Wohin faehrt die Person?",
          answer: "Nach Leipzig.",
          choices: ["Nach Leipzig.", "Nach Berlin.", "Nach Wien."],
        },
        {
          n: 2,
          prompt: "Wen besucht sie?",
          answer: "Ihre Cousine Maya.",
          choices: ["Ihre Cousine Maya.", "Einen Kollegen.", "Ihren Lehrer."],
        },
        {
          n: 3,
          prompt: "Wie reist sie?",
          answer: "Mit dem Zug.",
          choices: ["Mit dem Zug.", "Mit dem Flugzeug.", "Zu Fuss."],
        },
        {
          n: 4,
          prompt: "Wann haben sie sich zuletzt gesehen?",
          answer: "Vor einem Jahr.",
          choices: ["Vor einem Jahr.", "Gestern.", "Vor zehn Jahren."],
        },
      ],
    ),
    reading(
      `${prefix}-a2-l2-02`,
      "Neue Arbeit",
      "Lesen Teil 2",
      L,
      exam,
      "Seit zwei Wochen arbeite ich in einem Buero. Die Arbeitszeiten sind von 9 bis 17 Uhr. Meine Kollegen sind freundlich und helfen mir oft. Am Anfang war ich nervoes, aber jetzt geht es besser. In der Pause trinke ich Kaffee und lese Nachrichten. Am Freitag haben wir ein Teammeeting.",
      [
        {
          n: 1,
          prompt: "Seit wann arbeitet die Person dort?",
          answer: "Seit zwei Wochen.",
          choices: ["Seit zwei Wochen.", "Seit zwei Jahren.", "Seit gestern."],
        },
        {
          n: 2,
          prompt: "Wie sind die Kollegen?",
          answer: "Freundlich und hilfsbereit.",
          choices: [
            "Freundlich und hilfsbereit.",
            "Unfreundlich.",
            "Nie im Buero.",
          ],
        },
        {
          n: 3,
          prompt: "Was passiert am Freitag?",
          answer: "Es gibt ein Teammeeting.",
          choices: [
            "Es gibt ein Teammeeting.",
            "Das Buero ist geschlossen.",
            "Sie faehrt in Urlaub.",
          ],
        },
      ],
    ),
    tf(
      `${prefix}-a2-l3-01`,
      "Hausordnung",
      "Lesen Teil 3",
      "lesen",
      L,
      exam,
      "Hausordnung: Bitte nach 22 Uhr leise sein. Muell trennen: Papier, Glas, Restmuell. Fahhraeder nur im Hof abstellen. Gaeste bitte vorher anmelden. Rauchen ist auf dem Balkon erlaubt, nicht im Treppenhaus.",
      [
        {
          n: 1,
          prompt: "Nach 22 Uhr soll man leise sein.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Muell muss nicht getrennt werden.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Fahhraeder gehoeren ins Treppenhaus.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Rauchen im Treppenhaus ist erlaubt.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 5,
          prompt: "Gaeste soll man vorher anmelden.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
    ),
    cloze(
      `${prefix}-a2-sb-01`,
      "E-Mail an die Vermieterin",
      L,
      exam,
      "Sehr geehrte Frau Klein, ich {{1}} Ihnen wegen eines Problems in der Wohnung. Seit gestern {{2}} die Heizung nicht. Koennen Sie bitte einen Techniker {{3}}? Am besten {{4}} er morgen Nachmittag kommen. Vielen Dank im {{5}} und freundliche Gruesse.",
      [
        {
          n: 1,
          answer: "schreibe",
          choices: ["schreibe", "schreibt", "geschrieben", "schriebst"],
        },
        {
          n: 2,
          answer: "funktioniert",
          choices: ["funktioniert", "funktionieren", "funktioniertet", "ging"],
        },
        {
          n: 3,
          answer: "schicken",
          choices: ["schicken", "schickt", "schickst", "geschickt"],
        },
        {
          n: 4,
          answer: "koennte",
          choices: ["koennte", "kannst", "musste", "darfst"],
        },
        {
          n: 5,
          answer: "Voraus",
          choices: ["Voraus", "Nachhinein", "Moment", "Anfang"],
        },
      ],
    ),
    cloze(
      `${prefix}-a2-sb-02`,
      "Alltag planen",
      L,
      exam,
      "Wenn ich frueh {{1}}, habe ich mehr Zeit. Dann {{2}} ich zum Sport und danach {{3}} ich einkaufen. Am Abend {{4}} ich oft mit Freunden. Manchmal {{5}} wir einen Film.",
      [
        {
          n: 1,
          answer: "aufstehe",
          choices: ["aufstehe", "aufstehst", "aufsteht", "aufstehen"],
        },
        { n: 2, answer: "gehe", choices: ["gehe", "geht", "gehen", "ging"] },
        { n: 3, answer: "gehe", choices: ["gehe", "kaufe", "mache", "bin"] },
        {
          n: 4,
          answer: "treffe",
          choices: ["treffe", "trifft", "treffen", "traf"],
        },
        {
          n: 5,
          answer: "schauen",
          choices: ["schauen", "schaut", "sehe", "hoeren"],
        },
      ],
    ),
    tf(
      `${prefix}-a2-h-01`,
      "Arztgespraech",
      "Hören",
      "horen",
      L,
      exam,
      "Gespraech beim Arzt",
      [
        {
          n: 1,
          prompt: "Der Patient hat Kopfschmerzen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Die Beschwerden dauern seit drei Tagen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Der Arzt empfiehlt mehr Kaffee.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Der Patient soll Tabletten nehmen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Guten Tag. Was fehlt Ihnen? Ich habe seit drei Tagen starke Kopfschmerzen. Bitte trinken Sie mehr Wasser und nehmen Sie diese Tabletten nach dem Essen. Kaffee sollten Sie heute vermeiden.",
    ),
    tf(
      `${prefix}-a2-h-02`,
      "Im Reisebuero",
      "Hören",
      "horen",
      L,
      exam,
      "Beratung im Reisebuero",
      [
        {
          n: 1,
          prompt: "Die Kundin moechte nach Spanien fahren.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Sie reist eine Woche.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Das Hotel liegt am Strand.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Fruehstueck ist nicht inklusive.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Ich moechte eine Woche nach Spanien. Haben Sie ein Hotel am Strand? Ja, mit Fruehstueck inklusive. Der Flug geht am Samstag frueh.",
    ),
    writeEx(
      `${prefix}-a2-w-01`,
      "E-Mail: Termin verschieben",
      L,
      exam,
      "Schreiben (ca. 30 Minuten, ca. 60-80 Woerter):\n\nSchreiben Sie eine E-Mail an Ihren Kursleiter. Erklaeren Sie, warum Sie den Termin nicht wahrnehmen koennen, schlagen Sie einen neuen Termin vor und entschuldigen Sie sich hoeflich.",
      "Redige environ 60-80 mots, puis marque comme pret.",
    ),
    writeEx(
      `${prefix}-a2-w-02`,
      "Nachricht an Nachbarn",
      L,
      exam,
      "Schreiben:\n\nIhr Nachbar hat laut Musik gemacht. Schreiben Sie eine hoefliche Nachricht: Problem nennen, Bitte um Ruhe nach 22 Uhr, Vorschlag fuer ein Gespraech.",
      "Redige un message courtois (ca. 60 mots), puis marque comme pret.",
    ),
    speak(
      `${prefix}-a2-s-01`,
      "Ueber den Alltag sprechen",
      L,
      exam,
      "Sprechen Teil 1:\n\nErzaehlen Sie von Ihrem Alltag (2 Minuten): Aufstehen, Arbeit/Schule, Essen, Freizeit. Nutzen Sie Zeitangaben und einfache Begruendungen.",
    ),
    speak(
      `${prefix}-a2-s-02`,
      "Plane machen",
      L,
      exam,
      "Sprechen Teil 2:\n\nPlanen Sie mit einer Partnerin/einem Partner ein Wochenende in der Stadt: Ort, Zeit, Aktivitaeten, Kosten. Einigen Sie sich auf einen Plan (ca. 2-3 Minuten).",
    ),
  ];
}

const outDir = path.join(process.cwd(), "content", "exam");
const files = {
  "telc-a1.json": buildA1("TELC", "t"),
  "telc-a2.json": buildA2("TELC", "t"),
  "goethe-a1.json": buildA1("GOETHE", "g").map((ex) => ({
    ...ex,
    sourceTitle: ex.sourceTitle
      .replace("Kurze ", "Kleine ")
      .replace("Alltagstexte", "Alltagshinweise"),
  })),
  "goethe-a2.json": buildA2("GOETHE", "g").map((ex) => ({
    ...ex,
    sourceTitle: ex.sourceTitle
      .replace("Anzeigen und Infos", "Infos und Anzeigen")
      .replace("Kurze Mitteilungen", "Kurznachrichten"),
  })),
};

for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data));
  console.log(name, data.length, "exercises");
}
