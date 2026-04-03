import requests
import json

url = "http://localhost:8001/api/bot"
payload = {"query": "electrician near Hinjewadi"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", json.dumps(response.json(), indent=2))
    except json.JSONDecodeError:
        print("Raw Response:", response.text)
except requests.exceptions.RequestException as e:
    print("Request failed:", e)
