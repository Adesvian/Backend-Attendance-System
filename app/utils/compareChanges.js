exports.compareChanges = (existingData, reqBody) => {
  const changes = {};

  for (const key in reqBody) {
    // Periksa apakah nilai key yang sedang diperiksa berbeda
    if (reqBody[key] !== existingData[key]) {
      // Jika key termasuk dalam daftar format tanggal
      if (
        key === "birth_of_date" ||
        key === "start_time" ||
        key === "end_time" ||
        key === "date" ||
        key === "time"
      ) {
        // Konversi nilai ke format ISO
        let beforeDate = new Date(existingData[key]).toISOString();
        let afterDate = new Date(reqBody[key]).toISOString();

        // Jika key adalah "time", hanya ambil bagian waktu (HH:mm:ss.000Z)
        if (key === "time") {
          [beforeDate, afterDate] = [beforeDate, afterDate].map(
            (date) => date.split("T")[1]
          );
        }

        // Hanya masukkan perubahan jika nilai berbeda
        if (beforeDate !== afterDate) {
          changes[key] = { before: beforeDate, after: afterDate };
        }
      } else {
        // Untuk key lainnya
        changes[key] = { before: existingData[key], after: reqBody[key] };
      }
    }
  }

  return changes;
};
