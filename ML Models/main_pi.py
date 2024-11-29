from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from events_scoring_model import CosineRecommendationSystem
from database_connector import select_table
import pandas as pd
import json

app = Flask(__name__)
CORS(app, resources={r"/ml-model/*": {"origins": "http://localhost:4200"}})


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

    event_form = select_table("event_form")
    event_form_question = select_table("event_form_question")
    training_data = flat_question_and_answers(event_form=event_form, event_form_question=event_form_question)

    model = CosineRecommendationSystem(training_data)
    model.tokenize("form answers")

    model.transform(request.json["new_user_answers"])

    model.cosine_similarity()

    result = model.get_top_n(10)
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





def flat_vendor_info(vendor: pd.DataFrame, vendor_category: pd.DataFrame, vendor_service: pd.DataFrame):
    if 'category_id' not in vendor.columns or 'id' not in vendor_category.columns:
        raise KeyError("Las columnas necesarias no existen en los DataFrames proporcionados")
    vendor["category_id"] = vendor["category_id"].astype(str)
    vendor_category["id"] = vendor_category["id"].astype(str)
    vendor["id"] = vendor["id"].astype(str)
    vendor_service["vendor_id"] = vendor_service["vendor_id"].astype(str)
    vendor_category = vendor_category.rename(columns={'id': 'category_id'})
    vendor = pd.merge(vendor, vendor_category, how='left', left_on='category_id', right_on='category_id')
    print("vendor after merge with vendor_category")
    print(vendor)
    if 'id' not in vendor.columns:
        raise KeyError("La columna 'id' no existe en el DataFrame 'vendor' después de la unión")
    vendor_service = pd.merge(vendor_service, vendor, how='left', left_on='vendor_id', right_on='id')
    print("vendor_service after merge with vendor")
    print(vendor_service)
    vendor_info_wrapped = vendor_service.groupby('vendor_id').apply(
        lambda x: pd.Series({
            'vendor_info': ', '.join(
                f"Vendor: {row['name']} ({row['description']}), Location: {row['location']}, "
                f"Labels: {row['labels']}, Category: {row['category_name']} ({row['description_y']}), "
                f"Service: {row['service_name']} ({row['description_x']}), Available: {row['is_available']}"
                for _, row in x.iterrows()),
            'service_name': ', '.join(x['service_name'].unique())
        })
    ).reset_index()
    return vendor_info_wrapped  # Return the aggregated DataFrame

def get_vendor_templates(vendors: pd.DataFrame):
    # Print the structure of the vendors DataFrame
    print("Vendors DataFrame:")
    print(vendors)

    # Check if 'vendor_id' column exists
    if "vendor_id" not in vendors.columns:
        raise KeyError("The 'vendor_id' column is missing from the vendors DataFrame")

    total_vendors = len(vendors["vendor_id"])

    # Split the 'service_name' column into individual services
    vendors = vendors.assign(service_name=vendors['service_name'].str.split(', ')).explode('service_name')

    # Group by vendor_id and count the occurrences of each service_name
    vendor_task = vendors[["vendor_id", "service_name"]]
    vendor_task = vendor_task.drop_duplicates(subset=['vendor_id', 'service_name'])
    frequency = vendor_task['service_name'].value_counts().sort_values(ascending=False)

    # Print frequency for debugging
    print("Frequency of service names:")
    print(frequency)

    # Get top 10
    return (frequency / total_vendors).reset_index(name='frequency')

# Route to process EventForm and return computed JSON
@app.route('/ml-model/compute/vendor/suggestions', methods=['POST'])
def compute_vendor():
    if request.content_type != 'application/json':
        return jsonify({"status": "Unsupported Media Type"}), 415
    
    # Check if a token is provided in headers
    token = request.headers.get("Authorization")[7:]
    
    if not token or not is_user_logged_in(token) or type(is_user_logged_in(token)) == dict:
        return jsonify({"status": "Unauthorized"}), 401

    try:
        request_data = request.get_json()
        if request_data is None:
            raise ValueError("No JSON data provided")
    except (ValueError, TypeError) as e:
        return jsonify({"status": "Bad Request", "message": str(e)}), 400

    vendor = select_table("vendor")
    vendor_category = select_table("vendor_category")
    vendor_service = select_table("vendor_service")
    vendor_training_data = flat_vendor_info(vendor, vendor_category, vendor_service)
    model = CosineRecommendationSystem(vendor_training_data)
    
    model.tokenize("vendor_info")

    model.transform(request_data["vendor_answers"])

    model.cosine_similarity()

    result = model.get_top_n(5)    

    # Print result for debugging
    print("Result DataFrame:")
    print(result)

    frequency_templates = get_vendor_templates(result)
    frequency_templates = frequency_templates[frequency_templates["frequency"] >= 0.3]

    # Print frequency_templates for debugging
    print("Frequency Templates:")
    print(frequency_templates)

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




