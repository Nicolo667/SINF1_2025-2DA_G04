document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('role');
    const adminCodeGroup = document.getElementById('adminCodeGroup');
    const registrationForm = document.getElementById('registrationForm');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    roleSelect.addEventListener('change', function() {
        if (this.value === 'admin') {
            adminCodeGroup.style.display = 'block';
        } else {
            adminCodeGroup.style.display = 'none';
            const codeInput = document.getElementById('adminCode');
            if(codeInput) codeInput.value = ''; 
        }
    });

    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Recovery of values
        const emailValue = emailInput.value.trim();
        const role = roleSelect.value;
        const adminCodeInput = document.getElementById('adminCode');
        const adminCode = adminCodeInput ? adminCodeInput.value : '';

        // EMAIL VALIDATION
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailValue)) {
            emailError.textContent = "Please enter a valid email address.";
            emailInput.style.borderColor = "red";
            return;
        }
        emailError.textContent = "";
        emailInput.style.borderColor = "";

        // ADMIN CODE VALIDATION
        if (role === 'admin' && adminCode !== '1234') {
            alert("❌ Incorrect Administrator Code!");
            return;
        }

        // Preparing data for the server
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
                // if the email cause the errpr
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