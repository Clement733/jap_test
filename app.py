import dash
from dash import dcc, html
from dash.dependencies import Input, Output, State
import pandas as pd
import random

app = dash.Dash(__name__)

@ app.callback(
    Output('question', 'children'),
    Output('result', 'children'),
    Output('next-button', 'disabled'),
    Output('answer-input', 'value'),
    Input('next-button', 'n_clicks'),
    State('answer-input', 'value'),
    State('question', 'children'),
    State('result', 'children'),
    prevent_initial_call=True
)
def next_question(n_clicks, user_input, current_question, current_result):
    df = app.df

    if n_clicks is None:
        raise dash.exceptions.PreventUpdate

    current_question_index = int(current_question.split(' ')[-1].split(':')[0])  # Extracting the index part correctly

    if current_question_index < len(df):
        question_text = f"Question {current_question_index + 1}: What's {df['Français'][current_question_index]}?"
        if user_input == df['Hiragana'][current_question_index]:
            result_text = 'Correct!'
        else:
            result_text = f"Incorrect! The correct answer is {df['Hiragana'][current_question_index]}"

        return question_text, result_text, False, ''
    else:
        return 'Congratulations! You answered all questions correctly.', '', True, ''

def initialize_app():
    app.df = pd.read_csv('words.csv').sample(frac=1).reset_index(drop=True)

    app.layout = html.Div([
        html.H1('Welcome to my app!'),
        dcc.Input(id='answer-input', type='text', placeholder="Your Answer"),
        html.Button(id='next-button', n_clicks=0, children='Next Question'),
        html.Div(id='question', children='Question 1'),
        html.Div(id='result', children='')
    ])

if __name__ == "__main__":
    initialize_app()
    app.run_server(debug=True)
