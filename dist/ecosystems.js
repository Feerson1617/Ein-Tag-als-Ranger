export const FACTOR_CATALOG = {
  road: { label: 'Straßenbau', short: 'Straße' },
  corridor: { label: 'Wildtierkorridor', short: 'Korridor' },
  mutation: { label: 'Mutation', short: 'Mutation' },
  selection: { label: 'Natürliche Selektion', short: 'Selektion' },
  drift: { label: 'Genetische Drift', short: 'Drift' },
  bottleneck: { label: 'Populationsengpass', short: 'Engpass' },
  climate: { label: 'Klima & Jahreszeiten', short: 'Klima' },
  disease: { label: 'Krankheit', short: 'Krankheit' },
  mateChoice: { label: 'Partnerwahl', short: 'Partnerwahl' },
  competition: { label: 'Konkurrenz', short: 'Konkurrenz' },
  geneFlow: { label: 'Genfluss', short: 'Genfluss' },
  habitatLoss: { label: 'Lebensraumverlust', short: 'Lebensraum' },
};

// The bird catalogue deliberately names ecological roles as well as species.
// The renderer can keep one efficient flight rig while 6.1 replaces it with
// individual glTF assets and species-specific behaviour.
export const BIRD_SPECIES = [
  ['maeusebussard', 'Mäusebussard', 'Buteo buteo', 'Prädator', 'Kleinsäuger, Reptilien und Aas'],
  ['rotmilan', 'Rotmilan', 'Milvus milvus', 'Prädator', 'Kleinsäuger, Vögel und Aas'],
  ['habicht', 'Habicht', 'Accipiter gentilis', 'Prädator', 'Vögel und kleine Säuger'],
  ['sperber', 'Sperber', 'Accipiter nisus', 'Prädator', 'Kleinvögel'],
  ['waldkauz', 'Waldkauz', 'Strix aluco', 'Prädator', 'Mäuse und andere Kleinsäuger'],
  ['uhu', 'Uhu', 'Bubo bubo', 'Prädator', 'Säuger, Vögel und Amphibien'],
  ['turmfalke', 'Turmfalke', 'Falco tinnunculus', 'Prädator', 'Mäuse und Großinsekten'],
  ['wanderfalke', 'Wanderfalke', 'Falco peregrinus', 'Prädator', 'Fliegende Vögel'],
  ['seeadler', 'Seeadler', 'Haliaeetus albicilla', 'Prädator', 'Fische, Wasservögel und Aas'],
  ['fischadler', 'Fischadler', 'Pandion haliaetus', 'Prädator', 'Fische'],
  ['kormoran', 'Kormoran', 'Phalacrocorax carbo', 'Fischfresser', 'Fische und Wasserorganismen'],
  ['graureiher', 'Graureiher', 'Ardea cinerea', 'Fischfresser', 'Fische, Amphibien und Kleinsäuger'],
  ['weissstorch', 'Weißstorch', 'Ciconia ciconia', 'Prädator', 'Amphibien, Insekten und Kleinsäuger'],
  ['stockente', 'Stockente', 'Anas platyrhynchos', 'Primärkonsument', 'Wasserpflanzen, Samen und Wirbellose'],
  ['hoeckerschwan', 'Höckerschwan', 'Cygnus olor', 'Primärkonsument', 'Wasserpflanzen und Algen'],
  ['blaesshuhn', 'Blässhuhn', 'Fulica atra', 'Primärkonsument', 'Wasserpflanzen und Wirbellose'],
  ['eisvogel', 'Eisvogel', 'Alcedo atthis', 'Fischfresser', 'Kleine Fische und Wasserinsekten'],
  ['buntspecht', 'Buntspecht', 'Dendrocopos major', 'Insektenfresser', 'Holzbewohnende Insekten und Samen'],
  ['gruenspecht', 'Grünspecht', 'Picus viridis', 'Insektenfresser', 'Ameisen und andere Bodeninsekten'],
  ['amsel', 'Amsel', 'Turdus merula', 'Omnivor', 'Würmer, Beeren und Früchte'],
  ['kohlmeise', 'Kohlmeise', 'Parus major', 'Insektenfresser', 'Raupen, Insekten und Samen'],
  ['zaunkoenig', 'Zaunkönig', 'Troglodytes troglodytes', 'Insektenfresser', 'Kleine Wirbellose'],
  ['feldlerche', 'Feldlerche', 'Alauda arvensis', 'Primärkonsument', 'Samen und Insekten'],
  ['austernfischer', 'Austernfischer', 'Haematopus ostralegus', 'Prädator', 'Muscheln, Würmer und Krebse'],
];

