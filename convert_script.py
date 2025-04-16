import csv, json

with open('words.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    data = []
    for row in reader:
        data.append({
            'french': row['Français'],
            'hiragana': row['Hiragana'],
            'kanji': row.get('Kanji')
        })

with open('words.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)