document.addEventListener("DOMContentLoaded", () => {
    const shortenBtn = document.getElementById("shorten-btn");
    const longUrlInput = document.getElementById("long-url");
    const shortenedUrlOutput = document.getElementById("shortened-url");

    shortenBtn.addEventListener("click", async () => {
        const longUrl = longUrlInput.value.trim();

        if (!longUrl) {
            shortenedUrlOutput.innerHTML = "⚠️ Please enter a valid URL!";
            shortenedUrlOutput.style.color = "red";
            return;
        }

        try {
            const response = await fetch("https://bitter-mountain-1c37.kyleoberholzer.workers.dev/shorten", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ longUrl })
            });

            const data = await response.json();
            
            if (response.ok) {
                shortenedUrlOutput.innerHTML = `✅ Shortened URL: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
                shortenedUrlOutput.style.color = "#28a745";
            } else {
                shortenedUrlOutput.innerHTML = `⚠️ Error: ${data.message || "Something went wrong"}`;
                shortenedUrlOutput.style.color = "red";
            }
        } catch (error) {
            shortenedUrlOutput.innerHTML = "❌ Failed to connect to the server.";
            shortenedUrlOutput.style.color = "red";
        }
    });
});