const baseAnimals = [
  ['hare', 'Feldhase', 'Lepus europaeus', 'forest', 'Primärkonsument', 'Kräuter und Gräser'],
  ['fox', 'Rotfuchs', 'Vulpes vulpes', 'forest', 'Prädator/Omnivor', 'Kleinsäuger, Vögel, Früchte und Aas'],
  ['roe_deer', 'Reh', 'Capreolus capreolus', 'forest', 'Primärkonsument', 'Kräuter, Knospen und Blätter'],
  ['wild_boar', 'Wildschwein', 'Sus scrofa', 'forest', 'Omnivor', 'Wurzeln, Eicheln, Wirbellose und Kleintiere'],
  ['red_squirrel', 'Eichhörnchen', 'Sciurus vulgaris', 'forest', 'Primärkonsument', 'Samen, Nüsse und Früchte'],
  ['hedgehog', 'Europäischer Igel', 'Erinaceus europaeus', 'forest', 'Insektenfresser', 'Käfer, Würmer und Schnecken'],
  ['badger', 'Europäischer Dachs', 'Meles meles', 'forest', 'Omnivor', 'Regenwürmer, Kleinsäuger und Früchte'],
  ['pine_marten', 'Baummarder', 'Martes martes', 'forest', 'Prädator/Omnivor', 'Kleinsäuger, Vögel und Beeren'],
  ['wood_ant', 'Rote Waldameise', 'Formica rufa', 'forest', 'Primärkonsument/Detritivor', 'Honigtau und kleine Wirbellose'],
  ['common_frog', 'Grasfrosch', 'Rana temporaria', 'forest', 'Insektenfresser', 'Insekten und andere Wirbellose'],
  ['field_mouse', 'Waldmaus', 'Apodemus sylvaticus', 'meadow', 'Primärkonsument', 'Samen, Früchte und Gräser'],
  ['mole', 'Europäischer Maulwurf', 'Talpa europaea', 'meadow', 'Insektenfresser', 'Regenwürmer und Bodenfauna'],
  ['bumblebee', 'Steinhummel', 'Bombus lapidarius', 'meadow', 'Bestäuber', 'Nektar und Pollen'],
  ['grasshopper', 'Heuschrecke', 'Orthoptera', 'meadow', 'Primärkonsument', 'Gräser und Kräuter'],
  ['common_viper', 'Kreuzotter', 'Vipera berus', 'meadow', 'Prädator', 'Kleinsäuger und Eidechsen'],
  ['skylark', 'Feldlerche', 'Alauda arvensis', 'meadow', 'Omnivor', 'Samen und Insekten'],
  ['city_fox', 'Stadtfuchs', 'Vulpes vulpes', 'city', 'Omnivor', 'Kleinsäuger, Abfälle und Früchte'],
  ['raccoon', 'Waschbär', 'Procyon lotor', 'city', 'Omnivor', 'Wirbellose, Früchte und Abfälle'],
  ['pipistrelle', 'Zwergfledermaus', 'Pipistrellus pipistrellus', 'city', 'Insektenfresser', 'Nachtaktive Fluginsekten'],
  ['house_sparrow', 'Haussperling', 'Passer domesticus', 'city', 'Omnivor', 'Samen und Insekten'],
  ['feral_pigeon', 'Stadttaube', 'Columba livia domestica', 'city', 'Primärkonsument', 'Samen und Getreide'],
  ['brown_rat', 'Wanderratte', 'Rattus norvegicus', 'city', 'Omnivor', 'Samen, Abfälle und Wirbellose'],
  ['harbour_seal', 'Seehund', 'Phoca vitulina', 'beach', 'Prädator', 'Fische und Kopffüßer'],
  ['grey_seal', 'Kegelrobbe', 'Halichoerus grypus', 'beach', 'Prädator', 'Fische und Kopffüßer'],
  ['sanderling', 'Sanderling', 'Calidris alba', 'beach', 'Prädator', 'Kleine Krebstiere und Würmer'],
  ['ringed_plover', 'Sandregenpfeifer', 'Charadrius hiaticula', 'beach', 'Prädator', 'Würmer und kleine Wirbellose'],
  ['herring_gull', 'Silbermöwe', 'Larus argentatus', 'beach', 'Omnivor/Prädator', 'Fische, Wirbellose und Aas'],
  ['common_tern', 'Flussseeschwalbe', 'Sterna hirundo', 'beach', 'Fischfresser', 'Kleine Fische'],
  ['sand_lizard', 'Zauneidechse', 'Lacerta agilis', 'beach', 'Prädator', 'Insekten und Spinnen'],
  ['shore_crab', 'Strandkrabbe', 'Carcinus maenas', 'beach', 'Omnivor', 'Algen, Muscheln und Aas'],
  ['avocet', 'Säbelschnäbler', 'Recurvirostra avosetta', 'wadden', 'Prädator', 'Kleine Krebstiere und Würmer'],
  ['bar_tailed_godwit', 'Pfuhlschnepfe', 'Limosa lapponica', 'wadden', 'Prädator', 'Würmer und Muscheln'],
  ['dunlin', 'Alpenstrandläufer', 'Calidris alpina', 'wadden', 'Prädator', 'Kleine Würmer und Krebstiere'],
  ['eider', 'Eiderente', 'Somateria mollissima', 'wadden', 'Primärkonsument/Prädator', 'Muscheln und Wasserpflanzen'],
  ['lugworm', 'Pierwurm', 'Arenicola marina', 'wadden', 'Detritivor', 'Organisches Material im Wattboden'],
  ['shore_shrimp', 'Nordseegarnele', 'Crangon crangon', 'wadden', 'Omnivor', 'Kleine Tiere und Aas'],
  ['cockle', 'Herzmuschel', 'Cerastoderma edule', 'wadden', 'Filtrierer', 'Plankton aus dem Wasser'],
  ['blue_mussel', 'Miesmuschel', 'Mytilus edulis', 'wadden', 'Filtrierer', 'Phytoplankton'],
  ['common_whelk', 'Wellhornschnecke', 'Buccinum undatum', 'wadden', 'Prädator/Detritivor', 'Aas und Muscheln'],
  ['atlantic_herring', 'Atlantischer Hering', 'Clupea harengus', 'wadden', 'Sekundärkonsument', 'Zooplankton'],
];

