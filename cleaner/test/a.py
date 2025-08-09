import google.generativeai as genai

# Configure the API key
genai.configure(api_key="AIzaSyDRUvyiwRgV4q86sRAei8U50Pc9UgZTzcM")

# Load the model
model = genai.GenerativeModel("models/gemini-2.5-pro")

# Load the image
with open("2.png", "rb") as f:
    image_bytes = f.read()

# Send image + prompt
response = model.generate_content([
    {
        "mime_type": "image/jpeg",
        "data": image_bytes
    },
    "pls analyze this image."
])

print("Gemini's response:", response.text)
