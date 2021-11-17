import csv
import re

with open('../dict/Ternate Malay/Ternate_Malay_Wordlist.csv') as f:
  with open('../dict/Ternate Malay/Ternate_Malay_Wordlist2.csv', 'w') as fout:
    reader = csv.reader(f)
    writer = csv.writer(fout)
    for headword, gloss, comments in reader:
      match = re.search('^1\. (.+); 2\. (.+)$', gloss)
      if (match):
        writer.writerow([headword, match.group(1), comments])
        writer.writerow(['', match.group(2), ''])
      else:
        writer.writerow([headword, gloss, comments])