const makeInfo = ([id, common, latin, ecosystem, trophic, diet]) => ({
  id, common, latin, ecosystem, trophic, diet, kind: 'animal',
  goal: `Finde die Art ${common} und beobachte Nahrungssuche, Bewegung oder eine Wechselwirkung im Lebensraum.`,
  description: `${common} gehört hier zur Trophieebene „${trophic}“. Typische Nahrung bzw. Ressource: ${diet}. Der Eintrag beschreibt eine vereinfachte Beobachtung im Spiel.`,
});

export const PLANT_SPECIES = {
  trees: [
    ['Rotbuche', 'Fagus sylvatica', 'Baumschicht'], ['Stieleiche', 'Quercus robur', 'Baumschicht'], ['Traubeneiche', 'Quercus petraea', 'Baumschicht'],
    ['Sandbirke', 'Betula pendula', 'Baumschicht'], ['Waldkiefer', 'Pinus sylvestris', 'Baumschicht'], ['Europäische Lärche', 'Larix decidua', 'Baumschicht'],
    ['Vogelbeere', 'Sorbus aucuparia', 'Baumschicht'], ['Schwarzerle', 'Alnus glutinosa', 'Baumschicht'], ['Esche', 'Fraxinus excelsior', 'Baumschicht'],
    ['Bergahorn', 'Acer pseudoplatanus', 'Baumschicht'], ['Flatterulme', 'Ulmus laevis', 'Baumschicht'],
  ],
  shrubs: [
    ['Hasel', 'Corylus avellana', 'Strauchschicht'], ['Schlehe', 'Prunus spinosa', 'Strauchschicht'], ['Weißdorn', 'Crataegus monogyna', 'Strauchschicht'],
    ['Holunder', 'Sambucus nigra', 'Strauchschicht'], ['Wildrose', 'Rosa canina', 'Strauchschicht'], ['Faulbaum', 'Frangula alnus', 'Strauchschicht'],
    ['Wacholder', 'Juniperus communis', 'Strauchschicht'], ['Rote Heckenkirsche', 'Lonicera xylosteum', 'Strauchschicht'],
  ],
  herbs: [
    ['Brennnessel', 'Urtica dioica', 'Kraut- und Grasschicht'], ['Waldmeister', 'Galium odoratum', 'Kraut- und Grasschicht'], ['Buschwindröschen', 'Anemone nemorosa', 'Kraut- und Grasschicht'],
    ['Große Sternmiere', 'Stellaria holostea', 'Kraut- und Grasschicht'], ['Waldsauerklee', 'Oxalis acetosella', 'Kraut- und Grasschicht'], ['Adlerfarn', 'Pteridium aquilinum', 'Kraut- und Grasschicht'],
    ['Wiesenrispe', 'Poa pratensis', 'Kraut- und Grasschicht'], ['Rotschwingel', 'Festuca rubra', 'Kraut- und Grasschicht'], ['Wiesen-Kerbel', 'Anthriscus sylvestris', 'Kraut- und Grasschicht'],
  ],
  ground: [
    ['Frauenhaarmoos', 'Polytrichum commune', 'Moos- und Bodenschicht'], ['Etagenmoos', 'Hylocomium splendens', 'Moos- und Bodenschicht'],
    ['Zunderschwamm', 'Fomes fomentarius', 'Moos- und Bodenschicht'], ['Fliegenpilz', 'Amanita muscaria', 'Moos- und Bodenschicht'], ['Wald-Erdbeere', 'Fragaria vesca', 'Moos- und Bodenschicht'],
  ],
};

