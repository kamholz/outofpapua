const entryNotesPreShared = [
  {
    key: 'paradigm',
    label: 'Inflectional class',
    join: true,
  },
  {
    key: 'morph',
    label: 'Morphological form',
    join: false,
  },
];

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
  ...entryNotesPreShared,
];

export const entryNotesPost = [
  {
    key: 'scientific',
    label: 'Scientific name',
    join: true,
  },
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
    label: 'Etymology',
    join: false,
  },
  {
    key: 'etymologyComment',
    label: 'Etymology comment',
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
    link: true,
  },
  {
    key: 'antonym',
    label: 'Antonyms',
    join: true,
    link: true,
  },
  {
    key: 'crossref',
    label: 'See also',
    join: true,
    trans: true,
    link: true,
  },
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
];

export const senseNotes = [
  ...entryNotesPreShared,
  {
    key: 'literal',
    label: 'Literally',
    join: true,
  },
  ...entryNotesPost,
];
