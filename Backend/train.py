from gensim.models.doc2vec import Doc2Vec, TaggedDocument
import json
import logging
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from datetime import datetime

logging.basicConfig(format="%(levelname)s - %(asctime)s: %(message)s", datefmt= '%H:%M:%S', level=logging.INFO)

today = datetime.today()

# Load content from training.json
with open('training.json') as f:
    data = json.load(f)

# Extract user topics and event tags
users_data = data['user']
events_data = data['events']

# Text preprocessing
stop_words = set(stopwords.words('english'))

# Prepare training data
documents = []
for user in users_data:
    user_topics = user['topics']
    user_about = user.get('about','').split()  # Split the 'about' text into words
    user_topics.extend(user_about)  # Add the 'about' words to the user's topics
    user_topics = [re.sub(r'\d+', '', word) for word in word_tokenize(' '.join(user_topics)) if word not in stop_words]
    documents.append(TaggedDocument(words=user_topics, tags=[user['_id']['$oid']]))

for event in events_data:
    event_date = datetime.strptime(event['eventDate'], '%Y-%m-%d')
    if event_date < today:
        continue
    event_tags = event['tags']
    event_tags = [re.sub(r'\d+', '', word) for word in word_tokenize(' '.join(event_tags)) if word not in stop_words]
    documents.append(TaggedDocument(words=event_tags, tags=[event['_id']['$oid']]))

# Train a Doc2Vec model
model = Doc2Vec(documents, vector_size=20, window=2, min_count=1, workers=4, epochs=50)

# Save the model
model.save("event_model")
print("Model saved successfully!")