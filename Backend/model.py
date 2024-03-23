import sys
import os
from gensim.models.doc2vec import Doc2Vec
import numpy as np
import json
from datetime import datetime

# Load the trained model
model = Doc2Vec.load("event_model")

#Loading current date
today = datetime.today()

# Load content from training.json
with open('training.json') as f:
    data = json.load(f)

# Extract user ID from command line arguments
username = sys.argv[1]

# Find the user with the given ID
user = next((user for user in data['user'] if user['username'] == username), None)
if not user:
    print(f"No user found with ID {username}")
    sys.exit()

# Extract user topics and event tags
user_topics = user['topics']
events_data = data['events']
events_tags = [event['tags'] for event in events_data]

# Calculate user interest vector
user_vector = model.infer_vector(user_topics)

# Calculate similarity of user interests with each event
similarities = [model.similarity_unseen_docs(user_topics, event_tags) for event_tags in events_tags]

# Set a threshold for the cosine similarity
threshold = 0.25

# Get the indices of events sorted by similarity and where the similarity is above the threshold
sorted_indices = [index for index in np.argsort(similarities)[::-1] if similarities[index] > threshold]

# Get the top 10 recommended events
recommended_events = [events_data[index] for index in sorted_indices[:10] if datetime.strptime(events_data[index]['eventDate'], '%Y-%m-%d') >= today]

# Print the recommended events
for event in recommended_events:
    print(event)

if not os.path.exists('eventjson'):
    os.makedirs('eventjson')

# Write the recommended events to a JSON file inside the eventjson folder
with open(os.path.join('eventjson', f"{username}_events.json"), 'w') as f:
    json.dump(recommended_events, f)
