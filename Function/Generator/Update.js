const { setTimeout } = require("timers/promises");
const CekStatusDB = require("../Routes/CekStatusDB");
const VerifikasiKontak = require("../VerifikasiKontak");
const TarikProduk = require("../Routes/TarikProduk");
const TarikProduksKonveksi = require("../Routes/TarikProduksKonveksi");
const HargaProduk = require("../Update/HargaProduk");
const { HargaKonveksiMulai, HargaKonveksiOff, HargaKonveksiOn, HargaKonveksiCek } = require("../Update/HargaKonveksi");
const { AutoOff, AutoOn, AutoCek } = require("../Update/HargaProduks");

async function Update(pesan, kontak, res = []) {
  const StatusDB = await CekStatusDB();
  if (StatusDB.state === 1) {
    const pengguna = await VerifikasiKontak(kontak);
    switch (pengguna.pangkat) {
      case "superadmin":
      case "admin":
        let status = "";
        let tmp = pesan.body
          .replace(/!update/i, "")
          .replace(/!scrap/i, "")
          .replace(/ /g, "");
        if (tmp !== "") {
          switch (tmp.toUpperCase()) {
            case "CEK":
              status = await HargaKonveksiCek();
              res.push({
                caption: `╭──「 *Perintah Berhasil* 」
│Status Update Konveksi : ${status.status}
│Berhasil mengupdate ${status.diupdate}/${status.totalproduk}
│Gagal mengupdate ${status.gagal.length} produk
│Antrian update saat ini ${status.antrian}/${status.totalproduk}
╰───────────────`,
              });
              break;
            case "LOG":
              status = await HargaKonveksiCek();
              res.push({
                caption: `╭──「 *Perintah Berhasil* 」
│Log Update Konveksi :
${status.log.join(`\n\r`)}
╰───────────────`,
              });
              break;
            case "GAGAL":
              status = await HargaKonveksiCek();
              res.push({
                caption: `╭──「 *Perintah Berhasil* 」
│Log produk yang gagal diupdate :${status.gagal.join(`\n│\r`)}
╰───────────────`,
              });
              break;
            case "ON":
              status = await HargaKonveksiOff();
              status = await AutoOff();
              await setTimeout(5000);
              status = await HargaKonveksiOn();
              res.push({
                caption: `╭──「 *Perintah Berhasil* 」
│${status.status}
│Berhasil mengupdate ${status.diupdate}/${status.totalproduk}
│Gagal mengupdate ${status.gagal.length} produk
│Antrian update saat ini ${status.antrian}/${status.totalproduk}
╰───────────────`,
              });
              break;
            case "OFF":
              status = await HargaKonveksiOff();
              res.push({
                caption: `╭──「 *Perintah Berhasil* 」
│${status.status}
│Berhasil mengupdate ${status.diupdate}/${status.totalproduk}
│Gagal mengupdate ${status.gagal.length} produk
│Antrian update saat ini ${status.antrian}/${status.totalproduk}
╰───────────────`,
              });
              break;
            default:
              if (tmp.includes("_") === true) {
                let tmp1 = tmp.split("_");
                let produk = await TarikProduk(tmp1[0].toUpperCase());
                if (produk.length !== 0) {
                  if (produk[tmp1[1] - 1] !== undefined) {
                    let on;
                    let cek = await HargaKonveksiCek();
                    if (cek.state === true) {
                      cek = await HargaKonveksiOff();
                      on = "konveksi";
                    }
                    cek = await AutoCek();
                    if (cek.state === true) {
                      cek = await AutoOff();
                      on = "auto";
                    }
                    await setTimeout(5000);
                    let update = await HargaProduk(produk[tmp1[1] - 1]);
                    res.push({
                      caption: `╭──「 *Perintah Berhasil* 」
│Berhasil Mengupdate Produk ${tmp}
│Log:
${update.log.join(`\n\r`)}
╰───────────────`,
                    });
                    if (on === "konveksi") {
                      cek = await HargaKonveksiOn();
                    } else if (on === "auto") {
                      cek = await AutoOn();
                    }
                  } else {
                    res.push({
                      caption: `╭──「 *Perintah Gagal* 」
│Tidak dapat menemukan produk
│nomor ${tmp1[1]} di kode : ${tmp1[0]}
╰───────────────`,
                    });
                  }
                } else {
                  res.push({
                    caption: `╭──「 *Perintah Gagal* 」
│Tidak dapat menemukan produk
│nomor ${tmp1[1]} di kode : ${tmp1[0]}
╰───────────────`,
                  });
                }
              } else {
                let produk = await TarikProduk(tmp.toUpperCase());
                if (produk.length !== 0) {
                  if (produk.length > 1) {
                    let j = 1;
                    res.push({
                      caption: `╭──「 *Perintah Berhasil* 」
│Ditemukan lebih dari 1 produk
│dengan kode ${tmp.toUpperCase()}
│gunakan perintah 
│!update ${tmp.toUpperCase()}_<Noproduk>
│untuk melihat detail produk
│contoh  : !produk ${tmp.toUpperCase()}_2
│──「 *List Nomor Produk ${tmp.toUpperCase()}* 」─${produk.map(
                        (e) => `\n│ ${j++}: ${e.konveksi}-${e.namabarang.substring(0, 12)}...`
                      )}
╰───────────────`,
                    });
                  } else {
                    let on;
                    let cek = await HargaKonveksiCek();
                    if (cek.state === true) {
                      cek = await HargaKonveksiOff();
                      on = "konveksi";
                    }
                    cek = await AutoCek();
                    if (cek.state === true) {
                      cek = await AutoOff();
                      on = "auto";
                    }
                    await setTimeout(5000);
                    let update = await HargaProduk(produk[0]);
                    res.push({
                      caption: `╭──「 *Perintah Berhasil* 」
│Berhasil Mengupdate Produk ${tmp}
│Log:
${update.log.join(`\n\r`)}
╰───────────────`,
                    });
                    if (on === "konveksi") {
                      cek = await HargaKonveksiOn();
                    } else if (on === "auto") {
                      cek = await AutoOn();
                    }
                  }
                } else {
                  let konveksi = await TarikProduksKonveksi(tmp.toUpperCase());
                  if (konveksi.length !== 0) {
                    status = await AutoOff();
                    status = await HargaKonveksiOff();
                    await setTimeout(5000);
                    const update = await HargaKonveksiMulai(konveksi, 0);
                    res.push({
                      caption: `╭──「 *Perintah Berhasil* 」
│${update.status} ${tmp.toUpperCase()}
│Total Porduk ${update.totalproduk}
╰───────────────`,
                    });
                  } else {
                    res.push({
                      caption: `╭──「 *Perintah Gagal* 」
│Tidak dapat menemukan produk
│atau konveksi dengan
│kode : ${tmp}
╰───────────────`,
                    });
                  }
                }
              }

              break;
          }
        } else {
          res.push({
            caption: `╭──「 *Perintah Gagal* 」
│Harap masukan kode produk
│atau konveksi setelah 
│perintah !Update
│Contoh: 
│!Update D1008
╰───────────────`,
          });
        }
        break;
      case "Kosong":
        res.push({
          caption: `╭──「 *Perintah Ditolak* 」
│Anda belum Terdaftar, Silahkan
│mendaftar dengan !daftar
╰───────────────`,
        });
        break;
      case "member": // Kontak Berpangkat member
      case "baru":
      default:
        res.push({
          caption: `╭──「 *Perintah Ditolak* 」
│Perintah ini hanya dapat 
│diakses oleh :
│• *Admin*
│───────────────
│Status anda saat ini : ${pengguna.pangkat}
╰───────────────`,
        });
        break;
    } // Cek Pangkat Pengirim Pesan
  } else {
    res.push({
      caption: `╭──「 *Maintenence* 」
│Mohon Maaf @${kontak.number}, :)
│Saat ini Bot sedang dalam
│Maintenence...
╰───────────────`,
    });
  }
  return res;
}

module.exports = Update;
