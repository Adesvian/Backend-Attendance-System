exports.zoneTime = (zoneTime) => {
  let zt = zoneTime;
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
    timeZone: "Asia/Jakarta", // Specify the timezone to Jakarta, Indonesia
    weekday: "long",
  };

  zt = zoneTime.toLocaleString("id-ID", options).replace(/\./g, ":");

  return zt;
};

exports.localISO = (unixTimestamp) => {
  const dateInMilliseconds = unixTimestamp * 1000;
  const currentTime = new Date(dateInMilliseconds);
  const timezoneOffset = currentTime.getTimezoneOffset() * 60000;
  return new Date(currentTime.getTime() - timezoneOffset);
};
