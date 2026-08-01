import fs from "node:fs";
import path from "node:path";

/** Original MERK C1 practice aligned with telc Deutsch C1 task types.
 * Not a republication of official telc Übungstests.
 */

function match(sourceId, title, section, pairs, distractors = []) {
  const options = [...new Set([...pairs.map((p) => p.title), ...distractors])];
  return {
    sourceId,
    sourceTitle: title,
    section,
    skill: "lesen",
    level: "C1",
    exam: "TELC",
    format: "MATCH",
    options,
    pairs,
    gaps: [],
  };
}

function reading(sourceId, title, passage, questions) {
  return {
    sourceId,
    sourceTitle: title,
    section: "Lesen Teil 2",
    skill: "lesen",
    level: "C1",
    exam: "TELC",
    format: "READING_MCQ",
    options: [],
    pairs: [],
    passage,
    gaps: questions.map((q, i) => ({
      n: i + 1,
      prompt: q.prompt,
      answer: q.answer,
      choices: q.choices,
    })),
  };
}

function sprach(sourceId, title, passage, gaps) {
  return {
    sourceId,
    sourceTitle: title,
    section: "Sprachbausteine",
    skill: "sprachbausteine",
    level: "C1",
    exam: "TELC",
    format: "CLOZE_MCQ",
    options: [],
    pairs: [],
    passage,
    gaps,
  };
}

function horen(sourceId, title, statements) {
  return {
    sourceId,
    sourceTitle: title,
    section: "Hören",
    skill: "horen",
    level: "C1",
    exam: "TELC",
    format: "TF",
    options: ["richtig", "falsch"],
    pairs: [],
    passage: `${title} · Ubung ohne Audio (Aussagen zum Global-/Detailverstehen)`,
    audioUrl: null,
    gaps: statements.map((s, i) => ({
      n: i + 1,
      prompt: s.prompt,
      answer: s.answer,
      choices: ["richtig", "falsch"],
    })),
  };
}

function lesen3(sourceId, title, passage, statements) {
  return {
    sourceId,
    sourceTitle: title,
    section: "Lesen Teil 3",
    skill: "lesen",
    level: "C1",
    exam: "TELC",
    format: "TF",
    options: ["richtig", "falsch", "nicht im Text"],
    pairs: [],
    passage,
    gaps: statements.map((s, i) => ({
      n: i + 1,
      prompt: s.prompt,
      answer: s.answer,
      choices: ["richtig", "falsch", "nicht im Text"],
    })),
  };
}

function schreiben(sourceId, title, passage) {
  return {
    sourceId,
    sourceTitle: title,
    section: "Schreiben",
    skill: "schreiben",
    level: "C1",
    exam: "TELC",
    format: "WRITE",
    options: [],
    pairs: [],
    passage,
    gaps: [
      {
        n: 1,
        answer: "done",
        choices: ["done"],
        prompt: "Redige environ 350 mots. Timer conseille : 70 minutes.",
      },
    ],
  };
}

function sprechen(sourceId, title, passage) {
  return {
    sourceId,
    sourceTitle: title,
    section: "Sprechen",
    skill: "schreiben",
    level: "C1",
    exam: "TELC",
    format: "WRITE",
    options: [],
    pairs: [],
    passage,
    gaps: [
      {
        n: 1,
        answer: "done",
        choices: ["done"],
        prompt: "Prepare ta presentation (notes), puis marque comme pret.",
      },
    ],
  };
}

