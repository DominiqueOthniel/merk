import fs from "node:fs";
import path from "node:path";

/** Original MERK Goethe-aligned practice (B1/B2/C1). Not official Goethe materials. */

function base(level, exam = "GOETHE") {
  return { level, exam, pairs: [], gaps: [], options: [] };
}

function match(level, sourceId, title, section, pairs, distractors = []) {
  return {
    ...base(level),
    sourceId,
    sourceTitle: title,
    section,
    skill: "lesen",
    format: "MATCH",
    options: [...new Set([...pairs.map((p) => p.title), ...distractors])],
    pairs,
  };
}

function reading(level, sourceId, title, section, passage, questions) {
  return {
    ...base(level),
    sourceId,
    sourceTitle: title,
    section,
    skill: "lesen",
    format: "READING_MCQ",
    passage,
    gaps: questions.map((q, i) => ({
      n: i + 1,
      prompt: q.prompt,
      answer: q.answer,
      choices: q.choices,
    })),
  };
}

function cloze(level, sourceId, title, section, passage, gaps) {
  return {
    ...base(level),
    sourceId,
    sourceTitle: title,
    section,
    skill: "sprachbausteine",
    format: "CLOZE_MCQ",
    passage,
    gaps,
  };
}

function bank(level, sourceId, title, section, passage, bankWords, gaps) {
  return {
    ...base(level),
    sourceId,
    sourceTitle: title,
    section,
    skill: "sprachbausteine",
    format: "CLOZE_BANK",
    passage,
    bank: bankWords,
    options: bankWords,
    gaps,
  };
}

function horen(level, sourceId, title, statements, listenScript) {
  return {
    ...base(level),
    sourceId,
    sourceTitle: title,
    section: "Hören",
    skill: "horen",
    format: "TF",
    options: ["richtig", "falsch"],
    passage: `${title} · Horverstehen`,
    audioUrl: null,
    listenScript,
    gaps: statements.map((s, i) => ({
      n: i + 1,
      prompt: s.prompt,
      answer: s.answer,
      choices: ["richtig", "falsch"],
    })),
  };
}

function schreiben(level, sourceId, title, passage, prompt) {
  return {
    ...base(level),
    sourceId,
    sourceTitle: title,
    section: "Schreiben",
    skill: "schreiben",
    format: "WRITE",
    passage,
    gaps: [{ n: 1, answer: "done", choices: ["done"], prompt }],
  };
}

function sprechen(level, sourceId, title, passage, prompt) {
  return {
    ...base(level),
    sourceId,
    sourceTitle: title,
    section: "Sprechen",
    skill: "schreiben",
    format: "WRITE",
    passage,
    gaps: [{ n: 1, answer: "done", choices: ["done"], prompt }],
  };
}

