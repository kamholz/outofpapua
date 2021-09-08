use v5.14;
use utf8;

our $dict = {
  'Anceaux (1961)' => {
    lang_target => 'bsm',
    path => 'spreadsheets/Busami.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [2, 'pos'],
      [0, 'gloss', 'eng'],
      [3, 'page_num'],
    ],
    split => ',;',
    split_headword => ',;',
    headword_ipa => \&ipa_common,
  },
  'Berry & Berry (1987a)' => {
    lang_target => 'sbg',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [15, 'headword'],
      [5, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987b)' => {
    lang_target => 'mxn',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [16, 'headword'],
      [6, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987c)' => {
    lang_target => 'msg',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [17, 'headword'],
      [7, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987d)' => {
    lang_target => 'kzz',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [18, 'headword'],
      [8, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987e)' => {
    lang_target => 'Tehit Salmit',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [19, 'headword'],
      [9, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987f)' => {
    lang_target => 'Tehit Sawiat',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [20, 'headword'],
      [10, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987g)' => {
    lang_target => 'Tehit Tehijit',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [21, 'headword'],
      [11, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987h)' => {
    lang_target => 'Abun Ji',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [22, 'headword'],
      [12, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987i)' => {
    lang_target => 'Abun Tat',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [23, 'headword'],
      [13, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Berry & Berry (1987j)' => {
    lang_target => 'asz',
    path => 'BirdsHead_Berry&Berry1987.xlsx',
    parser => 'Spreadsheet',
    skip => 5,
    columns => [
      [24, 'headword'],
      [14, 'ph'],
      [3, 'gloss', 'eng'],
      [4, 'gloss', 'ind'],
      [1, 'sd'],
      [2, 'note', 'term number:'],
      [0, 'page_num'],
    ],
    split => '/',
    split_headword => ',',
    headword_preprocess => \&clear_hyphen,
  },
  'Blust & Trussel (ongoing a)' => {
    lang_target => 'Proto-Austronesian',
    path => 'acd',
    parser => 'ACD',
    split_heuristic => ',/',
  },
  'Blust & Trussel (ongoing b)' => {
    lang_target => 'Proto-Malayo-Polynesian',
    path => 'acd',
    parser => 'ACD',
    split_heuristic => ',/',
  },
  'Blust & Trussel (ongoing c)' => {
    lang_target => 'Proto-Central-Eastern Malayo-Polynesian',
    path => 'acd',
    parser => 'ACD',
    split_heuristic => ',/',
  },
  'Blust & Trussel (ongoing d)' => {
    lang_target => 'Proto-Eastern Malayo-Polynesian',
    path => 'acd',
    parser => 'ACD',
    split_heuristic => ',/',
  },
  'Blust & Trussel (ongoing e)' => {
    lang_target => 'Proto-SHWNG',
    path => 'acd',
    parser => 'ACD',
    split_heuristic => ',/',
  },
  'Dol (2007)' => {
    lang_target => 'ayz',
    path => '../dict/dol_maybrat2007_toolbox.txt',
    parser => 'Marker',
    split => ',;',
    split_headword => ',;/',
    headword_ipa => \&ipa_dol,
  },
  'Donohue (nd.)' => {
    lang_target => 'swr',
    path => 'spreadsheets/3-Saweru words in Donohue phonology paper.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [0, 'gloss', 'eng'],
      [2, 'page_num'],
    ],
    headword_ipa => \&ipa_donohue,
  },
  'Donohue (2001)' => {
    lang_target => 'swr',
    path => 'spreadsheets/5-Saweru words in Donohue split intransitivity paper.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [0, 'gloss', 'eng'],
      [2, 'page_num'],
    ],
    headword_ipa => \&ipa_donohue,
  },
  'Donohue (2003)' => {
    lang_target => 'swr',
    path => 'spreadsheets/4-Saweru words in Donohue stress paper (stress marked).xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [0, 'gloss', 'eng'],
      [2, 'page_num'],
    ],
    headword_action => 'deaccent',
    headword_ipa => \&ipa_donohue,
  },
  'Donohue & Ayeri (nd.)' => {
    lang_target => 'swr',
    path => 'Fieldworks/Saweru.db',
    parser => 'Marker',
    skip_marker => 'lx_Eng',
    headword_ipa => \&ipa_donohue,
  },
  'Gasser (2016a)' => {
    lang_target => 'and',
    path => 'Talking Dictionaries/Ansus talking dictionary setup 2.0.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [3, 'pos'],
      [2, 'gloss', 'eng'],
      [11, 'gloss', 'ind'],
      [4, 'note'],
    ],
    split => ',/',
    strip => ['to'],
    headword_ipa => \&ipa_common,
  },
  'Gasser (2016b)' => {
    lang_target => 'bhw',
    path => 'Talking Dictionaries/Biak talking dictionary setup 2.0.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [3, 'pos'],
      [2, 'gloss', 'eng'],
      [11, 'gloss', 'ind'],
      [4, 'note'],
    ],
    split => ',/',
    strip => ['to'],
  },
  'Gasser (2016c)' => {
    lang_target => 'pmo',
    path => 'Talking Dictionaries/Pom talking dictionary setup 2.0.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [3, 'pos'],
      [2, 'gloss', 'eng'],
      [11, 'gloss', 'ind'],
      [4, 'note'],
    ],
    split => ',/',
    strip => ['to'],
  },
  'Gasser (2016d)' => {
    lang_target => 'rnn',
    path => 'Talking Dictionaries/Roon talking dictionary setup 2.0.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [1, 'ph'],
      [3, 'pos'],
      [2, 'gloss', 'eng'],
      [11, 'gloss', 'ind'],
      [4, 'note'],
    ],
    split => ',/',
    strip => ['to'],
  },
  'Gasser (2016e)' => {
    lang_target => 'Serewen',
    path => 'Talking Dictionaries/Serewen talking dictionary setup 2.0.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [3, 'pos'],
      [2, 'gloss', 'eng'],
      [11, 'gloss', 'ind'],
      [4, 'note'],
    ],
    split => ',/',
    strip => ['to'],
  },
  'Gasser (2016f)' => {
    lang_target => 'Yawa Unat',
    path => 'Talking Dictionaries/Yawa Unat talking dictionary setup 2.0.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [3, 'pos'],
      [2, 'gloss', 'eng'],
      [11, 'gloss', 'ind'],
      [4, 'note'],
    ],
    split => ',/',
    strip => ['to'],
  },
  'Gasser (2019a)' => {
    lang_target => 'wad',
    path => 'Wamesa_all.db',
    parser => 'Marker',
    encoding => 'cp1252',
    gloss => {
      ge => 'eng',
      gi => 'ind'
    },
    definition => {
      de => 'eng',
      di => 'ind'
    }
  },
  'Gasser (2019b)' => {
    lang_target => 'akc',
    path => 'Talking Dictionaries/Mpur talking dictionary setup 2.0.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [4, 'pos'],
      [3, 'gloss', 'eng'],
      [1, 'gloss', 'ind'],
      [5, 'note'],
    ],
    split => ',/',
    strip => ['to'],
  },
  'Halmahera Lingua Centre (2019)' => {
    lang_target => 'szw',
    path => 'webonary/sawai/*.html',
    parser => 'LexiqueHTML',
    lang_national => 'id',
    split_heuristic => ',',
    headword_ipa => \&ipa_sawai,
  },
  'Imelda & Bowden (2014)' => {
    lang_target => 'gak',
    path => 'Kamus kecil Gamkonora 2014 toolbox.txt',
    parser => 'Marker',
    lang_national => 'ind',
    split_heuristic => ',',
    headword_preprocess => sub { $_[0] =~ tr/’/'/r },
  },
  'Jones, Paai & Paai (1989)' => {
    lang_target => 'yva',
    path => 'Fieldworks/Yawa.db',
    parser => 'Marker',
    headword_citation_action => 'prefer_root',
    skip_marker => 'lx_Eng',
    headword_ipa => \&ipa_jones,
  },
  'Kamholz (nd.a)' => {
    lang_target => 'mhz',
    path => 'Kamholz/Moor.txt',
    parser => 'Marker',
    lang_regional => 'ind',
    lang_national => 'ind',
    split_heuristic => ',',
    gloss_preprocess => \&clear_hyphen,
  },
  'Kamholz (nd.b)' => {
    lang_target => 'jau',
    path => 'Kamholz/Yaur.txt',
    parser => 'Marker',
    lang_regional => 'ind',
    lang_national => 'ind',
    gloss_preprocess => \&clear_hyphen,
    headword_ipa => \&ipa_kamholz,
  },
  'Kamholz (nd.c)' => {
    lang_target => 'ire',
    path => 'Kamholz/Yerisiam.txt',
    parser => 'Marker',
    lang_regional => 'ind',
    lang_national => 'ind',
    gloss_preprocess => \&clear_hyphen,
    headword_ipa => \&ipa_kamholz,
  },
  'Kamholz (nd.d)' => {
    lang_target => 'gop',
    path => 'Kamholz/Umar.txt',
    parser => 'Marker',
    lang_regional => 'ind',
    lang_national => 'ind',
    gloss_preprocess => \&clear_hyphen,
    headword_ipa => \&ipa_kamholz,
  },
  'Kijne (nd.a)' => {
    lang_target => 'Yawa Turu',
    path => 'spreadsheets/8-Turu word list Kijne.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [2, 'headword'],
      [4, 'ph'],
      [1, 'gloss', 'nld'],
      [0, 'gloss', 'eng'],
      [3, 'page_num'],
    ],
    headword_ipa => \&ipa_kijne,
  },
  'Kijne (nd.b)' => {
    lang_target => 'swr',
    path => 'spreadsheets/9-Saweru-Turu word list Kijne.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [7, 'ph'],
      [4, 'gloss', 'nld'],
      [0, 'gloss', 'eng'],
      [3, 'page_num'],
    ],
    headword_action => 'deaccent',
    headword_ipa => \&ipa_kijne,
  },
  'Kijne (nd.c)' => {
    lang_target => 'Yawa Turu',
    path => 'spreadsheets/9-Saweru-Turu word list Kijne.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [2, 'headword'],
      [6, 'ph'],
      [4, 'gloss', 'nld'],
      [0, 'gloss', 'eng'],
      [3, 'page_num'],
    ],
    headword_action => 'deaccent',
    headword_ipa => \&ipa_kijne,
  },
  'Kijne (nd.d)' => {
    lang_target => 'Yawa Mantembu',
    path => 'spreadsheets/10-Mantembu word list Kijne.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [4, 'ph'],
      [1, 'gloss', 'nld'],
      [2, 'gloss', 'eng'],
      [3, 'page_num'],
    ],
    headword_ipa => \&ipa_kijne,
  },
  'Kijne (nd.e)' => {
    lang_target => 'Yawa Ambaidiru',
    path => 'spreadsheets/11-Ambaidiru word list Kijne.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [2, 'headword'],
      [4, 'ph'],
      [1, 'gloss', 'nld'],
      [0, 'gloss', 'eng'],
      [3, 'page_num'],
    ],
    headword_ipa => \&ipa_kijne,
  },
  'Lobat (2017a)' => {
    lang_target => 'Kalabra Tet Tro',
    path => 'spreadsheets Upwork/Kalabra dictionary.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [0, 'gloss', 'ind'],
      [3, 'page_num'],
    ],
    split_headword => ';',
    headword_preprocess => \&strip_paren,
  },
  'Lobat (2017b)' => {
    lang_target => 'Kalabra Tet Tto',
    path => 'spreadsheets Upwork/Kalabra dictionary.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [2, 'headword'],
      [0, 'gloss', 'ind'],
      [3, 'page_num'],
    ],
    split_headword => ';',
    headword_preprocess => \&strip_paren,
  },
  'Mofu (nd.)' => {
    lang_target => 'bhw',
    path => 'Biak_dictionary.txt',
    parser => 'Marker',
    split => ',;',
    sense => 'hm',
  },
  'Price (2021)' => {
    lang_target => 'amk',
    path => 'Ambai Lexicon.db',
    parser => 'Marker',
    lang_national => 'ind',
    reverse_action => 'drop',
  },
  'Price & Donohue (2009)' => {
    lang_target => 'and',
    path => 'spreadsheets/Ansus.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [0, 'headword'],
      [1, 'gloss', 'eng'],
      [2, 'gloss', 'ind'],
      [3, 'page_num'],
    ],
    headword_ipa => \&ipa_common,
  },
  'Slump (1924-1938)' => {
    lang_target => 'seu',
    path => 'spreadsheets/12-Serui-Laut vocabulary Slump.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [0, 'gloss', 'ind'],
      [3, 'gloss', 'eng'],
      [2, 'page_num'],
    ],
    headword_ipa => \&ipa_common,
  },
  'Smits & Voorhoeve (1998a)' => {
    lang_target => 'Yawa Ambaidiru',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [2, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998b)' => {
    lang_target => 'Yawa Ariepi',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [3, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998c)' => {
    lang_target => 'Yawa Mariadei',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [4, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998d)' => {
    lang_target => 'Yawa Tarau',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [5, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998e)' => {
    lang_target => 'Yawa Tarau',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [6, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998f)' => {
    lang_target => 'Yawa Kampung Baru',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [7, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998g)' => {
    lang_target => 'Yawa Mantembu',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [8, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998h)' => {
    lang_target => 'Yawa Mantembu',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [9, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998i)' => {
    lang_target => 'Yawa Turu',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [10, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998j)' => {
    lang_target => 'Yawa Konti Unai',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [11, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998k)' => {
    lang_target => 'Yawa Wadapi-Darat',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [12, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998l)' => {
    lang_target => 'Yawa Wadapi-Darat',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [13, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998m)' => {
    lang_target => 'swr',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [14, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998n)' => {
    lang_target => 'swr',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [15, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Smits & Voorhoeve (1998o)' => {
    lang_target => 'swr',
    path => 'spreadsheets/6-Word list of multiple Yawa dialects and Saweru in Anceaux collection.xlsx',
    skip => 2,
    parser => 'Spreadsheet',
    columns => [
      [16, 'headword'],
      [0, 'gloss', 'eng'],
      [1, 'page_num'],
    ],
    headword_ipa => \&ipa_smits_voorhoeve,
  },
  'Unknown (nd.)' => {
    lang_target => 'kgr',
    path => 'Abun_conversations_wordlist.xlsx',
    parser => 'Spreadsheet',
    sheet => 'Sheet2',
    columns => [
      [0, 'headword'],
      [1, 'gloss', 'ind'],
      [2, 'gloss', 'eng'],
    ],
    split => '/',
  },
  'van Staden (1996)' => {
    lang_target => 'tvo',
    path => 'Tidore_toolbox.txt',
    parser => 'Marker',
    split => ',;',
    gloss_preprocess => \&replace_underscore,
    headword_preprocess => \&replace_underscore,
  },
  'Voorhoeve (1975)' => {
    lang_target => 'yva',
    path => 'spreadsheets/7-Yawa small word list Anceaux.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [1, 'headword'],
      [0, 'gloss', 'eng'],
    ],
    headword_ipa => \&ipa_voorhoeve,
  },
  'Wada (1980a)' => {
    lang_target => 'Proto-North Halmahera',
    path => 'Wada_1980/Wada.xlsx',
    parser => 'Spreadsheet',
    columns => [
      [3, 'headword'],
      [1, 'gloss', 'eng'],
      [2, 'gloss', 'ind'],
      [0, 'note'],
    ],
    split => ',;',
    split_headword => ',;',
  }
};

