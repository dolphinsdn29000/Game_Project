#!/usr/bin/env python3
"""
Run a local web server *for this game folder* and open index.html in a browser.

Usage (PyCharm): right-click run_local.py → Run 'run_local'
Usage (Terminal): python3 run_local.py
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading, webbrowser, socket, time

DEFAULT_PORT = 8000

def find_free_port(preferred: int) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", preferred))
            return preferred
        except OSError:
            s.bind(("127.0.0.1", 0))
            return s.getsockname()[1]

def main():
    game_dir = Path(__file__).resolve().parent
    Handler = partial(SimpleHTTPRequestHandler, directory=str(game_dir))
    port = find_free_port(DEFAULT_PORT)
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://localhost:{port}/index.html"
    print(f"\nServing '{game_dir.name}' at: {url}\nPress Ctrl+C to stop.\n")
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    time.sleep(0.25)
    webbrowser.open_new_tab(url)
    try:
        while t.is_alive():
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nShutting down…")
    finally:
        server.shutdown(); server.server_close(); print("Server stopped.")

if __name__ == "__main__":
    main()