const b1 = [
  match(
    "B1",
    "g-b1-l1-01",
    "Alltag und Termine",
    "Lesen Teil 1",
    [
      {
        title: "Arzttermin verschieben",
        passage:
          "Guten Tag, ich habe morgen um 10 Uhr einen Termin bei Dr. Keller. Leider muss ich arbeiten. Kann ich auf Freitag um 16 Uhr wechseln?",
      },
      {
        title: "Wohnung suchen",
        passage:
          "Wir suchen ab August eine 2-Zimmer-Wohnung in der Nahe der Uni. Maximal 850 Euro warm, Balkon ware schon.",
      },
      {
        title: "Kursanmeldung",
        passage:
          "Hallo, ich mochte mich fur den Deutschkurs am Abend anmelden. Gibt es noch freie Platze in der B1-Gruppe?",
      },
      {
        title: "Paket abholen",
        passage:
          "Ihr Paket liegt in der Filiale Hauptstrasse bereit. Bitte bringen Sie Ihren Ausweis mit. Offen bis 19 Uhr.",
      },
      {
        title: "Sportkurs Absage",
        passage:
          "Der Yoga-Kurs am Dienstag fallt wegen Krankheit aus. Ersatztermin: Donnerstag 18:30, gleicher Raum.",
      },
    ],
    ["Auto verkaufen", "Urlaubsbuchung bestatigt"],
  ),
  match(
    "B1",
    "g-b1-l1-02",
    "Arbeit und Schule",
    "Lesen Teil 1",
    [
      {
        title: "Praktikum Angebot",
        passage:
          "Fur drei Wochen im September suchen wir eine Assistenz im Empfang. Deutsch B1 und freundlicher Umgang mit Kunden sind wichtig.",
      },
      {
        title: "Hausaufgabenhilfe",
        passage:
          "Jeden Mittwoch von 15 bis 17 Uhr gibt es gratis Nachhilfe in Mathe und Deutsch in der Stadtbibliothek.",
      },
      {
        title: "Betriebsausflug",
        passage:
          "Am 12. Mai fahren wir gemeinsam nach Potsdam. Treffpunkt 8:30 am Bahnhof. Bitte bis Freitag anmelden.",
      },
      {
        title: "Klausurtermin",
        passage:
          "Die schriftliche Prufung findet am 3. Juni um 9 Uhr in Raum 214 statt. Bitte Personalausweis mitbringen.",
      },
      {
        title: "Schichtplan Anderung",
        passage:
          "Am Wochenende brauche ich jemanden fur den Fruhdienst. Wer tauschen kann, schreibt mir bitte eine kurze Nachricht.",
      },
    ],
    ["Konzertkarten", "Mietvertrag kundigen"],
  ),
  reading(
    "B1",
    "g-b1-l2-01",
    "Leben in Deutschland",
    "Lesen Teil 2",
    "Viele Menschen ziehen fur Arbeit oder Studium in eine neue Stadt. Am Anfang sind Behoerdengange und Wohnungssuche oft stressig. Wer fruh einen Sprachkurs besucht, findet schneller Anschluss. Nachbarn und Kollegen konnen bei praktischen Fragen helfen. Mit der Zeit wird der Alltag leichter: Einkaufen, Termine, Freizeit.",
    [
      {
        prompt: "Warum ist der Anfang oft stressig?",
        answer: "Wegen Behoerden und Wohnungssuche.",
        choices: [
          "Wegen Behoerden und Wohnungssuche.",
          "Weil es keine Sprachkurse gibt.",
          "Weil niemand arbeiten darf.",
        ],
      },
      {
        prompt: "Was hilft laut Text beim Anschluss?",
        answer: "Ein fruber Sprachkurs.",
        choices: [
          "Ein fruber Sprachkurs.",
          "Nur soziale Netzwerke.",
          "Sofort die Stadt verlassen.",
        ],
      },
      {
        prompt: "Was wird mit der Zeit leichter?",
        answer: "Der Alltag mit Einkaufen, Terminen und Freizeit.",
        choices: [
          "Der Alltag mit Einkaufen, Terminen und Freizeit.",
          "Nur die Prufungen an der Uni.",
          "Gar nichts, alles bleibt schwer.",
        ],
      },
    ],
  ),
  reading(
    "B1",
    "g-b1-l2-02",
    "Gesund bleiben",
    "Lesen Teil 2",
    "Regelmassige Bewegung und genug Schlaf sind wichtig fur die Konzentration. Viele Lernende sitzen lange am Schreibtisch und vergessen Pausen. Schon zehn Minuten Spazierengehen konnen helfen. Auch Wasser trinken und kurze Dehnubungen machen einen Unterschied. Wer sich uberfordert fuhlt, sollte fruh mit Lehrkraften sprechen.",
    [
      {
        prompt: "Was unterstutzt die Konzentration?",
        answer: "Bewegung und genug Schlaf.",
        choices: [
          "Bewegung und genug Schlaf.",
          "Nur mehr Kaffee.",
          "Längeres Sitzen ohne Pause.",
        ],
      },
      {
        prompt: "Was empfiehlt der Text bei Uberforderung?",
        answer: "Fruh mit Lehrkraften sprechen.",
        choices: [
          "Fruh mit Lehrkraften sprechen.",
          "Alles allein losen.",
          "Den Kurs sofort abbrechen ohne Gesprach.",
        ],
      },
    ],
  ),
  cloze(
    "B1",
    "g-b1-sb-01",
    "E-Mail an die Schule",
    "Sprachbausteine",
    "Sehr geehrte Damen und Herren, ich {{1}} mich fur den Abendkurs im September anmelden. Ich arbeite tagsuber und {{2}} deshalb einen Kurs nach 18 Uhr. Konnten Sie mir bitte mitteilen, ob noch Platze {{3}} sind? Vielen Dank im Voraus fur Ihre {{4}}.",
    [
      { n: 1, answer: "mochte", choices: ["mochte", "mag", "muss", "werde"] },
      { n: 2, answer: "brauche", choices: ["brauche", "braucht", "gebraucht", "brauchen"] },
      { n: 3, answer: "frei", choices: ["frei", "teuer", "spat", "fertig"] },
      { n: 4, answer: "Hilfe", choices: ["Hilfe", "Reise", "Prufung", "Wohnung"] },
    ],
  ),
  bank(
    "B1",
    "g-b1-sb-02",
    "Im Cafe",
    "Sprachbausteine",
    "Hallo Anna, hast du Lust, am Samstag {{1}} Kaffee zu trinken? Ich habe um 15 Uhr Zeit. Wir konnen uns im Cafe an der {{2}} treffen. Schreib mir bitte, ob das {{3}} passt.",
    ["auf", "Ecke", "dir", "in", "mit"],
    [
      { n: 1, answer: "auf", choices: [] },
      { n: 2, answer: "Ecke", choices: [] },
      { n: 3, answer: "dir", choices: [] },
    ],
  ),
  horen(
    "B1",
    "g-b1-h-01",
    "Durchsage im Bahnhof",
    [
      { prompt: "Der Zug nach Hamburg hat Verspatung.", answer: "richtig" },
      { prompt: "Alle Reisenden mussen den Zug sofort verlassen.", answer: "falsch" },
      { prompt: "Es gibt Informationen auf Gleis 4.", answer: "richtig" },
      { prompt: "Die Durchsage betrifft einen Flug.", answer: "falsch" },
    ],
    "Achtung, eine Bahndurchsage: Der Zug nach Hamburg hat derzeit Verspatung. Bitte bleiben Sie ruhig auf dem Bahnsteig. Sie mussen den Zug nicht verlassen. Weitere Informationen erhalten Sie auf Gleis 4. Ende der Durchsage.",
  ),
  horen(
    "B1",
    "g-b1-h-02",
    "Gesprach in der Apotheke",
    [
      { prompt: "Die Person braucht etwas gegen Kopfschmerzen.", answer: "richtig" },
      { prompt: "Man darf das Medikament mit Alkohol nehmen.", answer: "falsch" },
      { prompt: "Es wird geraten, viel Wasser zu trinken.", answer: "richtig" },
    ],
    "Guten Tag, ich habe starke Kopfschmerzen. Konnen Sie mir etwas empfehlen? Ja, diese Tabletten helfen gut. Bitte nehmen Sie sie nicht mit Alkohol ein. Trinken Sie ausserdem viel Wasser und ruhen Sie sich aus.",
  ),
  schreiben(
    "B1",
    "g-b1-w-01",
    "Einladung ablehnen",
    "Freundin Lea ladtt dich zum Geburtstag am Samstag ein. Du kannst nicht kommen (Arbeit / Familie). Schreib eine kurze Nachricht (ca. 80-100 Worter): bedanke dich, erklare den Grund, schlage einen anderen Termin vor.",
    "Schreibe die Nachricht, dann markiere als fertig.",
  ),
  schreiben(
    "B1",
    "g-b1-w-02",
    "Beschwerde Hostel",
    "Du warst zwei Nachte in einem Hostel. Das Zimmer war laut und das WLAN funktionierte nicht. Schreibe eine formelle E-Mail (ca. 100 Worter) an die Leitung: Problem, Auswirkung, Bitte um Losung.",
    "Schreibe die E-Mail, dann markiere als fertig.",
  ),
  sprechen(
    "B1",
    "g-b1-s-01",
    "Uber sich sprechen",
    "Bereite 2 Minuten vor: Name, Herkunft, Beruf/Studium, Hobbys, warum du Deutsch lernst. Notiere Stichpunkte.",
    "Prepare tes notes, puis marque comme pret.",
  ),
  sprechen(
    "B1",
    "g-b1-s-02",
    "Alltag planen",
    "Situation: Du planst mit einer Freundin / einem Freund einen Samstag in der Stadt (Museum, Essen, Park). Bereite Vorschlage und Kompromisse vor.",
    "Prepare tes notes, puis marque comme pret.",
  ),
];