# headword cleanup

sub clear_hyphen {
  return $_[0] =~ s/^-+$//r;
}

sub replace_underscore {
  return $_[0] =~ s/_/ /gr;
}

sub strip_paren {
  return $_[0] =~ s/ *\([^()]+\)$//r;
}

# syllabification

my $vowel = qr/[aeɛoɔ]i|[aoɔ]u|a[oɔ]|[aeɛəioɔu]/;
my $onset = qr/ɡʷ|tʃ|dʒ|[ptkbdɡfɸvβ][rɾl]?|[ʔsʃmnɳŋrɾlwj]/;

sub syllabify {
  my ($txt) = @_;
  $txt =~ s/(($onset)?$vowel)/σ$1/g;
  $txt =~ s/^σ//;
  return $txt;
}

sub stress_acute {
  return join(' ', map { stress_acute_word($_) } split(/ /, $_[0]));
}

sub stress_acute_word {
  my ($txt) = @_;
  my $syll = syllabify($txt);
  my $count = $syll =~ tr/\x{301}//;
  if ($count == 1) {
    my @syllables = split /σ/, $syll;
    foreach my $syllable (@syllables) {
      if ($syllable =~ s/\x{301}//) {
        $syllable = "\x{2c8}" . $syllable;
        last;
      }
    }
    return join('', @syllables);
  } elsif ($count > 1) {
    say "warning: multiple acute accents found: $txt";
    return $syll =~ s/[σ\x{301}]//gr;
  }
  return $txt;
}

