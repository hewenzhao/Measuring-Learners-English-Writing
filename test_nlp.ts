import nlp from 'compromise';

const text = "Dr. Smith went to the U.S.A. today. It was a good day, but he was tired! Therefore, he slept. He loves dogs.";
const doc = nlp(text);

console.log("Sentences:");
console.log(doc.sentences().out('array'));
console.log("Terms:");
console.log(doc.terms().out('array'));
console.log("Clauses:");
console.log(doc.clauses().out('array'));
console.log("Verbs/Nouns/Adj/Adv:");
console.log(doc.match('#Noun | #Verb | #Adjective | #Adverb').out('array'));
