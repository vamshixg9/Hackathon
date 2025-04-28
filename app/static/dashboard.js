const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');

const darkMode = document.querySelector('.dark-mode');




// Toggle sidebar menu
// Combine both event listeners into one block
menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
    darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
});

// Log population for the table
logs.forEach(order => {
    const tr = document.createElement('tr');
    const trContent = `
        <td>${order.Date}</td>
        <td>${order.ClockIn}</td>
        <td>${order.ClockOut}</td>
        <td>${order.Location}</td>
        <td class="${order.TotalHrs === '08:00' ? 'success' : order.TotalHrs === 'Active' ? 'warning' : 'primary'}">${order.TotalHrs}</td>
    `;
    tr.innerHTML = trContent;
    document.querySelector('table tbody').appendChild(tr);
});

fetch('/api/attendance')
  .then(response => response.json())
  .then(data => {
    const logs = data.attendance;
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    logs.forEach(order => {
      const tr = document.createElement('tr');
      const statusClass = order.TotalHrs === '08:00' ? 'success' :
                          order.TotalHrs === 'Active' ? 'warning' : 'primary';

      tr.innerHTML = `
        <td>${order.Date}</td>
        <td>${order.ClockIn}</td>
        <td>${order.ClockOut}</td>
        <td>${order.Location}</td>
        <td class="${statusClass}">${order.TotalHrs}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(error => console.error("Error loading attendance:", error));


function downloadTimesheet(format) {
    if (format === 'excel') {
      window.location.href = '/download/excel';
    } else if (format === 'pdf') {
      alert('PDF download not yet implemented!');
    }
  }

function downloadTimesheet(format) {
    if (format === 'excel') {
        window.location.href = '/download/excel';
    } else if (format === 'pdf') {
        window.location.href = '/download/pdf';
    }
}

