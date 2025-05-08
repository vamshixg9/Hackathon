document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/right-panel")
        .then(res => res.json())
        .then(data => {
            const panel = document.getElementById("right-panel");
            if (!panel || data.error) return;

            const user = data.user;

            // Render user profile
            panel.innerHTML = `
                <div class="nav">
                    <button id="menu-btn"><span class="material-icons-sharp">menu</span></button>
                    <div class="dark-mode">
                        <span class="material-icons-sharp active">light_mode</span>
                        <span class="material-icons-sharp">dark_mode</span>
                    </div>
                    <div class="profile">
                        <div class="info">
                            <p>Hey, <b>${user.name}</b></p>
                            <small class="text-muted">${user.employee_id}</small>
                        </div>
                        <div class="profile-photo">
                            <img src="${user.profile_pic}">
                        </div>
                    </div>
                </div>

                <div class="user-profile">
                    <div class="logo">
                        <img src="static/building.png">
                        <h2>${user.name}</h2>
                        <p>${user.department}</p>
                    </div>
                </div>

                <div class="reminders">
                    
                </div>
            `;
        });
});

document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/ticket-count")
        .then(response => response.json())
        .then(data => {
            const ticketElem = document.getElementById("ticket-count");
            if (ticketElem) {
                ticketElem.textContent = data.count;
            }
        })
        .catch(err => {
            console.error("Error fetching ticket count:", err);
        });
});
