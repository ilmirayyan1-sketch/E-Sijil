let senaraiLogoBase64 = []; // Menyimpan semua gambar logo yang dimuat naik dalam format Base64

// Menguruskan interaksi dropdown Jenis Sijil (Kustom vs Pilihan Sedia Ada)
function kemaskiniPilihanJenis() {
    const selectElem = document.getElementById("inputJenis");
    const inputJenisKustom = document.getElementById("inputJenisKustom");
    
    if (selectElem.value === "KUSTOM") {
        inputJenisKustom.classList.remove("d-none");
    } else {
        inputJenisKustom.classList.add("d-none");
    }
    kemaskiniPratinjau();
}

// Menukar tema warna tepi/bingkai sijil secara langsung
function tukarTemaSijil() {
    const activeTheme = document.getElementById("selectTheme").value;
    const previewContainer = document.getElementById("sijilPreview");
    
    // Buang kelas tema lama, masukkan kelas tema baharu
    previewContainer.className = `sijil-container ${activeTheme}`;
}

// Memproses pemuatan lencana/logo daripada komputer pengguna
function prosesMuatNaikLogo() {
    const files = document.getElementById("inputLogos").files;
    const dragLogoArea = document.getElementById("dragLogoArea");
    
    if (files.length === 0) return;
    
    dragLogoArea.innerHTML = ""; // Bersihkan ikon piala laluan
    senaraiLogoBase64 = []; // Reset database logo sementara
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result;
            senaraiLogoBase64.push(base64Data);
            
            // Tambahkan gambar ke dalam kawasan logo di kanvas pratinjau
            const imgHtml = `<img src="${base64Data}" class="logo-img" alt="Logo">`;
            dragLogoArea.innerHTML += imgHtml;
        }
        reader.readAsDataURL(file);
    });
}

// Fungsi mengemas kini teks secara langsung (Live Type-in Preview)
function kemaskiniPratinjau() {
    const selectJenis = document.getElementById("inputJenis").value;
    const inputJenisKustom = document.getElementById("inputJenisKustom").value.trim();
    
    let jenisSijilAkhir = selectJenis;
    if (selectJenis === "KUSTOM") {
        jenisSijilAkhir = inputJenisKustom ? inputJenisKustom : "Sijil Kustom Anda";
    }

    const acara = document.getElementById("inputAcara").value;
    const guru = document.getElementById("inputGuru").value;
    const jawatan = document.getElementById("inputJawatan").value;

    document.getElementById("previewJenis").innerText = jenisSijilAkhir;
    document.getElementById("previewAcara").innerText = acara;
    document.getElementById("previewGuru").innerText = guru;
    document.getElementById("previewJawatan").innerText = jawatan;
}

