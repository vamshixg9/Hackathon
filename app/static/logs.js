const logs = [];

function pad(num) {
    return num.toString().padStart(2, '0');
}

const locations = ['Office', 'Remote', 'Client Site']; // Random sample locations

for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const formattedDate = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
    const clockIn = `08:${pad(Math.floor(Math.random() * 30))}`;
    const clockOut = `17:${pad(30 + Math.floor(Math.random() * 30))}`;
    const totalHours = Math.random() > 0.2 ? '08:00' : 'Active';
    const location = locations[Math.floor(Math.random() * locations.length)];

    logs.push({
        Date: formattedDate,
        ClockIn: clockIn,
        ClockOut: clockOut,
        Location: location,
        TotalHrs: totalHours
    });
}


const loadingIndicator = document.getElementById('loading'); // Assuming there's a loading spinner in your HTML
loadingIndicator.style.display = 'block';

fetch('/api/attendance')
    .then(response => response.json())
    .then(data => {
        loadingIndicator.style.display = 'none'; // Hide loading spinner after data is fetched
        renderAttendanceData(data.attendance); // Call your render function
    })
    .catch(error => {
        loadingIndicator.style.display = 'none'; // Hide spinner on error
        console.error('Error fetching attendance data:', error);
    });