# ipa conversion

sub ipa_common {
  my $txt = lc shift;
  $txt =~ s/ng/ŋ/g;
  $txt =~ s/ny/ɳ/g;
  $txt =~ s/j/dʒ/g;
  $txt =~ s/c/tʃ/g;
  $txt =~ tr/gyv/ɡjβ/;
  return $txt;
}

sub ipa_dol {
  my $txt = lc shift;
  $txt = 'əte' if $txt eq 'ete';
  $txt =~ tr/h/x/;
  return ipa_common($txt);
}

sub ipa_donohue {
  my $txt = lc shift;
  $txt =~ tr/fweor/ɸβɛɔɾ/;
  $txt =~ s/a(\x{301}?)a/a$1ː/g;
  $txt =~ s/e(\x{301}?)e/ɛ$1ː/g;
  return stress_acute(ipa_common($txt));
}

sub ipa_jones {
  my $txt = lc shift;
  $txt =~ s/gw/ɡʷ/g;
  $txt =~ s/sy/ʃ/g;
  $txt =~ s/ui/ʷi/g;
  $txt =~ tr/r/ɾ/;
  return ipa_common($txt);
}

sub ipa_kamholz {
  my $txt = lc shift;
  $txt =~ s/gw/ɡʷ/g;
  $txt =~ tr/'r/ʔɾ/;
  return ipa_common($txt);
}

sub ipa_kijne {
  my $txt = lc shift;
  $txt =~ s/sy/ʃ/g;
  $txt =~ tr/er/ɛɾ/;
  return stress_acute(ipa_common($txt));
}

sub ipa_sawai {
  my $txt = lc shift;
  $txt =~ tr/eéoó/ɛeoɔ/;
  return ipa_common($txt);
}

sub ipa_smits_voorhoeve {
  my $txt = lc shift;
  $txt =~ s/dz/dʒ/g;
  $txt =~ s/sy/ʃ/g;
  $txt =~ tr/fèòä:r/ɸɛɔaːɾ/;
  return ipa_common($txt);
}

sub ipa_voorhoeve {
  my $txt = lc shift;
  $txt =~ s/gw/ɡʷ/g;
  $txt =~ tr/r/ɾ/;
  return ipa_common($txt);
}

1;