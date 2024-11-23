from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os

def load_env_file(filepath):
    if os.path.exists(filepath):
        with open(filepath, 'r') as file:
            for line in file:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

# Load the .env file
load_env_file('.env')

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant knowledgeable in medical terms."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        assistant_response = completion.choices[0].message.content
        return jsonify({'response': assistant_response})
    except Exception as e:
        print("Error details:", e)  # Log the error details for debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)