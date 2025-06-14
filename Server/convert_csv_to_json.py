import csv
import json

csv_file = "power_consumption_records.csv"
json_file = "power_consumption_records.json"

with open(csv_file, mode='r') as f:
    reader = csv.DictReader(f)
    data = list(reader)

with open(json_file, mode='w') as f:
    json.dump(data, f, indent=4)

print(f"Converted {csv_file} to {json_file}")
