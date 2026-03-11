async function loadLogs() {
  const res = await fetch("/api/logs");
  const text = await res.text();
  document.getElementById("logs").textContent = text;
}

loadLogs();
setInterval(loadLogs, 5000);
