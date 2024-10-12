exports.toJid = (number) => {
  let finalNumber = number;

  // Tambahkan @s.whatsapp.net jika belum ada
  if (!number.includes("@s.whatsapp.net")) {
    finalNumber += "@s.whatsapp.net";
  } else {
    return number; // Jika sudah dalam format JID, kembalikan nomor asli
  }

  // Mengonversi nomor menjadi format internasional
  if (finalNumber.startsWith("62")) {
    return finalNumber; // Sudah dalam format internasional
  } else if (finalNumber.startsWith("+62")) {
    return finalNumber.substring(1); // Hapus '+' dari format internasional
  } else if (finalNumber.startsWith("08")) {
    return "62" + finalNumber.substring(1); // Mengonversi dari 08 ke 62
  } else if (finalNumber.startsWith("8")) {
    return "62" + finalNumber; // Mengonversi dari 8 ke 62
  }

  return finalNumber; // Jika tidak ada perubahan, kembalikan nomor
};
