/* ======================= GANTI DI SINI =======================
   clientId  : OAuth Client ID dari Google Cloud (lihat panduan)
   emailBoleh: hanya akun Google ini yang boleh masuk
   ============================================================ */
const AUTH = {
  clientId: "190876029376-6fapvgqefs0jjk1uno8aqngulsl29mfl.apps.googleusercontent.com",
  emailBoleh: [
    "email-sholeh@gmail.com",
    "email-nadia@gmail.com"
  ],
  lamaLogin: 7   // hari; setelah ini harus login ulang
};

const AUTH_KEY = "ultah_login";

function authUser() {
  try {
    const u = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    if (u && u.sampai > Date.now() && authBoleh(u.email)) return u;
  } catch {}
  return null;
}

function authBoleh(email) {
  return AUTH.emailBoleh.map(e => e.trim().toLowerCase()).includes(String(email).toLowerCase());
}

function authSimpan(u) {
  u.sampai = Date.now() + AUTH.lamaLogin * 864e5;
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); } catch {}
}

function keluar() {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
  if (window.google && google.accounts) google.accounts.id.disableAutoSelect();
  location.replace("login.html");
}

// Halaman selain login.html: belum login -> lempar ke login, lalu kembali ke halaman ini
if (!window.AUTH_HALAMAN_LOGIN && !authUser()) {
  const sini = location.pathname.split("/").pop() || "index.html";
  location.replace("login.html?next=" + encodeURIComponent(sini + location.search));
}
