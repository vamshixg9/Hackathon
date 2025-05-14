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
            const menuBtn = document.getElementById("menu-btn");
            const closeBtn = document.getElementById("close-btn");
            const sidebar = document.querySelector("aside");

            const darkMode = document.querySelector('.dark-mode');

            if (menuBtn && sidebar) {
                menuBtn.addEventListener("click", () => {
                    sidebar.style.display = "block";
                });
            }
            if (closeBtn && sidebar) {
                closeBtn.addEventListener("click", () => {
                    sidebar.style.display = "none";
                });
            }

            
darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
    darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
})

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