const exercises = [
  match(
    "c1-l1-01",
    "Bildung und Chancengleichheit",
    "Lesen Teil 1",
    [
      {
        title: "Fruhe Forderung lohnt sich langfristig",
        passage:
          "Studien zeigen, dass gezielte Sprach- und Leseforderung bereits im Kindergarten die spateren Schulleistungen messbar verbessert. Besonders Kinder aus bildungsfernen Haushalten profitieren, sofern die Angebote kontinuierlich und qualitativ hochwertig sind.",
      },
      {
        title: "Digitale Lernplattformen ersetzen keine Lehrkraft",
        passage:
          "Obwohl adaptive Software individualisierte Ubungen ermoglicht, bleibt die padagogische Begleitung entscheidend. Ohne Ruckmeldung und Motivation durch Erwachsene sinkt die Nutzung oft rasch, und Lernruckstande werden kaum aufgeholt.",
      },
      {
        title: "Stipendien allein genugen nicht",
        passage:
          "Finanzielle Unterstutzung erleichtert den Zugang zur Hochschule, doch viele Studierende scheitern an fehlenden Netzwerken, unklaren Erwartungen und mangelnder Orientierung im Wissenschaftsbetrieb. Mentoringprogramme schliessen diese Lucke wirksamer.",
      },
      {
        title: "Berufliche Weiterbildung wird zum Normalfall",
        passage:
          "Angesichts rascher technologischer Veranderungen planen immer mehr Erwerbstatige regelmassige Qualifizierungsphasen ein. Unternehmen, die Lernzeiten verbindlich einraumen, berichten von hoherer Bindung und Innovationsfahigkeit.",
      },
      {
        title: "Prufungsangst beeintrachtigt Leistung",
        passage:
          "Nicht fehlendes Wissen, sondern starke Angstreaktionen fuhren bei einem Teil der Kandidatinnen und Kandidaten zu unterdurchschnittlichen Ergebnissen. Entspannungstechniken und realitatsnahe Probelaufe konnen die Kluft zwischen Konnen und Abruf verringern.",
      },
    ],
    ["Mehr Schulgebaude losen das Problem", "Privatschulen sind immer besser"]
  ),
  match(
    "c1-l1-02",
    "Arbeit und Gesellschaft",
    "Lesen Teil 1",
    [
      {
        title: "Homeoffice verandert Stadte",
        passage:
          "Weniger Pendelverkehr entlastet Verkehrswege, zugleich verlieren Innenstadtlagen an Frequenz. Cafes und Einzelhandel reagieren mit neuen Offnungszeiten, wahrend Wohnvororte starker nachgefragt werden.",
      },
      {
        title: "Fachkrafte fehlen trotz Arbeitslosigkeit",
        passage:
          "Qualifikationsmismatch erklart, warum offene Stellen und arbeitsuchende Personen gleichzeitig existieren. Umschulungen greifen nur, wenn sie eng mit Betrieben verzahnt sind und realistische Einstiegsperspektiven bieten.",
      },
      {
        title: "Vier-Tage-Woche bleibt umstritten",
        passage:
          "Pilotprojekte berichten von stabiler Produktivitat und besserer Gesundheit, Kritiker warnen jedoch vor Mehrbelastung in personalintensiven Branchen. Ob das Modell skalierbar ist, hangt stark von Organisationskultur und Auftragslage ab.",
      },
      {
        title: "KI ubernehmen Routine, nicht Verantwortung",
        passage:
          "Automatisierte Systeme beschleunigen Analyse und Dokumentation, doch ethische und rechtliche Entscheidungen bleiben bei Menschen. Transparente Prozesse sind notig, damit Fehlerquellen nachvollziehbar bleiben.",
      },
      {
        title: "Ehrenamt braucht professionelle Strukturen",
        passage:
          "Freiwilliges Engagement tragt soziale Infrastruktur, gerat aber unter Druck, wenn Koordination und Absicherung fehlen. Verbindliche Ansprechpartner und Weiterbildungen halten Engagement langfristig tragfahig.",
      },
    ],
    ["Steuern werden abgeschafft", "Alle Berufe verschwinden"]
  ),
  match(
    "c1-l1-03",
    "Umwelt und Innovation",
    "Lesen Teil 1",
    [
      {
        title: "Kreislaufwirtschaft senkt Rohstoffbedarf",
        passage:
          "Durch Wiederverwendung und Reparatur lassen sich Materialstrome reduzieren. Voraussetzung sind Produkte, die zerlegbar konstruiert sind, sowie Rucknahmesysteme, die fur Verbraucherinnen und Verbraucher unkompliziert funktionieren.",
      },
      {
        title: "Grune Energien brauchen Speicher",
        passage:
          "Wind und Sonne schwanken stark. Ohne Batterien, Netze und flexible Nachfrage bleibt die Energiewende unvollstandig, selbst wenn die installierte Leistung steigt.",
      },
      {
        title: "Stadtische Hitzeinseln gefahrden Gesundheit",
        passage:
          "Versiegelte Flachen speichern Warme und erhohen nachts die Temperatur. Begrunung, Schatten und entsiegelte Boden konnen lokale Extremwerte deutlich abmildern.",
      },
      {
        title: "CO2-Preise steuern Verhalten",
        passage:
          "Okonomische Anreize machen emissionsintensive Optionen teurer und fordern Alternativen. Damit soziale Harte vermieden wird, empfehlen Fachleute Ausgleichszahlungen fur Haushalte mit geringem Einkommen.",
      },
      {
        title: "Forschung allein schafft keine Akzeptanz",
        passage:
          "Technische Losungen scheitern oft an Misstrauen und unklarer Kommunikation. Fruhe Beteiligung Betroffener erhoht die Chance, dass Projekte tatsachlich umgesetzt werden.",
      },
    ],
    ["Plastik ist unproblematisch", "Klimaandert sich nicht"]
  ),

  reading(
    "c1-l2-01",
    "Demografischer Wandel",
    "In vielen europaischen Landern steigt der Anteil alterer Menschen, wahrend geburtenschwache Jahrgange nachwachsen. Das verandert nicht nur Rentensysteme, sondern auch Arbeitsmarkte, Gesundheitsversorgung und Stadtentwicklung. Arbeitgeber konkurrieren um weniger junge Fachkrafte und experimentieren mit langeren Erwerbsbiografien. Gleichzeitig wachst der Bedarf an Pflege, barrierefreiem Wohnen und mobilen Dienstleistungen. Politische Debatten kreisen um die Frage, wie Lasten zwischen Generationen fair verteilt werden konnen, ohne Innovation und gesellschaftlichen Zusammenhalt zu gefahrden. Experten betonen, dass rein finanzielle Anpassungen unzureichend sind: Bildungswege, Gesundheitspravention und die Aufwertung von Pflegeberufen gehoren ebenso dazu. Wer Demografie nur als Kostenproblem versteht, ubersieht die Potenziale alterer Erwerbstatiger und die Notwendigkeit, Einwanderung und Weiterbildung strategisch zu verknupfen.",
    [
      {
        prompt: "Worauf zielt der Text vor allem ab?",
        answer: "Auf die vielschichtigen Folgen und Losungsansatze des demografischen Wandels.",
        choices: [
          "Auf die vielschichtigen Folgen und Losungsansatze des demografischen Wandels.",
          "Auf die Abschaffung der Rentenversicherung.",
          "Auf den Beweis, dass Einwanderung uberflussig ist.",
        ],
      },
      {
        prompt: "Was kritisieren Experten an einer rein finanziellen Betrachtung?",
        answer: "Sie lasst Bildung, Pravention und Aufwertung der Pflege ausser Acht.",
        choices: [
          "Sie lasst Bildung, Pravention und Aufwertung der Pflege ausser Acht.",
          "Sie ist zu teuer fur den Staatshaushalt.",
          "Sie bevorzugt jungere Arbeitnehmer unfair.",
        ],
      },
      {
        prompt: "Welche Rolle spielen altere Erwerbstatige im Text?",
        answer: "Sie werden als Potenzial gesehen, nicht nur als Kostenfaktor.",
        choices: [
          "Sie werden als Potenzial gesehen, nicht nur als Kostenfaktor.",
          "Sie sollen sofort in den Ruhestand gehen.",
          "Sie ersetzen vollstandig junge Fachkrafte.",
        ],
      },
      {
        prompt: "Welche Bereiche verandert der demografische Wandel laut Text?",
        answer: "Unter anderem Arbeitsmarkt, Gesundheit und Stadtentwicklung.",
        choices: [
          "Unter anderem Arbeitsmarkt, Gesundheit und Stadtentwicklung.",
          "Ausschliesslich den Tourismus.",
          "Nur die Hochschulzulassung.",
        ],
      },
      {
        prompt: "Was wird mit Weiterbildung und Einwanderung verknupft?",
        answer: "Eine strategische Antwort auf Fachkraftemangel.",
        choices: [
          "Eine strategische Antwort auf Fachkraftemangel.",
          "Die Abschaffung von Pflegeberufen.",
          "Die Senkung des Rentenalters ohne Bedingungen.",
        ],
      },
    ]
  ),
  reading(
    "c1-l2-02",
    "Medien und Offentlichkeit",
    "Digitale Plattformen haben die Verbreitung von Nachrichten beschleunigt und zugleich die Grenze zwischen Information, Meinung und Unterhaltung verwischt. Algorithmen priorisieren Inhalte, die Aufmerksamkeit binden, nicht zwingend solche, die sorgfaltig gepruft wurden. Dadurch entstehen Filterblasen, in denen widerspruchliche Befunde kaum noch wahrgenommen werden. Gleichzeitig ermoglichen Open-Source-Recherchen und datenjournalistische Projekte eine neue Qualitat der Kontrolle. Medienkompetenz bedeutet daher nicht nur, Fakten zu erkennen, sondern auch Interessen, Finanzierung und Darstellungsformen zu hinterfragen. Regulierung allein reicht nicht: Ohne eine Kultur der Zweifel und der Quellenprufung bleibt die demokratische Offentlichkeit anfällig fur gezielte Desinformation.",
    [
      {
        prompt: "Welches Problem erzeugen Algorithmen laut Text?",
        answer: "Sie bevorzugen aufmerksamkeitsstarke Inhalte gegenuber sorgfaltig gepruften.",
        choices: [
          "Sie bevorzugen aufmerksamkeitsstarke Inhalte gegenuber sorgfaltig gepruften.",
          "Sie verhindern jegliche Meinungsausserung.",
          "Sie ersetzen Journalismus vollstandig durch Bucher.",
        ],
      },
      {
        prompt: "Was gehort zur Medienkompetenz uber Faktenwissen hinaus?",
        answer: "Interessen, Finanzierung und Darstellungsformen zu hinterfragen.",
        choices: [
          "Interessen, Finanzierung und Darstellungsformen zu hinterfragen.",
          "Nur Schlagzeilen zu lesen.",
          "Soziale Netzwerke komplett zu meiden.",
        ],
      },
      {
        prompt: "Welche positive Entwicklung nennt der Text?",
        answer: "Open-Source-Recherchen und datenjournalististische Projekte.",
        choices: [
          "Open-Source-Recherchen und datenjournalististische Projekte.",
          "Das Ende aller Regulierungen.",
          "Die Abschaffung von Printmedien.",
        ],
      },
      {
        prompt: "Warum reicht Regulierung allein nicht aus?",
        answer: "Ohne Prufungskultur bleibt die Offentlichkeit anfällig fur Desinformation.",
        choices: [
          "Ohne Prufungskultur bleibt die Offentlichkeit anfällig fur Desinformation.",
          "Weil Gesetze immer falsch sind.",
          "Weil Plattformen keine Nutzer haben.",
        ],
      },
      {
        prompt: "Was beschreiben Filterblasen?",
        answer: "Raume, in denen widerspruchliche Befunde kaum wahrgenommen werden.",
        choices: [
          "Raume, in denen widerspruchliche Befunde kaum wahrgenommen werden.",
          "Technische Storungen im Internet.",
          "Bibliotheken ohne digitale Kataloge.",
        ],
      },
    ]
  ),
  reading(
    "c1-l2-03",
    "Wissenschaftskommunikation",
    "Komplexe Forschungsergebnisse mussen der Offentlichkeit so vermittelt werden, dass sie verstandlich bleiben, ohne unzulässig vereinfacht zu werden. Gerade in Krisen steigt der Druck auf klare Botschaften, zugleich wachst das Risiko, Unsicherheiten zu verschweigen. Gute Wissenschaftskommunikation benennt den Stand des Wissens, offene Fragen und den Unterschied zwischen vorlaufigen Hinweisen und belastbaren Metaanalysen. Visuelle Formate konnen helfen, sofern sie nicht Scheingenauigkeit erzeugen. Vertrauensverlust entsteht oft nicht durch zu viel Detail, sondern durch nachtraglich korrigierte Absolute, die zunachst als Gewissheit verkauft wurden. Institutionen, die Fehler transparent korrigieren, starken langfristig ihre Glaubwurdigkeit.",
    [
      {
        prompt: "Was ist das zentrale Spannungsfeld des Textes?",
        answer: "Verstandlichkeit ohne unzulässige Vereinfachung.",
        choices: [
          "Verstandlichkeit ohne unzulässige Vereinfachung.",
          "Maximale Geheimhaltung von Forschung.",
          "Ersatz von Wissenschaft durch Meinungsumfragen.",
        ],
      },
      {
        prompt: "Wann steigt das Risiko, Unsicherheiten zu verschweigen?",
        answer: "Besonders in Krisen mit Druck auf klare Botschaften.",
        choices: [
          "Besonders in Krisen mit Druck auf klare Botschaften.",
          "Nur in Ferienzeiten.",
          "Ausschliesslich in der Grundlagenforschung ohne Publikum.",
        ],
      },
      {
        prompt: "Was starkt langfristig Glaubwurdigkeit?",
        answer: "Transparente Korrektur von Fehlern.",
        choices: [
          "Transparente Korrektur von Fehlern.",
          "Nie zuzugeben, dass etwas unklar ist.",
          "Nur absolute Aussagen ohne Daten.",
        ],
      },
      {
        prompt: "Welche Rolle spielen visuelle Formate?",
        answer: "Sie helfen, wenn sie keine Scheingenauigkeit erzeugen.",
        choices: [
          "Sie helfen, wenn sie keine Scheingenauigkeit erzeugen.",
          "Sie sind immer irrefuhrend.",
          "Sie ersetzen Metaanalysen vollstandig.",
        ],
      },
      {
        prompt: "Was sollte gute Wissenschaftskommunikation benennen?",
        answer: "Wissensstand, offene Fragen und Belastbarkeit der Befunde.",
        choices: [
          "Wissensstand, offene Fragen und Belastbarkeit der Befunde.",
          "Nur die spektakularsten Einzelergebnisse.",
          "Ausschliesslich politische Forderungen.",
        ],
      },
    ]
  ),

  lesen3(
    "c1-l3-01",
    "Studieren im Ausland",
    "Viele Hochschulen werben mit internationalen Semestern, doch die Realitat ist anspruchsvoll. Neben der fachlichen Vorbereitung zahlen Sprachkenntnisse auf akademischem Niveau, die Fahigkeit, Verwaltungsablaufe in einer anderen Kultur zu navigieren, und ein realistisches Budget. Stipendien decken oft nur Teile der Kosten. Wer fruh Wohnheimplatze beantragt und Prufungsordnungen vergleicht, vermeidet typische Verzogerungen. Mentorenprogramme erleichtern den Einstieg, sind aber nicht uberall verfugbar. Der Text betont ausdrucklich nicht, dass Auslandsaufenthalte fur jeden Studiengang verpflichtend seien.",
    [
      { prompt: "Auslandsaufenthalte sind in jedem Studiengang Pflicht.", answer: "nicht im Text" },
      { prompt: "Akademische Sprachkenntnisse sind wichtig.", answer: "richtig" },
      { prompt: "Stipendien decken immer die gesamten Kosten.", answer: "falsch" },
      { prompt: "Fruhe Wohnheimsuche kann Verzogerungen vermeiden.", answer: "richtig" },
      { prompt: "Mentorenprogramme gibt es an allen Hochschulen weltweit.", answer: "falsch" },
      { prompt: "Verwaltungsablaufe in einer anderen Kultur konnen herausfordernd sein.", answer: "richtig" },
    ]
  ),
  lesen3(
    "c1-l3-02",
    "Nachhaltiger Konsum",
    "Nachhaltiger Konsum bedeutet nicht automatisch Verzicht auf Komfort, sondern bewusstere Entscheidungen uber Lebensdauer, Reparaturfahigkeit und Lieferketten. Labels helfen nur, wenn sie glaubwurdig kontrolliert werden. Second-Hand-Markte wachsen, bleiben jedoch fur manche Produktgruppen begrenzt. Der Text nennt keine konkreten Prozentzahlen zur Emissionsreduktion durch einzelne Kaufentscheidungen und fordert keine generelle Abschaffung des Onlinehandels.",
    [
      { prompt: "Nachhaltiger Konsum bedeutet immer totalen Verzicht.", answer: "falsch" },
      { prompt: "Glaubwurdig kontrollierte Labels konnen Orientierung geben.", answer: "richtig" },
      { prompt: "Der Text nennt exakte Prozentwerte fur Emissionsersparnis pro Kauf.", answer: "nicht im Text" },
      { prompt: "Second-Hand ist fur alle Produktgruppen gleich stark verfugbar.", answer: "falsch" },
      { prompt: "Reparaturfahigkeit spielt eine Rolle bei nachhaltigen Entscheidungen.", answer: "richtig" },
      { prompt: "Der Text verlangt die Abschaffung des Onlinehandels.", answer: "nicht im Text" },
    ]
  ),
  lesen3(
    "c1-l3-03",
    "Hybrides Arbeiten",
    "Hybride Modelle kombinieren Prasenz und Distanzarbeit. Vorteile liegen in Flexibilitat und potenziell besserer Vereinbarkeit, Nachteile in erschwerter spontaner Koordination und ungleicher Sichtbarkeit von Mitarbeitenden. Fuhrungskrafte brauchen klare Regeln zu Erreichbarkeit und Bewertung. Der Text behauptet nicht, dass Homeoffice die Buroarbeit vollstandig ersetzen werde, und nennt keine gesetzliche Pflicht zur Vier-Tage-Woche.",
    [
      { prompt: "Hybride Arbeit kann die Vereinbarkeit verbessern.", answer: "richtig" },
      { prompt: "Sichtbarkeit von Mitarbeitenden kann ungleich werden.", answer: "richtig" },
      { prompt: "Homeoffice wird laut Text die Buroarbeit vollstandig ersetzen.", answer: "nicht im Text" },
      { prompt: "Klare Regeln zu Erreichbarkeit sind fur Fuhrung wichtig.", answer: "richtig" },
      { prompt: "Es gibt keinerlei Nachteile hybrider Modelle.", answer: "falsch" },
      { prompt: "Eine gesetzliche Pflicht zur Vier-Tage-Woche wird gefordert.", answer: "nicht im Text" },
    ]
  ),

  sprach(
    "c1-sb-01",
    "Essay: Offentlicher Raum",
    "Stadte stehen vor der Aufgabe, knappen {{1}} gerecht zu verteilen. Dabei geht es nicht nur um Verkehr, sondern auch um Aufenthaltsqualitat. Wer Strassen ausschliesslich als Durchgangswege begreift, {{2}} die sozialen Funktionen des offentlichen Raums. Aktuelle Planungen setzen verstarkt auf Mischformen, {{3}} Fussganger, Radverkehr und Aufenthalt gleichermassen berucksichtigt werden. Entscheidend ist, dass Massnahmen {{4}} evaluiert und angepasst werden, statt als einmalige Grossprojekte zu enden. Beteiligung der Bevolkerung kann Konflikte {{5}}, sofern sie fruhzeitig und transparent organisiert ist. Ohne belastbare Daten {{6}} jedoch die Gefahr, dass symbolische Gesten echte Verbesserungen ersetzen. Langfristig profitieren Kommunen, {{7}} investieren, statt nur kurzfristige Sichtbarkeit zu suchen. Gerade in dicht besiedelten Vierteln {{8}} kleine Eingriffe oft grossere Wirkung als spektakulare Prestigeobjekte.",
    [
      { n: 1, answer: "Raum", choices: ["Raum", "Raume", "Raumen", "Raumes"] },
      { n: 2, answer: "unterschatzt", choices: ["unterschatzt", "uberschatzt", "geschatzt", "entschatzt"] },
      { n: 3, answer: "in denen", choices: ["in denen", "in dem", "an denen", "bei dem"] },
      { n: 4, answer: "kontinuierlich", choices: ["kontinuierlich", "kontinuierlicher", "kontinuierliche", "kontinuierliches"] },
      { n: 5, answer: "entschärfen", choices: ["entschärfen", "verscharfen", "verschärfen", "entscharfen"] },
      { n: 6, answer: "besteht", choices: ["besteht", "bestehen", "bestand", "bestunde"] },
      { n: 7, answer: "die nachhaltig", choices: ["die nachhaltig", "der nachhaltig", "das nachhaltig", "denen nachhaltig"] },
      { n: 8, answer: "entfalten", choices: ["entfalten", "entfaltet", "entfaltete", "entfaltend"] },
    ]
  ),
  sprach(
    "c1-sb-02",
    "Brief: Forschungsantrag",
    "Sehr geehrte Mitglieder der Kommission, hiermit {{1}} ich um Forderung fur ein Projekt zur digitalen Teilhabe alterer Menschen. Ziel ist es, Barrieren {{2}} Nutzung von Behoerdenportalen zu identifizieren und praxisnahe Schulungen zu entwickeln. Bisherige Ansatze scheitern haufig daran, dass sie technische Losungen {{3}} die Lebenswelt der Zielgruppe stellen. Unser Vorhaben verbindet daher Feldforschung mit iterativen Prototypen, {{4}} fortlaufend getestet werden. Die beantragten Mittel {{5}} vor allem fur Personal und barrierefreie Materialien. Wir sind uberzeugt, dass die Ergebnisse uber die Region {{6}} ubertragbar sind. Fur Ruckfragen {{7}} ich Ihnen jederzeit zur Verfugung. Mit freundlichen Grussen {{8}} ich mich fur Ihre Prufung des Antrags.",
    [
      { n: 1, answer: "bitte", choices: ["bitte", "bittet", "bat", "beten"] },
      { n: 2, answer: "bei der", choices: ["bei der", "beim", "bei dem", "bei den"] },
      { n: 3, answer: "uber", choices: ["uber", "unter", "gegenuber", "neben"] },
      { n: 4, answer: "die", choices: ["die", "der", "das", "den"] },
      { n: 5, answer: "werden", choices: ["werden", "wird", "wurde", "worden"] },
      { n: 6, answer: "hinaus", choices: ["hinaus", "heraus", "hinein", "herunter"] },
      { n: 7, answer: "stehe", choices: ["stehe", "steht", "stehen", "stand"] },
      { n: 8, answer: "bedanke", choices: ["bedanke", "bedankt", "bedanken", "bedankte"] },
    ]
  ),
  sprach(
    "c1-sb-03",
    "Kommentar: Bildungspolitik",
    "Bildungspolitik gerat unter Druck, sobald internationale Vergleiche {{1}} werden. Dabei ist Vorsicht geboten: Rankings messen nicht alles, was Schulen leisten. Wer ausschliesslich Testergebnisse {{2}}, ubersieht soziale Integration, Kreativitat und demokratische Bildung. Dennoch konnen Daten helfen, systematische Ungleichheiten {{3}} zu machen. Entscheidend ist, ob daraus wirksame Forderung folgt, {{4}} nur symbolische Reformrhetorik. Lehrkrafte brauchen Zeit und Ressourcen, {{5}} sie individualisiert unterrichten konnen. Ohne diese Voraussetzungen {{6}} selbst durchdachte Curricula wirkungslos. Gesellschaften, die Bildung als gemeinsame Investition {{7}}, sichern langfristig Teilhabe. Kurzfristige Sparmassnahmen hingegen {{8}} oft teurer, als sie zunachst erscheinen.",
    [
      { n: 1, answer: "veroffentlicht", choices: ["veroffentlicht", "veroffentlichen", "veroffentlichte", "veroffentlichend"] },
      { n: 2, answer: "betrachtet", choices: ["betrachtet", "betrachten", "betrachtete", "betrachtend"] },
      { n: 3, answer: "sichtbar", choices: ["sichtbar", "sichtbaren", "sichtbare", "sichtbares"] },
      { n: 4, answer: "statt", choices: ["statt", "trotz", "wegen", "seit"] },
      { n: 5, answer: "damit", choices: ["damit", "dadurch", "dafur", "daran"] },
      { n: 6, answer: "bleiben", choices: ["bleiben", "bleibt", "blieb", "geblieben"] },
      { n: 7, answer: "begreifen", choices: ["begreifen", "begreift", "begriff", "begriffen"] },
      { n: 8, answer: "wirken", choices: ["wirken", "wirkt", "wirkte", "gewirkt"] },
    ]
  ),

  horen("c1-h-01", "Vortrag: Stadtmobilitat", [
    { prompt: "Der Vortrag behandelt ausschliesslich Flugverkehr.", answer: "falsch" },
    { prompt: "Flexibilitat und Zuverlassigkeit werden als Spannungsfeld genannt.", answer: "richtig" },
    { prompt: "Parkraumbewirtschaftung kann Verkehr lenken.", answer: "richtig" },
    { prompt: "Der Vortrag lehnt Offentlichen Verkehr grundsatzlich ab.", answer: "falsch" },
    { prompt: "Verhaltensanderung braucht auch Infrastruktur.", answer: "richtig" },
  ]),
  horen("c1-h-02", "Interview: Forschungsethik", [
    { prompt: "Einwilligung von Teilnehmenden wird als zentral beschrieben.", answer: "richtig" },
    { prompt: "Daten durfen beliebig weiterverkauft werden.", answer: "falsch" },
    { prompt: "Transparenz uber Risiken gehort zu guter Praxis.", answer: "richtig" },
    { prompt: "Ethikkommissionen gelten als uberflussig.", answer: "falsch" },
    { prompt: "Nachvollziehbarkeit von Methoden wird betont.", answer: "richtig" },
  ]),
  horen("c1-h-03", "Reportage: Fachkraftemangel", [
    { prompt: "Nur die Gastronomie ist betroffen.", answer: "falsch" },
    { prompt: "Anerkennung auslandischer Abschlusse wird thematisiert.", answer: "richtig" },
    { prompt: "Weiterbildung im Betrieb kann Engpasse mildern.", answer: "richtig" },
    { prompt: "Lohne spielen laut Aussage keine Rolle.", answer: "falsch" },
    { prompt: "Langfristige Strategien werden gefordert.", answer: "richtig" },
  ]),
  horen("c1-h-04", "Diskussion: KI in der Verwaltung", [
    { prompt: "Automatisierung kann Bearbeitungszeiten verkürzen.", answer: "richtig" },
    { prompt: "Menschliche Kontrolle wird fur entbehrlich erklart.", answer: "falsch" },
    { prompt: "Diskriminierungsrisiken durch Trainingsdaten werden genannt.", answer: "richtig" },
    { prompt: "Burgernahe Erklarungen der Entscheidungen sind unwichtig.", answer: "falsch" },
    { prompt: "Pilotprojekte sollen vor flachendeckendem Einsatz stehen.", answer: "richtig" },
  ]),

  schreiben(
    "c1-w-01",
    "Erorterung: Homeschooling",
    "Aufgabe (ca. 70 Minuten, mindestens 350 Worter):\n\nErortern Sie, inwiefern digitales Lernen die klassische Prasenzlehre erganzen oder ersetzen sollte. Gehen Sie auf Chancen (Flexibilitat, Individualisierung) und Risiken (soziale Isolation, ungleiche Ausstattung) ein. Beziehen Sie Stellung und begrunden Sie Ihre Position mit Beispielen."
  ),
  schreiben(
    "c1-w-02",
    "Stellungnahme: Datenschutz",
    "Aufgabe (ca. 70 Minuten, mindestens 350 Worter):\n\nSchreiben Sie eine begrusste Stellungnahme zur Frage, wie streng der Schutz personlicher Daten in digitalen Diensten sein sollte. Wägen Sie Sicherheitsinteressen, Komfort und demokratische Kontrolle ab. Formulieren Sie konkrete Empfehlungen fur Politik oder Unternehmen."
  ),
  schreiben(
    "c1-w-03",
    "Kommentar: Klimapolitik",
    "Aufgabe (ca. 70 Minuten, mindestens 350 Worter):\n\nVerfassen Sie einen Kommentar zu Massnahmen gegen den Klimawandel auf kommunaler Ebene. Diskutieren Sie, welche Instrumente (Regeln, Anreize, Infrastruktur) besonders wirksam sind und wie soziale Gerechtigkeit gesichert werden kann."
  ),
  schreiben(
    "c1-w-04",
    "Brief: Hochschulbeschwerde",
    "Aufgabe (ca. 70 Minuten, mindestens 350 Worter):\n\nSie studieren an einer Universitat und sind mit der Organisation eines Pflichtmoduls unzufrieden (unklare Kriterien, fehlende Materialien, schlechte Erreichbarkeit). Schreiben Sie einen formellen Beschwerdebrief an die Studiengangsleitung. Schildern Sie Sachverhalt, Auswirkungen und Ihre Forderungen sachlich und losungsorientiert."
  ),

  sprechen(
    "c1-s-01",
    "Prasentation: Lebenslanges Lernen",
    "Sprechen Teil 1A/1B (Vorbereitung ca. 20 Min):\n\nBereiten Sie eine kurze Prasentation (ca. 3 Minuten) zum Thema \"Lebenslanges Lernen in einer digitalen Arbeitswelt\" vor. Struktur: Einleitung, 2-3 Argumente mit Beispiel, Schlussfolgerung. Notieren Sie anschliessend 3 mogliche Anschlussfragen und knappe Antworten."
  ),
  sprechen(
    "c1-s-02",
    "Diskussion: Stadt der Zukunft",
    "Sprechen Teil 2 (Diskussion):\n\nDiskutieren Sie das Thema \"Wie soll die Stadt der Zukunft Mobilitat und Wohnen verbinden?\". Bereiten Sie Pro- und Contra-Punkte vor (Offentlicher Verkehr vs. Individualverkehr, Nachverdichtung vs. Grunflachen, Bezahlbarkeit). Formulieren Sie 5 Diskussionsimpulse fur ein Gesprach zu zweit."
  ),
  sprechen(
    "c1-s-03",
    "Prasentation: Medienkompetenz",
    "Sprechen Teil 1A/1B:\n\nPrasentieren Sie, warum Medienkompetenz Teil der Allgemeinbildung sein sollte. Nutzen Sie eine klare Gliederung und mindestens ein aktuelles Beispiel. Bereiten Sie eine kurze Zusammenfassung fur eine Zuhorerin/einen Zuhorer vor."
  ),
];

const outDir = path.join(process.cwd(), "content", "exam");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "telc-c1.json");
fs.writeFileSync(out, JSON.stringify(exercises));
const items = exercises.reduce(
  (s, e) => s + (e.format === "MATCH" ? e.pairs.length : e.gaps.length),
  0
);
console.log(`Wrote ${exercises.length} C1 sets, ${items} items -> ${out}`);
