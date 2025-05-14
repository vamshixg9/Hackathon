document.addEventListener("DOMContentLoaded", () => {
    const ticketForm = document.getElementById("ticketForm");
    const ticketList = document.getElementById("ticketList");
  
    if (window.ticketFormHandlerAttached) return;
    window.ticketFormHandlerAttached = true;
    // Fetch and display existing tickets on page load
    fetch("/api/tickets", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        displayTickets(data);
      })
      .catch((err) => {
        console.error("Error fetching tickets:", err);
      });
  
    // Handle form submission
    ticketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Form submitted");  // Debug: Check for double event
  
      const formData = new FormData(ticketForm);
      const ticketData = {
        title: formData.get("type"),  // 'type' used as title
        description: formData.get("description"),
      };
  
      fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
        credentials: "include"
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            addTicketToList(data.ticket);
            ticketForm.reset();
          } else {
            alert("Error submitting ticket.");
          }
        })
        .catch((err) => {
          console.error("Error submitting ticket:", err);
        });
    });
  
    function displayTickets(tickets) {
      ticketList.innerHTML = "";
      tickets.forEach(addTicketToList);
    }
  
    function addTicketToList(ticket) {
        const div = document.createElement("div");
        div.className = "ticket-entry p-4 border rounded bg-gray-50 shadow-sm flex justify-between items-start gap-4";
      
        const content = document.createElement("div");
        content.innerHTML = `
          <p><strong>Type:</strong> ${ticket.title}</p>
          <p><strong>Description:</strong> ${ticket.description}</p>
          <p><strong>Status:</strong> <span class="ticket-status ${ticket.status?.toLowerCase() || 'pending'}">${ticket.status || 'Pending'}</span></p>
          <p class="text-sm text-gray-500">Submitted at: ${new Date(ticket.created_at).toLocaleString()}</p>
        `;
      
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "❌";
        deleteBtn.className = "text-red-500 hover:text-red-700 text-xl font-bold";
        deleteBtn.title = "Delete ticket";
      
        deleteBtn.addEventListener("click", () => {
          fetch(`/api/tickets/${ticket.id}`, {
            method: "DELETE",
            credentials: "include"
          })
          .then(res => {
            if (res.ok) {
              div.remove();
            } else {
              alert("Failed to delete ticket.");
            }
          })
          .catch(err => {
            console.error("Error deleting ticket:", err);
          });
        });
      
        div.appendChild(content);
        div.appendChild(deleteBtn);
        ticketList.prepend(div);
      }
      
  });
  