const b2 = [
  match(
    "B2",
    "g-b2-l1-01",
    "Medien und Meinungen",
    "Lesen Teil 1",
    [
      {
        title: "Kurzmeldungen reichen nicht",
        passage:
          "Wer sich nur uber Schlagzeilen informiert, ubersieht oft Zusammenhange. Ausfuhrliche Reportagen helfen, Ursachen und Folgen besser zu verstehen.",
      },
      {
        title: "Lokale Medien unter Druck",
        passage:
          "Viele Regionalzeitungen verlieren Anzeigenkunden. Ohne neue Finanzierungsmodelle droht eine Lucke in der lokalen Berichterstattung.",
      },
      {
        title: "Podcasts als Lernquelle",
        passage:
          "Immer mehr Lernende nutzen Podcasts, um Horverstehen und Wortschatz zu trainieren. Wichtig bleibt, Inhalte kritisch einzuordnen.",
      },
      {
        title: "Bilder lenken Aufmerksamkeit",
        passage:
          "Starke Fotos werden haufiger geteilt als reine Textbeitrage. Das kann die Diskussion emotionalisieren und Fakten in den Hintergrund drangen.",
      },
      {
        title: "Faktenprufung braucht Zeit",
        passage:
          "Redaktionen investieren in Verificationsteams. Gerade bei viralen Behauptungen ist Sorgfalt wichtiger als Geschwindigkeit.",
      },
    ],
    ["Wetter bleibt stabil", "Sport ohne Regeln"],
  ),
  match(
    "B2",
    "g-b2-l1-02",
    "Arbeitswelt im Wandel",
    "Lesen Teil 1",
    [
      {
        title: "Weiterbildung als Standard",
        passage:
          "Unternehmen erwarten, dass Mitarbeitende regelmassig neue Tools lernen. Interne Kursangebote werden deshalb ausgebaut.",
      },
      {
        title: "Hybride Teams koordinieren",
        passage:
          "Wenn ein Teil im Buro und ein Teil remote arbeitet, brauchen Teams klare Regeln fur Meetings und Erreichbarkeit.",
      },
      {
        title: "Fachkrafte aus dem Ausland",
        passage:
          "Anerkennungsverfahren fur Abschlusse dauern oft lange. Beschleunigte Verfahren konnen Engpasse in Pflege und IT mildern.",
      },
      {
        title: "Pause wirkt produktiv",
        passage:
          "Studien zeigen, dass kurze Erholungspausen Fehler reduzieren. Dauerhafte Uberlastung senkt dagegen die Qualitat der Arbeit.",
      },
      {
        title: "Feedbackkultur aufbauen",
        passage:
          "Regelmassige, konkrete Ruckmeldungen helfen schneller als seltene Jahresgesprache. Voraussetzung ist ein respektvoller Ton.",
      },
    ],
    ["Ferienhaus mieten", "Kochrezept teilen"],
  ),
  reading(
    "B2",
    "g-b2-l2-01",
    "Nachhaltiges Reisen",
    "Lesen Teil 2",
    "Immer mehr Menschen mochten umweltfreundlicher reisen, ohne auf Erlebnisse zu verzichten. Bahnfahren gilt auf mittleren Strecken oft als Alternative zum Flug. Gleichzeitig bleiben Preise und Verbindungen ein Hindernis. Wer fruh bucht und flexible Daten wahlt, findet haufig bessere Angebote. Nachhaltiges Reisen bedeutet auch, vor Ort regionale Betriebe zu unterstutzen und Ressourcen bewusst zu nutzen. Kompletter Verzicht auf Reisen ist fur viele unrealistisch; realistisch sind schrittweise Verbesserungen.",
    [
      {
        prompt: "Was gilt oft als Alternative zum Flug?",
        answer: "Die Bahn auf mittleren Strecken.",
        choices: [
          "Die Bahn auf mittleren Strecken.",
          "Nur Kreuzfahrten.",
          "Gar keine Mobilitat.",
        ],
      },
      {
        prompt: "Welche Hindernisse nennt der Text?",
        answer: "Preise und Verbindungen.",
        choices: [
          "Preise und Verbindungen.",
          "Zu viele Hotels.",
          "Zu kurze Ferien gesetzlich.",
        ],
      },
      {
        prompt: "Was empfiehlt der Text zusatzlich vor Ort?",
        answer: "Regionale Betriebe unterstutzen und Ressourcen bewusst nutzen.",
        choices: [
          "Regionale Betriebe unterstutzen und Ressourcen bewusst nutzen.",
          "Nur internationale Ketten buchen.",
          "Mull in der Natur lassen.",
        ],
      },
    ],
  ),
  reading(
    "B2",
    "g-b2-l2-02",
    "Lernen mit Zielen",
    "Lesen Teil 2",
    "Klare Lernziele machen Fortschritte sichtbar. Statt vage zu sagen \"besser werden\", hilft ein konkreter Plan: drei Horubungen pro Woche, ein Schreibtext alle vierzehn Tage, Wortschatz zu einem Thema. Ruckblicke am Wochenende zeigen, was funktioniert hat. Wer nur auf die Prufung starrt, vernachlassigt oft Alltagskommunikation. Ein ausgewogener Plan verbindet Prufungsformat und echte Sprachsituationen.",
    [
      {
        prompt: "Warum sind klare Ziele nutzlich?",
        answer: "Weil Fortschritte sichtbar werden.",
        choices: [
          "Weil Fortschritte sichtbar werden.",
          "Weil man dann nicht mehr uben muss.",
          "Weil Prufungen abgeschafft werden.",
        ],
      },
      {
        prompt: "Was kann passieren, wenn man nur auf die Prufung starrt?",
        answer: "Alltagskommunikation wird vernachlassigt.",
        choices: [
          "Alltagskommunikation wird vernachlassigt.",
          "Man lernt zu viele Dialekte.",
          "Man bekommt automatisch eine bessere Note.",
        ],
      },
    ],
  ),
  cloze(
    "B2",
    "g-b2-sb-01",
    "Stellungnahme Arbeit",
    "Sprachbausteine",
    "Viele Unternehmen diskutieren, {{1}} eine Vier-Tage-Woche sinnvoll ist. Befurworter argumentieren, dass Erholung die Produktivitat {{2}}. Kritiker hingegen befürchten Mehrarbeit an den verbleibenden Tagen. Entscheidend ist, ob Teams ihre Ablaufe {{3}} anpassen und realistische Ziele setzen. Ohne klare Kommunikation {{4}} solche Modelle schnell zu Konflikten.",
    [
      { n: 1, answer: "ob", choices: ["ob", "als", "weil", "trotz"] },
      { n: 2, answer: "steigert", choices: ["steigert", "senkt", "verhindert", "kopiert"] },
      { n: 3, answer: "gezielt", choices: ["gezielt", "zufallig", "niemals", "leise"] },
      { n: 4, answer: "fuhren", choices: ["fuhren", "fuhrt", "fuhrten", "gefahren"] },
    ],
  ),
  cloze(
    "B2",
    "g-b2-sb-02",
    "Formeller Brief",
    "Sprachbausteine",
    "Sehr geehrte Frau Weber, Bezug nehmend auf Ihr Schreiben vom 12. Marz {{1}} ich Ihnen die angeforderten Unterlagen. Sollten weitere Nachweise {{2}} sein, teilen Sie mir das bitte mit. Ich {{3}} mich fur die zügige Bearbeitung und verbleibe mit freundlichen Grussen.",
    [
      { n: 1, answer: "ubersende", choices: ["ubersende", "ubersendet", "schicke ich nie", "nehme"] },
      { n: 2, answer: "erforderlich", choices: ["erforderlich", "unmoglich", "verboten", "egal"] },
      { n: 3, answer: "bedanke", choices: ["bedanke", "beschwere", "entscheide", "erinnere"] },
    ],
  ),
  horen(
    "B2",
    "g-b2-h-01",
    "Radiobeitrag Weiterbildung",
    [
      { prompt: "Der Beitrag handelt von beruflicher Weiterbildung.", answer: "richtig" },
      { prompt: "Onlinekurse werden als nutzlos dargestellt.", answer: "falsch" },
      { prompt: "Zeitmanagement wird als Herausforderung genannt.", answer: "richtig" },
      { prompt: "Nur Studierende durfen Kurse besuchen.", answer: "falsch" },
    ],
    "In unserem Beitrag geht es um berufliche Weiterbildung. Viele Unternehmen fordern Onlinekurse, weil sie flexibel und hilfreich sind. Gleichzeitig bleibt Zeitmanagement eine grosse Herausforderung. Die Angebote richten sich nicht nur an Studierende, sondern auch an Berufstatige.",
  ),
  horen(
    "B2",
    "g-b2-h-02",
    "Interview Stadtleben",
    [
      { prompt: "Grunflachen gelten als wichtig fur die Lebensqualitat.", answer: "richtig" },
      { prompt: "Der Gast lehnt Offentlichen Verkehr ab.", answer: "falsch" },
      { prompt: "Bezahlbarer Wohnraum wird thematisiert.", answer: "richtig" },
    ],
    "Fur mich gehoren Grunflachen klar zur Lebensqualitat in der Stadt. Ich nutze regelmassig den Offentlichen Verkehr und halte ihn fur unverzichtbar. Ein weiteres zentrales Thema ist bezahlbarer Wohnraum, besonders fur junge Familien.",
  ),
  schreiben(
    "B2",
    "g-b2-w-01",
    "Forumbeitrag Homeoffice",
    "Schreibe einen Forumsbeitrag (ca. 150 Worter): Vorteile und Nachteile von Homeoffice fur Konzentration und Teamwork. Beende mit einer klaren Meinung.",
    "Schreibe den Beitrag, dann markiere als fertig.",
  ),
  schreiben(
    "B2",
    "g-b2-w-02",
    "Brief an den Vermieter",
    "In deiner Wohnung ist die Heizung seit einer Woche defekt. Schreibe einen formellen Brief (ca. 150 Worter): Situation, Auswirkungen, Frist fur Reparatur, weitere Schritte.",
    "Schreibe den Brief, dann markiere als fertig.",
  ),
  sprechen(
    "B2",
    "g-b2-s-01",
    "Kurzprasentation Hobby",
    "Prasentiere 2-3 Minuten ein Hobby und erklare, warum es fur dich wichtig ist. Strukturiere: Einleitung, 2 Argumente, Schluss.",
    "Prepare tes notes, puis marque comme pret.",
  ),
  sprechen(
    "B2",
    "g-b2-s-02",
    "Diskussion Reisen",
    "Diskutiert: Sollte man fur den Klimaschutz weniger fliegen? Bereite Pro/Contra und einen Kompromissvorschlag vor.",
    "Prepare tes notes, puis marque comme pret.",
  ),
];

