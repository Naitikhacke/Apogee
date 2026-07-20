import kagglehub
import os
import csv
import json

print("Downloading dataset...")
path = kagglehub.dataset_download("mightyglow/astronomical-image-and-csv-dataset")
print("Dataset downloaded to:", path)

csv_files = []
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith('.csv'):
            csv_files.append(os.path.join(root, file))

if csv_files:
    print("Found CSV:", csv_files[0])
    with open(csv_files[0], 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        print("Header:", header)
        for i in range(5):
            try:
                print("Row", i, next(reader))
            except StopIteration:
                break
else:
    print("No CSV found.")
