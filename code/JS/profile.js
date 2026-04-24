document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName'); // Defined as 'name'
    const lastName = localStorage.getItem('userLastName');
    const email = localStorage.getItem('userEmail');
    const username = localStorage.getItem('userUsername');

    const fullNameElement = document.getElementById('fullName');
    const usernameElement = document.getElementById('displayUsername');
    const emailElement = document.getElementById('displayEmail');

    
    if (fullNameElement) {
        fullNameElement.textContent = (name && lastName) ? `${name} ${lastName}` : "User Profile";
    }
    if (usernameElement) {
        usernameElement.textContent = username || "username";
    }
    if (emailElement) {
        emailElement.textContent = email || "email@example.com";
    }

    // role pages.
    const adminView = document.getElementById('adminView'); 
    const studentView = document.getElementById('studentView');

    if (role === 'admin' || role === 'administrator') {
        if (adminView) adminView.style.display = 'block';
        if (studentView) studentView.style.display = 'none';
    } else {
        if (adminView) adminView.style.display = 'none';
        if (studentView) studentView.style.display = 'block';
    }

    //Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const formData = new FormData();
            formData.append('action', 'logout');
            fetch('../PHP/controller.php', { method: 'POST', body: formData })
                .then(response => response.json())
                .then(() => {
                    localStorage.clear();
                    window.location.href = 'mainPage.html';
                })
                .catch(() => {
                    localStorage.clear();
                    window.location.href = 'mainPage.html';
                });
        });
    }

    // load events for admin.
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-admin');

        if (target && target.classList.contains('add')) {
            console.log("Redirecting to addEvent.html...");
            window.location.href = 'addEvent.html';
        }

        if (target && target.classList.contains('edit')) { 
            window.location.href = 'manageEvents.html'; // redirect to the manage page.
        }
    });
    
    //Load events
    if (typeof loadEvents === "function") {
        loadEvents();
    }
});

function loadEvents() {
    // we implement this later.
}
