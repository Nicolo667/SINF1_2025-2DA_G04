document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const emailInput  = document.getElementById('email');
    const emailError  = document.getElementById('emailError');
    const emailValue  = emailInput.value.trim();
    const passwordValue = document.getElementById('password').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        emailError.textContent = "Please enter a valid email address (e.g., name@domain.com)";
        emailInput.style.borderColor = "red";
        return;
    }
    emailError.textContent = "";
    emailInput.style.borderColor = "";

    try {
        const response = await fetch('../PHP/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailValue, password: passwordValue })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = './profile.html';
        } else {
            emailError.textContent = data.message || "Invalid email or password";
            emailInput.style.borderColor = "red";
        }
    } catch (err) {
        emailError.textContent = "Connection error. Please try again.";
    }
});
