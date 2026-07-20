import kagglehub
import os

print("Downloading dataset...")
path = kagglehub.dataset_download("mightyglow/astronomical-image-and-csv-dataset")
print("Dataset downloaded to:", path)

print("Files in dataset:")
for root, dirs, files in os.walk(path):
    for file in files:
        print(os.path.join(root, file))