// ----------------------------------------------------
// SISTEM ENGINE UNTUK MENGALIKAN (DRAG & DROP) ELEMEN
// ----------------------------------------------------
function aktifkanSistemDrag() {
    const elements = document.querySelectorAll('.draggable-text');
    let activeElement = null;
    let offsetLeft = 0;
    let offsetTop = 0;

    elements.forEach(element => {
        element.addEventListener('mousedown', (e) => {
            // Hanya benarkan seretan menggunakan klik kiri tetikus
            if (e.button !== 0) return;
            
            activeElement = element;
            
            // Dapatkan kedudukan tetikus berbanding titik kiri-atas elemen terpilih
            const rect = element.getBoundingClientRect();
            offsetLeft = e.clientX - rect.left;
            offsetTop = e.clientY - rect.top;
            
            element.style.borderColor = "#c5a880";
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeElement) return;

        const container = document.getElementById("sijilPreview");
        const containerRect = container.getBoundingClientRect();

        // Hitung posisi baharu di dalam bingkai kontena sijil
        let newX = e.clientX - containerRect.left - offsetLeft;
        let newY = e.clientY - containerRect.top - offsetTop;

        // Hadkan pergerakan supaya tidak terkeluar dari sempadan sijil (Boundary check)
        const elementRect = activeElement.getBoundingClientRect();
        const maxX = containerRect.width - elementRect.width;
        const maxY = containerRect.height - elementRect.height;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // Nyatakan koordinat kedudukan baharu dalam bentuk peratusan atau piksel
        activeElement.style.left = `${newX}px`;
        activeElement.style.top = `${newY}px`;
        activeElement.style.transform = "none"; // Buang transform translate selepas elemen digerakkan pertama kali
    });

    document.addEventListener('mouseup', () => {
        if (activeElement) {
            activeElement.style.borderColor = "transparent";
            activeElement = null;
        }
    });
}

// ----------------------------------------------------
// UTiliti untuk Mengumpul data gaya kedudukan (Posisi CSS)
// ----------------------------------------------------
function dapatkanGayaPosisi(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return "";
    
    const left = element.style.left;
    const top = element.style.top;
    const transform = element.style.transform;
    
    let styleString = "";
    if (left) styleString += `left: ${left}; `;
    if (top) styleString += `top: ${top}; `;
    if (transform) styleString += `transform: ${transform}; `;
    
    return styleString;
}

// ----------------------------------------------------
// PENJANAAN PDF SECARA PUKAL
// ----------------------------------------------------
function janaSijilPukal() {
    const senaraiNamaText = document.getElementById("inputNamaMurid").value.trim();
    
    if (!senaraiNamaText) {
        alert("Sila masukkan senarai nama penerima terlebih dahulu!");
        return;
    }

    const senaraiNama = senaraiNamaText.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    
    const selectJenis = document.getElementById("inputJenis").value;
    const inputJenisKustom = document.getElementById("inputJenisKustom").value.trim();
    let jenisSijilAkhir = selectJenis;
    if (selectJenis === "KUSTOM") {
        jenisSijilAkhir = inputJenisKustom ? inputJenisKustom : "Sijil";
    }

    const acara = document.getElementById("inputAcara").value;
    const guru = document.getElementById("inputGuru").value;
    const jawatan = document.getElementById("inputJawatan").value;
    const activeTheme = document.getElementById("selectTheme").value;

    // Dapatkan koordinat kedudukan semasa setiap elemen dari kanvas
    const styleLogo = dapatkanGayaPosisi("dragLogoArea");
    const styleJenis = dapatkanGayaPosisi("dragJenis");
    const styleSub = dapatkanGayaPosisi("dragSub");
    const styleNama = dapatkanGayaPosisi("dragNama");
    const styleUlasan = dapatkanGayaPosisi("dragUlasan");
    const styleTandatangan = dapatkanGayaPosisi("dragTandatangan");

    // Bina senarai tag img untuk logo-logo yang telah dimuat naik
    let logoHtmlString = "<span>🏆</span>";
    if (senaraiLogoBase64.length > 0) {
        logoHtmlString = senaraiLogoBase64.map(logoSrc => `<img src="${logoSrc}" style="height: 55px; object-fit: contain; margin: 0 7px;" />`).join("");
    }

    const tempContainer = document.getElementById("temp-output-container");
    tempContainer.innerHTML = ""; 

    senaraiNama.forEach((nama, index) => {
        const uniquePageId = `sijil-page-${index}`;
        
        const templateHtml = `
            <div class="sijil-container ${activeTheme}" id="${uniquePageId}" style="page-break-after: always; width: 800px; height: 565px; padding: 35px; background: #ffffff; position: relative; box-sizing: border-box; user-select: none;">
                <div class="sijil-inner" style="height: 100%; width: 100%; padding: 20px; position: relative; box-sizing: border-box;">
                    
                    <!-- Logos -->
                    <div style="position: absolute; display: flex; justify-content: center; align-items: center; ${styleLogo ? styleLogo : 'top: 25px; left: 50%; transform: translateX(-50%);'}">
                        ${logoHtmlString}
                    </div>

                    <!-- Tajuk Jenis -->
                    <div style="position: absolute; text-align: center; ${styleJenis ? styleJenis : 'top: 110px; left: 50%; transform: translateX(-50%); width: 80%;'}">
                        <div class="sijil-tajuk" style="font-family: 'Cinzel', serif, Georgia; font-size: 30px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">${jenisSijilAkhir}</div>
                    </div>

                    <!-- Subtitle -->
                    <div style="position: absolute; text-align: center; ${styleSub ? styleSub : 'top: 165px; left: 50%; transform: translateX(-50%); width: 80%;'}">
                        <div style="font-family: 'Montserrat', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #c5a880; font-weight: 700;">Dengan ini dianugerahkan kepada</div>
                    </div>

                    <!-- Penerima -->
                    <div style="position: absolute; text-align: center; ${styleNama ? styleNama : 'top: 200px; left: 50%; transform: translateX(-50%); width: 90%;'}">
                        <div style="font-family: 'Playfair Display', serif, 'Times New Roman'; font-size: 26px; color: #1e293b; border-bottom: 2px solid #c5a880; display: inline-block; padding-bottom: 3px; font-weight: 700; font-style: italic;">${nama}</div>
                    </div>

                    <!-- Ulasan -->
                    <div style="position: absolute; text-align: center; ${styleUlasan ? styleUlasan : 'top: 275px; left: 50%; transform: translateX(-50%); width: 80%;'}">
                        <div style="font-family: 'Montserrat', sans-serif; font-size: 13px; line-height: 1.6; color: #475569;">
                            di atas sumbangan, komitmen dan kecemerlangan yang telah ditunjukkan sepanjang menyertai <strong>${acara}</strong>. Terima kasih atas usaha murni yang diberikan.
                        </div>
                    </div>

                    <!-- Tandatangan -->
                    <div style="position: absolute; text-align: center; ${styleTandatangan ? styleTandatangan : 'bottom: 40px; left: 50%; transform: translateX(-50%); width: 60%;'}">
                        <div style="font-family: 'Montserrat', sans-serif; font-weight: 700; border-top: 1.5px solid #94a3b8; display: inline-block; padding-top: 5px; width: 220px; font-size: 13px; color: #1e293b; text-transform: uppercase; text-align: center;">${guru}</div>
                        <div style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; text-align: center;">${jawatan}</div>
                    </div>

                </div>
            </div>
        `;
        tempContainer.innerHTML += templateHtml;
    });

    const opt = {
        margin:       0,
        filename:     `Sijil_Kreatif_${jenisSijilAkhir.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'px', format: [800, 565], orientation: 'landscape' }
    };

    alert(`Memproses dan menjana ${senaraiNama.length} keping PDF... Sila tunggu sebentar.`);

    html2pdf().set(opt).from(tempContainer).save().then(() => {
        tempContainer.innerHTML = ""; // Bersihkan selepas muat turun
    });
}

// Panggil sistem sebaik aplikasi siap dimuatkan
document.addEventListener("DOMContentLoaded", () => {
    kemaskiniPratinjau();
    aktifkanSistemDrag();
});
