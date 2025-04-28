const tickets = []; // Store ticket data

// Handle form submission
document.getElementById('ticket-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page reload

    const type = document.getElementById('request-type').value;
    const date = document.getElementById('request-date').value;
    const reason = document.getElementById('request-reason').value;

    if (!type || !date || !reason) {
        alert('Please fill all fields!');
        return;
    }

    const newTicket = {
        Type: type,
        Date: date,
        Reason: reason,
        Status: 'Pending'
    };

    tickets.push(newTicket);
    renderTickets(); // Refresh the table
    this.reset(); // Clear the form
});

// Render tickets into the table
function renderTickets() {
    const tbody = document.getElementById('tickets-table').querySelector('tbody');
    tbody.innerHTML = '';

    tickets.forEach(ticket => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ticket.Type}</td>
            <td>${ticket.Date}</td>
            <td>${ticket.Reason}</td>
            <td class="${getStatusClass(ticket.Status)}">${ticket.Status}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Helper: Return class based on status
function getStatusClass(status) {
    switch (status) {
        case 'Pending': return 'warning';
        case 'Approved': return 'success';
        case 'Rejected': return 'danger';
        default: return '';
    }
}

// (Optional) Load existing tickets from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTickets = JSON.parse(localStorage.getItem('tickets')) || [];
    tickets.push(...savedTickets);
    renderTickets();
});

// (Optional) Save tickets to localStorage whenever you add a ticket
function saveTickets() {
    localStorage.setItem('tickets', JSON.stringify(tickets));
}
