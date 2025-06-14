import requests
from bs4 import BeautifulSoup
import re
import json

url = "https://notable-complete-garfish.ngrok-free.app/temperature_plot"

print("Fetching the URL...")
response = requests.get(url)
print(f"Status Code: {response.status_code}")

if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")
    scripts = soup.find_all("script")

    for script in scripts:
        script_text = script.text.strip()
        if "Plotly.newPlot" in script_text:
            print("\n✅ Found Plotly Chart Script")

            # Extract the data array from Plotly.newPlot call using regex
            match = re.search(r"Plotly\.newPlot\([^\[]+(\[\s*{.*?}\s*\])", script_text, re.DOTALL)
            if match:
                try:
                    # Parse the list of trace objects
                    plotly_data = json.loads(match.group(1))
                    for trace in plotly_data:
                        print(f"\n📊 Trace Name: {trace.get('name')}")
                        print("Timestamps:", trace.get("x", []))
                        print("Temperatures:", trace.get("y", []))
                except Exception as e:
                    print("❌ Failed to parse Plotly data:", e)
            else:
                print("❌ Could not locate Plotly data array.")
            break
    else:
        print("❌ No Plotly chart script found.")
else:
    print("❌ Failed to fetch the page. Status code:", response.status_code)
