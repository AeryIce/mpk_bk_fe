export const kpis = [
{ label: "Total Sponsor", value: 42, sub: "+6 baru minggu ini" },
{ label: "Upload Menunggu Kurasi", value: 18, sub: "butuh tindakan" },
{ label: "Approved", value: 24, sub: "+3 hari ini" },
{ label: "Paket Dikirim", value: 12, sub: "3 dalam perjalanan" },
];


export const uploads = [
{ id: "UPL-0001", instansi: "SMA St. Ignatius", pic: "Andreas", status: "Uploaded", file: "banner_ignatius.pdf", size: "2.1 MB", date: "2025-09-28" },
{ id: "UPL-0002", instansi: "TK Bunda Maria", pic: "Citra", status: "Kurasi", file: "tk_bm.png", size: "1.2 MB", date: "2025-09-27" },
{ id: "UPL-0003", instansi: "Yayasan Adi Putra", pic: "Dina", status: "Revisi", file: "layout_yap.pdf", size: "3.0 MB", date: "2025-09-27" },
{ id: "UPL-0004", instansi: "SMP Kanisius", pic: "Fiona", status: "Approved", file: "kanisius.jpg", size: "1.6 MB", date: "2025-09-26" },
];


export const packages = [
{ id: "PKG-00A1", tujuan: "SMA St. Ignatius", alamat: "Jl. Merdeka 12, Jakarta", pic: "Andreas", wa: "+62 812-3456-7890", status: "Ready" },
{ id: "PKG-00A2", tujuan: "TK Bunda Maria", alamat: "Jl. Mawar 3, Bekasi", pic: "Citra", wa: "+62 811-8888-777", status: "Dispatched" },
{ id: "PKG-00A3", tujuan: "SMP Kanisius", alamat: "Jl. Sudirman 5, Depok", pic: "Fiona", wa: "+62 813-0000-9999", status: "Received" },
];


export const shipments = [
{ resi: "JNE-123-XYZ", paket: "PKG-00A2", kurir: "JNE", status: "Dalam Perjalanan", update: "2025-09-28 14:10" },
{ resi: "SICEPAT-88-PP", paket: "PKG-00A3", kurir: "SiCepat", status: "Diterima", update: "2025-09-27 18:42" },
];