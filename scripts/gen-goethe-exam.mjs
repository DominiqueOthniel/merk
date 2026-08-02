/**
 * Genere content/exam/goethe-*.json aligne sur le Goethe-Zertifikat :
 * 4 modules (Lesen, Horen, Schreiben, Sprechen), sans Sprachbausteine.
 *
 * A1/A2 : Lesen 1-4, Horen 1-4, Schreiben 1-2, Sprechen 1-3
 * B1/B2 : Lesen 1-5, Horen 1-4, Schreiben 1-3, Sprechen 1-3
 * C1    : Lesen 1-4, Horen 1-4, Schreiben 1-2, Sprechen 1-2
 */
import fs from "node:fs";
import path from "node:path";

const EXAM = "GOETHE";

function match(id, title, section, level, pairs, distractors = []) {
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill: "lesen",
    level,
    exam: EXAM,
    format: "MATCH",
    options: [...pairs.map((p) => p.title), ...distractors],
    pairs,
    gaps: [],
  };
}

function reading(id, title, section, level, passage, gaps) {
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill: "lesen",
    level,
    exam: EXAM,
    format: "READING_MCQ",
    options: [],
    pairs: [],
    passage,
    gaps,
  };
}

function tf(id, title, section, skill, level, passage, gaps, listenScript = null) {
  const safeGaps = Array.isArray(gaps) ? gaps : [];
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill,
    level,
    exam: EXAM,
    format: "TF",
    options: safeGaps[0]?.choices ?? ["richtig", "falsch"],
    pairs: [],
    passage,
    gaps: safeGaps,
    ...(skill === "horen" ? { audioUrl: null, listenScript } : {}),
  };
}

