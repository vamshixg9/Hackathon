document.addEventListener("DOMContentLoaded", function () {    
    fetch('/api/user/attendance-logs', {
        method: 'GET',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
        if (!data.success) {
            console.error("Failed to load logs:", data.message);
            return;
        }

        const tbody = document.querySelector('.previous-logs table tbody');
        if (!tbody) {
            console.warn("Logs table body not found.");
            return;
        }

        tbody.innerHTML = ""; // Clear previous rows

        data.logs.forEach(log => {
            const row = document.createElement('tr');

            const date = new Date(log.date).toLocaleDateString();
            const checkin = log.checkin_time ? new Date(log.checkin_time).toLocaleTimeString() : "—";
            const checkout = log.checkout_time ? new Date(log.checkout_time).toLocaleTimeString() : "—";
            const total = log.total_hours ? `${log.total_hours} hrs` : "—";

            row.innerHTML = `
                <td>${date}</td>
                <td>${checkin}</td>
                <td>${checkout}</td>
                <td>${total}</td>
                <td></td>
            `;
            tbody.appendChild(row);
        });
        })
        .catch(err => {
        console.error("Error fetching logs:", err);
        });
     });