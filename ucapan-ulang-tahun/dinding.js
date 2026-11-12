/* ======================= GANTI DI SINI =======================
   Isi dari Firebase Console > Project settings (ikon gerigi) > Your apps > Web app
   Salin nilai apiKey, authDomain, projectId, appId dari "firebaseConfig".
   Lihat panduan di catatan dari Claude / README.
   ============================================================ */
const FIREBASE = {
  apiKey: "AIzaSyB1HAV1d7LCiQeSTB_d0gIuk6Qc8Jod0bU",
  authDomain: "my-future-1bfb3.firebaseapp.com",
  projectId: "my-future-1bfb3",
  appId: "1:141057246731:web:ba2e486b9feb24544b690e"
};

export const aktif = !!(FIREBASE.apiKey && FIREBASE.projectId);

const SDK = "https://www.gstatic.com/firebasejs/10.12.0/";
let auth, db, fa, fs;

async function siap() {
  if (!aktif) throw new Error("BELUM_DIATUR");
  if (db) return;
  const [{ initializeApp }, A, F] = await Promise.all([
    import(SDK + "firebase-app.js"),
    import(SDK + "firebase-auth.js"),
    import(SDK + "firebase-firestore.js")
  ]);
  fa = A; fs = F;
  const app = initializeApp(FIREBASE);
  auth = A.getAuth(app);
  db = F.getFirestore(app);
}

// Masuk ke Firebase memakai token Google dari login situs (disimpan auth.js saat login).
// Setelah sekali masuk, Firebase menyimpan sesinya sendiri di browser ini.
async function masuk() {
  await siap();
  await new Promise(r => { const off = fa.onAuthStateChanged(auth, () => { off(); r(); }); });
  if (auth.currentUser) return auth.currentUser;
  const u = typeof authUser === "function" ? authUser() : null;
  if (!u || !u.token) throw new Error("LOGIN_ULANG");
  try {
    const cred = fa.GoogleAuthProvider.credential(u.token);
    return (await fa.signInWithCredential(auth, cred)).user;
  } catch (e) {
    if (/invalid-credential|expired|token/i.test((e.code || "") + " " + (e.message || ""))) throw new Error("LOGIN_ULANG");
    throw e;
  }
}

// data: { gambar: dataURL jpeg, tata, nama, w, h }
export async function simpan(id, data) {
  const u = await masuk();
  await fs.setDoc(fs.doc(db, "dinding", id), { ...data, oleh: u.email, tanggal: fs.serverTimestamp() });
}

export async function daftar() {
  await masuk();
  const q = fs.query(fs.collection(db, "dinding"), fs.orderBy("tanggal", "desc"), fs.limit(100));
  return (await fs.getDocs(q)).docs.map(d => {
    const x = d.data();
    return { id: d.id, ...x, tanggal: x.tanggal && x.tanggal.toDate ? x.tanggal.toDate() : null };
  });
}

export async function hapus(id) {
  await masuk();
  await fs.deleteDoc(fs.doc(db, "dinding", id));
}

export function pesanGalat(e) {
  const m = (e && e.message) || String(e), kode = (e && e.code) || "";
  if (m === "BELUM_DIATUR") return "Dinding belum diatur: isi konfigurasi Firebase di file dinding.js.";
  if (m === "LOGIN_ULANG") return "Sesi Google-mu sudah kedaluwarsa untuk dinding. Keluar lalu masuk lagi ya.";
  if (kode === "permission-denied") return "Akun ini tidak diizinkan oleh aturan Firestore. Cek daftar email di Rules.";
  if (kode === "auth/operation-not-allowed") return "Login Google belum diaktifkan di Firebase Authentication.";
  if (kode === "auth/invalid-credential") return "Token Google tidak diterima Firebase. Pastikan Client ID sudah dimasukkan ke daftar 'Safelist client IDs' di Firebase Authentication > Google.";
  if (kode === "unavailable" || /network/i.test(m)) return "Tidak bisa terhubung ke Firebase. Cek koneksi internet.";
  return "Gagal: " + (kode ? kode + " · " : "") + m;
}
