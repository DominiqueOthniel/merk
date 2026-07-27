/* Auto-imported TELC B1 practice content adapted from public Deuropa exercises. */
export type ExamPair = { passage: string; title: string };

export type ExamExercise = {
  sourceId: string;
  sourceTitle: string;
  section: string;
  skill: "lesen" | "sprachbausteine" | "horen";
  level: string;
  exam: string;
  options: string[];
  pairs: ExamPair[];
};

export const EXAM_TELC_B1: ExamExercise[] = [
  {
    "sourceId": "204",
    "sourceTitle": "PETRA/JENNIFER",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Angebot für Reisende: Für wenig Geld öffentliche Verkehrsmittel benutzen.",
      "Bildband: Babys im Garten.",
      "Ein Schüler mit vielen Ideen.",
      "Früh übt sich: Hotels bieten Skikurse für Zweijährige an.",
      "Neu: Taxi – Tickest für Discobesucher.",
      "Straßenbahn und Bus im Flugticket enthalten.",
      "Handbuch für Hobby-Fotografen.",
      "Neu: Mit dem Taxi gratis zur Disco.",
      "Schulkinder schreiben spannende Geschichten.",
      "Skikurs für Eltern und Kinde."
    ],
    "pairs": [
      {
        "passage": "Ich möchte, dass Menschen, die meine Fotos gesehen haben, von nun an die Welt mit anderen Augen betrachten. Das könnte der neuseeländischen Fotografin Anne Geddes gelingen. Denn die Bilder, die sie für das Buch. Drunten im Garten von den kleinen Menschenkindern gemacht hat, sind ungewöhnlich und wunderschon: Babys auf Blumen, Blattern, Beeren, verkleidet als Morcheln, Melonen oder Marienkäfer, Babys in Tulpen und als Schmetterlinge. Ein Bildband, angereichert mit poetischen Texten und Ratschlägen.",
        "title": "Bildband: Babys im Garten."
      },
      {
        "passage": "Die meisten Skikurse für Kinder beginnen im Alter von vier Jahren. Im Kärntner Baby Dorf Trebesing ist das anders: Hier werden im Windel Wedel Camp bereits Kleinkinder ab zwei Jahren unterrichtet. Täglich zwei Stunden können die Skihaserin unter fachkundiger Anleitung auf einem flachen Hügel erste Geh- bzw. Fahrversuche auf zwei Brettern machen. Nach einigen Tagen Übung geht es dann mit dem Baby Bus ins Skigebiet Innerkrems. Auch Ginas Baby – und Kinderhotel am Fiaker See bietet seinen jüngsten Gästen Skikurse. Fast 1000 Knirpse haben in der Windelschule schon Skifahren gelernt. Auskunft: Tourismusverband Leiser – Malta Tal und die Kinderhotels",
        "title": "Früh übt sich: Hotels bieten Skikurse für Zweijährige an."
      },
      {
        "passage": "Berlins jüngster Schriftsteller hat deutlich mehr Texte verfasst als er Jahre zählt. Rund 50 Gedichte und Erzählungen tippte Daniel Story. 12, schon in seiner Computer. Ich schreibe fast, seitdem es mich gibt, sagt der Sechstklässler Bereits mit sieben dichtete er die ersten Verse, jetzt mit zwölf ist er stolz auf seine erste Autorenlesung. Wenn Freunde Fußball spielen, tobt Daniels Phantasie im Kinderzimmer. Warum er lieber schreibt? Daniel: Ich schreibe, weil ich nicht alles erleben kann, was ich denke.",
        "title": "Ein Schüler mit vielen Ideen."
      },
      {
        "passage": "Ob Sie privat oder geschäftlich unterwegs sind, mit dem Stadt Ticket können Sie billig die öffentlichen Verkehrsmittel nutzen. Voraussetzung: Sie sind mit dem Flugzeug oder der Deutschen Bahn(über 100 km) angereist. Gegen einen Aufpreis von nur Euro 2,50 ermöglicht Ihnen das Stadt Ticket auch nach der Ankunft am Zielort freie Fahrt. Mit U- S- oder Straßenbahnen sowie Bussen. Bis zu 48 Stunden. Übrigens: Ihr Stadt Ticket gilt an zwei aufeinanderfolgenden Tagen, die Sie beim Kauf Ihres Fahrscheines selbst bestimmen.",
        "title": "Angebot für Reisende: Für wenig Geld öffentliche Verkehrsmittel benutzen."
      },
      {
        "passage": "In Mecklenburg-Vorpommern können junge Leute jetzt für den halben Fahrpreis mit dem Taxi auf Discotour gehen. Tickets dafür sind bei allen Geschäftsstellen der Allgemeinen Ortskrankenkasse (AOK) sowie an Esso Tankstellen zum halben Preis erhältlich. Junge Leute zwischen 16 und 25 Jahren können sie an Wochenenden und Feiertagen in der Zeit von 20 Uhr bis morgens 6 Uhr benutzen. Die Taxifahrer erhalten bei ihrer Zentrale dann den vollen Fahrpreis erstattet",
        "title": "Neu: Taxi – Tickest für Discobesucher."
      }
    ]
  },
  {
    "sourceId": "206",
    "sourceTitle": "EVA/IRIS",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Zufriedenheit im Job schützt vor Stress.",
      "Erfolgreiche Männer können auch gute Väter sein.",
      "Keiner lacht so fröhlich wie der Weihnachtsmann.",
      "Wie Männer und Frauen lachen.",
      "Weniger Arbeit – weniger Stress.",
      "Schlechte Nachrichten? Sagen Sie es mit einem Lächeln.",
      "Der Beruf ist für Männer wichtiger als die Familie.",
      "Auch ältere Menschen leiden unter Stress.",
      "Frauen reagieren besser auf schlechte Nachrichten als Männer.",
      "Mit 70 Jahren macht das Leben am meistens Spaß."
    ],
    "pairs": [
      {
        "passage": "Frauen lachen auf viele Arten Sie kichern glucksen und manchmal singen sie fast Bei Männern dagegen kommt das viel seltener vor. Aber gemeinsam ist Männern und Frauen, dass sie in Vokalen lachen die im Mundzentrum gebildet werden. Und das ist entscheidend: Nur wenn die Vokale im Mundzentrum gebildet werden, ist das Lachen für uns fröhlich und positiv. Damit ist bewiesen, dass das Lachen vom Weihnachtsmann, dass wie eine tiefes Ho, ho , ho klingt. Kaum als fröhlich empfunden wird. Denn dieser Laut wird im hinteren Teil des Mundraums gebildet.",
        "title": "Wie Männer und Frauen lachen."
      },
      {
        "passage": "Viel Arbeit, viel Stress. Wer viel arbeitet muss nicht unbedingt gestresst sein. Frauen in medizinischen Berufen zum Beispiel klagen trotz teilweise hoher Belastung deutlich weniger über stressbedingte Krankheiten als Raumpflegerinnen, Kindergärtnerinnen oder Berufsschullehrerinnen. Dies zeigt eine Untersuchung des Hamburger IPO – Instituts, dasfür eine Studie 1000 Frauen und Männer befragt hat. Vor Stress schützen laut Studie ein angenehmes Betriebsklima, ein gutes Verhältnis zur Chefin oder zum Chef und die Möglichkeit, die eigene Arbeit selbstständig zu planen.",
        "title": "Zufriedenheit im Job schützt vor Stress."
      },
      {
        "passage": "Ein neues Buch zeigt, wie Männer Fähigkeiten aus dem Arbeitsleben auf die Erziehung übertragen können und so zu erfolgreichen Vätern werden. Da wird die gemeinsame Kindererziehung zur Partnerarbeit (oder sogar zum Joint Venture) geschicktes Verhandeln heißt, das Kind zu überzeugen, dasssie Zähne geputzt werden müssen, und der Familienurlaub hat alle Qualitäten einer Tagung oder eines Seminars: Man erhält die Gelegenheit, die Kinder intensiv zu studieren.",
        "title": "Erfolgreiche Männer können auch gute Väter sein."
      },
      {
        "passage": "Eine Studie der Universität Essex hat ergeben dass wir mit siebzig Jahren am glücklichsten sind. Zwar haben die meisten Menschen in diesem Alter gesundheitliche Probleme, aber dafür genießen sie viel Freizeit und haben keinen Stress mehr. Deshalb macht ihnen das Leben so viel Spaß wie nie zuvor. Die Studie besagt auch, dass wir einen ersten Höhepunkt der Lebensfreude mit fünfzehn Jahren erreichen. Danach geht es bergab zwischen dreißig und fünfzig Jahren tragen wir am meisten Verantwortung das Leben ist geprägt von Sachzwängen.",
        "title": "Mit 70 Jahren macht das Leben am meistens Spaß."
      },
      {
        "passage": "Warum bleiben manche Managerinnen erfolgreich, obwohl sie Nachrichten mitteilen, die ihr Publikum lieber nicht hören möchte? Ganz einfach: Sie verkaufen die schlechte Nachricht mit Humor. Ein Londoner Soziologe hat während einer Studie beobachtet, dass gerade bei Reden unangenehmen Inhalts oft heiter gelacht wird. Das Lachen wird bewusst provoziert, etwa durch bestimmte Wörter oder durch ein eigenes breites Lächeln. Die fröhliche Stimmung soll dafür sorgen, dass die Zuhörenden das Gefühl haben würden mehr wissen als alle anderen.",
        "title": "Schlechte Nachrichten? Sagen Sie es mit einem Lächeln."
      }
    ]
  },
  {
    "sourceId": "215",
    "sourceTitle": "SOPHIE/ANDREAS2",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Arbeitsplatz: Bezahlung wichtiger als Zufriedenheit.",
      "Ausstellungseröffnung an bayerischem Gymnasium.",
      "Frauen: mehr Spaß am Beruf als Männer.",
      "Gründe für Zufriedenheit am Arbeitsplatz.",
      "Immer mehr Teilzeitarbeitsplätze für Männer.",
      "Karriere ist Männern weniger wichtig als Frauen.",
      "Technik für Kleinkinder.",
      "Technisches Museum vergibt Umwelt-und Technikpreis.",
      "Umwelt- und Technikpreis.",
      "Wünsche von berufstätigen Eltern."
    ],
    "pairs": [
      {
        "passage": "Eine aktuelle Umfrage der Arbeiterkammer unter berufstätigen Eltern zeigt den dringenden Wunsch nach flexiblen Arbeitszeiten (60% der Eltern) und nach Kindergärten im oder in der Nähe des Betriebes (58%). Frauen verlangen aber deutlich mehr Teilzeitarbeitsplätze (50%) als Männer (36%). 52% aller Eltern wünschen eine Ersatzperson, die den Vater oder die Mutter bei Krankheit des Kindes im Betrieb vertritt. Die Arbeiterkammer fordert, dass sich Bedarf der Eltern orientieren.",
        "title": "Wünsche von berufstätigen Eltern."
      },
      {
        "passage": "MÜNCHEN: Schüler an bayerischen Gymnasien, die sich für Umwelt oder Technik interessieren, können sich auch dieses Jahr wieder um den Carl Friedrich von Martius Umwelt und Technikpreis bewerben. Bei diesem Wettbewerb werden Facharbeiten aus dem letzten Schuljahr bewertet. Nähere Informationen erhältlich beim GSF- Forschungszentrum unter der Telefonnummer 089/311 87 27 12.",
        "title": "Umwelt- und Technikpreis."
      },
      {
        "passage": "WIEN: Eine einmalige Abteilung für drei- bis sechsjährige Kinder wurde im Technischen Museum (15, Mariahitferstraße 112 ) eröffnet. In einem speziell für Kinder eingerichteten Bereich können die jüngsten Besucher Technik angreifen. Dort gibt es unter anderem Plasmascheiben, die Blitze erzeugen, ein Laufrad und ein Hüpfklavier, mit dem die Kinder Töne erspringen können. Viel Spaß macht den Kleinen auch, in einem Elektroauto herumzukurven und sich in verschiedenen Zerrspiegeln zu betrachten.",
        "title": "Technik für Kleinkinder."
      },
      {
        "passage": "HAMBURG: Männer haben mehr Karrierechancen, Frauen dafür mehr Freude am Beruf: Das ergab eine große Umfrage in Hamburg. Obwohl nur 8% der weiblichen Arbeitnehmer an ihre Aufstiegschancen glauben, geben 61% an, dass ihre Arbeit ihnen Spaß mache. Bei den Männer ist dieses Verhältnis 23 zu 57 Prozent.",
        "title": "Frauen: mehr Spaß am Beruf als Männer."
      },
      {
        "passage": "Für Zufriedenheit am Arbeitsplatz kann Geld allein nicht entscheidend sein. Dies gilt in besonderen Maß für hochqualifizierte europäische Arbeitskräfte, wie eine vergleichende internationale Management-Studie zeigt. Sowohl in Europa wie auch unter japanischen und amerikanischen Managern wird der Möglichkeit, neben der Arbeit auch Zeit für das Privatleben zu haben, ein zentraler Stellenwert beigemessen. Viel stärker als in Japan spielt es unter europäischen Angestellten eine Rolle, dass die Arbeit Spaß macht. Die Analysen zeigen auch, dass neben dem Gehalt der Ruf des Unternehmens für die Arbeitsplatzwahl von europäischen Arbeitnehmern besonders wichtig ist.",
        "title": "Gründe für Zufriedenheit am Arbeitsplatz."
      }
    ]
  },
  {
    "sourceId": "219",
    "sourceTitle": "NADJA/CLAUDIA",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Bilder mit dem Computer bearbeiten.",
      "Kirche bietet Backkurs für Kinder an.",
      "Kirche eröffnet neuen Treffpunkt.",
      "Neu: Kochbuch über Weiner Fleischgerichte.",
      "Neue Computerprogramme werden getestet.",
      "Preis für bestes Lernprogramm.",
      "Rezepte für Kuchen und Torten.",
      "Studie zeigt: Kaffeetrinker sind glücklicher.",
      "Warum die Wiener ins Café gehen.",
      "Zürcher Fotografen stellen aus."
    ],
    "pairs": [
      {
        "passage": "Die Kunst – und Medienschule F+ F Zürich bietet bereits zum dritten Mal den Computerkurs Digitale Bildbearbeitung an im neuen Semester steht für zehn Samstage Fotografie nach der Fotografie also die digitale Bearbeitung von Bildern im Mittelpunkt Dabei kommen verschiedene Softwareprodukte zum Einsatz Der Kurs befasst sich aber nicht nur mit dem Vermitteln auch Themen – und Problembereiche rund um die digitale Foto – und Bildbearbeitung kurskosten 800Franken Nähere Informationen und Anmeldung zu diesem Kurs www.f- f.ch.",
        "title": "Bilder mit dem Computer bearbeiten."
      },
      {
        "passage": "Neuperlach-Süd – Nach dem Einkaufen eine Kaffee genießen, mit anderen ins Gespräch Immen, sich mit Bekannten treffen oder einfach spannen – all das geht ab 11 Juli immer dienstags zwischen 14 und 18 Uhr im neuen Eiscafé der Dietrich – Bonhoeffer – Kirche Wir hotten damit einen Ort der Begegnung für Jung und Alt anbieten und zur Belebung des Stadtteils beitragen erklärt Pfarrer Sebastian Kühnen. Neben kalten und heißen Getränken sowie Kuchen steht während der Öffnungszeiten auch eine Mitarbeiten für Gespräch zur Verfügung.",
        "title": "Kirche eröffnet neuen Treffpunkt."
      },
      {
        "passage": "Geheimnisse der modernen Konditorkunst der Meister des Süßen, Herwig Gasser, in Jahre hinweg sammelte der Bäcker des berühmten Wiener Café Landmann Mehlspeisenrezepte. Von der Birnentorte über den Apfelstrudel bis hin zum Heidelbeerstolle Verlag Kettel, 110 Fotos, 300 Seiten. ISBAN 3 – 85134 – 014 -0",
        "title": "Rezepte für Kuchen und Torten."
      },
      {
        "passage": "Am Montag wird in Stuttgart die BildungsDidacta eröffnet. Dort werden vor allem Lehrmaterialien vorgestellt. Bei vielen sich um Bildungssoftware. Für ein gelungenes Softwareprojekt wird am der Bildungssoftwarepreis digital vergeben Dabei handelt es sich um die wichtige Auszeichnung für Lehr – und Lernprogramm deutschsprachigen Raum Die verzeichnen mit dem digital multimediale Gebote aus, die inhaltlich und formal als ragend und beispielgebend gelten können.",
        "title": "Preis für bestes Lernprogramm."
      },
      {
        "passage": "Des Gallup – Instituts hat sich mit Kaffeehausverhaltens der Wiener Ein Vorurteil hat sich dabei bestätigt Kaffeehaus und der Wiener Seine Melange Ergebnisse der Studie 27 der an, zumindest einmal im Monat der Nähe ihrer Wohnung zu gehen. Durchschnittlich 54 Minuten Befragten in ihrem Stamm Café Kundschaft umso länger wird gegessen. Der Grund ein Kaffeehaus wichtiger ist das Plaudern und Freunden. 77 der Befragten Grund für den Besuch im Kaffeehaus.",
        "title": "Warum die Wiener ins Café gehen."
      }
    ]
  },
  {
    "sourceId": "221",
    "sourceTitle": "NICOLE",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Sportkurse für ältere Menschen.",
      "Für Jugendliche ist der Computer etwas Alltägliches.",
      "Das Interesse am Handel über Internet nimmt stark ab.",
      "Arbeiten am Computer verursacht häufig Rückenschmerzen.",
      "Internetnutzer machen viele Dinge gleichzeitig.",
      "Firmen müssen auch über Internet für Produkte werben.",
      "Auch Freizeitsportarten sollten trainiert werden.",
      "Was man gegen Rückenschmerzen tun kann.",
      "Kinder wollen mit dem Computer nur spielen.",
      "Internetnutzer interessieren sich nicht fürs Fernsehen."
    ],
    "pairs": [
      {
        "passage": "Falsche Körperhaltung, mangelnde Bewegung und psychische Faktoren sind meistens die Hauptfaktoren für Rückenschmerzen. Hier finden Sie ein ganzheitliches Trainingsprogramm, das hilft: Alle Übungen lassen sich im Alltag gut umsetzen und sind auch bei Vorschäden der Wirbelsäule durchführbar. Mit speziellen Entspannungstraining. 114 Seiten, durchgehend Farbabbildungen, 18×25 cm, gebunden.",
        "title": "Was man gegen Rückenschmerzen tun kann."
      },
      {
        "passage": "Der Computer gehört heute wie selbstverständlich in das Jugendzimmer. Wie früher die Modelleisendbahn oder die Barbie-Puppe. Was aber genau treiben die Kids mit den hochgerüsteten Rechenmaschinen auf dem Schreibtisch? Das wollte die Jugendzeitschrift Bravo wissen. Selbstverständlich spielen, aber auch andere, nützlichere Dinge wie Texte schreiben oder Hausaufgaben für die Schule erledigen, Tabellen erstellen – und natürlich im Internet herumsurfen.",
        "title": "Für Jugendliche ist der Computer etwas Alltägliches."
      },
      {
        "passage": "Inline-Skating ist ein Idealer Ausdauersport – nicht nur für die jüngere Generation. Das haben jetzt Untersuchungen am Institut für Sportwissenschaften an der Universität Frankfurt bestätigt. Danach trainiert Inline-Skating das Herz-Kreislauf-System, beansprucht die wichtigsten Muskelgruppen und fördert die Koordination. Die Faszination dieser rasanten Freizeitsportart wirke generationenübergreifend und erfasst die Jungen wie die Alten, sagt Dr. Hans Jürgen Ahrens. Allerdings fragt der Arzt kritisch, warum jeder Skifahrer, Windsurfer oder Tennisspieler zu Beginn Trainingsstunden bei einem Profi belege, oft aber nicht der Inliner: Dabei lässt sich das Verletzungsrisiko durch regelmäßiges Fahrtraining deutlich verringern. In einem Kurs sollten die wichtigsten Sturz- Brems und Fahrtechniken erlernt werden.",
        "title": "Auch Freizeitsportarten sollten trainiert werden."
      },
      {
        "passage": "Eine Studie der Fernsehgesellschaften ARD und ZDF besagt, dass deutsche Internetnutzer sich auch mit anderen Dingen beschäftigen, wenn sie im Internet sind. Ein Großteil der beobachteten Personen telefoniert beim Surfen, hört nebenbei Musik, oder arbeitet mit anderen Computerprogrammen. Aber auch Konkurrenzmedien wie Fernsehen und Zeitschriften finden große Aufmerksamkeit, während im Internet nach Informationen gesucht wird.",
        "title": "Internetnutzer machen viele Dinge gleichzeitig."
      },
      {
        "passage": "Geschäfte über das Internet werden in Deutschland auch in Zukunft Milliarden Euro einbringen. In spätestens zwei Jahren werden 20 Prozent aller europäischen Geschäfte über das Internet abgewickelt, sagen die Fachleute. Heutzutage ist es kaum vorstellbar, dass ein Unternehmen allein mit klassischen Verkaufsmethoden und ohne zusätzliches Online- Marketing erfolgreich sein wird. Wer heute nicht anfängt, diese Möglichkeiten zu nutzen, kann in Zukunft seine Kunden verlieren. Das Argument, dass die angebotene Ware sich ja auch ohne Internet gut verkaufe, stimmt so nicht mehr. Denn das Internet beeinflusst auch das Käuferverhalten auf der Straße.",
        "title": "Firmen müssen auch über Internet für Produkte werben."
      }
    ]
  },
  {
    "sourceId": "223",
    "sourceTitle": "ANDREAS",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Märchen-Festspiele in Bremen.",
      "Griechische Botschaft bietet Sprachkurse für Schüler.",
      "Universitätsstadt wird 300 Jahre.",
      "Wissenschaft: Von der Körpergröße hängt das Gehalt ab.",
      "Durch Handel reich geworden.",
      "Interessante Universitätsstadt mit hoher Lebensqualität.",
      "Latein in deutschen Schulen wieder beliebter.",
      "Wer wenig lacht, verdient auch weniger.",
      "Fremdsprachen: Schüler lernen nur Englisch und Französisch.",
      "Griechisch wird in deutschen Schulen kaum unterrichtet."
    ],
    "pairs": [
      {
        "passage": "In Deutschland lernen nur ganz wenige Schüler Griechisch. Es sind insgesamt nur 0.14 aller Schüler. Vor 30 Jahren waren es noch 0,48 So berichtet die griechische Botschaft in Berlin in ihrem Europabericht. Griechisch wird meistens von Zwölftklässlern als dritte Fremdsprache neben Französisch und Englisch gewählt. Die wenigen Schüler, die Griechisch wählen, haben Verwandte in Griechenland.",
        "title": "Griechisch wird in deutschen Schulen kaum unterrichtet."
      },
      {
        "passage": "Dem Meer verdankt die Hansestadt Bremen ihre Bedeutung. Bremer Kaufleute und Seefahrer nutzten die günstige geografische Lage, um in aller Welt heimisch zu werden. Seit Generationenhaben sie Handel getrieben, so dass Geld in die Stadt. Dies steht man der Stadt heute noch an: das Alte Rathaus, das Kaufmannhaus, die historische Innenstadt. Außerdem war Bremen auch immer eine Heimat für natürlich das Märchen der Bremer Stadtmusikanten.",
        "title": "Durch Handel reich geworden."
      },
      {
        "passage": "Freiburg, die Hauptstadt des Schwarzwaldes, liegt in einer der sonnigsten Gegenden Deutschlands. Wo es so viel Sonne gibt , da ist auch viel Lebensfreude, und nicht zuletzt gehören auch badische Küche und badischer Wein zum Besten was in Deutschland geboten wird. Zum einmaligen Flair gemütlichen Universitätsstadt trägt auch ihre Lage bei. Frankreich und die Schweiz sind nicht weit entfernt. Die Stadt selbst lockt mit vielen alten Straßen mit zahlreichen Museen und Baudenkmälern. Über alles hinaus ragt die große Kirche, die nach 300 – jähriger Bauzeit 1513 vollendet wurde.",
        "title": "Interessante Universitätsstadt mit hoher Lebensqualität."
      },
      {
        "passage": "In einer wissenschaftlichen Untersuchung hat man erforscht, warum bestimme Menschen mehr Geld verdienen als andere. Britische Wissenschaftler behaupten, größeren Menschen zahlt der Chef mehr. Im Laufe des vergangenen Jahres haben zwei weitere Untersuchungen festgestellt: Wer wenig lacht oder häufig mit Kollegen trinken geht, verdient mehr nur: Nicht lachen und mit Kollegen trinken, gehen das kann man lernen. Aber wachsen?",
        "title": "Wissenschaft: Von der Körpergröße hängt das Gehalt ab."
      },
      {
        "passage": "Das Statistische Bundesamt berichtet, dass in deutschen Schulen allgemein wieder mehr Latein gelernt wird. Allein in Thüringen hat sich die Anzahl in den letzten beiden Jahren verdoppelt Während der Tiefpunkt bei Latein im vorletzten Jahr erreicht war, wählen zurzeit wieder mehr Schüler Latein als erste Fremdsprache. Als vorteilhaft hat sich offenbar vor allem das wittenbergische Modell erwiesen, das Latein in der fünften Klasse mit einer modernen Fremdsprache (Französisch, Englisch usw.) kombiniert Allerdinges sind hier meist nur drei Stunden für beide Sprachen pro Woche vorgesehen. Das sei bei Weitem zu wenig, Kritisieren Lateinlehrer Weitem zu wenig kritisieren Lateinlehrer.",
        "title": "Latein in deutschen Schulen wieder beliebter."
      }
    ]
  },
  {
    "sourceId": "226",
    "sourceTitle": "ANNIKA1",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Der öffentliche Verkehr auf einen Blick.",
      "Türen auf für fremde Kulturen.",
      "Ski fahren in der Schweiz.",
      "Schlank werden und trotzdem gut essen.",
      "Herr Ober: Es schmekt mir nicht! , sagen nur wenige Gäste.",
      "Die schönsten Bahnstrecken in Deutschland.",
      "Die Deutschen beschweren sich sofort.",
      "Wanderungen im Schnee.",
      "Hauptsache es schmeckt - Gesundheit ist Nebensache.",
      "Immer beliebter: Studienreisen in die Schweiz."
    ],
    "pairs": [
      {
        "passage": "Es stimmt: Wir essen einfach zu viel Fett, zu viel Fleisch und zu wenig Ballaststoffe. Doch die wenigsten scheint das zu kümmern. Die Hausmannskost mit Kohlrouladen. Schweine braten und Currywurst sund nach wie vor die Lieblingsgerichte der Deutschen. Und nur jeder Fünfte will sich der Figur zuliebe beim Essen einschränken. Das ergab die neueste Umfrage der Gesellschaft für Konsumforschung über - Trends in der Ernährung.",
        "title": "Hauptsache es schmeckt - Gesundheit ist Nebensache."
      },
      {
        "passage": "Sämtliche Informationen zu den Bahnlinien und ausgesuchen Busverbindungen in der Bundesrepublik können Sie in gesammelter Form auf der Webseite des Verkehrsclubs Deutschland (www.vcd.net) finden. Unter dem Menüpunkt Fahrpläne Bus und Bahn Deutschland können Sie die wichtigsten Daten zum Fernverkehr, zu Regional und S-Bahnen sowie zu Buslinien abrufen. Per Suchbefehl erhalten Sie außerdem Auskunft über Verkehrsverbunde und rund 8000 Bahnhöfe in Deutschland.",
        "title": "Der öffentliche Verkehr auf einen Blick."
      },
      {
        "passage": "Immer mehr Gäste in den Wintersportorten wollen auch in der kalten Jahreszeit ihrem Hobby, dem Wandern, frönen und suchen Freunde und + Erholung abseits des Pistenrummeis. Sie finden beides auf markierten und vom Schnee geräumten Winterwanderwegen in den Bergen. Der Autor Emanuel Balsinger stellt drei Dutzend Routen in der Schweiz vor und liefert sämtliche Informationen zu einfachen Spazierengängen im Schnee oder anspuchswollen, längeren Wanderungen. Das Buch kostet CHF 34,80 Euro. Erhältich im Buchhandel oder direkt bei: Werd Verlag, Postfach, 8021 Zürich.",
        "title": "Wanderungen im Schnee."
      },
      {
        "passage": "Der Service im Restaurant ist schlecht, das Essen lauwarm und mäßig . Beschweren Sie sich? Nein, Dann befinden Sie sich in großer Gesellschaft. Nach dem Ergebnis einer Studie der Bundesforschungsanstalt für Ernährung hat nur jeder Dritte beim Anblick des bestellten Menüs daran gedacht, sich zu beschweren. Wenige von ihnen machten ihrem Ärger auch tatsächlich Luft. Die übrigens zwei Drittel hielten lieber still, weil sie den Aufwand scheuten, keine Zeit hatten oder es peinlich fanden. Dabei hatten die Aufmüpfigen durchweg Erfolg. Die meinsten erhielten eine Ersatzleistung. Seltener gab es eine Entschuldigung und noch seltener Preisnachlass.",
        "title": "Herr Ober: Es schmekt mir nicht! , sagen nur wenige Gäste."
      },
      {
        "passage": "Die Jugendaustausch - Organisation AFS Interkulturelle Programme Schweiz sucht Familien, die während eines Jahres Schüler und Schülerinnen aus dem Ausland beherbergen möchten. Die 16 bis 19 jährigen Jungen und Mädchen kommen vorwiegend aus Neuseeland und Australien, aber auch aus Südafrika, Chile , Simbabwe, Costa Rica und Kolumbien. In ihrem Austauschjahr möchten sie unsere Kultur und Sprache kennenlernen. Die Gastfamilien bieten kostenlos mit neuen Gedanken und Menschen aus fremden Kulturen auseinandersetzt, wendet sich an: AFS Interkulturelle Programme Schweiz CH 8037 Zürich, Langstr. Tel 01-2116041.",
        "title": "Türen auf für fremde Kulturen."
      }
    ]
  },
  {
    "sourceId": "227",
    "sourceTitle": "ANNIKA2/SONJA CORINA",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Finanzielle Unterstützung für Kunstprojekte mit Schülern.",
      "Winterveranstaltung auf dem Eis mit Musik.",
      "Aktionsprogramm der Eu:Finanzielle Unterstützung für italienische Künstler.",
      "Kunstausstellung von italienischen Schülern.",
      "Deutschlernen mit euer Methode im Radio.",
      "Geld für gemeinsame europäische Projekte.",
      "Elternverein organsiert Kunstausstellung.",
      "Mit der Eisenbahn ins winterliche Wien.",
      "Mehr Geld für österreichische Musikschulen.",
      "Wie Sprachaufenthalte auswählen?"
    ],
    "pairs": [
      {
        "passage": "Rund 150,000 Sprachreisen werden von Deutschen jährlich unternommen. Der Wunsch, eine andere Sprache zu lernen, kann verschieden Gründe haben: private, schulische oder berufliche. Das Angebot an Sprachreisen wächst ständig, über die Qualität ist jedoch wenig oder nichts bekannt. Im Marktplatz geht es diesmal um Kriterien für das Lernen mit Erfolg. Welche Methoden sind zu empfehlen, welche Anbieter kosten? Ihre Fragen werden am Hörertelefon unter 0800-839601 von Fachleuten beantwortet.",
        "title": "Wie Sprachaufenthalte auswählen?"
      },
      {
        "passage": "Die Metropole Wien lädt zum winterlichen Eisvergnügen vor dem Wiener Rathaus ein: vom 22. Januar bis 7.März kann man auf 1800 Quadratmetern übers Eis fahren. Die Musik dazu bestimmt den Fahrstil und reicht vom klassischen Walzer bis zur Diskomusik. Nachts werden auf der Eisbahn Partys veranstaltet, vom Samba - Fest bis zum Hip-Hop –Event. Speisen und Getränke gibt es an verschiedenen Ständen, Schlittschuhe und Stiefel kann man leihen. Informationen: Wiener Tourismusverband.",
        "title": "Winterveranstaltung auf dem Eis mit Musik."
      },
      {
        "passage": "Für das Aktionsprogramm der Europäischen Union (EU) zur beruflichen Weiterbildung, Leonardo da Vinci, können noch bis zum 31. März Anträge gestellt werden. Ziel des Programms ist es, europäische Projekte zur beruflichen Weiterbildung zu unterstützen Anträge auf finanzielle unterstützen können die Institutionen stellen, die mit mindestens zwei weiteren europäischen Partnern an einem Projekt arbeiten wollen. Information: Nationale Koordinerungsstelle Leonardo da Vinci, Fehrbelliner Platz 3, D-10707 Berlin, Tel, 030/8643-0, Fax- 2637.",
        "title": "Geld für gemeinsame europäische Projekte."
      },
      {
        "passage": "Wien(SN.APA). Wie das Unterrichtsministerlum mitteilte, sollen im kommenden. Jahr monatlich 70,000 Euro für Kulturprojekte an Schulen zur Verfügung gestellt werden. Unterstützt würden damit Veranstaltungen und Projekte, die das Verständnis der Kinder und Jugendlichen für die Künste wecken, das Interesse am Musisch – Kreativen verstärken und zu Kontakten und einer Auseinandersetzung mit Künstlern führen. Dadurch soll in altersgemäßer Form die ganzheitliche Entwicklung der Persönlichkeit von Kindern und Jugendlichen gefördert werden.",
        "title": "Finanzielle Unterstützung für Kunstprojekte mit Schülern."
      },
      {
        "passage": "Zum sechsten Mal veranstaltet das Comitato Geniton Binnigen/ Bottmingen seine breit angelegte multikulturelle Kunstausstellung Arte. An der Veranstaltung nehmen 70 Künstlerinnen und Künstler aus der Region sowie Gäste aus Italien, Frankreich, Deutschland und weiteren Ländern teil. Bei dem vor 18 Jahren gegründeten Comitato handelt es sich um einen Elternverein, der damals italienischsprachigen Kindern bei ihren Schulprobiemen hilfreich zur Seite stand. Da die jetzige dritte Kindergeneration nicht mehr diese Probleme hat, suchte das Comitato nach neuen Aufgeben und fand in der Organisation der alljährlichen Kunstausstellung ein neues, interessantes Betätigungsfeld.",
        "title": "Elternverein organsiert Kunstausstellung."
      }
    ]
  },
  {
    "sourceId": "228",
    "sourceTitle": "CAROLINA/ALICIA",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Familienbildung Schwerpunkt Beruf und Familie.",
      "Demonstration gegen Fluglärm.",
      "Flughafen Frankfurt wird 10 Jahre.",
      "Flughafen Frankfurt beliebter Veranstaltungsort.",
      "Experten gegen Vergrößerung des Flughafens.",
      "Diskussion über Flughafen und Arbeitsplätze.",
      "Neue Kurse: Spiele für Mütter und Kinder.",
      "Umwelt und Flughafen: Ein Informationsabend der Bürger.",
      "Neue Kurse für Kinder.",
      "Neue Kurse: Museumsführung für junge Väter."
    ],
    "pairs": [
      {
        "passage": "Der Frankfurter Flughafen wird weiter ausgebaut. Eine Gruppe von Frankfurter Bürgern aus den östlichen Stadtteilen, die sich seit Jahren aktiv für den Naturschutz und die Umwelt einsetzt, lädt für Donnerstag dieser Woche um 19.30 Uhr zu einem Informationsabend über den Ausbau des Frankfurter Flughafens ein. Im Bürgerhaus Ostend, Parkstraße 24, Clubraurn 12, werden verschiedene Sprecher zu hören sein. Die Gruppe möchte Antworten auf folgende Fragen suchen: Wie viel Lärm durch Flugzeuge verträgt die Stadt? Oder Welche Auswirkungen hat der Flugverkehr auf Umwelt und Natur?",
        "title": "Umwelt und Flughafen: Ein Informationsabend der Bürger."
      },
      {
        "passage": "Der Frankfurter Flughafen erfreut sich bei vielen Firmen als beliebter Ort für Veranstaltungen und Tagungen. Dies zeigt ein Bericht des Frankfurter Flughafens, der beim zehnjährigen Jubiläum des Kongresszentruns vorgelegt wurde. Im Jubiläumsjahr haben am Frankfurter Flughafen 6800 Veranstaltungen mit insgesamt 72000 Teilnehmern stattgefunden. Im Jahr davor waren es nur 6300 Veranstaltungen mit 70000 Gästen. Im Kongresszentrum, das direkt gegenüber dem Hauptgebäude des Flughafens liegt, gibt es 28 Konferenzräume für bis zu 200 Teilnehmer. Modernste Technik wie Laptop-Anschlüsse und Internetzugänge in allen Konferenzräumen sind ebenso vorhanden, wie ein Dolmetscherdienst und verschiedene Speisemöglichkeiten. Eine transportable Videokonferenz-Anlage ermöglicht Verbindungen in die ganze Welt.",
        "title": "Flughafen Frankfurt beliebter Veranstaltungsort."
      },
      {
        "passage": "Eine Bürgergruppe mit dem Namen Südliches Frankfurt lädt für Montag kommender Woche, um 19.30 Uhr ins Pfarrhaus St. Mauritius, Mauritiusstraße 14, zu einer öffentlichen Expertenbefragung zum Thema Arbeitsplätze am Frankfurter Flughafen ein. Der Gruppe liegen Berichte und Daten vor, die nach den Worten der Sprecher der Gruppe sehr fantastisch und zweifelhaft sind. Deshalb hat die Bürgergruppe Südliches Frankfurt den Personalleiter des Frankfurter Flughafens, einen Experten aus dem Wirtschaftsministerium, einen bekannten Stadtentwicklungsplaner und einen Soziologen, der sich mit der Arbeitsplatzentwicklung in der Frankfurter Region beschäftigt, eingeladen. Im Anschluss an die Vorträge der Experten haben die Gäste Zeit, Fragen zu stellen.",
        "title": "Diskussion über Flughafen und Arbeitsplätze."
      },
      {
        "passage": "Das neue Halbjahresprogramm der Evangelischen Familienbildungsstätte bringt eine Übersicht über viele Veranstaltungen. Neben Kursen wie Geburtsvorbereitung und Babypflege steht diesmal das Thema Berufstätige Eltern im Mittelpunkt. In Gruppen und Kursen vor allem für Frauen geht es darum, wie sich nach der Geburt eines Kindes Beruf und Familie miteinander vereinbaren lassen. Das Verhältnis zwischen Mann und Frau spielt eine große Rolle im Angebot der Familienbildung; hierzu gibt es wieder spezielle Programme nur für Frauen oder nur für Männer. Auch zum Verhältnis der Generationen (Großeltern und Enkelkinder) gibt es wieder Angebote. Darüber hinaus wartet das Programm mit Kursen für Entspannung und Zeitmanagement auf, die bei Fragen des Alltags helfen wollen.",
        "title": "Familienbildung Schwerpunkt Beruf und Familie."
      },
      {
        "passage": "Die Volkshochschule Dornbirn bietet in den kommenden Wochen neue Kurse an. Am Mittwoch nächster Woche beginnen zwei Malkurse für Kinder. Zweieinhalb- bis vierjährige Kinder treffen sich um 15.30 Uhr, Kinder im Alter von fünf und sechs Jahren um 17.00 Uhr. Für Kinder im Alter zwischen eineinhalb und sechs Jahren und ihre Väter beginnt am Samstag um 10.00 Uhr eine feste Vater-Kind-Gruppe. Am darauf-folgenden Samstag gibt es dann auch ein Treffen für Väter und Kinder bis dreieinhalb Jahren. Etwas anderes ist die Kultur- und Kreativwerkstatt am Montag nächster Woche. Aus Ton und Erde sollen Figuren nach afrikanischen Beispielen gebastelt werden. Zur Vorbereitung treffen sich die Teilnehmer am kommenden Montag zuerst im Museum. Anmeldung spätestens morgen bis 15.00 Uhr.",
        "title": "Neue Kurse für Kinder."
      }
    ]
  },
  {
    "sourceId": "230",
    "sourceTitle": "VERA",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Abendwanderungen ab 89 Euro.",
      "Ausflugsziele für Literaturinteressierte.",
      "Hinweis für Besucher der Bregenzer Festspiele.",
      "Ihre Zeitung folgt Ihnen in den Urlaub.",
      "Laute Musik stört den Nachbarn.",
      "Musikveranstaltungen am Nachmittag.",
      "Neue Zeitung für Ihre Urlaubsplanung.",
      "Rekord: 70.000 Besucher im Bücherdorf.",
      "Schlechtes Wetter: Festspiele abgesagt.",
      "Wandern ohne Gepäck."
    ],
    "pairs": [
      {
        "passage": "Wenn Sie verreisen, wünschen wir ihnen erholsame und angenehme Ferienlage Bitte denken Sie daran, sich ihre Zeitung in den Urlaubtort nachsenden zu lassen. Denn mit den Neuigkeiten von zu Hause und aus aller Weil lässt sich die schönste Zeit des Jahres erst richtig genießen ganz Europa kostenlos, Die Höhe des Bezeugendes bleibt unverändert. Ausführliche Informationen und entsprechende Coupons ihrem Europabericht. Griechisch wird meistens von Zwölftklässlern als dritte Fremdsprache neben Französisch und Englisch gewählt. finden Sie in unserem großen Reise Service – Anzeigen oder rufen Sie uns einfach an: Telefon 01 30-18 58 50 zum Nulltarif. Hannoversche Allgemeine Neue Presse",
        "title": "Ihre Zeitung folgt Ihnen in den Urlaub."
      },
      {
        "passage": "Im Luftkurort Stadtkylf in der Mittelgebirgslandschaft des Oberen Kullas werden dreitägige Wanderungen ohne Gepäck veranstaltet Die Rundwanderung im deutsch – bei gischen Naturpark führt abends zu reservierten Zimmern. Die Betriebe übernehmen den Gepäcktransport zum nächsten Tagesziel. Die Wanderungen werden ganzjährig angeboten. In den Wanderprogramm sind drei Übernachtungen mit Frühstück dreimal Gepäcktransport, eine Wanderkarte, eine Wegbeschreibung und ein Wanderpass enthalten. Der Pauschalbetrag beträgt pro Person 89 Euro. Auskünfte: Verkehrsverein Erholungsgebiet Oberes Kylltal. Kurallee, 54589 Stadtkylf, Telefon ( 06597) 28 78.",
        "title": "Wandern ohne Gepäck."
      },
      {
        "passage": "Für den einen ist es musikalischer Hochgenuss für den anderen schlicht Lärm. Gemeint ist Musik, die aus Lautsprechen, Radios oder durch Musikinstrumente durch geöffnet Türen und Fenster bei sommerlichen Temperaturen ins Freie dringt. Die Gemeinde weist darauf hin, dass der Mittagsruhe von 13 bis 15 Uhr und nachts von 22 bis 7 Uhr keine musikalische Ruhestörung erfolgen darf. Gartengeräte mit Motoren dürfen montags bis freitags nur von 8 bis 13 und von 15 bis 19 Uhr benutzt werden, an Sonnabenden von 9 bis 13 Uhr. An Sonn - und Feiertagen dürfen die Geräte nicht zum Einsatz kommen.",
        "title": "Laute Musik stört den Nachbarn."
      },
      {
        "passage": "Das erste deutsche Bücherdorf hat in Mühlbeck/ Fredersdorf (Sachsen – Anhalt ) seit Ende September seine Tore geöffnet. In acht Antiquarten warten über 70 000 Bücher aus allen Bereichen der Literatur auf Interessenten. Das in reizvoller landschaftlicher Umgebung liegende Bücherdorf nahe Bitterfeld - unweit der A19 und des Flughafens Leipzig - ist aus allen Teilen Deutschlands leicht zu erreich. Geöffnet sind die Antiquariate auch am Samstag und Sonntag. In Europa gibt es bereits acht solcher Bücherdörfer in Belgien, Frankreich, Großbritannien, den Niederlanden, Norwegen und der Schweiz. Initiatorin des deutschen Bücherdorfes ist Heidi Dehne (Tel. 03493/4 30 43).",
        "title": "Ausflugsziele für Literaturinteressierte."
      },
      {
        "passage": "Die Bregenzer Festspiele sind bemüht, die Vorstellungen auch bei zweifelhafter Witterung bzw. leichtem Regen auf der Seebühne abzuhalten, weshalb es zu Verzögerungen des Beginns oder zu Unterbrechungen kommen kann. Sollte die Seeaufführung nicht stattfinden können, wird eine halbszenische Version von Porgy and Bess im Festspielhaus gegeben. Wir empfehlen unseren Gästen , bei unsicherer Wetterlage regenfester Kleidung den Vorzug zu geben und auf Schirme zu verzichten, da diese die Sicht beeinträchtigen. Das Spiel auf dem See wird ohne Pause gespielt. Die Spieldauer beträgt ca.2 Std. 45 Min.",
        "title": "Hinweis für Besucher der Bregenzer Festspiele."
      }
    ]
  },
  {
    "sourceId": "232",
    "sourceTitle": "THOMAS",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Eine Karte – viele Vorteile.",
      "Endlich Ferien ohne Kinder.",
      "Günstiger Urlaub für Vereinsmitglieder.",
      "Meer statt Berge.",
      "Neues Wohnprojekt für Alleinerziehende.",
      "Reisebüros weltweit vernetzt.",
      "Schweizer Seen weiterhin sehr beliebt.",
      "Söhne schenken mehr als Töchter.",
      "Söhne werden großzügiger beschenkt.",
      "Beratung: Wo auch Kinder ihren Spaß haben."
    ],
    "pairs": [
      {
        "passage": "Das fängt ja gut an: Schon im Kinderzimmer werden Jungs bevorzugt – sie bekommen mehr geschenkt als Mädchen. Das ist das Ergebnis einer Untersuchung vom Bundesverband des Spielwaren- Einzelhandels-Bundesweit wurden 6500 Familien nach ihren Schenkgewohnheiten befragt. Fast immer wurden für die Söhne – auch schon im Babyalter – mehr gekauft. Zuständig für die Geschenke sind übrigens meist die Mütter.",
        "title": "Söhne werden großzügiger beschenkt."
      },
      {
        "passage": "In diesem Sommer werden weitere 200 Großstadt-Jugendherbergen auf der ganzen Welt miteinander vernetzt ICYN heißt das Zauberwort – International Communication Youth Network. Das System wurde speziell für Jugendherbergen entwickelt. Für nur 15 Euro Jahresgebühr kann man mit der ICYN-Karte weltweit nicht nur Übernachtungen in anderen Herbergen reservieren, sondern auch unbegrenzt im Internet surfen, sogar gratis übers Internet telefonieren, Bahn- und Flugtickets bargeldlos buchen sowie günstige Konzerttickets bekommen.",
        "title": "Eine Karte – viele Vorteile."
      },
      {
        "passage": "Ob zu Hause, irgendwo in der Schweiz oder im Ausland: Ferien mit Kindern wollen gut geplant sein. Wo gibt es denn Orte, wo Kinder noch Abenteuer erleben, Hotels oder Wohnungen, in denen sie sich wohl fühlen, wo aber gleichzeitig auch die Eltern auf ihre Rechnung kommen? Ruth Michaela Richter gibt Tipps, verrät Adressen und zeigt Beispiele. Damit werden sogar Städtereisen oder Schlossferien in England interessant.",
        "title": "Beratung: Wo auch Kinder ihren Spaß haben."
      },
      {
        "passage": "Die Sehnsucht nach dem Meer ist in der Schweiz groß, vor allem bei der jüngeren Generation. Ein Drittel der Schweizerinnen und Schweizer würde nach einer Umfrage im Tausch für eine Meeresküste die Hälfte der Berge hergeben. Die Zeitschrift mare ließ über 1000 Personen in der Schweiz nach ihrem Verhältnis zum Meer befragen. Rund 42 Prozent der 15-bis 34-Jährigen würden – treu dem Motto der Jugendbewegung der 80er Jahre: Nieder mit den Alpen, freie Sicht aufs Mittelmeer – den Tausch eingehen. In der Deutschschweiz könnten sich nur 29 Prozent von den Bergen trennen, in der Roman die sind es 37 und im Tessin 43 Prozent.",
        "title": "Meer statt Berge."
      },
      {
        "passage": "Ob für die traditionelle Familie oder für Alleinerziehende: Der Verein für Familienherbergen in Gelsenkirchen bietet schon seit Jahren preisgünstige Ferien. Über 1100 Zimmer und Wohnungen – auch für das kleine Portemonnaie – stehen zwischen Nordsee und Sizilien den Mitgliedern im neuen Katalog zur Auswahl. Nichtmitglieder erhalten diesen Katalog gegen eine Gebühr von 5 Euro. Infos: Telefon 061/981 25 25 oder www.ferienwohnung.ch",
        "title": "Günstiger Urlaub für Vereinsmitglieder."
      }
    ]
  },
  {
    "sourceId": "234",
    "sourceTitle": "TAMARA/JAKOB PAUL",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Neue Untersuchung über Familien in der Schweiz.",
      "Ein Jahr preiswert reisen.",
      "Bahnfahren im nächsten Jahr um 25% teurer!",
      "Ein Unternehmen mit vielen beruflichen Möglichkeiten.",
      "Neue Kindersendung im Fernsehen.",
      "Der Film soll echt sein: Schweizer Filmteam in Indien.",
      "Wie man im Zug Leute kennen lernt.",
      "Jeden Tag ein Stück Wirklichkeit im Fernsehen.",
      "Buchtipp: Ausflüge für Familien.",
      "Filmaufnahmen im Berner Oberland."
    ],
    "pairs": [
      {
        "passage": "Immer wieder drehen indische Regisseure Szenen ihrer Kinofilme in den Schweizer Bergen. Warum nehmen sie die Strapazen und hoben Kosten einer solch langen Reise auf sich? Das Hamburger Abendblatt eines dieser Filmteams auf dem Drehplatz im idyllischen Berner Oberland erhielt spannende und heitere Antworten.",
        "title": "Filmaufnahmen im Berner Oberland."
      },
      {
        "passage": "KIDTOURS – Ferien mit Kindern ist ein praktischer Ausflugsführer für Familien: mit 1000 Tipps, Tricks und Ideen für jeden Geschmack, jedes Alter und jedes Budget. Das übersichtliche, hübsch illustrierte Nach- schlage werk erhalten Sie für € 19,50 im Buchhandel oder direkt bei Werd Verlag, www.werd.net.",
        "title": "Buchtipp: Ausflüge für Familien."
      },
      {
        "passage": "Das Halbtax -Abo ist Ihr Schlüssel zu günstigen Reisen mit Bahn, Bus und Schifft und präsentiert sich im praktischen Kreditkartenformat. Schon beim Abo selbst können Sie zünftig sparen: Für ein Jahr halbtaxeln bezahlen Sie 150 Schweizer Franken. Und das ist noch nicht alles: Mit dem Halbtax-Abo sind Sie gut informiert: Zweimal jährlich erhalten Sie das Kundenmagazin mit vielen Reise -Ideen und exklusiven Reiseangeboten. Mit Ihrem Halbtax- Abo erhalten Sie 25% Preisnachlass auf Zugfahrten von der Schweiz nach Deutschland und Österreich, wenn Sie Ihre Fahrkarte in der Schweiz kaufen. SBB CFF FF SBB – Schweizerische Bundesbahnen.",
        "title": "Ein Jahr preiswert reisen."
      },
      {
        "passage": "Dokumentarfilm und Seifenoper zusammen heißt Doku-Soap, stammt aus England und macht sich seit Jahren auch auf deutschen TV Kanälen breit. Vor allem Privatsender haben sich als erfolgreiche Doku – Soap- Sender etabliert. In vielen TV- Serien kann man das wirkliche Leben von Menschen verfolgen und mit ihnen mit leben. Zurzeit besonders erfolgreich: die Sendung Tausche Familie die täglich um 18 Uhr viele Zuschauer vor den Fernseher lockt.",
        "title": "Jeden Tag ein Stück Wirklichkeit im Fernsehen."
      },
      {
        "passage": "Wir wollen dir bei der Berufswahl helfen: Die deutsche Bahn, ein Unternehmen mit Zukunft. Viele Berufe ändern sich im Laufe der Zeit. Genauso wie die Interessen im Leben. Und trotzdem gibt es Neigungen und Fähigkeiten, die du lange Zeit in deinem Leben behalten wirst. So zum Beispiel die Freude am Kontakt mit Menschen. Oder die Begeisterung für fremde Sprachen. Oder das Arbeiten in der freien Natur und im Team. Oder das Interesse an Technik und die Freude am Handwerk. Je nachdem, wofür du dich interessierst, kannst du bei der Deutschen Bahn aus insgesamt 15 Lehrberufen wählen. Um die richtige Entscheidung zu treffen, lohnt es sich, sich gründlich zu informieren, zum Beispiel aus unserer Website www. Bahn .de",
        "title": "Ein Unternehmen mit vielen beruflichen Möglichkeiten."
      }
    ]
  },
  {
    "sourceId": "235",
    "sourceTitle": "JAN",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Abendwanderungen ab 89 Euro.",
      "Neues für Literaturinteressierte.",
      "Hinweis für Besucher der Bregenzer Festspiele.",
      "Ihre Zeitung folgt Ihnen in den Urlaub.",
      "Laute Musik stört den Nachbarn.",
      "Musikveranstaltungen am Nachmittag.",
      "Neue Zeitung für Ihre Urlaubsplanung.",
      "Rekord: 70.000 Besucher im Bücherdorf.",
      "Schlechtes Wetter: Festspiele abgesagt.",
      "Wandern ohne Gepäck."
    ],
    "pairs": [
      {
        "passage": "Wenn Sie verreisen, wünschen wir ihnen erholsame und angenehme Ferienlage Bitte denken Sie daran, sich ihre Zeitung in den Urlaubtort nachsenden zu lassen. Denn mit den Neuigkeiten von zu Hause und aus aller Weil lässt sich die schönste Zeit des Jahres erst richtig genießen ganz Europa kostenlos, Die Höhe des Bezeugendes bleibt unverändert. Ausführliche Informationen und entsprechende Coupons ihrem Europabericht. Griechisch wird meistens von Zwölftklässlern als dritte Fremdsprache neben Französisch und Englisch gewählt. finden Sie in unserem großen Reise Service – Anzeigen oder rufen Sie uns einfach an: Telefon 01 30-18 58 50 zum Nulltarif. Hannoversche Allgemeine Neue Presse",
        "title": "Ihre Zeitung folgt Ihnen in den Urlaub."
      },
      {
        "passage": "Im Luftkurort Stadtkylf in der Mittelgebirgslandschaft des Oberen Kullas werden dreitägige Wanderungen ohne Gepäck veranstaltet Die Rundwanderung im deutsch – bei gischen Naturpark führt abends zu reservierten Zimmern. Die Betriebe übernehmen den Gepäcktransport zum nächsten Tagesziel. Die Wanderungen werden ganzjährig angeboten. In den Wanderprogramm sind drei Übernachtungen mit Frühstück dreimal Gepäcktransport, eine Wanderkarte, eine Wegbeschreibung und ein Wanderpass enthalten. Der Pauschalbetrag beträgt pro Person 89 Euro. Auskünfte: Verkehrsverein Erholungsgebiet Oberes Kylltal. Kurallee, 54589 Stadtkylf, Telefon ( 06597) 28 78.",
        "title": "Wandern ohne Gepäck."
      },
      {
        "passage": "Für den einen ist es musikalischer Hochgenuss für den anderen schlicht Lärm. Gemeint ist Musik, die aus Lautsprechen, Radios oder durch Musikinstrumente durch geöffnet Türen und Fenster bei sommerlichen Temperaturen ins Freie dringt. Die Gemeinde weist darauf hin, dass der Mittagsruhe von 13 bis 15 Uhr und nachts von 22 bis 7 Uhr keine musikalische Ruhestörung erfolgen darf. Gartengeräte mit Motoren dürfen montags bis freitags nur von 8 bis 13 und von 15 bis 19 Uhr benutzt werden, an Sonnabenden von 9 bis 13 Uhr. An Sonn - und Feiertagen dürfen die Geräte nicht zum Einsatz kommen.",
        "title": "Laute Musik stört den Nachbarn."
      },
      {
        "passage": "Das erste deutsche Bücherdorf hat in Mühlbeck/ Fredersdorf (Sachsen – Anhalt ) seit Ende September seine Tore geöffnet. In acht Antiquarten warten über 70 000 Bücher aus allen Bereichen der Literatur auf Interessenten. Das in reizvoller landschaftlicher Umgebung liegende Bücherdorf nahe Bitterfeld - unweit der A19 und des Flughafens Leipzig - ist aus allen Teilen Deutschlands leicht zu erreich. Geöffnet sind die Antiquariate auch am Samstag und Sonntag. In Europa gibt es bereits acht solcher Bücherdörfer in Belgien, Frankreich, Großbritannien, den Niederlanden, Norwegen und der Schweiz. Initiatorin des deutschen Bücherdorfes ist Heidi Dehne (Tel. 03493/4 30 43).",
        "title": "Neues für Literaturinteressierte."
      },
      {
        "passage": "Die Bregenzer Festspiele sind bemüht, die Vorstellungen auch bei zweifelhafter Witterung bzw. leichtem Regen auf der Seebühne abzuhalten, weshalb es zu Verzögerungen des Beginns oder zu Unterbrechungen kommen kann. Sollte die Seeaufführung nicht stattfinden können, wird eine halbszenische Version von Porgy and Bess im Festspielhaus gegeben. Wir empfehlen unseren Gästen , bei unsicherer Wetterlage regenfester Kleidung den Vorzug zu geben und auf Schirme zu verzichten, da diese die Sicht beeinträchtigen. Das Spiel auf dem See wird ohne Pause gespielt. Die Spieldauer beträgt ca.2 Std. 45 Min.",
        "title": "Hinweis für Besucher der Bregenzer Festspiele."
      }
    ]
  },
  {
    "sourceId": "237",
    "sourceTitle": "VIKTOR",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Nur wenige lesen im Zug.",
      "Bahnfahren bei älteren Menschen immer beliebter.",
      "Per Internet leichter ans Ziel.",
      "Männer fahren besser.",
      "Hilfe beim Reisen mit der Bahn.",
      "Frauen finden den richtigen Weg.",
      "Neuer Deutschkurs in Solothurn.",
      "Jetzt wird auch im Zug gelernt.",
      "Lesen im Zug ist beliebt.",
      "Neue Verkehrsregeln für Autofahrer."
    ],
    "pairs": [
      {
        "passage": "Frauen kommen genauso gut an ihr Ziel wie Männer, sie geben nur nicht so damit an. Das ergab eine Studie der Eberhard – Karls – Universität Tübingen mit 600 Testpersonen. Obwohl Frauen sich so gut zurechtfinden wie Männer. Wenn Frauen allein unterwegs sind, fragen sie öfter nach dem Weg und freuen sich, wenn ihnen Freunde helfen. Die Tübinger Forscher nennen das ein kommunikatives. Orientierungsmodell Männer dagegen verfahren sich lieber dreimal, als einmal Um Hilfe zu bitten. Dabei Spielt offsichtlich die Erziehung eine Rolle.",
        "title": "Frauen finden den richtigen Weg."
      },
      {
        "passage": "Bahnfahren ist entspannend und lädt zum Lesen ein. Deswegen liest auch etwa die Hälfte aller Reissenden während ihrer Banfahrt. Frauen sind dabei lesefreudiger als Männer : 63 Prozent von ihnen steigen mit dem Buch in den Zug unterwegs ist, verbringt im Durschnitt etwa eine Stunde und 28 Minuten mit dem Lesen eines Buches oder einer Zeitung. Ein Zehntel aller Bahnreisenden gesteht, dass sie keine Buchleser sind. Dies sind die wesentlichen Ergebnisse einer Studie der Stiftung Lesen in Zusammenarbeit mit der Deutschen Bahn.",
        "title": "Lesen im Zug ist beliebt."
      },
      {
        "passage": "Der friere Verein junger Mädchen heißt nun Cornpagna und hat sich zu einem modernen gemeinnützigen Dienstleistungsbetrieb gewandelt. Das wichtigste Ziel des Vereins ist es weiterhin, Menschen zu begleiten. Diese Dienstleistung richtet sich vor allem an Menschen, die Hilfe angewiesen sind: Alleinreisende Kinder alte und behinderte Menschen. Die Reisen werden am Ausgangsbahnhof abgeholt und mit den öffentlich Verkehrsmitteln bis zum Zielort begleitet.",
        "title": "Hilfe beim Reisen mit der Bahn."
      },
      {
        "passage": "Christine zum stein Leiterin der Volkshochschule Solothurn (VHS), ist begeistert: super gelaufen seien die Kurse, die die VHS in den Morgenzügen des Quartal angeboten hat. Weil sich das Pilotprojekt von VHS und RBS auf der Strecke Solothurn – Bern bestens bewährt hat, sollen künftig auch Pendlerinnen und Pendler in umgekehrter Richtung die Möglichkeit erhalten während der Bahnfahrt Sprachen zu lernen Zug ab Bern, mit einem Kurs in einer neuer Rechtschreibung. Ebenfalls angeboten werden Englisch, Italienisch und Französisch.",
        "title": "Jetzt wird auch im Zug gelernt."
      },
      {
        "passage": "Sie sind in der Schweiz zu einem Fest eingeladen aber auf der Einladung steht nur die Adresse? Kein Problem, auch ohne Auto: Seit einiger Zeit hat er Internet Fahrplan der Schweizerischen Bundesbahnen (www.sbb.ch) einen großen Brüder. Bis jetzt konnte man nur Verbindungen von Bahnhöfen zu Bahnhöfen oder Haltstellen zu abfragen. Neuerdings ist das auch für den Weg von einer Adresse zu einer anderen möglich. Der elektronische Fahrplan führt Sie automatisch zum Haltepunkt des öffentlichen Verkehrs der am nächsten bei der Zieladresse liegt. Das ist mit dem Verkehrsleitssystem für Autos vergleichbar, das Sie aber auch in der Verkehrten Richtung durch Einbahnstraßen führen kann. Beim öffentlichen Verkehr kommt das glücklicherweise nicht vor.",
        "title": "Per Internet leichter ans Ziel."
      }
    ]
  },
  {
    "sourceId": "240",
    "sourceTitle": "ALEX & CORA",
    "section": "Lesen Teil 1",
    "skill": "lesen",
    "level": "B1",
    "exam": "TELC",
    "options": [
      "Eltern trotz Kritik mit der Schule zufrieden.",
      "Elektromobilität für Angestellte.",
      "Stärkung von Bus und Bahn.",
      "Schule und Umweltschutz.",
      "Bald keine Firmenwagen mehr?",
      "Ticketpreise bei der Bahn.",
      "Lehrerberuf wird immer attraktiver.",
      "Engagement für die Natur.",
      "Preissenkungen bei Bus, Straßenbahn und U-Bahn!",
      "Zu wenig Lehrer - Stadt reagiert."
    ],
    "pairs": [
      {
        "passage": "Sie haben Mitarbeiter, die gern mit dem Fahrrad zur Arbeit kommen? Warum dann nicht mehr E-Bikes leasen statt nur teure Firmenwagen? Gerade In Städten kommt man mit einem E-Bike schneller und bequemer ans Ziel als mit dem Auto. Und Parkplatzprobleme gibt es auch nicht. Sie fördern zudem die Gesundheit Ihrer Mitarbeiter und schonen die Umwelt, und dabei können Sie noch Steuern sparen. Bei der BikeLaasing GmbH bekommen Sie Angebote, die zu Ihnen passen. Melden Sie sich bei uns an, und wir kümmern uns um den Rest",
        "title": "Elektromobilität für Angestellte."
      },
      {
        "passage": "Die Bahn erhöht dieses Jahr die Ticketipreise nicht. Dies soll die Bahn attraktiver machen, sodass mehr Menschen die Züge nutzen. Ob dies wirklich erfolgreich ist, bestreiten manche Experten. Sie argumentieren, dass das Auto in Deutschland zu beliebt ist. Günstiger werden außerdem die Tickets im öffentlichen Nahverkehr, weil dann nicht mehr so viele Berufstätige mit. dem Auto zur Arbeit fahren. Ob diese Maßnahmen wirklich erfolgreich sind, wird sich zeigen. Experten sind sich einig: Ein Schritt in die richtige Richtung!",
        "title": "Ticketpreise bei der Bahn."
      },
      {
        "passage": "Vergangeren Monat wurden etwa tausend Eltern von der Stiftung Schulqualität befragt, ob sie mit der Schule ihrer Kinder zufrieden sind. Dabei sagten 80%, dass die Schule gut oder sogar sehr gut sei. Und das, obwohl nur 40% der Eitern denken, dass die Kinder in der Schule auf den Beruf vorbereitet werden. Die Schülerinnen und Schüler sollten mehr über Ökonomie lernen. Außerdem sagten über 60%, dass das Thema Umweltschutz im Unterricht eine größere Rolle spielen sollte.",
        "title": "Eltern trotz Kritik mit der Schule zufrieden."
      },
      {
        "passage": "Berlin. in der Hauptstadt herrscht weiterhin Lehrermangel: Tausende Lehrkräfte fehlen. Mittlerweile unterrichten sogar schon Studie- rende die Schülerinnen und Schüler der Haupt- stadt, weil sich nicht genügend ausgebildete Lehrkräfte finden. Die Unterrichtsqualität lei- det stark. Daher plant der Berliner Senat eine Werbekampagne, um den Lehrerberuf attrakti- ver zu gestalten. Dabei sollen auch Menschen in anderen Berufen angesprochen werden, die denkt man über eine Erhöhung der Gehälter für Lehrerinnen und Lehrer nach.",
        "title": "Zu wenig Lehrer - Stadt reagiert."
      },
      {
        "passage": "KaturVerband ist der größte Umweltverband in Deutschland. Er engagiert sich für Umwelt- und Tierschutz. Sie wollen sich auch aktiv gegen Umweltverschmutzung einsetzen? Sie wöllen sich für mehr Naturschutz engagieren? ‚Dann sind Sie bei uns richtig. Wir haben regelmäßige Treffen und führen Informationsveran- staltungen zu verschiedenen aktuellen Themen durch, außerdem gibt es eine monatliche Mit- gliederzeitschrift, Melden Sie sich einfach bei uns.",
        "title": "Engagement für die Natur."
      }
    ]
  }
] as ExamExercise[];
