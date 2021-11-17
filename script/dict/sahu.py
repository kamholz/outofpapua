import csv
import re

fieldnames = ['subentry', 'headword', 'register', 't.s. for', 'root', 'variant', 'connected', 'page', 'gloss (Indonesian)', 'gloss (MM)', 'gloss (English)', 'reg gloss', 'ex1', 'ex1 (Ind)', 'ex1 (MM)', 'ex1 (Eng)', 'ex2', 'ex2 (Ind)', 'ex2 (MM)', 'ex2 (Eng)', ' ex3',' ex3 (Ind)', 'ex 3 (MM)', ' ex3 (Eng)', 'ex4', 'ex4 (Ind)', 'ex4 (MM)', 'ex4 (Eng)', 'ex5', 'ex5 (Ind)', 'ex5 (Eng)', 'ex6', 'ex6 (Ind)', 'ex6 (Eng)', 'ex7', 'ex7 (Ind)', 'ex7 (Eng)', 'note']

def parse_subsenses(row):
  subsenses = []

  if row['gloss2 (Ind)'] or row['gloss2 (MM)'] or row['gloss2 (Eng)']:
    subsenses.append({
      'gloss (Indonesian)': row['gloss2 (Ind)'],
      'gloss (MM)': row['gloss2 (MM)'],
      'gloss (English)': row['gloss2 (Eng)'],
      'reg gloss': row['reg gloss2'],
    })
  if row['gloss3 (Ind)'] or row['gloss3 (MM)'] or row['gloss3 (Eng)']:
    subsenses.append({
      'gloss (Indonesian)': row['gloss3 (Ind)'],
      'gloss (MM)': row['gloss3 (MM)'],
      'gloss (English)': row['gloss3 (Eng)'],
    })
  if row['gloss4 (Ind)'] or row['gloss4 (Eng)']:
    subsenses.append({
      'gloss (Indonesian)': row['gloss4 (Ind)'],
      'gloss (English)': row['gloss4 (Eng)'],
    })
  
  return subsenses

if __name__ == '__main__':
  with open('../dict/spreadsheets/Sahu/wordlist_Sahu_Visser,Voorhoeve1987.csv') as f:
    with open('../dict/spreadsheets/Sahu/wordlist_Sahu_Visser,Voorhoeve1987_fixed.csv', 'w') as fout:
      reader = csv.DictReader(f)
      writer = csv.DictWriter(fout, fieldnames, extrasaction='ignore')
      writer.writeheader()
      for row in reader:
        for key in row.keys():
          row[key] = row[key].strip()

        row['subentry'] = 0
        if row['root']:
          # print(f'{last_row["headword"]} => {row["headword"]}')
          if row['root'] == last_row['headword']:
            row['subentry'] = 1
            row['root'] = ''
        else:
          last_row = row

        row['reg gloss'] = row['reg gloss1']
        writer.writerow(row)
        for subsense in parse_subsenses(row):
          writer.writerow({ **subsense, **{ 'subentry': 0 } })

