document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('../PHP/session.php');
        const data = await response.json();

        if (!data.loggedIn) {
            window.location.href = './loginPage.html';
            return;
        }

        document.getElementById('fullName').textContent        = data.name || `${data.firstName} ${data.lastName}`;
        document.getElementById('displayUsername').textContent = data.username || '';
        document.getElementById('displayEmail').textContent    = data.email;

    } catch (err) {
        window.location.href = './loginPage.html';
    }

    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = `
        <div class="no-events">
            <p>You are not yet registered for any event.</p>
            <p style="font-size: 0.9rem; color: #666;">Discover the program and join the events!</p>
        </div>
    `;
});

document.getElementById('logoutBtn').addEventListener('click', async function() {
    const conferma = confirm("Are you sure you want to log out??");
    
    if (conferma) {
        try {
            // Call the PHP file to destroy the session on the server
            const response = await fetch('../PHP/logout.php');
            const data = await response.json();

            if (data.success) {
                // We also clean the data in the browser
                localStorage.removeItem('isLoggedIn');
                
                // We redirect to the home page
                window.location.href = './mainPage.html'; 
            }
        } catch (err) {
            console.error("Error during logging out:", err);
            window.location.href = './mainPage.html';
        }
    }
});
