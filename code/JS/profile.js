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

        // ROLE MANAGEMENT
        const studentView = document.getElementById('studentView');
        const adminView = document.getElementById('adminView');

        if (data.role === 'admin') { 
            studentView.style.display = 'none';
            adminView.style.display = 'block';

            const addEventBtn = document.querySelector('.btn-admin.add');
            if (addEventBtn) {
                addEventBtn.addEventListener('click', () => {
                    window.location.href = './addEvent.html';
                });
            }
        } else { 
            studentView.style.display = 'block';
            adminView.style.display = 'none';

            const eventsList = document.getElementById('eventsList');
            eventsList.innerHTML = `
                <div class="no-events">
                    <p>You are not yet registered for any event.</p>
                    <p style="font-size: 0.9rem; color: #666;">Discover the program and join the events!</p>
                </div>
            `;
        }

    } catch (err) {
        console.error("Session error:", err);
        window.location.href = './loginPage.html';
    }

    
    // CSV IMPORT LOGIC (only for admin)
    const importBtn = document.getElementById('importCsvBtn');
    const fileInput = document.getElementById('csvFileInput');

    if (importBtn && fileInput) {
        // when click on the visible btn click also the invisible one
        importBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async function() {
            if (this.files.length === 0) return;

            const file = this.files[0];
            if (!file.name.endsWith('.csv')) {
                alert("Please select a valid CSV file.");
                return;
            }

            const formData = new FormData();
            formData.append('csvFile', file);

            try {
                const response = await fetch('../PHP/import_csv.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    alert("✅ Success: " + result.message);
                } else {
                    alert("❌ Error: " + result.message);
                }
            } catch (err) {
                console.error("CSV upload error:", err);
                alert("Network error while uploading CSV.");
            } finally {
                fileInput.value = ''; // reset 
            }
        });
    }
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
