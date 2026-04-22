/*document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const emailInput  = document.getElementById('email');
    const emailError  = document.getElementById('emailError');
    const emailValue  = emailInput.value.trim();
    const passValue   = document.getElementById('password').value;
    const username    = document.getElementById('username').value.trim();
    const firstName   = document.getElementById('firstName').value.trim();
    const lastName    = document.getElementById('lastName').value.trim();
    const birthDate   = document.getElementById('birthDate').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        emailError.textContent = "Please enter a valid email address (e.g., name@domain.com)";
        emailInput.style.borderColor = "red";
        return;
    }
    emailError.textContent = "";
    emailInput.style.borderColor = "";

    try {
        const response = await fetch('../PHP/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, firstName, lastName, birthDate, email: emailValue, password: passValue })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = './profile.html';
        } else {
            emailError.textContent = data.message || "Registration failed. Please try again.";
            emailInput.style.borderColor = "red";
        }
    } catch (err) {
        emailError.textContent = "Connection error. Please try again.";
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('role');
    const adminCodeGroup = document.getElementById('adminCodeGroup');
    const registrationForm = document.getElementById('registrationForm');

    // Show/hide code field management
    roleSelect.addEventListener('change', function() {
        if (this.value === 'admin') {
            adminCodeGroup.style.display = 'block';
        } else {
            adminCodeGroup.style.display = 'none';
            document.getElementById('adminCode').value = ''; 
        }
    });

    
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const role = roleSelect.value;
        const adminCode = document.getElementById('adminCode').value;

        // Admin Code Validation
        if (role === 'admin' && adminCode !== '1234') {
            alert("❌ Incorrect Administrator Code!");
            return;
        }

        const formData = {
            username: document.getElementById('username').value.trim(),
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            birthDate: document.getElementById('birthDate').value,
            role: role
        };

        try {
            const response = await fetch('../PHP/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert("✅ Registration made as " + role);
                window.location.href = './login.html';
            } else {
                alert("⚠️ Error: " + data.message);
            }
        } catch (err) {
            console.error("Errore fetch:", err);
            alert("Error connecting to the server.");
        }
    });
});*/
document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('role');
    const adminCodeGroup = document.getElementById('adminCodeGroup');
    const registrationForm = document.getElementById('registrationForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    // 1. Gestione mostrare/nascondere campo codice admin
    roleSelect.addEventListener('change', function() {
        if (this.value === 'admin') {
            adminCodeGroup.style.display = 'block';
        } else {
            adminCodeGroup.style.display = 'none';
            const codeInput = document.getElementById('adminCode');
            if(codeInput) codeInput.value = ''; 
        }
    });

    // 2. Unico ascoltatore per il Submit
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Recupero valori
        const emailValue = emailInput.value.trim();
        const role = roleSelect.value;
        const adminCodeInput = document.getElementById('adminCode');
        const adminCode = adminCodeInput ? adminCodeInput.value : '';

        // VALIDAZIONE EMAIL
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailValue)) {
            emailError.textContent = "Please enter a valid email address.";
            emailInput.style.borderColor = "red";
            return;
        }
        emailError.textContent = "";
        emailInput.style.borderColor = "";

        // VALIDAZIONE CODICE ADMIN
        if (role === 'admin' && adminCode !== '1234') {
            alert("❌ Incorrect Administrator Code!");
            return;
        }

        // Preparazione dati per il server
        const formData = {
            username: document.getElementById('username').value.trim(),
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            birthDate: document.getElementById('birthDate').value,
            email: emailValue,
            password: document.getElementById('password').value,
            role: role
        };

        try {
            const response = await fetch('../PHP/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert("✅ Registration successful as " + role);
                window.location.href = './loginPage.html';
            } else {
                alert("⚠️ Error: " + data.message);
                // Se l'errore riguarda l'email, evidenziamolo
                if(data.message.toLowerCase().includes('email')) {
                    emailInput.style.borderColor = "red";
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Connection error. Please try again.");
        }
    });
});