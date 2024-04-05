# import os
# os.system('pip install gensim')
# os.system('pip install nltk')
# import nltk
# nltk.download('stopwords')
# nltk.download('punkt')

import os
import platform

if platform.system() == 'Linux':
    os.system('sudo apt install python3-gensim')
    os.system('sudo apt install python3-nltk')
else:
    os.system('pip install gensim')
    os.system('pip install nltk')

import nltk
nltk.download('stopwords')
nltk.download('punkt')