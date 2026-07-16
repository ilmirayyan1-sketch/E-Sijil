// Konfigurasi Asas Data Struktur E-Kehadiran
function mulakanDatabase() {
    let storage = localStorage.getItem("e_kehadiran_db");
    if (!storage) {
        const strukturAsal = {
            senaraiKelas: ["5 Sains", "5 Sastera"],
            pelajar: [
                { id: 1, nama: "Ahmad Ali", kelas: "5 Sains", rekod: {} },
                { id: 2, nama: "Siti Aminah", kelas: "5 Sains", rekod: {} },
                { id: 3, nama: "Chong Wei", kelas: "5 Sastera", rekod: {} }
            ]
        };
        localStorage.setItem("e_kehadiran_db", JSON.stringify(strukturAsal));
        return strukturAsal;
    }
    return JSON.parse(storage);
}

let db = mulakanDatabase();

// Menjana Pilihan 20 Minggu Semester secara Automatik
function janaPilihanMinggu() {
    const pilihMinggu = document.getElementById("pilihMinggu");
    const laporanMinggu = document.getElementById("laporanMinggu");
    
    let htmlMinggu = "";
    for (let i = 1; i <= 20; i++) {
        htmlMinggu += `<option value="Minggu-${i}">Minggu ${i}</option>`;
    }
    
    if (pilihMinggu) pilihMinggu.innerHTML = htmlMinggu;
    if (laporanMinggu) laporanMinggu.innerHTML += htmlMinggu;
}

// Kemas kini Pilihan Dropdown Kelas di index dan laporan
function janaPilihanKelas() {
    const pilihKelas = document.getElementById("pilihKelas");
    const laporanKelas = document.getElementById("laporanKelas");
    
    let htmlKelas = db.senaraiKelas.map(k => `<option value="${k}">${k}</option>`).join("");
    
    if (pilihKelas) pilihKelas.innerHTML = htmlKelas;
    if (laporanKelas) laporanKelas.innerHTML = htmlKelas;
}

// Tambah Kelas Kustom Baru
function tambahKelas() {
    const namaInput = document.getElementById("namaKelasBaru");
    let nama = namaInput.value.trim();
    if (!nama) return alert("Sila masukkan nama kelas!");
    if (db.senaraiKelas.includes(nama)) return alert("Kelas ini sudah wujud!");

    db.senaraiKelas.push(nama);
    localStorage.setItem("e_kehadiran_db", JSON.stringify(db));
    namaInput.value = "";
    janaPilihanKelas();
    alert(`Kelas ${nama} berjaya didaftarkan!`);
}

// Tambah Pelajar Baru ke dalam kelas yang dipilih semasa
function tambahPelajar() {
    const namaInput = document.getElementById("namaPelajarBaru");
    const kelasTerpilih = document.getElementById("pilihKelas").value;
    let nama = namaInput.value.trim();
    
    if (!nama) return alert("Sila masukkan nama pelajar!");
    
    let idBaru = db.pelajar.length > 0 ? db.pelajar[db.pelajar.length - 1].id + 1 : 1;
    db.pelajar.push({ id: idBaru, nama: nama, kelas: kelasTerpilih, rekod: {} });
    
    localStorage.setItem("e_kehadiran_db", JSON.stringify(db));
    namaInput.value = "";
    tukarKonfigurasiSesi();
    alert(`Pelajar ${nama} dimasukkan ke kelas ${kelasTerpilih}!`);
}

// Paparkan senarai nama pelajar berdasarkan kelas yang dipilih guru
function tukarKonfigurasiSesi() {
    const kelasTerpilih = document.getElementById("pilihKelas").value;
    const kontenaPelajar = document.getElementById("senaraiPelajar");
    if (!kontenaPelajar) return;

    let pelajarKelas = db.pelajar.filter(p => p.kelas === kelasTerpilih);
    kontenaPelajar.innerHTML = "";

    if (pelajarKelas.length === 0) {
        kontenaPelajar.innerHTML = `<p class="text-center text-muted py-3">Tiada pelajar lagi dalam kelas ini.</p>`;
        return;
    }

    pelajarKelas.forEach((pelajar, index) => {
        kontenaPelajar.innerHTML += `
            <div class="d-flex justify-content-between align-items-center p-3 student-row">
                <span class="fw-semibold">${index + 1}. ${pelajar.nama}</span>
                <div class="btn-group" role="group">
                    <input type="radio" class="btn-check" name="status-${pelajar.id}" id="hadir-${pelajar.id}" value="Hadir" checked>
                    <label class="btn btn-outline-success btn-sm px-3" for="hadir-${pelajar.id}"><i class="bi bi-check-circle"></i> Hadir</label>

                    <input type="radio" class="btn-check" name="status-${pelajar.id}" id="tidak-${pelajar.id}" value="Tidak Hadir">
                    <label class="btn btn-outline-danger btn-sm px-3" for="tidak-1${pelajar.id}"><i class="bi bi-x-circle"></i> Ponteng</label>
                </div>
            </div>
        `;
    });
}

