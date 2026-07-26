import type { CefrLevel } from "@/lib/types";

export type SeedCard = {
  themeSlug: string;
  level: CefrLevel;
  prompt: string;
  answer: string;
  context: string;
  hint?: string;
};

/** German fill-in cards with mandatory sentence context. */
export const CARDS_DE: SeedCard[] = [
  // Identite
  { themeSlug: "identite", level: "A1", prompt: "Ich ___ Anna.", answer: "heiße", context: "On se presente : Ich heiße Anna.", hint: "s'appeler" },
  { themeSlug: "identite", level: "A1", prompt: "Das ist ___ Bruder.", answer: "mein", context: "Familie : Das ist mein Bruder.", hint: "mon" },
  { themeSlug: "identite", level: "A1", prompt: "Ich komme ___ Frankreich.", answer: "aus", context: "Origine : Ich komme aus Frankreich." },
  { themeSlug: "identite", level: "A2", prompt: "Meine Schwester ist sehr ___.", answer: "freundlich", context: "Caractere : Meine Schwester ist sehr freundlich." },
  { themeSlug: "identite", level: "A2", prompt: "Ich fuhle mich heute ___.", answer: "mude", context: "Emotions : Ich fuhle mich heute mude." },
  { themeSlug: "identite", level: "B1", prompt: "Es ist mir wichtig, ___ zu bleiben.", answer: "ehrlich", context: "Valeurs : Es ist mir wichtig, ehrlich zu bleiben." },

  // Quotidien
  { themeSlug: "quotidien", level: "A1", prompt: "Ich ___ um 7 Uhr auf.", answer: "stehe", context: "Routine : Ich stehe um 7 Uhr auf." },
  { themeSlug: "quotidien", level: "A1", prompt: "Wo ist die ___?", answer: "Kuche", context: "Logement : Wo ist die Kuche?" },
  { themeSlug: "quotidien", level: "A1", prompt: "Ich wohne in einer ___.", answer: "Wohnung", context: "Habitat : Ich wohne in einer Wohnung." },
  { themeSlug: "quotidien", level: "A2", prompt: "Kannst du den Tisch ___?", answer: "decken", context: "Maison : Kannst du den Tisch decken?" },
  { themeSlug: "quotidien", level: "A2", prompt: "Am Wochenende raume ich mein Zimmer ___.", answer: "auf", context: "Menage : Am Wochenende raume ich mein Zimmer auf." },
  { themeSlug: "quotidien", level: "B1", prompt: "Ich habe mir angewöhnt, fruh ___ gehen.", answer: "schlafen zu", context: "Habitudes : Ich habe mir angewöhnt, fruh schlafen zu gehen." },

  // Achats
  { themeSlug: "achats", level: "A1", prompt: "Was ___ das?", answer: "kostet", context: "Prix : Was kostet das?" },
  { themeSlug: "achats", level: "A1", prompt: "Ich ___ ein Brot.", answer: "mochte", context: "Boulangerie : Ich mochte ein Brot." },
  { themeSlug: "achats", level: "A1", prompt: "Der Apfel ist ___.", answer: "frisch", context: "Marche : Der Apfel ist frisch." },
  { themeSlug: "achats", level: "A2", prompt: "Haben Sie das auch in einer anderen ___?", answer: "Grosse", context: "Magasin : Haben Sie das auch in einer anderen Grosse?" },
  { themeSlug: "achats", level: "A2", prompt: "Die Rechnung bitte, wir mochten ___.", answer: "zahlen", context: "Restaurant : Die Rechnung bitte, wir mochten zahlen." },
  { themeSlug: "achats", level: "B1", prompt: "Ich hatte gern etwas ___ Empfehlung.", answer: "nach Ihrer", context: "Restaurant : Ich hatte gern etwas nach Ihrer Empfehlung." },

  // Sante
  { themeSlug: "sante", level: "A1", prompt: "Mir ist ___.", answer: "schlecht", context: "Chez le medecin : Mir ist schlecht." },
  { themeSlug: "sante", level: "A1", prompt: "Ich habe ___.", answer: "Kopfschmerzen", context: "Symptomes : Ich habe Kopfschmerzen." },
  { themeSlug: "sante", level: "A1", prompt: "Wo tut es ___?", answer: "weh", context: "Douleur : Wo tut es weh?" },
  { themeSlug: "sante", level: "A2", prompt: "Sie sollten mehr Wasser ___.", answer: "trinken", context: "Conseil : Sie sollten mehr Wasser trinken." },
  { themeSlug: "sante", level: "A2", prompt: "Nehmen Sie die Tabletten ___ dem Essen.", answer: "nach", context: "Ordonnance : Nehmen Sie die Tabletten nach dem Essen." },
  { themeSlug: "sante", level: "B1", prompt: "Seit wann haben Sie diese ___?", answer: "Beschwerden", context: "Anamnese : Seit wann haben Sie diese Beschwerden?" },

  // Travail
  { themeSlug: "travail", level: "A1", prompt: "Ich bin ___.", answer: "Lehrer", context: "Metier : Ich bin Lehrer." },
  { themeSlug: "travail", level: "A1", prompt: "Wo ___ Sie?", answer: "arbeiten", context: "Travail : Wo arbeiten Sie?" },
  { themeSlug: "travail", level: "A2", prompt: "Ich habe eine ___ fur 10 Uhr.", answer: "Bewerbung", context: "Entretien : Ich habe eine Bewerbung fur 10 Uhr." },
  { themeSlug: "travail", level: "A2", prompt: "Meine Starken sind Pünktlichkeit und ___.", answer: "Teamfahigkeit", context: "CV : Meine Starken sind Pünktlichkeit und Teamfahigkeit." },
  { themeSlug: "travail", level: "B1", prompt: "In meiner letzten Stelle war ich fur das Budget ___.", answer: "verantwortlich", context: "Experience : In meiner letzten Stelle war ich fur das Budget verantwortlich." },
  { themeSlug: "travail", level: "B1", prompt: "Ich mochte mich beruflich ___.", answer: "weiterentwickeln", context: "Carriere : Ich mochte mich beruflich weiterentwickeln." },

  // Education
  { themeSlug: "education", level: "A1", prompt: "Ich lerne ___.", answer: "Deutsch", context: "Cours : Ich lerne Deutsch." },
  { themeSlug: "education", level: "A1", prompt: "Die Schule beginnt um ___.", answer: "acht", context: "Emploi du temps : Die Schule beginnt um acht." },
  { themeSlug: "education", level: "A2", prompt: "Kannst du mir bei den Hausaufgaben ___?", answer: "helfen", context: "Aide : Kannst du mir bei den Hausaufgaben helfen?" },
  { themeSlug: "education", level: "A2", prompt: "Ich habe die Prufung ___.", answer: "bestanden", context: "Resultats : Ich habe die Prufung bestanden." },
  { themeSlug: "education", level: "B1", prompt: "Ohne regelmassige Wiederholung vergisst man den Stoff ___.", answer: "schnell", context: "Methode : Ohne regelmassige Wiederholung vergisst man den Stoff schnell." },
  { themeSlug: "education", level: "B1", prompt: "Mein Ziel ist es, das Goethe-Zertifikat zu ___.", answer: "erreichen", context: "Examen : Mein Ziel ist es, das Goethe-Zertifikat zu erreichen." },

  // Voyage
  { themeSlug: "voyage", level: "A1", prompt: "Wo ist der ___?", answer: "Bahnhof", context: "Transports : Wo ist der Bahnhof?" },
  { themeSlug: "voyage", level: "A1", prompt: "Eine Fahrkarte nach Berlin, ___.", answer: "bitte", context: "Guichet : Eine Fahrkarte nach Berlin, bitte." },
  { themeSlug: "voyage", level: "A1", prompt: "Ich habe ein Zimmer ___.", answer: "reserviert", context: "Hotel : Ich habe ein Zimmer reserviert." },
  { themeSlug: "voyage", level: "A2", prompt: "Der Zug hat zehn Minuten ___.", answer: "Verspatung", context: "Retard : Der Zug hat zehn Minuten Verspatung." },
  { themeSlug: "voyage", level: "A2", prompt: "Konnen Sie mir den Weg zum Museum ___?", answer: "zeigen", context: "Orientation : Konnen Sie mir den Weg zum Museum zeigen?" },
  { themeSlug: "voyage", level: "B1", prompt: "Falls der Flug ausfallt, brauche ich eine ___.", answer: "Erstattung", context: "Litige : Falls der Flug ausfallt, brauche ich eine Erstattung." },

  // Loisirs
  { themeSlug: "loisirs", level: "A1", prompt: "Ich spiele gern ___.", answer: "Fußball", context: "Sport : Ich spiele gern Fußball." },
  { themeSlug: "loisirs", level: "A1", prompt: "Am Samstag gehe ich ins ___.", answer: "Kino", context: "Culture : Am Samstag gehe ich ins Kino." },
  { themeSlug: "loisirs", level: "A2", prompt: "Interessierst du dich fur ___ Musik?", answer: "klassische", context: "Gouts : Interessierst du dich fur klassische Musik?" },
  { themeSlug: "loisirs", level: "A2", prompt: "Wir feiern jedes Jahr dieses ___.", answer: "Fest", context: "Traditions : Wir feiern jedes Jahr dieses Fest." },
  { themeSlug: "loisirs", level: "B1", prompt: "In meiner Freizeit widme ich mich der ___.", answer: "Fotografie", context: "Hobby : In meiner Freizeit widme ich mich der Fotografie." },
  { themeSlug: "loisirs", level: "B1", prompt: "Das Konzert hat mich tief ___.", answer: "beeindruckt", context: "Critique : Das Konzert hat mich tief beeindruckt." },

  // Societe
  { themeSlug: "societe", level: "A2", prompt: "Der Umweltschutz ist ein wichtiges ___.", answer: "Thema", context: "Debat : Der Umweltschutz ist ein wichtiges Thema." },
  { themeSlug: "societe", level: "A2", prompt: "Viele Menschen lesen jeden Tag die ___.", answer: "Nachrichten", context: "Actualite : Viele Menschen lesen jeden Tag die Nachrichten." },
  { themeSlug: "societe", level: "B1", prompt: "Ich bin der Meinung, dass Bildung fur alle ___ sein sollte.", answer: "zuganglich", context: "Opinion : Ich bin der Meinung, dass Bildung fur alle zuganglich sein sollte." },
  { themeSlug: "societe", level: "B1", prompt: "Wir sollten offener uber soziale ___ sprechen.", answer: "Ungleichheit", context: "Societe : Wir sollten offener uber soziale Ungleichheit sprechen." },
  { themeSlug: "societe", level: "B1", prompt: "Die Diskussion blieb sachlich und ___.", answer: "respektvoll", context: "Debat : Die Diskussion blieb sachlich und respektvoll." },

  // Technologie
  { themeSlug: "technologie", level: "A1", prompt: "Meine ___ ist schwach.", answer: "Verbindung", context: "Internet : Meine Verbindung ist schwach." },
  { themeSlug: "technologie", level: "A1", prompt: "Ich schreibe eine ___.", answer: "E-Mail", context: "Communication : Ich schreibe eine E-Mail." },
  { themeSlug: "technologie", level: "A2", prompt: "Kannst du mir den Link ___?", answer: "schicken", context: "Reseaux : Kannst du mir den Link schicken?" },
  { themeSlug: "technologie", level: "A2", prompt: "Ich habe mein Passwort ___.", answer: "vergessen", context: "Compte : Ich habe mein Passwort vergessen." },
  { themeSlug: "technologie", level: "B1", prompt: "Bitte achten Sie auf den Datenschutz bei sozialen ___.", answer: "Netzwerken", context: "Securite : Bitte achten Sie auf den Datenschutz bei sozialen Netzwerken." },
  { themeSlug: "technologie", level: "B1", prompt: "Die Nachricht wurde automatisch ___.", answer: "ubersetzt", context: "Outils : Die Nachricht wurde automatisch ubersetzt." },

  // Nature
  { themeSlug: "nature", level: "A1", prompt: "Heute ist das Wetter ___.", answer: "schon", context: "Meteo : Heute ist das Wetter schon." },
  { themeSlug: "nature", level: "A1", prompt: "Es ___.", answer: "regnet", context: "Meteo : Es regnet." },
  { themeSlug: "nature", level: "A2", prompt: "Im Wald gibt es viele ___.", answer: "Tiere", context: "Nature : Im Wald gibt es viele Tiere." },
  { themeSlug: "nature", level: "A2", prompt: "Wir sollten weniger Plastik ___.", answer: "verbrauchen", context: "Ecologie : Wir sollten weniger Plastik verbrauchen." },
  { themeSlug: "nature", level: "B1", prompt: "Der Klimawandel erfordert schnelles ___.", answer: "Handeln", context: "Environnement : Der Klimawandel erfordert schnelles Handeln." },
  { themeSlug: "nature", level: "B1", prompt: "Lokale Produkte sind oft nachhaltiger und ___.", answer: "umweltfreundlicher", context: "Conso : Lokale Produkte sind oft nachhaltiger und umweltfreundlicher." },

  // Admin
  { themeSlug: "admin", level: "A1", prompt: "Ich brauche ein ___.", answer: "Konto", context: "Banque : Ich brauche ein Konto." },
  { themeSlug: "admin", level: "A1", prompt: "Wo ist das ___?", answer: "Rathaus", context: "Demarches : Wo ist das Rathaus?" },
  { themeSlug: "admin", level: "A2", prompt: "Ich mochte einen Termin ___.", answer: "vereinbaren", context: "Rendez-vous : Ich mochte einen Termin vereinbaren." },
  { themeSlug: "admin", level: "A2", prompt: "Haben Sie Ihren ___ dabei?", answer: "Ausweis", context: "Identite : Haben Sie Ihren Ausweis dabei?" },
  { themeSlug: "admin", level: "B1", prompt: "Fur die Anmeldung brauchen Sie eine Meldebescheinigung und einen ___.", answer: "Mietvertrag", context: "Expatriation : Fur die Anmeldung brauchen Sie eine Meldebescheinigung und einen Mietvertrag." },
  { themeSlug: "admin", level: "B1", prompt: "Die Uberweisung wurde noch nicht ___.", answer: "gutgeschrieben", context: "Banque : Die Uberweisung wurde noch nicht gutgeschrieben." },
  { themeSlug: "admin", level: "B1", prompt: "Ich beantrage eine Verlangerung meiner ___.", answer: "Aufenthaltserlaubnis", context: "Administration : Ich beantrage eine Verlangerung meiner Aufenthaltserlaubnis." },
];

