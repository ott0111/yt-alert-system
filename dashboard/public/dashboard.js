async function loadChannels() {
  const res = await fetch("/api/channels");
  const channels = await res.json();

  const list = document.getElementById("channel-list");
  list.innerHTML = "";

  channels.forEach(ch => {
    const card = document.createElement("div");
    card.className =
      "bg-[#15121c] p-4 rounded-lg border border-[#2a2433] flex justify-between items-center";

    card.innerHTML = `
      <div>
        <p class="font-semibold text-violet-300">${ch.youtube_channel_name}</p>
        <p class="text-sm text-[#a89bb8]">${ch.youtube_channel_id}</p>
      </div>
      <button data-id="${ch.id}"
        class="delete-btn px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white">
        Delete
      </button>
    `;

    list.appendChild(card);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await fetch(`/api/channels/${id}`, { method: "DELETE" });
      loadChannels();
    });
  });
}

async function addChannel() {
  const name = document.getElementById("channel-name").value.trim();
  if (!name) return alert("Enter a channel name");

  const res = await fetch("/api/channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      youtube_channel_name: name,
      youtube_channel_id: name // temporary — watcher resolves real ID
    })
  });

  if (res.ok) {
    document.getElementById("channel-name").value = "";
    loadChannels();
  }
}

async function loadLogs() {
  const res = await fetch("/api/logs");
  const text = await res.text();
  document.getElementById("logs").textContent = text;
}

document.getElementById("add-channel-btn").addEventListener("click", addChannel);

loadChannels();
loadLogs();
setInterval(loadLogs, 5000);
