export function questFinished(book,q){return book.progress(q)>=q.encounters.length;}
export function questInstructions(q){
 if(q.scenario)return 'Finde beide Partner am Lichtstrahl. Fokussiere Tiere mit dem Fernglas, Pflanzen mit der Lupe. Nimm danach beide gemeinsam in den Bildausschnitt.';
 if(q.category==='evolution')return 'Starte den Modellversuch und folge dem Lichtstrahl zu den Versuchstieren. Lass den Versuch laufen und beobachte die markierten Tiere sechs Sekunden ruhig mit dem Fernglas.';
 const action={predation:'Beobachte eine Verfolgung oder einen Fang.',competition:'Finde beide Arten an derselben Futterstelle und beobachte sie dort.',mutualism:'Folge einem Bestäuber von einer Blüte zur nächsten.',herbivory:'Beobachte ein Tier beim Fressen an einer Pflanze.',dispersal:'Beobachte, wie ein Tier einen Samen aufnimmt, wegträgt und versteckt.',deposit:'Beobachte die Aufnahme abgestorbenen Materials.',filtering:'Beobachte eine lebende Muschel unter Wasser.',resourceUse:'Beobachte, wie das Tier seine Nahrung aufnimmt.'}[q.kind]||'Beobachte die markierten Partner.';return `Folge dem Lichtstrahl und bestimme die Tierart mit dem Fernglas. ${action} Halte den Vorgang sechs Sekunden im Fokus. Vergleiche die Fundorte im Questbuch.`;
}
export function residentDestination(person,book){
 if(person.index===3)return {view:'map'};
 if(person.index!==1)return {view:'quests'};
 const q=book.available().find(q=>q.kind==='mutualism'&&q.encounters.some(c=>c.habitat==='city'&&c.species.includes('apis_mellifera')));
 return q?{view:'quest',id:q.id,habitat:'city'}:{view:'quests',message:'Bestäubung findest du in der freien Erkundung oder im Szenario Mutualismus. Wähle hier einen Auftrag für dein aktuelles Szenario.'};
}