// Simpan data tandaan harian mengiringi struktur minggu
function simpanKehadiran() {
    const tarikh = document.getElementById("tarikhKehadiran").value;
    const minggu = document.getElementById("pilihMinggu").value;
    const kelasTerpilih = document.getElementById("pilihKelas").value;
    
    if (!tarikh) return alert("Sila tetapkan tarikh!");

    let pelajarKelas = db.pelajar.filter(p => p.kelas === kelasTerpilih);

    pelajarKelas.forEach(pelajar => {
        const isHadir = document.getElementById(`hadir-${pelajar.id}`).checked;
        if (!pelajar.rekod[minggu]) {
            pelajar.rekod[minggu] = [];
        }
        
        // Elakkan duplikasi data pada tarikh yang sama
        pelajar.rekod[minggu] = pelajar.rekod[minggu].filter(r => r.tarikh !== tarikh);
        pelajar.rekod[minggu].push({ tarikh: tarikh, status: isHadir ? "Hadir" : "Tidak Hadir" });
    });

    localStorage.setItem("e_kehadiran_db", JSON.stringify(db));
    alert("Kehadiran hari ini berjaya dikunci!");
}

// Memproses Analisis Kehadiran & Menyalakan Zon Amaran Merah (< 80%)
function paparLaporan() {
    const jadual = document.getElementById("jadualLaporan");
    if (!jadual) return;

    const kelasTerpilih = document.getElementById("laporanKelas").value;
    const mingguTerpilih = document.getElementById("laporanMinggu").value;

    let pelajarKelas = db.pelajar.filter(p => p.kelas === kelasTerpilih);
    jadual.innerHTML = "";

    pelajarKelas.forEach(pelajar => {
        let totalHari = 0;
        let hariHadir = 0;

        if (mingguTerpilih === "semua") {
            // Kira keseluruhan semester
            Object.keys(pelajar.rekod).forEach(mgu => {
                pelajar.rekod[mgu].forEach(sesi => {
                    totalHari++;
                    if (sesi.status === "Hadir") hariHadir++;
                });
            });
        } else {
            // Tapis satu minggu spesifik sahaja
            if (pelajar.rekod[mingguTerpilih]) {
                pelajar.rekod[mingguTerpilih].forEach(sesi => {
                    totalHari++;
                    if (sesi.status === "Hadir") hariHadir++;
                });
            }
        }

        let peratus = totalHari === 0 ? 0 : ((hariHadir / totalHari) * 100);
        let statusKelasCSS = (peratus < 80 && totalHari > 0) ? "danger-alert" : "";
        let peratusTeksCSS = peratus < 80 ? "text-danger fw-bold" : "text-success fw-bold";

        jadual.innerHTML += `
            <tr class="${statusKelasCSS}">
                <td>${pelajar.nama}</td>
                <td>${hariHadir}</td>
                <td>${totalHari}</td>
                <td><span class="${peratusTeksCSS}">${peratus.toFixed(2)}%</span></td>
            </tr>
        `;
    });
}

function padamSemuaDataKelas() {
    if(confirm("Adakah anda pasti mahu memadam semua rekod dan data pelajar?")) {
        localStorage.removeItem("e_kehadiran_db");
        location.reload();
    }
}

// Panggilan Permulaan Aplikasi apabila Halaman Selesai Dimuat
document.addEventListener("DOMContentLoaded", () => {
    janaPilihanMinggu();
    janaPilihanKelas();
    tukarKonfigurasiSesi();
    paparLaporan();
});
