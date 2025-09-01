export const entryNotesPre = [
  {
    key: 'variant',
    label: 'Variants',
    trans: true,
    join: true,
  },
  {
    key: 'singular',
    label: 'Singular',
    join: true,
  },
  {
    key: 'plural',
    label: 'Plural',
    join: true,
  },
  {
    key: 'morph',
    label: 'Morphological form',
    join: false,
  },
  {
    key: 'paradigm',
    label: 'Inflection/class',
    join: true,
  },
];

const entryNotesPost1 = [
  {
    key: 'literal',
    label: 'Literally',
    join: true,
  },
];

const entryNotesPost2 = [
  {
    key: 'scientific',
    label: 'Scientific name',
    join: true,
  },
];

const entryNotesPost3 = [
  {
    key: 'usage',
    label: 'Usage',
    join: false,
  },
  {
    key: 'grammar',
    label: 'Grammatical note',
    join: false,
  },
  {
    key: 'phono',
    label: 'Phonological note',
    join: false,
  },
  {
    key: 'discourse',
    label: 'Discourse note',
    join: false,
  },
  {
    key: 'socio',
    label: 'Sociolinguistic note',
    join: false,
  },
  {
    key: 'anthro',
    label: 'Anthropological note',
    join: false,
  },
  {
    key: 'note',
    label: 'Note',
    join: false,
  },
];

const entryNotesPost4 = [
  {
    key: 'question',
    label: 'Analyst’s question',
    join: false,
  },
  {
    key: 'encyclopedic',
    label: 'Encyclopedic info',
    join: false,
  },
  {
    key: 'domain',
    label: 'Semantic domain',
    join: true,
  },
  {
    key: 'etymology',
    label: 'Origin',
    join: false,
  },
  {
    key: 'etymologyComment',
    label: 'Origin comment',
    join: false,
  },
  {
    key: 'lexicalFunction',
    label: 'Lexical functions',
    join: true,
  },
  {
    key: 'synonym',
    label: 'Synonyms',
    join: true,
    link: 'entry',
  },
  {
    key: 'antonym',
    label: 'Antonyms',
    join: true,
    link: 'entry',
  },
];

const entryNotesPost5 = [
  {
    key: 'crossref',
    label: 'See also',
    join: true,
    trans: true,
    link: 'entry',
  },
];

const entryNotesPost6 = [
  {
    key: 'source',
    label: 'Source',
    join: true,
  },
  {
    key: 'reference',
    label: 'Reference',
    join: true,
  },
  {
    key: 'url',
    label: 'URL',
    join: false,
    link: 'url',
  },
];

export const entryNotesPost = [
  ...entryNotesPost1,
  ...entryNotesPost2,
  ...entryNotesPost3,
  ...entryNotesPost4,
  ...entryNotesPost5,
  ...entryNotesPost6,
];

export const senseNotes = [
  ...entryNotesPost2,
  ...entryNotesPost3,
  ...entryNotesPost4,
  {
    key: 'crossref',
    label: 'See also',
    join: true,
    link: 'entry',
  },
];

export const exampleNotes = [
  ...entryNotesPost3,
  ...entryNotesPost5,
];
