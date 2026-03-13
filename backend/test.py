from google import genai;
from config import Config; 
client = genai.Client(api_key=Config.GEMINI_KEY); 
print(client.models.generate_content(model='gemini-2.5-flash-lite', contents='Hello').text)