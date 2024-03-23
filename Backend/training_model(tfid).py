import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

def recommend_events(user_topics, events_data):
        
    # Convert lists of topics/tags into single strings
    user_topics_str = [' '.join(topics) for topics in user_topics]

    # Extract tags from each event and join them into single strings
    events_tags_str = [' '.join(event['tags']) for event in events_data]

    # Step 1: Preprocessing
    vectorizer = TfidfVectorizer()
    user_topics_matrix = vectorizer.fit_transform(user_topics_str)
    event_tags_matrix = vectorizer.transform(events_tags_str)

    # Step 2: Model Training
    # In this case, we're using cosine similarity to measure the similarity between user topics and event tags
    cosine_similarities = linear_kernel(user_topics_matrix, event_tags_matrix)

    # Step 3: Recommendation
    # Get the top 10 event indices sorted by similarity
    sorted_indices = cosine_similarities.argsort().flatten()

    # Only include events where the cosine similarity is greater than zero
    top_event_indices = [index for index in sorted_indices if cosine_similarities[0, index] > 0]

    recommended_events = [events_data[index] for index in top_event_indices]

    return recommended_events

# User's topics of interest
# user_json = json.loads('{"_id":{"$oid":"65d58f60c0e922d682304185"},"name":"Karthik Vijay","username":"karthik1801","email":"chn20cs064@ceconline.edu","password":"$2a$10$1V3SJQJsqPMGM5BTV3gUdOOc4eekeh1QvP0uAGrc.wPiNl./NHka2","forums":[{"name":"IEDC","description":"Description for IEDC","_id":{"$oid":"65d58f60c0e922d682304186"}},{"name":"GDSC","description":"Description for GDSC","_id":{"$oid":"65d58f60c0e922d682304187"}},{"name":"IEEE","description":"IEEE Student Branch of College of Engineering Chengannur formed on 16th of September, 1996 with the goal of keeping the students in touch with technological advances. What started as a small initiative for technical advancement of the students, is now one of the most vibrant Student Branches of the Asia Pacific Region (Region 10) and Kerala Section","_id":{"$oid":"65d6e2482bb9b1f77cc7203b"}}],"__v":{"$numberInt":"83"},"customEvents":[{"event_date":"2024-03-14","event_title":"YIP Marathon","event_theme":"blue","_id":{"$oid":"65e494c3bf929c91beebae9e"}},{"event_date":"2024-03-13","event_title":"Aptitest","event_theme":"green","_id":{"$oid":"65ef2d143dd2e77a0c950f55"}}],"joinedEvents":[{"eventName":"YIP Marathon","forumName":"IEDC","questions":[{"question":" Relevant technologies you know?","response":"MENN, React Native","_id":{"$oid":"65e494c2bf929c91beebae96"}}],"_id":{"$oid":"65e494c2bf929c91beebae95"},"isAttended":true},{"eventName":"Aptitest","forumName":"IEDC","questions":[{"question":" Do you have internet connection?","response":"Yes","_id":{"$oid":"65ef2d123dd2e77a0c950f48"}},{"question":" Rating of maths knowledge?","response":"98","_id":{"$oid":"65ef2d123dd2e77a0c950f49"}}],"_id":{"$oid":"65ef2d123dd2e77a0c950f47"}}],"topics":["Cybersecurity","Web Development","App Development"],"about":"MERN Stack Developer,React Native App Developer,Networking Enthusiast","branch":"Computer Science and Engineering","phoneNumber":"8547257478","yearOfJoin":"2019"}')
# user_topics = [user_json['topics']]

# # List of event data
# events_data = [
#     json.loads('{"_id":{"$oid":"65e33f1d89a19e70dcd2c42a"},"eventName":"YIP Marathon","date":"2024-03-30","time":"10:00","description":"YIP Idea Submission Programme in Collab with GDSC","location":"College of Engineering Chengannur","imagePath":"events/IEDC/YIP Marathon/yip.jpg","forumName":"IEDC","questions":[{"question":" Relevant technologies you know?","type":"text","_id":{"$oid":"65e33f1d89a19e70dcd2c42b"}}],"tags":["Personality","AI"],"collabForums":["GDSC","IEDC"],"amount":{"$numberInt":"0"},"__v":{"$numberInt":"0"},"eventVenue":"Offline"}'),
#     json.loads('{"_id":{"$oid":"65f31aea26229aba0b1170f9"},"eventName":"PiCraft","date":"2024-04-12","time":"10:00","description":"Raspberry","location":"CEC","eventVenue":"Offline","imagePath":"events/IEDC/PiCraft/picraft.jpg","forumName":"IEDC","questions":[],"tags":["Cybersecurity"],"collabForums":["IEDC"],"amount":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}'),
#     json.loads('{"_id":{"$oid":"65f2bc02e11a7a9a99a47041"},"eventName":"CodeVerse","date":"2024-04-04","time":"16:00","description":"Github","location":"CEC","eventVenue":"Offline","imagePath":"events/IEDC/CodeVerse/codeverse.jpg","forumName":"IEDC","questions":[],"tags":["Web Development"],"collabForums":["IEDC"],"amount":{"$numberInt":"0"},"__v":{"$numberInt":"0"}}')
#     # Add more event data here...
# ]

    #load content from training.json
with open('training.json') as f:
    data = json.load(f)

# Extract user topics and event tags
user_topics = [data['user']['topics']]
events_data = data['events']
events_tags = [event['tags'] for event in events_data]
    
print(user_topics,end="\n\n")
print(events_data,end="\n\n")


# Call the function
recommended_events = recommend_events(user_topics, events_data)

# Print the recommended events
for event in recommended_events:
    print(event)
    
# Save the recommended events to a JSON file
with open('response.json', 'w') as f:
    json.dump(recommended_events, f)