const c1 = [
  match(
    "C1",
    "g-c1-l1-01",
    "Bildung und Teilhabe",
    "Lesen Teil 1",
    [
      {
        title: "Fruhe Sprachforderung wirkt nachhaltig",
        passage:
          "Programme in Kitas verbessern langfristig Lesekompetenz, besonders wenn Familien einbezogen werden und Angebote kontinuierlich finanziert sind.",
      },
      {
        title: "Digitale Tools ersetzen keine Begleitung",
        passage:
          "Lernapps individualisieren Ubungen, doch ohne Ruckmeldung durch Lehrkrafte sinkt die Motivation oft rasch und Lucken bleiben bestehen.",
      },
      {
        title: "Stipendien allein genugen nicht",
        passage:
          "Finanzielle Hilfen offnen Türen, aber Mentoring und Orientierung im Hochschulsystem entscheiden oft uber den Studienerfolg.",
      },
      {
        title: "Weiterbildung wird zur Normalitat",
        passage:
          "Angesichts schneller Technologiewechsel planen Erwerbstatige regelmassige Qualifizierung. Betriebe mit Lernzeiten berichten von hoherer Bindung.",
      },
      {
        title: "Prufungsangst mindert Leistung",
        passage:
          "Nicht fehlendes Wissen, sondern starke Angstreaktionen fuhren zu schwachen Ergebnissen. Realitatsnahe Proben konnen helfen.",
      },
    ],
    ["Privatschulen sind immer besser", "Gebaude allein losen alles"],
  ),
  reading(
    "C1",
    "g-c1-l2-01",
    "Wissenschaftskommunikation",
    "Lesen Teil 2",
    "Komplexe Forschung muss verstandlich bleiben, ohne unzulässig vereinfacht zu werden. In Krisen steigt der Druck auf klare Botschaften, zugleich wachst das Risiko, Unsicherheiten zu verschweigen. Gute Kommunikation benennt Wissensstand, offene Fragen und den Unterschied zwischen Hinweis und Metaanalyse. Vertrauen entsteht, wenn Korrekturen transparent erfolgen.",
    [
      {
        prompt: "Welches Spannungsfeld beschreibt der Text?",
        answer: "Verstandlichkeit ohne unzulässige Vereinfachung.",
        choices: [
          "Verstandlichkeit ohne unzulässige Vereinfachung.",
          "Maximale Geheimhaltung von Daten.",
          "Ersatz von Forschung durch Umfragen.",
        ],
      },
      {
        prompt: "Wann steigt das Risiko, Unsicherheiten zu verschweigen?",
        answer: "In Krisen mit Druck auf klare Botschaften.",
        choices: [
          "In Krisen mit Druck auf klare Botschaften.",
          "Nur in Ferienzeiten.",
          "Ausschliesslich in der Grundlagenforschung ohne Publikum.",
        ],
      },
      {
        prompt: "Was starkt langfristig Vertrauen?",
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
    "C1",
    "g-c1-l3-01",
    "Fragen zum Text: Hybrides Arbeiten",
    "Lesen Teil 3",
    "Hybride Modelle kombinieren Prasenz und Distanzarbeit. Vorteile sind Flexibilitat und bessere Vereinbarkeit; Nachteile liegen in erschwerter spontaner Koordination und ungleicher Sichtbarkeit. Fuhrung braucht klare Regeln zu Erreichbarkeit und Bewertung. Der Text fordert keine gesetzliche Pflicht zur Vier-Tage-Woche und behauptet nicht, Homeoffice ersetze Buroarbeit vollstandig.",
    [
      {
        prompt: "Welche Vorteile nennt der Text?",
        answer: "Flexibilitat und bessere Vereinbarkeit.",
        choices: [
          "Flexibilitat und bessere Vereinbarkeit.",
          "Weniger Bedarf an Fuhrung.",
          "Automatische Gehaltserhohungen.",
        ],
      },
      {
        prompt: "Was wird uber eine gesetzliche Vier-Tage-Woche gesagt?",
        answer: "Sie wird nicht gefordert.",
        choices: [
          "Sie wird nicht gefordert.",
          "Sie ist bereits Pflicht.",
          "Sie gilt nur fur Studierende.",
        ],
      },
    ],
  ),
  cloze(
    "C1",
    "g-c1-sb-01",
    "Essay Offentlicher Raum",
    "Sprachbausteine",
    "Stadte mussen knappen {{1}} gerecht verteilen. Wer Strassen nur als Durchgangswege sieht, {{2}} soziale Funktionen. Planungen setzen auf Mischformen, {{3}} Fussverkehr und Aufenthalt berucksichtigen. Massnahmen sollten {{4}} evaluiert werden. Beteiligung kann Konflikte {{5}}, sofern sie fruh und transparent ist.",
    [
      { n: 1, answer: "Raum", choices: ["Raum", "Raume", "Raumen", "Raumes"] },
      { n: 2, answer: "unterschatzt", choices: ["unterschatzt", "uberschatzt", "geschatzt", "ignoriert nie"] },
      { n: 3, answer: "die", choices: ["die", "der", "das", "denen"] },
      { n: 4, answer: "kontinuierlich", choices: ["kontinuierlich", "nie", "zufallig", "einmalig nur"] },
      { n: 5, answer: "entschärfen", choices: ["entschärfen", "verscharfen", "ignorieren", "verbieten"] },
    ],
  ),
  horen(
    "C1",
    "g-c1-h-01",
    "Vortrag Stadtmobilitat",
    [
      { prompt: "Der Vortrag behandelt ausschliesslich Flugverkehr.", answer: "falsch" },
      { prompt: "Parkraumbewirtschaftung kann Verkehr lenken.", answer: "richtig" },
      { prompt: "Verhaltensanderung braucht auch Infrastruktur.", answer: "richtig" },
      { prompt: "Offentlicher Verkehr wird grundsatzlich abgelehnt.", answer: "falsch" },
    ],
    "Dieser Vortrag behandelt die Stadtmobilitat, nicht den Flugverkehr. Parkraumbewirtschaftung kann den Verkehr wirksam lenken. Verhaltensanderung gelingt jedoch nur, wenn auch die Infrastruktur passt. Offentlicher Verkehr wird dabei als zentrale Losung empfohlen.",
  ),
  horen(
    "C1",
    "g-c1-h-02",
    "Diskussion KI in der Verwaltung",
    [
      { prompt: "Automatisierung kann Bearbeitungszeiten verkürzen.", answer: "richtig" },
      { prompt: "Menschliche Kontrolle gilt als entbehrlich.", answer: "falsch" },
      { prompt: "Diskriminierungsrisiken durch Daten werden genannt.", answer: "richtig" },
    ],
    "Automatisierung kann Bearbeitungszeiten deutlich verkürzen. Dennoch bleibt menschliche Kontrolle unerlasslich. Zugleich werden Diskriminierungsrisiken durch Trainingsdaten klar benannt und mussen gepruft werden.",
  ),
  schreiben(
    "C1",
    "g-c1-w-01",
    "Erorterung digitales Lernen",
    "Erortern Sie (ca. 350 Worter), inwiefern digitales Lernen Prasenzlehre erganzen oder ersetzen sollte. Chancen, Risiken, klare Position mit Beispielen.",
    "Redige environ 350 mots, puis marque comme pret.",
  ),
  schreiben(
    "C1",
    "g-c1-w-02",
    "Stellungnahme Datenschutz",
    "Schreiben Sie eine begrusste Stellungnahme (ca. 350 Worter) zur Strenge des Datenschutzes in digitalen Diensten. Sicherheit, Komfort, demokratische Kontrolle, Empfehlungen.",
    "Redige environ 350 mots, puis marque comme pret.",
  ),
  sprechen(
    "C1",
    "g-c1-s-01",
    "Prasentation lebenslanges Lernen",
    "Bereiten Sie eine 3-Minuten-Prasentation vor: Lebenslanges Lernen in der digitalen Arbeitswelt. Struktur + 3 Anschlussfragen.",
    "Prepare tes notes, puis marque comme pret.",
  ),
  sprechen(
    "C1",
    "g-c1-s-02",
    "Diskussion Stadt der Zukunft",
    "Diskutieren Sie Mobilitat und Wohnen in der Stadt der Zukunft. Pro/Contra, Bezahlbarkeit, Grunflachen. 5 Diskussionsimpulse.",
    "Prepare tes notes, puis marque comme pret.",
  ),
];

const outDir = path.join(process.cwd(), "content", "exam");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "goethe-b1.json"), JSON.stringify(b1));
fs.writeFileSync(path.join(outDir, "goethe-b2.json"), JSON.stringify(b2));
fs.writeFileSync(path.join(outDir, "goethe-c1.json"), JSON.stringify(c1));
console.log(
  JSON.stringify(
    { b1: b1.length, b2: b2.length, c1: c1.length, outDir },
    null,
    2,
  ),
);
