"""Jalankan file ini (tombol Run Python) untuk membuka web ucapan di localhost."""
import http.server
import os
import socket
import socketserver
import webbrowser

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


httpd = None
for port in range(5500, 5520):
    try:
        httpd = Server(("0.0.0.0", port), http.server.SimpleHTTPRequestHandler)
        break
    except OSError:
        continue

if httpd is None:
    raise SystemExit("Port 5500-5519 terpakai semua. Tutup server lain dulu.")

url = f"http://localhost:{port}/"
print("Web ucapan jalan di :", url)
ip = lan_ip()
if ip:
    print("Buka dari HP (WiFi sama):", f"http://{ip}:{port}/")
print("Pembuat QR          :", url + "qr.html")
print("Tekan Ctrl+C untuk berhenti.")

webbrowser.open(url)
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer berhenti.")