export const ECOSYSTEMS = {
  forest: { id: 'forest', number: '01', title: 'Wald', description: 'Norddeutscher Wald mit geschlossenem Kronendach, Sträuchern, Kraut- und Bodenschicht.', layers: ['Baumschicht', 'Strauchschicht', 'Kraut- und Grasschicht', 'Moos- und Bodenschicht'], defaults: ['selection', 'competition', 'climate'], species: ['hare', 'fox', 'roe_deer', 'wild_boar', 'badger', 'red_squirrel', ...BIRD_SPECIES.map(x => x[0])] },
  meadow: { id: 'meadow', number: '02', title: 'Wiese', description: 'Artenreiche norddeutsche Wiese mit Gräsern, Blüten, Bestäubern und Feldbewohnern.', layers: ['Gräser', 'Kräuter und Blüten', 'Bodenoberfläche', 'Bodenfauna'], defaults: ['climate', 'competition', 'selection', 'mateChoice'], species: ['hare', 'field_mouse', 'mole', 'bumblebee', 'grasshopper', 'common_viper', 'skylark', 'roe_deer', 'common_frog', 'kohlmeise', 'turmfalke'] },
  city: { id: 'city', number: '03', title: 'Stadt & Dorf', description: 'Gärten, Dächer, Straßen und Grüninseln verändern Nahrung, Licht und Rückzugsräume.', layers: ['Stadtbäume und Hecken', 'Gärten und Parks', 'Gebäude und Dächer', 'Boden und Gewässer'], defaults: ['road', 'habitatLoss', 'disease', 'selection'], species: ['city_fox', 'raccoon', 'pipistrelle', 'house_sparrow', 'feral_pigeon', 'brown_rat', 'hedgehog', 'common_frog', 'amsel', 'kohlmeise'] },
  beach: { id: 'beach', number: '04', title: 'Strand', description: 'Dünen, Spülsaum und Flachwasser bilden einen dynamischen Lebensraum an der Nordseeküste.', layers: ['Dünenvegetation', 'Strand und Spülsaum', 'Flachwasser', 'Sand- und Muschelboden'], defaults: ['climate', 'habitatLoss', 'competition', 'disease'], species: ['harbour_seal', 'grey_seal', 'sanderling', 'ringed_plover', 'herring_gull', 'common_tern', 'sand_lizard', 'shore_crab', 'austernfischer', 'eider'] },
  wadden: { id: 'wadden', number: '05', title: 'Wattenmeer', description: 'Das Gezeitenökosystem verbindet Wattboden, Prielsysteme, Salzwiesen und Zugvögel.', layers: ['Salzwiese', 'Wattoberfläche', 'Prielsystem', 'Wattboden und Schlick'], defaults: ['climate', 'geneFlow', 'competition', 'bottleneck'], species: ['harbour_seal', 'grey_seal', 'avocet', 'bar_tailed_godwit', 'dunlin', 'eider', 'lugworm', 'shore_shrimp', 'cockle', 'blue_mussel', 'common_whelk', 'atlantic_herring'] },
  lake: { id: 'lake', number: '06', title: 'See & Ufer', description: 'Ufer, Freiwasser, Schilf und Grund für Fische und Wasservögel.', layers: ['Uferzone', 'Schilf- und Röhricht', 'Freiwasser', 'Tiefen- und Bodenzone'], defaults: ['climate', 'competition', 'disease', 'geneFlow'], species: ['fish', 'bird'] },
  village: { id: 'village', number: '03', title: 'Dorf & Stadt', description: 'Gärten, Dächer, Straßen und Grüninseln verändern Wege und Rückzugsräume.', layers: ['Bäume und Hecken', 'Gärten und Wiesen', 'Gebäude und Dächer', 'Boden und Gewässer'], defaults: ['road', 'habitatLoss', 'disease', 'selection'], species: ['bird', 'hare', 'fox'] },
};

