import os
from backend.app import create_app
from backend.config import Config

app = create_app(Config)

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5000))
    print(f"==================================================")
    print(f"  Kaushalam College Peer Learning Platform")
    print(f"  Backend REST API running at: http://127.0.0.1:{port}")
    print(f"==================================================")
    app.run(host="0.0.0.0", port=port, debug=True)
