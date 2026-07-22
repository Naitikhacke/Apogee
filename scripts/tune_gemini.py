import os
import sys
import uuid
import time
import csv

# Help users install missing requirements
try:
    import pandas as pd
    import kagglehub
    import google.generativeai as genai
except ImportError:
    print("Error: Missing required Python packages.")
    print("Please install them in your virtual environment by running:")
    print("  .venv\\Scripts\\pip.exe install google-generativeai pandas \"kagglehub[pandas-datasets]\"")
    sys.exit(1)

def load_env_api_key():
    env_path = '.env.local'
    if not os.path.exists(env_path):
        print(f"Error: {env_path} not found. Please create it first.")
        sys.exit(1)
        
    api_key = None
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                api_key = line.split('=', 1)[1].strip()
                break
                
    if not api_key or api_key == 'your-google-ai-studio-api-key':
        print("Error: GEMINI_API_KEY is missing or invalid in .env.local")
        sys.exit(1)
        
    return api_key

def update_env_model_id(tuned_model_name):
    env_path = '.env.local'
    lines = []
    updated = False
    
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
    for i, line in enumerate(lines):
        if line.startswith('GEMINI_CHAT_MODEL='):
            lines[i] = f"GEMINI_CHAT_MODEL={tuned_model_name}\n"
            updated = True
            break
            
    if not updated:
        lines.append(f"\n# Tuned Gemini Chat Model\nGEMINI_CHAT_MODEL={tuned_model_name}\n")
        
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
        
    print(f"\n[SUCCESS] Updated .env.local with GEMINI_CHAT_MODEL={tuned_model_name}")

def main():
    api_key = load_env_api_key()
    genai.configure(api_key=api_key)
    
    print("Downloading/Locating Kaggle Astronomical Dataset...")
    try:
        path = kagglehub.dataset_download("mightyglow/astronomical-image-and-csv-dataset")
    except Exception as e:
        print(f"Failed to download dataset via kagglehub: {e}")
        sys.exit(1)
        
    print(f"Dataset mounted at: {path}")
    
    csv_file = None
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith('dwarf_planets_info.csv'):
                csv_file = os.path.join(root, file)
                break
                
    if not csv_file:
        print("Error: Could not locate dwarf_planets_info.csv in the downloaded dataset.")
        sys.exit(1)
        
    print(f"Found CSV dataset: {csv_file}")
    
    # Read the dataset and generate training pairs
    training_data = []
    
    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('Name') or row.get('\ufeffName')
            desc = row.get('Description')
            mass = row.get('Mass')
            radius = row.get('Radius')
            period = row.get('Period (days)')
            axis = row.get('Semi-Major Axis (AU)')
            temp = row.get('Temp. (K)')
            method = row.get('Discovery Method')
            year = row.get('Disc. Year')
            distance = row.get('Distance (ly)')
            facts = row.get('Fun Facts')
            
            if not name:
                continue
                
            # Create different types of training queries for the model to learn
            
            # 1. General Info
            prompt1 = f"Tell me about the dwarf planet {name}."
            output1 = (
                f"{name} is a dwarf planet in our solar system. "
                f"Description: {desc} It sits at a semi-major axis of {axis} and a distance of {distance}."
            )
            training_data.append({"text_input": prompt1, "output": output1})
            
            # 2. Physical details
            prompt2 = f"What is the size and mass of dwarf planet {name}?"
            output2 = (
                f"{name} has an estimated mass of {mass} and a radius of {radius}. "
                f"Its orbital period is {period} and its average temperature is around {temp}."
            )
            training_data.append({"text_input": prompt2, "output": output2})
            
            # 3. Discovery details
            prompt3 = f"When was the dwarf planet {name} discovered?"
            output3 = f"{name} was discovered in the year {year} using the {method} method."
            training_data.append({"text_input": prompt3, "output": output3})
            
            # 4. Fun Facts
            prompt4 = f"Give me some fun facts about {name}."
            output4 = f"Here are interesting facts about {name}:\n{facts}"
            training_data.append({"text_input": prompt4, "output": output4})

    print(f"Generated {len(training_data)} training examples.")
    if len(training_data) < 10:
        print("Error: Too few training examples. Tuning requires larger dataset sizes.")
        sys.exit(1)
        
    tuned_model_id = f"dwarf-planets-{uuid.uuid4().hex[:8]}"
    print(f"\nInitiating Gemini model tuning job for: {tuned_model_id}...")
    print("This runs asynchronously on Google AI Studio servers. Staring upload...")
    
    try:
        operation = genai.create_tuned_model(
            source_model="models/gemini-1.5-flash-001",
            training_data=training_data,
            id=tuned_model_id,
            epoch_count=10,
            batch_size=4,
            learning_rate=0.001,
        )
        
        print("Tuning job submitted successfully!")
        print("Tuned model name:", operation.name)
        print("Waiting for training to complete (this may take 5-15 minutes depending on load)...")
        
        # Display wait bar progress
        for status in operation.wait_bar():
            time.sleep(15)
            
        tuned_model = operation.result()
        print("\n[SUCCESS] Model tuning completed!")
        print(f"Tuned Model ID: {tuned_model.name}")
        
        update_env_model_id(tuned_model.name)
        print("You can now start your dev server (npm run dev) and ask the AI Assistant about Ceres, Eris, Haumea, or Makemake!")
        
    except Exception as e:
        print(f"\nFailed to create tuned model: {e}")
        print("Verify your Gemini API key is correct and has fine-tuning permissions enabled.")
        sys.exit(1)

if __name__ == '__main__':
    main()
