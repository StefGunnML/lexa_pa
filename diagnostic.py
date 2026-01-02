import os
import httpx
from backend.app.models import SessionLocal, SystemConfig

def run():
    db = SessionLocal()
    s = db.query(SystemConfig).filter(SystemConfig.key == 'NANGO_SECRET_KEY').first()
    db.close()
    key = s.value if s else os.getenv('NANGO_SECRET_KEY')
    if not key:
        print("No NANGO_SECRET_KEY found")
        return
    resp = httpx.get('https://api.nango.dev/config', headers={'Authorization': f'Bearer {key}'})
    print(resp.text)

if __name__ == "__main__":
    run()
