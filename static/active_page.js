const currentPath = window.location.pathname.split("/").pop(); // get current file
const sidebarLinks = document.querySelectorAll(".sidebar a");

sidebarLinks.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
    } else {
        link.classList.remove("active");
    }
});