def flat_suggestions_info(suggestions_template: pd.DataFrame):
    if 'id' not in suggestions_template.columns or 'labels' not in suggestions_template.columns:
        raise KeyError("Las columnas necesarias no existen en los DataFrames proporcionados")
    
    suggestions_template["id"] = suggestions_template["id"].astype(str)
    suggestions_template["labels"] = suggestions_template["labels"].astype(str)
    
    # Eliminar duplicados
    suggestions_template = suggestions_template.drop_duplicates(subset=['id', 'labels', 'suggestions'])
    
    print(suggestions_template)
    
    suggestions_info_wrapped = suggestions_template.groupby('id').apply(
        lambda x: pd.Series({
            'suggestions_info': ', '.join(
                f"{row['suggestions']}"
                for _, row in x.iterrows()),
            'labels': ', '.join(x['labels'].unique())
        })
    ).reset_index()
    
    return suggestions_info_wrapped  # Return the aggregated DataFrame


def get_suggestions_templates(suggestions: pd.DataFrame):
    # Print the structure of the suggestions DataFrame
    print("Suggestions DataFrame:")
    print(suggestions)

    # Check if 'id' column exists
    if "id" not in suggestions.columns:
        raise KeyError("The 'id' column is missing from the suggestions DataFrame")

    total_suggestions = len(suggestions["id"])

    # Split the 'labels' column into individual labels
    suggestions = suggestions.assign(labels=suggestions['labels'].str.split(', ')).explode('labels')

    # Eliminar duplicados
    suggestions_task = suggestions[["id", "labels"]]
    suggestions_task = suggestions_task.drop_duplicates(subset=['id', 'labels'])
    
    frequency = suggestions_task['labels'].value_counts().sort_values(ascending=False)

    # Print frequency for debugging
    print("Frequency of labels:")
    print(frequency)

    # Get top 10
    return (frequency / total_suggestions).reset_index(name='frequency')


@app.route('/ml-model/compute/event/suggestions', methods=['POST'])
def compute_suggestions():
    if request.content_type != 'application/json':
        return jsonify({"status": "Unsupported Media Type"}), 415
    
    # Check if a token is provided in headers
    token = request.headers.get("Authorization")[7:]
    
    if not token or not is_user_logged_in(token) or type(is_user_logged_in(token)) == dict:
        return jsonify({"status": "Unauthorized"}), 401

    try:
        request_data = request.get_json()
        if request_data is None:
            raise ValueError("No JSON data provided")
    except (ValueError, TypeError) as e:
        return jsonify({"status": "Bad Request", "message": str(e)}), 400

    suggestions_template = select_table("suggestions_template")
    
    # Ensure the 'suggestions' column exists
    if 'suggestions' not in suggestions_template.columns:
        return jsonify({"status": "Internal Server Error", "message": "'suggestions' column not found in suggestions_template"}), 500

    
    suggestions_training_data = flat_suggestions_info(suggestions_template) # porque filtramos antes del entrenamiento, no hace falta hacer esto.
    print("expected output", suggestions_training_data)
    model = CosineRecommendationSystem(suggestions_training_data)
    
    model.tokenize("suggestions_info")

    model.transform(request_data["suggestions_answers"])

    model.cosine_similarity()

    result = model.get_top_n(5)    

    # Print result for debugging
    print("Result DataFrame:")
    print(result)

    frequency_templates = get_suggestions_templates(result)
    frequency_templates = frequency_templates[frequency_templates["frequency"] >= 0.3]

    # Print frequency_templates for debugging
    print("Frequency Templates:")
    print(frequency_templates)

    frequency_templates_json = frequency_templates.to_dict(orient="records")

    result_json = result.to_dict(orient="records")

    # Extract only the unique suggestions from the result
    suggestions_list = list(set(result["suggestions_info"].tolist()))

    response_data = {
        "suggestions": suggestions_list,
        "frequency_analysis": frequency_templates_json
    }

    return jsonify({
        "status": "success",
        "data": response_data
    }), 200

# Run the Flask app
if __name__ == "__main__":
    app.run(port=5000, debug=True)
    # response = requests.get("http://localhost:3306/auth/login")
    # print(response.json())