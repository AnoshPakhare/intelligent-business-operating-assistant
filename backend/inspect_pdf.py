import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

req = urllib.request.Request(f"{BASE_URL}/invoices/5")
with urllib.request.urlopen(req) as resp:
    inv = json.loads(resp.read().decode('utf-8'))

print("Invoice 5 Detail from API:")
print("Status:", inv.get('status'))
print("Keys:", list(inv.keys()))