function writeEx(id, title, section, level, passage, prompt) {
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill: "schreiben",
    level,
    exam: EXAM,
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

function speak(id, title, section, level, passage) {
  return {
    sourceId: id,
    sourceTitle: title,
    section,
    skill: "sprechen",
    level,
    exam: EXAM,
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

function buildA1() {
  const L = "A1";
  return [
    match(
      "g-a1-l1-01",
      "E-Mails und Notizen",
      "Lesen Teil 1",
      L,
      [
        {
          title: "Termin verschieben",
          passage:
            "Hallo Anna, ich kann heute nicht. Koennen wir morgen um 16 Uhr treffen? Liebe Gruesse, Tom",
        },
        {
          title: "Einladung zum Essen",
          passage:
            "Liebe Freunde, am Samstag koche ich bei mir. Ab 19 Uhr. Bitte sagt Bescheid. Mona",
        },
        {
          title: "Paket abholen",
          passage:
            "Ihr Paket ist da. Bitte holen Sie es bis Freitag im Buero ab. Oeffnungszeiten: 9-17 Uhr.",
        },
        {
          title: "Kursbeginn",
          passage:
            "Der Deutschkurs startet am Montag. Raum 12, 1. Stock. Bitte bringen Sie Ihr Buch mit.",
        },
      ],
      ["Zugausfall", "Wetterbericht"],
    ),
    match(
      "g-a1-l2-01",
      "Schilder und Infos",
      "Lesen Teil 2",
      L,
      [
        {
          title: "Parken verboten",
          passage: "Hier ist Halteverbot. Bitte nicht parken. Abschleppdienst aktiv.",
        },
        {
          title: "Oeffnungszeiten",
          passage: "Mo-Fr 8-18 Uhr. Sa 9-13 Uhr. So geschlossen.",
        },
        {
          title: "Ruhe bitte",
          passage: "Bitte leise sprechen. Pruefung im Nebenraum.",
        },
        {
          title: "WLAN frei",
          passage: "Kostenloses WLAN. Passwort an der Rezeption.",
        },
      ],
      ["Eintritt frei", "Nur Personal"],
    ),
    reading(
      "g-a1-l3-01",
      "Mein Wochenende",
      "Lesen Teil 3",
      L,
      "Am Samstag stehe ich spaet auf. Dann fruehstuecke ich und gehe einkaufen. Am Nachmittag treffe ich Freunde im Park. Am Abend schaue ich einen Film. Am Sonntag lerne ich Deutsch und rufe meine Familie an.",
      [
        {
          n: 1,
          prompt: "Wann steht die Person am Samstag auf?",
          answer: "Spaet.",
          choices: ["Spaet.", "Sehr frueh.", "Gar nicht."],
        },
        {
          n: 2,
          prompt: "Wo trifft sie Freunde?",
          answer: "Im Park.",
          choices: ["Im Park.", "Im Buero.", "Im Zug."],
        },
        {
          n: 3,
          prompt: "Was macht sie am Sonntag?",
          answer: "Sie lernt Deutsch und ruft die Familie an.",
          choices: [
            "Sie lernt Deutsch und ruft die Familie an.",
            "Sie fliegt nach Spanien.",
            "Sie arbeitet im Krankenhaus.",
          ],
        },
      ],
    ),
    match(
      "g-a1-l4-01",
      "Anzeigen zuordnen",
      "Lesen Teil 4",
      L,
      [
        {
          title: "Wohnung gesucht",
          passage: "Studentin sucht kleines Zimmer in der Naehe der Uni. Bis 400 Euro.",
        },
        {
          title: "Fahrrad zu verkaufen",
          passage: "Blaues Fahrrad, gut erhalten. 80 Euro. Tel. 0176-445566.",
        },
        {
          title: "Babyssitter",
          passage: "Ich passe gerne auf Kinder auf. Abends und Wochenende. Erfahrung vorhanden.",
        },
      ],
      ["Konzertkarten", "Autovermietung"],
    ),
    tf(
      "g-a1-h1-01",
      "Durchsage im Bus",
      "Hören Teil 1",
      "horen",
      L,
      "Durchsage · Buslinie",
      [
        {
          n: 1,
          prompt: "Der Bus faehrt zum Bahnhof.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Die naechste Haltestelle ist Rathaus.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Der Bus hat Verspaetung von einer Stunde.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Achtung bitte. Dieser Bus faehrt zum Bahnhof. Naechste Haltestelle: Rathaus. Wir haben heute keine Verspaetung.",
    ),
    tf(
      "g-a1-h2-01",
      "Im Cafe",
      "Hören Teil 2",
      "horen",
      L,
      "Gespraech · Bestellung",
      [
        {
          n: 1,
          prompt: "Die Kundin moechte einen Tee.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Sie bestellt einen Kaffee und ein Stueck Kuchen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Sie zahlt bar.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Guten Tag, ich moechte einen Kaffee und ein Stueck Kuchen bitte. Zahle ich bar? Ja, gerne. Danke.",
    ),
    tf(
      "g-a1-h3-01",
      "Telefon: Termin",
      "Hören Teil 3",
      "horen",
      L,
      "Telefonat · Arzt",
      [
        {
          n: 1,
          prompt: "Der Termin ist am Dienstag.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Der Termin ist um acht Uhr.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Hallo, hier ist die Praxis. Ihr Termin ist am Dienstag um zehn Uhr. Bitte kommen Sie zehn Minuten frueher. Tschuess.",
    ),
    tf(
      "g-a1-h4-01",
      "Im Laden",
      "Hören Teil 4",
      "horen",
      L,
      "Einkaufsgesprach",
      [
        {
          n: 1,
          prompt: "Die Aepfel kosten zwei Euro.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Es gibt keine Bananen.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Die Aepfel kosten zwei Euro das Kilo. Bananen haben wir auch, frisch und guenstig.",
    ),
    writeEx(
      "g-a1-w1-01",
      "Formular",
      "Schreiben Teil 1",
      L,
      "Schreiben Teil 1:\n\nFuellen Sie das Formular aus: Name, Adresse, Telefon, Nationalitaet, warum Sie Deutsch lernen. Schreiben Sie kurze Saetze.",
      "Remplis le formulaire, puis marque comme pret.",
    ),
    writeEx(
      "g-a1-w2-01",
      "Kurze E-Mail",
      "Schreiben Teil 2",
      L,
      "Schreiben Teil 2 (ca. 30 Woerter):\n\nSchreiben Sie eine E-Mail an einen Freund: Stellen Sie sich vor, sagen Sie wo Sie wohnen und fragen Sie nach seinem Wochenende.",
      "Redige environ 30 mots, puis marque comme pret.",
    ),
    speak(
      "g-a1-s1-01",
      "Sich vorstellen",
      "Sprechen Teil 1",
      L,
      "Sprechen Teil 1:\n\nStellen Sie sich vor (Name, Herkunft, Wohnort, Beruf/Schule, Hobbys). Ca. 1-2 Minuten.",
    ),
    speak(
      "g-a1-s2-01",
      "Fragen stellen",
      "Sprechen Teil 2",
      L,
      "Sprechen Teil 2:\n\nStellen Sie Ihrem Partner Fragen zu Alltagsthemen: Wohnen, Freizeit, Familie. Reagieren Sie auf die Antworten.",
    ),
    speak(
      "g-a1-s3-01",
      "Gemeinsam planen",
      "Sprechen Teil 3",
      L,
      "Sprechen Teil 3:\n\nPlanen Sie gemeinsam einen Nachmittag in der Stadt: Treffpunkt, Zeit, Aktivitaet. Einigen Sie sich.",
    ),
  ];
}

function buildA2() {
  const L = "A2";
  return [
    match(
      "g-a2-l1-01",
      "Mitteilungen",
      "Lesen Teil 1",
      L,
      [
        {
          title: "Nachhilfe angeboten",
          passage:
            "Mathe-Nachhilfe fuer die 8. Klasse. Mittwochs 16-17 Uhr. 18 Euro/Stunde. Melden Sie sich per E-Mail.",
        },
        {
          title: "Mitfahrgelegenheit",
          passage:
            "Am Freitag fahre ich nach Hamburg. Zwei Plaetze frei. Abfahrt 8 Uhr am Hauptbahnhof.",
        },
        {
          title: "Wohnungsboerse",
          passage:
            "Wir suchen eine Mitbewohnerin ab Oktober. Ruhige Wohnung, Bus in 5 Minuten. Nichtraucher.",
        },
        {
          title: "Flohmarkt",
          passage:
            "Samstag 9-15 Uhr im Stadtpark. Standplaetze 5 Euro. Bei Regen findet der Markt trotzdem statt.",
        },
      ],
      ["Kinoprogramm", "Fahrplan Bus 7"],
    ),
    reading(
      "g-a2-l2-01",
      "Neuer Job",
      "Lesen Teil 2",
      L,
      "Seit drei Wochen arbeite ich in einem Cafe. Die Arbeitszeiten sind von 9 bis 17 Uhr. Meine Kollegen helfen mir oft. Am Anfang war ich nervoes, aber jetzt geht es besser. Freitags haben wir ein kurzes Teammeeting.",
      [
        {
          n: 1,
          prompt: "Seit wann arbeitet die Person dort?",
          answer: "Seit drei Wochen.",
          choices: ["Seit drei Wochen.", "Seit drei Jahren.", "Seit gestern."],
        },
        {
          n: 2,
          prompt: "Wie sind die Kollegen?",
          answer: "Hilfsbereit.",
          choices: ["Hilfsbereit.", "Unfreundlich.", "Nie da."],
        },
        {
          n: 3,
          prompt: "Was passiert freitags?",
          answer: "Es gibt ein Teammeeting.",
          choices: [
            "Es gibt ein Teammeeting.",
            "Das Cafe ist zu.",
            "Sie faehrt in Urlaub.",
          ],
        },
      ],
    ),
    tf(
      "g-a2-l3-01",
      "Hausordnung",
      "Lesen Teil 3",
      "lesen",
      L,
      "Hausordnung: Nach 22 Uhr bitte leise sein. Muell trennen. Fahrrad nur im Hof. Gaeste vorher anmelden. Rauchen auf dem Balkon erlaubt, nicht im Treppenhaus.",
      [
        {
          n: 1,
          prompt: "Nach 22 Uhr soll man leise sein.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Fahrrad im Treppenhaus ist erlaubt.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Rauchen im Treppenhaus ist erlaubt.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
    ),
    match(
      "g-a2-l4-01",
      "Anzeigen und Situationen",
      "Lesen Teil 4",
      L,
      [
        {
          title: "Wer braucht einen Techniker?",
          passage:
            "Waschmaschine kaputt? Wir kommen am gleichen Tag. Hotline 0800-112233.",
        },
        {
          title: "Wer sucht Sport?",
          passage:
            "Yoga montags, Fussball dienstags. Probetraining gratis. Neue Mitglieder willkommen.",
        },
        {
          title: "Wer hat einen Impftermin?",
          passage:
            "Erinnerung: Donnerstag 9:30 Uhr. Bitte Impfpass mitbringen.",
        },
        {
          title: "Wer braucht Aushilfe?",
          passage:
            "Cafe sucht Hilfe am Wochenende. Deutsch A2 und Puenktlichkeit wichtig.",
        },
      ],
      ["Wetterwarnung", "Konzert abgesagt"],
    ),
    tf(
      "g-a2-h1-01",
      "Bahnhofsdurchsage",
      "Hören Teil 1",
      "horen",
      L,
      "Durchsage · Zug",
      [
        {
          n: 1,
          prompt: "Der Zug nach Koeln hat Verspaetung.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Die Verspaetung betraegt 15 Minuten.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Er faehrt von Gleis 2.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Achtung. Der Zug nach Koeln hat heute 15 Minuten Verspaetung. Abfahrt von Gleis vier. Wir bitten um Verstaendnis.",
    ),
    tf(
      "g-a2-h2-01",
      "Arztgespraech",
      "Hören Teil 2",
      "horen",
      L,
      "Beim Arzt",
      [
        {
          n: 1,
          prompt: "Der Patient hat Kopfschmerzen seit drei Tagen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Der Arzt empfiehlt mehr Kaffee.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Tabletten nach dem Essen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Ich habe seit drei Tagen starke Kopfschmerzen. Bitte trinken Sie mehr Wasser und nehmen Sie die Tabletten nach dem Essen. Kaffee besser vermeiden.",
    ),
    tf(
      "g-a2-h3-01",
      "Im Reisebuero",
      "Hören Teil 3",
      "horen",
      L,
      "Reiseberatung",
      [
        {
          n: 1,
          prompt: "Die Kundin will eine Woche nach Spanien.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Das Hotel liegt am Strand.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Fruehstueck ist nicht inklusive.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Ich moechte eine Woche nach Spanien. Haben Sie ein Hotel am Strand? Ja, mit Fruehstueck inklusive. Der Flug geht am Samstag frueh.",
    ),
    tf(
      "g-a2-h4-01",
      "Radiomeldung",
      "Hören Teil 4",
      "horen",
      L,
      "Kurznachricht · Verkehr",
      [
        {
          n: 1,
          prompt: "Auf der A3 gibt es Stau.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Die Polizei empfiehlt die Autobahn.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Verkehrshinweis: Auf der A3 Richtung Frankfurt gibt es dichten Stau. Bitte nutzen Sie wenn moeglich die Landstrasse.",
    ),
    writeEx(
      "g-a2-w1-01",
      "E-Mail: Termin verschieben",
      "Schreiben Teil 1",
      L,
      "Schreiben Teil 1 (ca. 40-60 Woerter):\n\nSchreiben Sie an Ihren Kursleiter: Sie koennen den Termin nicht wahrnehmen, begruenden Sie, schlagen Sie einen neuen Termin vor und entschuldigen Sie sich.",
      "Redige 40-60 mots, puis marque comme pret.",
    ),
    writeEx(
      "g-a2-w2-01",
      "Nachricht an Nachbarn",
      "Schreiben Teil 2",
      L,
      "Schreiben Teil 2:\n\nIhr Nachbar macht laut Musik. Schreiben Sie eine hoefliche Nachricht: Problem, Bitte um Ruhe nach 22 Uhr, Vorschlag fuer ein Gespraech.",
      "Redige un message courtois, puis marque comme pret.",
    ),
    speak(
      "g-a2-s1-01",
      "Alltag erzaehlen",
      "Sprechen Teil 1",
      L,
      "Sprechen Teil 1:\n\nErzaehlen Sie von Ihrem Alltag (Aufstehen, Arbeit/Schule, Freizeit). Ca. 2 Minuten.",
    ),
    speak(
      "g-a2-s2-01",
      "Meinung aeussern",
      "Sprechen Teil 2",
      L,
      "Sprechen Teil 2:\n\nSprechen Sie ueber Vor- und Nachteile von Homeoffice oder Lernen online. Aeussern Sie Ihre Meinung mit Beispielen.",
    ),
    speak(
      "g-a2-s3-01",
      "Wochenende planen",
      "Sprechen Teil 3",
      L,
      "Sprechen Teil 3:\n\nPlanen Sie mit einem Partner ein Wochenende: Ort, Zeit, Aktivitaeten, Kosten. Einigen Sie sich.",
    ),
  ];
}

function buildB1() {
  const L = "B1";
  return [
    match(
      "g-b1-l1-01",
      "Blogbeitraege zuordnen",
      "Lesen Teil 1",
      L,
      [
        {
          title: "Weniger Pendeln dank Homeoffice",
          passage:
            "Seit ich zwei Tage von zu Hause arbeite, spare ich jede Woche mehrere Stunden im Zug. Ich bin entspannter und habe mehr Zeit fuer Sport.",
        },
        {
          title: "Nachbarschaftshilfe lohnt sich",
          passage:
            "In unserem Haus organisieren wir Einkaufsdienste fuer aeltere Nachbarn. Man lernt sich kennen und hilft praktisch, ohne viel Aufwand.",
        },
        {
          title: "Sprachaustausch statt nur Apps",
          passage:
            "Apps sind nuetzlich, aber erst Gespraeche mit Muttersprachlern haben mir Sicherheit gegeben. Einmal pro Woche treffen wir uns im Cafe.",
        },
        {
          title: "Zweites Handykonto fuer Arbeit",
          passage:
            "Ich habe Arbeit und Privatleben getrennt: eine Nummer fuer den Job, eine fuer Freunde. Abends bleibe ich erreichbarer fuer meine Familie.",
        },
        {
          title: "Bibliothek als ruhiger Arbeitsort",
          passage:
            "Zu Hause lenken mich viele Dinge ab. In der Stadtbibliothek finde ich Ruhe, Steckdosen und WLAN. Dort lerne ich am effektivsten.",
        },
      ],
      ["Urlaub auf dem Mars", "Kostenlose Flugtickets fuer alle"],
    ),
    reading(
      "g-b1-l2-01",
      "Artikel: Fahrradstadt",
      "Lesen Teil 2",
      L,
      "Immer mehr Staedte bauen Radwege aus. Ziel ist weniger Stau und bessere Luft. Kritiker sagen, Autofahrer verlieren Parkplaetze. Unterstuetzter argumentieren, dass sichere Radwege auch Kinder und Aeltere mobil machen. Studien zeigen: Wo Radwege zusammenhaengend sind, steigt die Nutzung deutlich. Wichtig sind klare Regeln an Kreuzungen und genug Abstellplaetze. Eine Stadt allein reicht nicht: Verbindungen in die Vororte entscheiden oft ueber den Erfolg.",
      [
        {
          n: 1,
          prompt: "Was ist ein Ziel des Radwegeausbaus?",
          answer: "Weniger Stau und bessere Luft.",
          choices: [
            "Weniger Stau und bessere Luft.",
            "Mehr Flugverkehr.",
            "Schliessung aller Buslinien.",
          ],
        },
        {
          n: 2,
          prompt: "Was kritisieren Gegner?",
          answer: "Verlust von Parkplaetzen.",
          choices: [
            "Verlust von Parkplaetzen.",
            "Zu viele Baeume.",
            "Zu billige Fahrraeder.",
          ],
        },
        {
          n: 3,
          prompt: "Wann steigt die Radnutzung laut Studien?",
          answer: "Wenn Radwege zusammenhaengend sind.",
          choices: [
            "Wenn Radwege zusammenhaengend sind.",
            "Nur bei Schnee.",
            "Nur in Ferienorten.",
          ],
        },
        {
          n: 4,
          prompt: "Was ist zusaetzlich wichtig?",
          answer: "Verbindungen in die Vororte.",
          choices: [
            "Verbindungen in die Vororte.",
            "Nur Innenstadt-Hotels.",
            "Mehr Parkhaeuser ohne Alternativen.",
          ],
        },
      ],
    ),
    match(
      "g-b1-l3-01",
      "Anzeigen den Situationen zuordnen",
      "Lesen Teil 3",
      L,
      [
        {
          title: "Sie brauchen Nachhilfe in Deutsch.",
          passage:
            "Erfahrene Lehrkraft gibt Intensivkurs B1. Kleine Gruppen, Abends und Samstags. Probestunde moeglich.",
        },
        {
          title: "Sie suchen eine guenstige Unterkunft fuer zwei Wochen.",
          passage:
            "Privatzimmer nahe Uni, 25 Euro/Nacht inkl. WLAN. Kurzzeitbuchung willkommen.",
        },
        {
          title: "Sie moechten am Wochenende Sport machen.",
          passage:
            "Offenes Volleyball-Training sonntags 11 Uhr im Stadtpark. Keine Anmeldung noetig. Baelle vorhanden.",
        },
        {
          title: "Ihr Laptop ist kaputt.",
          passage:
            "Reparaturservice am Bahnhof. Diagnose 20 Euro, oft am gleichen Tag fertig. Ersatzgeraete zum Ausleihen.",
        },
        {
          title: "Sie brauchen Kinderbetreuung am Abend.",
          passage:
            "Zuverlaessige Babysitterin mit Referenzen. Ab 18 Uhr verfuegbar. Preis nach Absprache.",
        },
      ],
      ["Sie wollen ein Flugzeug kaufen.", "Sie suchen einen Opernkurs auf Latein."],
    ),
    reading(
      "g-b1-l4-01",
      "Forum: Lernen im Ausland",
      "Lesen Teil 4",
      L,
      "Viele schreiben im Forum, dass ein Sprachaufenthalt hilft, Alltagsdeutsch schneller zu lernen. Andere warnen vor hohen Kosten und Heimweh. Tipps: frueh Wohnheimplaetze beantragen, realistisch budgetieren, lokale Vereine besuchen. Niemand behauptet, dass man ohne Lernen automatisch fliessend wird. Ein Teilnehmer betont Mentoring-Programme an Hochschulen.",
      [
        {
          n: 1,
          prompt: "Was hilft laut Forum besonders?",
          answer: "Alltagsdeutsch durch Aufenthalt.",
          choices: [
            "Alltagsdeutsch durch Aufenthalt.",
            "Nur Grammatikbuecher ohne Sprechen.",
            "Fernsehen ausschliesslich auf der Muttersprache.",
          ],
        },
        {
          n: 2,
          prompt: "Welche Risiken werden genannt?",
          answer: "Kosten und Heimweh.",
          choices: [
            "Kosten und Heimweh.",
            "Zu viele kostenlose Wohnungen.",
            "Keine Moeglichkeit zu telefonieren.",
          ],
        },
        {
          n: 3,
          prompt: "Was sagt der Text ueber automatisches Lernen?",
          answer: "Ohne Lernen wird man nicht automatisch fliessend.",
          choices: [
            "Ohne Lernen wird man nicht automatisch fliessend.",
            "Man wird immer automatisch fliessend.",
            "Lernen ist verboten.",
          ],
        },
      ],
    ),
    tf(
      "g-b1-l5-01",
      "Anleitung: Online-Anmeldung",
      "Lesen Teil 5",
      "lesen",
      L,
      "So melden Sie sich zum Kurs an: 1) Konto erstellen. 2) Kurs waehlen. 3) Zahlung bis Freitag. 4) Bestaetigung per E-Mail speichern. Ohne Zahlung wird der Platz nach 48 Stunden freigegeben. Telefonische Anmeldung ist nicht moeglich.",
      [
        {
          n: 1,
          prompt: "Man muss zuerst ein Konto erstellen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Telefonische Anmeldung ist moeglich.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Ohne Zahlung bleibt der Platz unbegrenzt reserviert.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Die Bestaetigung kommt per E-Mail.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
    ),
    tf(
      "g-b1-h1-01",
      "Durchsagen am Bahnhof",
      "Hören Teil 1",
      "horen",
      L,
      "Horen Teil 1 · Durchsagen",
      [
        {
          n: 1,
          prompt: "Der Zug nach Muenchen faellt aus.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Es gibt eine Gleisaenderung.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Fahrgaeste sollen Gleis 7 nutzen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Achtung. Der Zug nach Muenchen faehrt heute von Gleis sieben statt Gleis drei. Bitte folgen Sie den Anzeigen. Der Zug faellt nicht aus.",
    ),
    tf(
      "g-b1-h2-01",
      "Alltagsgespraech: Umzug",
      "Hören Teil 2",
      "horen",
      L,
      "Horen Teil 2 · Gespraech",
      [
        {
          n: 1,
          prompt: "Lea zieht naechste Woche um.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Sie braucht Hilfe am Samstag.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Jonas kann den ganzen Tag helfen.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Sie mieten einen Transporter.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Lea: Ich ziehe naechste Woche um und brauche Samstag Hilfe. Jonas: Vormittags kann ich, nachmittags habe ich Schicht. Lea: Super, wir mieten einen Transporter.",
    ),
    tf(
      "g-b1-h3-01",
      "Radiobeitrag: Lernen",
      "Hören Teil 3",
      "horen",
      L,
      "Horen Teil 3 · Radio",
      [
        {
          n: 1,
          prompt: "Regelmassiges Wiederholen hilft laut Beitrag.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Nur auswendig lernen wird empfohlen.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Sprechen mit anderen wird als nuetzlich genannt.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Experten raten zu regelmaessigem Wiederholen statt einmaligem Auswendiglernen. Besonders hilfreich ist, neue Woerter im Gespraech zu nutzen und kurze Texte selbst zu schreiben.",
    ),
    tf(
      "g-b1-h4-01",
      "Diskussion: Stadtverkehr",
      "Hören Teil 4",
      "horen",
      L,
      "Horen Teil 4 · Diskussion",
      [
        {
          n: 1,
          prompt: "Beide sind gegen oeffentlichen Verkehr.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Parkgebuehren koennen Verkehr lenken.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Bessere Buslinien werden vorgeschlagen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Person A: Parkgebuehren koennen den Verkehr in der Innenstadt lenken. Person B: Ja, aber nur zusammen mit besseren Buslinien und sicheren Radwegen. Beide sehen oeffentlichen Verkehr als Teil der Loesung.",
    ),
    writeEx(
      "g-b1-w1-01",
      "Persoenliche E-Mail",
      "Schreiben Teil 1",
      L,
      "Schreiben Teil 1:\n\nSchreiben Sie eine persoenliche E-Mail an eine Freundin/einen Freund. Erzaehlen Sie von einem Kurs oder einem Alltagsproblem, fragen Sie nach Rat und schlagen Sie ein Treffen vor (ca. 80 Woerter).",
      "Redige une email personnelle (ca. 80 mots), puis marque comme pret.",
    ),
    writeEx(
      "g-b1-w2-01",
      "Forumsbeitrag",
      "Schreiben Teil 2",
      L,
      "Schreiben Teil 2:\n\nIn einem Online-Forum wird diskutiert: \"Sollte Homeoffice Pflicht sein?\" Schreiben Sie einen Forumsbeitrag mit Ihrer Meinung und zwei Argumenten (ca. 80 Woerter).",
      "Redige un billet de forum (ca. 80 mots), puis marque comme pret.",
    ),
    writeEx(
      "g-b1-w3-01",
      "Halbformelle E-Mail",
      "Schreiben Teil 3",
      L,
      "Schreiben Teil 3:\n\nSchreiben Sie eine halbformelle E-Mail an die Kursverwaltung: Kurswechsel begruenden, Wunschtermin nennen, um Bestaetigung bitten (ca. 80 Woerter).",
      "Redige une email semi-formelle (ca. 80 mots), puis marque comme pret.",
    ),
    speak(
      "g-b1-s1-01",
      "Gemeinsam planen",
      "Sprechen Teil 1",
      L,
      "Sprechen Teil 1 (ca. 3 Min):\n\nPlanen Sie mit Ihrem Partner eine Aktivitaet (Ausflug, Geburtstagsfeier oder Lernwochenende). Machen Sie Vorschlaege, reagieren Sie und einigen Sie sich auf Zeit, Ort und Aufgaben.",
    ),
    speak(
      "g-b1-s2-01",
      "Thema praesentieren",
      "Sprechen Teil 2",
      L,
      "Sprechen Teil 2 (ca. 3 Min):\n\nPraesentieren Sie ein aktuelles Thema, z. B. \"Nachhaltig einkaufen\" oder \"Lernen mit Apps\". Struktur: Einleitung, 2-3 Punkte mit Beispiel, Schluss. Notizen erlaubt, frei sprechen.",
    ),
    speak(
      "g-b1-s3-01",
      "Ueber Praesentationen sprechen",
      "Sprechen Teil 3",
      L,
      "Sprechen Teil 3 (ca. 2 Min):\n\nFragen Sie Ihren Partner zu dessen Thema, geben Sie Feedback und vergleichen Sie kurz mit Ihrem eigenen Thema.",
    ),
  ];
}

function buildB2() {
  const L = "B2";
  return [
    match(
      "g-b2-l1-01",
      "Forenbeitraege",
      "Lesen Teil 1",
      L,
      [
        {
          title: "Flexible Arbeitszeiten steigern Motivation",
          passage:
            "Wer Kernzeiten hat und den Rest frei einteilen kann, berichtet oft von besserer Konzentration und weniger Stress. Klarheit ueber Erreichbarkeit bleibt aber entscheidend.",
        },
        {
          title: "Weiterbildung braucht betriebliche Zeitfenster",
          passage:
            "Onlinekurse allein reichen nicht, wenn sie in die Freizeit gedraengt werden. Betriebe mit festen Lernfenstern sehen hoehere Abschlussquoten.",
        },
        {
          title: "Daten allein ersetzen keine Gespraeche",
          passage:
            "Dashboards zeigen Trends, aber schwierige Entscheidungen brauchen den Austausch im Team. Transparenz ohne Dialog erzeugt Misstrauen.",
        },
        {
          title: "Stadtgruen verbessert Aufenthaltsqualitaet",
          passage:
            "Baume und kleine Parks senken Hitze und laeden zum Verweilen ein. Gerade dicht bebaute Viertel profitieren von vernetzten Gruenflaechen.",
        },
        {
          title: "Medienkompetenz schuetzt vor Desinformation",
          passage:
            "Quellen pruefen und Bilder kritisch lesen gehoeren heute zur Grundbildung. Schulen und Erwachsenenbildung sollten das systematisch trainieren.",
        },
      ],
      ["Kostenlose Luxusautos fuer alle", "Verbot von oeffentlichen Bibliotheken"],
    ),
    reading(
      "g-b2-l2-01",
      "Kommentar: Digitale Bildung",
      "Lesen Teil 2",
      L,
      "Digitale Tools koennen Unterricht individualisieren, ersetzen aber keine paedagogische Beziehung. Wer nur auf Software setzt, riskiert, dass Lernende bei Motivationstiefs allein bleiben. Sinnvoll ist eine Mischung: adaptive Uebungen plus gezieltes Feedback durch Lehrkraefte. Gleichzeitig muessen Schulen Ausstattung und Fortbildung sicherstellen, sonst waechst die Ungleichheit. Der Text fordert keine vollstaendige Abschaffung von Praesenzlehre und behauptet nicht, dass Apps immer besser sind als Buicher.",
      [
        {
          n: 1,
          prompt: "Was ersetzt digitale Tools nicht?",
          answer: "Die paedagogische Beziehung.",
          choices: [
            "Die paedagogische Beziehung.",
            "Jede Form von Uebung.",
            "Den Stromanschluss.",
          ],
        },
        {
          n: 2,
          prompt: "Was wird als sinnvoll beschrieben?",
          answer: "Mischung aus Tools und Feedback.",
          choices: [
            "Mischung aus Tools und Feedback.",
            "Nur Software ohne Lehrkraefte.",
            "Nur Buicher ohne Technik.",
          ],
        },
        {
          n: 3,
          prompt: "Welche Gefahr bei ungleicher Ausstattung?",
          answer: "Wachsende Ungleichheit.",
          choices: [
            "Wachsende Ungleichheit.",
            "Zu viele Lehrkraefte.",
            "Zu billige Geraete.",
          ],
        },
        {
          n: 4,
          prompt: "Fordert der Text die Abschaffung der Praesenzlehre?",
          answer: "Nein.",
          choices: ["Nein.", "Ja, vollstaendig.", "Nur fuer Mathematik."],
        },
      ],
    ),
    match(
      "g-b2-l3-01",
      "Kommentare zuordnen",
      "Lesen Teil 3",
      L,
      [
        {
          title: "Wer warnt vor Isolation?",
          passage:
            "Homeoffice ist praktisch, aber ohne feste Rituale und soziale Kontakte sinkt das Wohlbefinden. Teams sollten hybride Treffen planen.",
        },
        {
          title: "Wer betont Bezahlbarkeit?",
          passage:
            "Oeffentlicher Verkehr hilft dem Klima nur, wenn Tickets bezahlbar bleiben. Sonst weichen Menschen aufs Auto aus.",
        },
        {
          title: "Wer fordert klare Regeln?",
          passage:
            "KI in der Verwaltung braucht menschliche Kontrolle und transparente Kriterien, sonst entstehen Diskriminierungsrisiken.",
        },
        {
          title: "Wer sieht Chancen fuer Laendliche Regionen?",
          passage:
            "Schnelles Internet ermoeglicht Remote-Arbeit ausserhalb der Grossstaedte und kann Abwanderung bremsen.",
        },
      ],
      ["Wer will Schulen schliessen?", "Wer verbietet Fahrradhelme?"],
    ),
    reading(
      "g-b2-l4-01",
      "Reportage: Weiterbildung",
      "Lesen Teil 4",
      L,
      "Unternehmen investieren zunehmend in kurze Zertifikatskurse statt langer Studiengaenge. Vorteil: schnelle Anpassung an Technikwechsel. Nachteil: oberflaechliches Wissen ohne Tiefe. Erfolgreiche Programme verbinden Praxisprojekte mit Mentoring. Teilnehmende berichten, dass Anerkennung im Team wichtiger ist als das Zertifikat allein.",
      [
        {
          n: 1,
          prompt: "Was ist ein Vorteil kurzer Kurse?",
          answer: "Schnelle Anpassung.",
          choices: [
            "Schnelle Anpassung.",
            "Immer tiefere Theorie als Uni.",
            "Keine Lernzeit noetig.",
          ],
        },
        {
          n: 2,
          prompt: "Was macht Programme erfolgreich?",
          answer: "Praxis plus Mentoring.",
          choices: [
            "Praxis plus Mentoring.",
            "Nur Online-Videos ohne Feedback.",
            "Pruefungen ohne Vorbereitung.",
          ],
        },
        {
          n: 3,
          prompt: "Was zaehlt fuer Teilnehmende besonders?",
          answer: "Anerkennung im Team.",
          choices: [
            "Anerkennung im Team.",
            "Nur das Papierzertifikat.",
            "Laengere Anfahrtswege.",
          ],
        },
      ],
    ),
    tf(
      "g-b2-l5-01",
      "Anleitung: Hybridmeeting",
      "Lesen Teil 5",
      "lesen",
      L,
      "Vor dem Meeting: Agenda senden, Technik testen, Redezeiten planen. Waehrenddessen: Kamera optional, aber klare Moderationsregeln. Danach: Protokoll innerhalb 24 Stunden. Aufnahmen nur mit Zustimmung aller.",
      [
        {
          n: 1,
          prompt: "Die Agenda soll vorher gesendet werden.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Aufnahmen sind ohne Zustimmung erlaubt.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Das Protokoll soll innerhalb von 24 Stunden kommen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
    ),
    tf(
      "g-b2-h1-01",
      "Durchsagen und Ansagen",
      "Hören Teil 1",
      "horen",
      L,
      "Horen Teil 1",
      [
        {
          n: 1,
          prompt: "Der Vortrag beginnt spaeter.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Der Raum wechselt in den 3. Stock.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Die Veranstaltung faellt ganz aus.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Liebe Teilnehmende, der Vortrag beginnt 15 Minuten spaeter und findet im dritten Stock, Raum 312, statt. Die Veranstaltung findet statt.",
    ),
    tf(
      "g-b2-h2-01",
      "Interview: Beruf",
      "Hören Teil 2",
      "horen",
      L,
      "Horen Teil 2",
      [
        {
          n: 1,
          prompt: "Die Interviewte arbeitet in der Projektleitung.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Sie haelt Weiterbildung fuer ueberfluessig.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Teamarbeit wird als zentral genannt.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Ich leite Projekte in einem mittelstaendischen Betrieb. Ohne kontinuierliche Weiterbildung kommt man nicht weiter. Am wichtigsten ist klare Kommunikation im Team.",
    ),
    tf(
      "g-b2-h3-01",
      "Vortrag: Konsum",
      "Hören Teil 3",
      "horen",
      L,
      "Horen Teil 3",
      [
        {
          n: 1,
          prompt: "Der Vortrag behandelt nachhaltigen Konsum.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Reparieren wird als Alternative genannt.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Nur Verbote werden empfohlen.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Nachhaltiger Konsum bedeutet nicht nur Verzicht. Reparaturen, Sharing und bewusste Kaufentscheidungen wirken oft staerker als reine Verbote.",
    ),
    tf(
      "g-b2-h4-01",
      "Diskussion: Studium",
      "Hören Teil 4",
      "horen",
      L,
      "Horen Teil 4",
      [
        {
          n: 1,
          prompt: "Beide sehen Praktika als nuetzlich.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Theorie wird als voellig nutzlos bezeichnet.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Mentoring wird positiv erwaehnt.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Praktika helfen beim Berufseinstieg, ersetzen aber nicht die Theorie. Mentoring an der Hochschule kann beide Seiten verbinden und Unsicherheit reduzieren.",
    ),
    writeEx(
      "g-b2-w1-01",
      "Forumsbeitrag Gesellschaft",
      "Schreiben Teil 1",
      L,
      "Schreiben Teil 1:\n\nSchreiben Sie einen Forumsbeitrag zu einem gesellschaftlichen Thema (z. B. Vier-Tage-Woche oder Datenschutz). Meinung begruenden, Gegenargument nennen, Schlussfolgerung (ca. 150 Woerter).",
      "Redige un forum (ca. 150 mots), puis marque comme pret.",
    ),
    writeEx(
      "g-b2-w2-01",
      "Formelle E-Mail / Brief",
      "Schreiben Teil 2",
      L,
      "Schreiben Teil 2:\n\nSchreiben Sie eine formelle E-Mail an eine Institution: Anliegen schildern, Bitte formulieren, Hoeflichkeit und klare Struktur (ca. 150 Woerter).",
      "Redige une email formelle (ca. 150 mots), puis marque comme pret.",
    ),
    writeEx(
      "g-b2-w3-01",
      "Stellungnahme",
      "Schreiben Teil 3",
      L,
      "Schreiben Teil 3:\n\nNehmen Sie Stellung: \"Sollten Pruefungen staerker digital ablaufen?\" Chancen, Risiken, klare Position (ca. 150 Woerter).",
      "Redige une prise de position (ca. 150 mots), puis marque comme pret.",
    ),
    speak(
      "g-b2-s1-01",
      "Gemeinsam entscheiden",
      "Sprechen Teil 1",
      L,
      "Sprechen Teil 1:\n\nEntscheiden Sie mit Ihrem Partner ueber eine Massnahme in der Stadt (z. B. mehr Radwege). Argumentieren, Kompromisse finden, Ergebnis festhalten.",
    ),
    speak(
      "g-b2-s2-01",
      "Kurzvortrag",
      "Sprechen Teil 2",
      L,
      "Sprechen Teil 2:\n\nHalten Sie einen Kurzvortrag (ca. 3-4 Min) zu einem aktuellen Thema. Struktur, Beispiele, klare Schlussfolgerung.",
    ),
    speak(
      "g-b2-s3-01",
      "Diskussion und Nachfragen",
      "Sprechen Teil 3",
      L,
      "Sprechen Teil 3:\n\nDiskutieren Sie die Vortraege: Nachfragen stellen, Meinung aeussern, Gemeinsamkeiten und Unterschiede benennen.",
    ),
  ];
}

function buildC1() {
  const L = "C1";
  return [
    match(
      "g-c1-l1-01",
      "Komplexe Forenbeitraege",
      "Lesen Teil 1",
      L,
      [
        {
          title: "Fruehe Sprachfoerderung wirkt nachhaltig",
          passage:
            "Programme in Kitas verbessern langfristig Lesekompetenz, besonders wenn Familien einbezogen werden und Angebote kontinuierlich finanziert sind.",
        },
        {
          title: "Digitale Tools ersetzen keine Begleitung",
          passage:
            "Lernapps individualisieren Uebungen, doch ohne Rueckmeldung durch Lehrkraefte sinkt die Motivation oft rasch und Luecken bleiben bestehen.",
        },
        {
          title: "Stipendien allein genuegen nicht",
          passage:
            "Finanzielle Hilfen oeffnen Tueren, aber Mentoring und Orientierung im Hochschulsystem entscheiden oft ueber den Studienerfolg.",
        },
        {
          title: "Weiterbildung wird zur Normalitaet",
          passage:
            "Angesichts schneller Technologiewechsel planen Erwerbstaetige regelmaessige Qualifizierung. Betriebe mit Lernzeiten berichten von hoeherer Bindung.",
        },
        {
          title: "Pruefungsangst mindert Leistung",
          passage:
            "Nicht fehlendes Wissen, sondern starke Angstreaktionen fuehren zu schwachen Ergebnissen. Realitaetsnahe Proben koennen helfen.",
        },
      ],
      ["Privatschulen sind immer besser", "Gebaeude allein loesen alles"],
    ),
    reading(
      "g-c1-l2-01",
      "Wissenschaftskommunikation",
      "Lesen Teil 2",
      L,
      "Komplexe Forschung muss verstaendlich bleiben, ohne unzulaessig vereinfacht zu werden. In Krisen steigt der Druck auf klare Botschaften, zugleich waechst das Risiko, Unsicherheiten zu verschweigen. Gute Kommunikation benennt Wissensstand, offene Fragen und den Unterschied zwischen Hinweis und Metaanalyse. Vertrauen entsteht, wenn Korrekturen transparent erfolgen.",
      [
        {
          n: 1,
          prompt: "Welches Spannungsfeld beschreibt der Text?",
          answer: "Verstaendlichkeit ohne unzulaessige Vereinfachung.",
          choices: [
            "Verstaendlichkeit ohne unzulaessige Vereinfachung.",
            "Maximale Geheimhaltung von Daten.",
            "Ersatz von Forschung durch Umfragen.",
          ],
        },
        {
          n: 2,
          prompt: "Wann steigt das Risiko, Unsicherheiten zu verschweigen?",
          answer: "In Krisen mit Druck auf klare Botschaften.",
          choices: [
            "In Krisen mit Druck auf klare Botschaften.",
            "Nur in Ferienzeiten.",
            "Ausschliesslich in der Grundlagenforschung ohne Publikum.",
          ],
        },
        {
          n: 3,
          prompt: "Was staerkt langfristig Vertrauen?",
          answer: "Transparente Korrekturen.",
          choices: [
            "Transparente Korrekturen.",
            "Nie zuzugeben, dass etwas unklar ist.",
            "Nur absolute Aussagen ohne Belege.",
          ],
        },
      ],
    ),
    reading(
      "g-c1-l3-01",
      "Hybrides Arbeiten",
      "Lesen Teil 3",
      L,
      "Hybride Modelle kombinieren Praesenz und Distanzarbeit. Vorteile sind Flexibilitaet und bessere Vereinbarkeit; Nachteile liegen in erschwerter spontaner Koordination und ungleicher Sichtbarkeit. Fuehrung braucht klare Regeln zu Erreichbarkeit und Bewertung. Der Text fordert keine gesetzliche Pflicht zur Vier-Tage-Woche und behauptet nicht, Homeoffice ersetze Buerarbeit vollstaendig.",
      [
        {
          n: 1,
          prompt: "Welche Vorteile nennt der Text?",
          answer: "Flexibilitaet und bessere Vereinbarkeit.",
          choices: [
            "Flexibilitaet und bessere Vereinbarkeit.",
            "Weniger Bedarf an Fuehrung.",
            "Automatische Gehaltserhoehungen.",
          ],
        },
        {
          n: 2,
          prompt: "Was wird ueber eine gesetzliche Vier-Tage-Woche gesagt?",
          answer: "Sie wird nicht gefordert.",
          choices: [
            "Sie wird nicht gefordert.",
            "Sie ist bereits Pflicht.",
            "Sie gilt nur fuer Studierende.",
          ],
        },
        {
          n: 3,
          prompt: "Was braucht Fuehrung laut Text?",
          answer: "Klare Regeln zu Erreichbarkeit und Bewertung.",
          choices: [
            "Klare Regeln zu Erreichbarkeit und Bewertung.",
            "Keine Kommunikation.",
            "Nur spontane Entscheidungen ohne Dokumentation.",
          ],
        },
      ],
    ),
    tf(
      "g-c1-l4-01",
      "Selektiv: Foerderrichtlinie",
      "Lesen Teil 4",
      "lesen",
      L,
      "Foerderung wird nur gewaehrt, wenn der Antrag vollstaendig ist, ein Zeitplan vorliegt und Eigenmittel von mindestens 20 Prozent nachgewiesen werden. Nachtraegliche Aenderungen muessen schriftlich genehmigt werden. Muendliche Zusagen sind unverbindlich.",
      [
        {
          n: 1,
          prompt: "Ein Zeitplan ist erforderlich.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Eigenmittel von 20 Prozent sind noetig.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Muendliche Zusagen sind verbindlich.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Aenderungen brauchen schriftliche Genehmigung.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
    ),
    tf(
      "g-c1-h1-01",
      "Vortrag Stadtmobilitaet",
      "Hören Teil 1",
      "horen",
      L,
      "Horen Teil 1 · Vortrag",
      [
        {
          n: 1,
          prompt: "Der Vortrag behandelt ausschliesslich Flugverkehr.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Parkraumbewirtschaftung kann Verkehr lenken.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Verhaltensanderung braucht auch Infrastruktur.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 4,
          prompt: "Oeffentlicher Verkehr wird grundsaetzlich abgelehnt.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
      ],
      "Dieser Vortrag behandelt die Stadtmobilitaet, nicht den Flugverkehr. Parkraumbewirtschaftung kann den Verkehr wirksam lenken. Verhaltensanderung gelingt jedoch nur, wenn auch die Infrastruktur passt. Oeffentlicher Verkehr wird dabei als zentrale Loesung empfohlen.",
    ),
    tf(
      "g-c1-h2-01",
      "Diskussion KI in der Verwaltung",
      "Hören Teil 2",
      "horen",
      L,
      "Horen Teil 2 · Diskussion",
      [
        {
          n: 1,
          prompt: "Automatisierung kann Bearbeitungszeiten verkuerzen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Menschliche Kontrolle gilt als entbehrlich.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Diskriminierungsrisiken durch Daten werden genannt.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Automatisierung kann Bearbeitungszeiten deutlich verkuerzen. Dennoch bleibt menschliche Kontrolle unerlaesslich. Zugleich werden Diskriminierungsrisiken durch Trainingsdaten klar benannt und muessen geprueft werden.",
    ),
    tf(
      "g-c1-h3-01",
      "Podcast: Bildungspolitik",
      "Hören Teil 3",
      "horen",
      L,
      "Horen Teil 3 · Podcast",
      [
        {
          n: 1,
          prompt: "Fruehfoerderung wird als Investition beschrieben.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Nur Universitaeten sollen gefoerdert werden.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Qualitaet der Angebote wird betont.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Fruehfoerderung ist eine Investition in spaetere Bildungschancen. Nicht nur Universitaeten, sondern auch Kitas und Schulen brauchen stabile Finanzierung. Entscheidend bleibt die Qualitaet der paedagogischen Angebote.",
    ),
    tf(
      "g-c1-h4-01",
      "Podium: Arbeitsmarkt",
      "Hören Teil 4",
      "horen",
      L,
      "Horen Teil 4 · Podium",
      [
        {
          n: 1,
          prompt: "Fachkraeftemangel betrifft mehrere Branchen.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
        {
          n: 2,
          prompt: "Nur Gehalt entscheidet laut allen Sprechern.",
          answer: "falsch",
          choices: ["richtig", "falsch"],
        },
        {
          n: 3,
          prompt: "Weiterbildung und Zuwanderung werden als Hebel genannt.",
          answer: "richtig",
          choices: ["richtig", "falsch"],
        },
      ],
      "Der Fachkraeftemangel betrifft Pflege, Handwerk und IT zugleich. Gehalt ist wichtig, aber nicht allein entscheidend. Weiterbildung und gesteuerte Zuwanderung werden als zentrale Hebel genannt.",
    ),
    writeEx(
      "g-c1-w1-01",
      "Diskussionsbeitrag Forum",
      "Schreiben Teil 1",
      L,
      "Schreiben Teil 1 (ca. 200+ Woerter):\n\nSchreiben Sie einen anspruchsvollen Diskussionsbeitrag fuer ein Forum zum Thema digitales Lernen vs. Praesenzlehre. Differenzierte Argumentation, Gegenposition, klare Stellungnahme.",
      "Redige un billet de discussion exigeant, puis marque comme pret.",
    ),
    writeEx(
      "g-c1-w2-01",
      "Erorterung / Stellungnahme",
      "Schreiben Teil 2",
      L,
      "Schreiben Teil 2 (ca. 350 Woerter):\n\nErortern Sie die Strenge des Datenschutzes in digitalen Diensten. Sicherheit, Komfort, demokratische Kontrolle, Empfehlungen.",
      "Redige une erorterung (ca. 350 mots), puis marque comme pret.",
    ),
    speak(
      "g-c1-s1-01",
      "Vortrag und Gespraech",
      "Sprechen Teil 1",
      L,
      "Sprechen Teil 1:\n\nHalten Sie einen Vortrag (ca. 5 Min) zu \"Lebenslanges Lernen in der digitalen Arbeitswelt\", dann ca. 2 Min Austausch. Zwei Themen zur Wahl moeglich; Notizen erlaubt.",
    ),
    speak(
      "g-c1-s2-01",
      "Diskussion zu zweit",
      "Sprechen Teil 2",
      L,
      "Sprechen Teil 2 (ca. 5 Min):\n\nDiskutieren Sie Mobilität und Wohnen in der Stadt der Zukunft. Pro/Contra, Bezahlbarkeit, Gruenflaechen. Freies Sprechen, aufeinander eingehen.",
    ),
  ];
}

const outDir = path.join(process.cwd(), "content", "exam");
const files = {
  "goethe-a1.json": buildA1(),
  "goethe-a2.json": buildA2(),
  "goethe-b1.json": buildB1(),
  "goethe-b2.json": buildB2(),
  "goethe-c1.json": buildC1(),
};

for (const [name, data] of Object.entries(files)) {
  const skills = [...new Set(data.map((e) => e.skill))];
  if (skills.includes("sprachbausteine")) {
    throw new Error(`${name} contains Sprachbausteine`);
  }
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data));
  const sections = [...new Set(data.map((e) => e.section))];
  console.log(name, data.length, "ex", sections.join(" | "));
}
