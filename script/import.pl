use v5.14;
use lib 'lib';
use File::Slurper 'read_text';
use JSON::MaybeXS;
use Lexicon::Importer;
use Lexicon::Parser::Fieldworks;
use Lexicon::Parser::Flex;
use Lexicon::Parser::LexiqueDocx;
use Lexicon::Parser::Marker;
binmode STDOUT, ':encoding(utf-8)';
binmode STDERR, ':encoding(utf-8)';

my $json = JSON->new;
my $config = $json->decode(read_text('config.json'));

my $importer = Lexicon::Importer->new(db_url => $config->{db});

sub import_lexicon {
  my ($source_title, $path, $args) = @_;
  $args->{path} = "dict/$args->{path}";
  my $parser = "Lexicon::Parser::$parser_type"->new($args);
  $importer->import_lexicon($source_title, $parser);
}

1;