const birdEcosystem = id => ['kormoran', 'graureiher', 'stockente', 'hoeckerschwan', 'blaesshuhn', 'eisvogel', 'fischadler'].includes(id) ? 'lake' : ['seeadler', 'austernfischer'].includes(id) ? 'wadden' : ['weissstorch', 'feldlerche', 'turmfalke'].includes(id) ? 'meadow' : 'forest';

export const SPECIES_INFO = {
  bird: { id: 'bird', common: 'Vogel', latin: 'Aves', ecosystem: 'forest', kind: 'animal', trophic: 'verschiedene Ebenen', goal: 'Finde einen Vogel und beobachte Flug, Nahrungssuche oder einen Wechsel zwischen Schichten.', description: 'Die Vogelgemeinschaft verbindet mehrere Trophieebenen. Im Modell fliegen ihre Vertreter mit weichen Bögen durch den Lebensraum.' },
  fish: { id: 'fish', common: 'Seefisch', latin: 'Pisces', ecosystem: 'lake', kind: 'animal', trophic: 'Sekundärkonsument', goal: 'Finde einen Fisch im Freiwasser und beobachte das Schwarmverhalten.', description: 'Fische bilden im See lockere Schwärme und verbinden Freiwasser, Uferzone sowie die aquatische Nahrungskette.' },
  ...Object.fromEntries(baseAnimals.map(entry => [entry[0], makeInfo(entry)])),
  ...Object.fromEntries(BIRD_SPECIES.map(([id, common, latin, trophic, diet]) => [id, { id, common, latin, ecosystem: birdEcosystem(id), kind: 'bird', trophic, diet, goal: `Finde die Art ${common} und beobachte ihre typische Nahrungssuche auf der Trophieebene „${trophic}“.`, description: `${common} (${latin}) gehört zur Trophieebene „${trophic}“. Typische Nahrung: ${diet}. Im Spiel wird sein Flug zunächst mit einem tabletfreundlichen Bewegungsmodell dargestellt.` }])),
};

export const ALL_PLANT_SPECIES = Object.values(PLANT_SPECIES).flat().map(([common, latin, layer]) => ({ common, latin, layer, kind: 'plant', ecosystem: 'forest' }));

export function factorLabel(name) {
  return FACTOR_CATALOG[name]?.label ?? name;
}
