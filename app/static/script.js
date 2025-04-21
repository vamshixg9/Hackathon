// Initialize variables
let clockInTime = null;
let clockOutTime = null;
let clockInButton = document.getElementById('clockIn');
let clockOutButton = document.getElementById('clockOut');
let todayDetails = document.getElementById('todayDetails');
let logList = document.getElementById('logList');

// Retrieve logs from localStorage or initialize an empty array
let logs = JSON.parse(localStorage.getItem('logs')) || [];

// Update the clock every second
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);  // Update clock every second

// Clock In function
function clockIn() {
    if (!clockInTime) {
        clockInTime = new Date();
        clockInButton.disabled = true;  // Disable clockIn button after clocking in
        clockInButton.classList.add('disabled');  // Add a disabled class for animation
        clockOutButton.disabled = false;  // Enable clockOut button after clocking in
        clockOutButton.classList.remove('disabled');  // Remove disabled class for clockOut button
        todayDetails.innerHTML = `<p>You have clocked in at: ${clockInTime.toLocaleTimeString()}</p>`;
        alert('Clocked In!');
    }
}

// Clock Out function
function clockOut() {
    if (clockInTime && !clockOutTime) {
        clockOutTime = new Date();
        logs.push({
            date: new Date().toLocaleDateString(),
            clockIn: clockInTime.toLocaleTimeString(),
            clockOut: clockOutTime.toLocaleTimeString()
        });
        localStorage.setItem('logs', JSON.stringify(logs));  // Store logs in localStorage

        todayDetails.innerHTML += `<p>You have clocked out at: ${clockOutTime.toLocaleTimeString()}</p>`;

        // Reset the buttons for the next day with smooth animation
        clockInButton.disabled = false;
        clockInButton.classList.remove('disabled');  // Remove the disabled class after clocking out
        clockOutButton.disabled = true;  // Disable clockOut button again
        clockOutButton.classList.add('disabled');  // Add the disabled class for animation
        clockInTime = null;
        clockOutTime = null;
        alert('Clocked Out!');
        renderLogs();  // Re-render the logs after clocking out
    }
}

// Render logs function
function renderLogs() {
    logList.innerHTML = '';
    logs.forEach(log => {
        const li = document.createElement('li');
        li.classList.add('log-item');
        li.innerHTML = `<p><strong>${log.date}</strong>: Clocked In at ${log.clockIn}, Clocked Out at ${log.clockOut}</p>`;
        logList.appendChild(li);
    });
}

// Toggle visibility of previous logs
function togglePreviousLogs() {
    const logsSection = document.getElementById('logList');
    if (logsSection.style.display === 'none' || logsSection.style.display === '') {
        logsSection.style.display = 'block';
        renderLogs();  // Render logs when displaying them
    } else {
        logsSection.style.display = 'none';
    }
}

// Initial render of logs when the page loads
renderLogs();
