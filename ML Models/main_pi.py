from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from events_scoring_model import CosineRecommendationSystem
from database_connector import select_table
import pandas as pd
import json

app = Flask(__name__)
CORS(app, resources={r"/ml-model/*": {"origins": "*"}})


def flat_question_and_answers(event_form: pd.DataFrame, event_form_question: pd.DataFrame):

    event_form["event_form_question_id"] = event_form["event_form_question_id"].astype(str)
    event_form_question["id"] = event_form_question["id"].astype(str)
    event_form = pd.merge(event_form, event_form_question, how='left', left_on='event_form_question_id', right_on='id')
    print("event_form after merge")
    print(event_form)

    event_form_wrapped = event_form.groupby('event_id').apply(
        lambda x: ', '.join(f"Pregunta: {row['question']} {row['answer']}..." for _, row in x.iterrows())
        ).reset_index(name='form answers')

    return event_form_wrapped

# Helper function to validate token with external auth service
def is_user_logged_in(token):
    url = f"http://localhost:8080/auth/isauthenticated"
    try:
        # add header token with bearer of the token
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, headers=headers)
        print("response", response)
        print("response of token", response.json())
        return response.json()
    except requests.RequestException as e:
        print("Error checking token:", e)
        return False

# Route to process EventForm and return computed JSON
@app.route('/ml-model/compute', methods=['POST'])
def compute():
    
    # Check if a token is provided in headers
    token = request.headers.get("Authorization")[7:]
    
    if not token or not is_user_logged_in(token) or type(is_user_logged_in(token)) == dict:
        return jsonify({"status": "Unauthorized"}), 401

    # Aquí cambiamos la tabla que queremos usar para entrenamiento. Esto para el entrenanimiento.
    event_form = select_table("event_form")
    event_form_question = select_table("event_form_question")
    training_data = flat_question_and_answers(event_form=event_form, event_form_question=event_form_question)

    # Modelo de AI. Aqui se pasa la tabla que queremos usar para entrenar.
    model = CosineRecommendationSystem(training_data)

    model.tokenize("form answers")

    # Se pasa el ejemplo que quiero que me de la recomendación.
    model.transform(request.json["new_user_answers"])

    # Aqui haace pensar al modelo.
    model.cosine_similarity()

    result = model.get_top_n(5)
    frequency_templates = get_templates(result)
    frequency_templates = frequency_templates[frequency_templates["count"] >= 0.3]
    frequency_templates_json = frequency_templates.to_dict(orient="records")

    result_json = result.to_dict(orient="records")

    response_data = {
        "cosine_similarity": result_json,
        "frequency_analysis": frequency_templates_json
    }
    # Expecting JSON data in the form of an EventForm object
    return jsonify({
        "status": "success",
        "data": response_data
        }), 200

def get_templates(events: list):
    event_task_templates = select_table("event_task_template")

    #print(event_task_templates)
    event_tasks = []
    total_events = len(events["event_id"])
    event_tasks = event_task_templates[event_task_templates["event_id"].isin(events["event_id"].astype(int))]

    event_task = event_tasks[["event_id", "task_template_id"]]
    # update
    event_task = event_task.drop_duplicates(subset=['event_id', 'task_template_id'])
    frequency = event_task['task_template_id'].value_counts().sort_values(ascending=False)
    # get top 10
    return (frequency / total_events).reset_index()

# Run the Flask app
if __name__ == "__main__":
    app.run(port=5000, debug=True)
    # response = requests.get("http://localhost:3306/auth/login")
    # print(response.json())