export const PLACEMENT_ITEMS = [
  { prompt: "Ich ___ Paul.", answer: "heiße", level: "A1" as CefrLevel },
  { prompt: "Wo ___ du?", answer: "wohnst", level: "A1" as CefrLevel },
  { prompt: "Was ___ das?", answer: "kostet", level: "A1" as CefrLevel },
  { prompt: "Ich habe ___.", answer: "Hunger", level: "A1" as CefrLevel },
  { prompt: "Kannst du mir ___?", answer: "helfen", level: "A2" as CefrLevel },
  { prompt: "Gestern ___ ich im Kino.", answer: "war", level: "A2" as CefrLevel },
  { prompt: "Wenn ich Zeit habe, ___ ich spazieren.", answer: "gehe", level: "A2" as CefrLevel },
  { prompt: "Ich habe die Prufung ___.", answer: "bestanden", level: "A2" as CefrLevel },
  { prompt: "Es ware nett, wenn Sie mir Bescheid ___.", answer: "geben konnten", level: "B1" as CefrLevel },
  { prompt: "Obwohl es regnete, sind wir ___ gegangen.", answer: "spazieren", level: "B1" as CefrLevel },
  { prompt: "Ich bin fur das Projekt ___.", answer: "verantwortlich", level: "B1" as CefrLevel },
  { prompt: "Hatte ich mehr Zeit, ___ ich mehr lesen.", answer: "wurde", level: "B2" as CefrLevel },
];
