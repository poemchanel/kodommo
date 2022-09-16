const DBState = require("../../Routes/DBState");
const Verify = require("../Contacts/Verify");
const FindProduct = require("../../Routes/Products/FindKodeBarang");

async function Link(Pesan, From, Res = []) {
  const State = await DBState();
  if (State === 1) {
    const Rank = await Verify(From);
    switch (Rank) {
      case "superadmin":
      case "admin":
      case "member": // Kontak Berpangkat member
        Res = await RankMember(
          Pesan.replace(/!link/i, "")
            .split(" ")
            .filter((e) => e !== "")
        );
        break;
      case "Kosong":
        Res.push(RankKosong());
        break;
      default: //Kontak Tidak Memiliki Pangkat
        Res.push(RankDefault(Rank));
        break;
    } // Cek Pangkat Pengirim Pesan
  } else {
    Res.push(DBDisconected());
  }
  return Res;
}
async function RankMember(KodeProduk, Res = []) {
  if (KodeProduk.length !== 0) {
    KodeProduk.forEach(async (e) => {
      if (e.includes("_") === true) {
        Res.push(await ProductNumber(e).toUpperCase().split("_"));
      } else {
        Res.push(await Product(e.toUpperCase()));
      }
    });
  } else {
    Res.push(PesanKosong());
  }
  return Res;
}
async function Product(KodeProduk, Res) {
  const Product = await FindProduct(KodeProduk);
  if (Product.length !== 0) {
    if (Product.length > 1) {
      Res = Products(Product, KodeProduk);
    } else {
      if (Product[0].shopee !== undefined) {
        Res = Shopee(KodeProduk, "", Product[0].shopee);
      } else {
        Res = ShopeeKosong(KodeProduk);
      }
    }
  } else {
    Res = ProductKosong(KodeProduk);
  }
  return Res;
}
async function ProductNumber(KodeProduk, Res) {
  const Product = await FindProduct(KodeProduk[0]);
  if (Product.length !== 0) {
    if (Product[KodeProduk[1] - 1] !== undefined) {
      if (Product[tmp1[1] - 1] !== undefined) {
        Res = Shopee(KodeProduk[0], `_${KodeProduk[1]}`, Product[tmp1[1] - 1].shopee);
      } else {
        Res = ShopeeKosong(KodeProduk);
      }
    } else {
      Res = ProductNumberKosong(KodeProduk[0], KodeProduk[1]);
    }
  } else {
    Res = ProductKosong(KodeProduk[0]);
  }
  return Res;
}
function Products(Product, KodeProduk, Res) {
  let j = 1;
  Res = `╭──「 *Perintah Berhasil* 」
│Ditemukan lebih dari 1
│produk dengan kode ${KodeProduk}
│──「 *i* 」────────
│Gunakan perintah 
│!produk ${KodeProduk}_<Noproduk>
│──「 *Contoh* 」────────
│!produk ${KodeProduk}_2
│──「 *List Nomor Produk ${tmp[i].toUpperCase()}* 」─${Product.map(
    (e) => `\n│ ${j++}: ${e.konveksi}-${e.namabarang.substring(0, 12)}..`
  )}
╰───────────────`;
  return Res;
}
function ProductNumberKosong(KodeProduk, Nomor, Res) {
  Res = `╭──「 *Perintah Gagal* 」
│Tidak dapat menemukan 
│produk ${KodeProduk} nomor ${Nomor} 
╰───────────────`;
  return Res;
}
function ProductKosong(KodeProduk, Res) {
  Res = `╭──「 *Perintah Gagal* 」
│Tidak dapat menemukan 
│produk dengan kode : ${KodeProduk}
╰───────────────`;
  return Res;
}
function Shopee(KodeProduk, Number, Shopee, Res) {
  Res = `╭──「 *Link Produk* 」
│Produk ${KodeProduk}${Number}${Shopee.forEach((e) => `\n|${e.nama}\n${e.link}`)}
╰───────────────`;
  return Res;
}
function ShopeeKosong(KodeProduk, Res) {
  Res = `╭──「 *Link Produk* 」
│Produk ${KodeProduk}
│Tidak Memiliki Link
╰───────────────`;
  return Res;
}
function PesanKosong(Res) {
  Res = `╭──「 *Perintah Gagal* 」
│Kode Produk Kosong
│──「 *i* 」────────
│Masukan Kode Produk
│setelah perintah !Link
│──「 *Contoh* 」──────── 
│!Link D1008, D1008 ...
╰───────────────`;
  return Res;
}
function RankKosong(Res) {
  Res = `╭──「 *Perintah Ditolak* 」
│Anda belum Terdaftar
│──「 *i* 」────────
│Silahkan mendaftar
│dengan !daftar
╰───────────────`;
  return Res;
}
function RankDefault(Rank, Res) {
  Res = `╭──「 *Perintah Ditolak* 」
│Perintah ini hanya 
│dapat diakses oleh :
│• *Admin*
│• *Member*
│──「 *i* 」────────
│Status anda saat ini : ${Rank}
╰───────────────`;
  return Res;
}
function DBDisconected(Res) {
  Res = `╭──「 *Maintenence* 」
│Mohon Maaf :)
│Saat ini Bot sedang
│dalam Maintenence...
╰───────────────`;
  return Res;
}
module.exports = Link;
