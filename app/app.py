import csv
import random
from flask import Flask, render_template, jsonify

app = Flask(__name__)

def load_data():
    data = []
    with open('words.csv', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append({
                'french': row['Français'],
                'hiragana': row['Hiragana'],
                'kanji': row['Kanji'] if 'Kanji' in row else None
            })
    return data

questions = load_data()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/french_to_japanese')
def french_to_japanese():
    return render_template('french_to_japanese.html')

@app.route('/japanese_to_french')
def japanese_to_french():
    return render_template('japanese_to_french.html')

@app.route('/get_question/french_to_japanese')
def get_question_french_to_japanese():
    global questions
    if not questions:
        return jsonify({'question': None})

    filtered_questions = [q for q in questions if q['french'] is not None]

    if not filtered_questions:
        return jsonify({'question': None})

    question = random.choice(filtered_questions)
    questions.remove(question)

    return jsonify({'question': question})

@app.route('/get_question/japanese_to_french')
def get_question_japanese_to_french():
    global questions
    if not questions:
        return jsonify({'question': None})

    filtered_questions = [q for q in questions if q['kanji'] is not None]

    if not filtered_questions:
        return jsonify({'question': None})

    question = random.choice(filtered_questions)
    questions.remove(question)

    return jsonify({'question': question})

if __name__ == '__main__':
    app.run(debug=True)
