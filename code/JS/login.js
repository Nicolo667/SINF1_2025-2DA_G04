document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    // create variables
    const passwordInput = document.getElementById('password').value;
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const emailValue = emailInput.value;

    // must have: @ and one '.' after @ (create the patter for the email)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
        // email doesn't correct
        emailError.textContent = "Please enter a valid email address (e.g., name@domain.com)"; // error message 
        emailInput.style.borderColor = "red";
        return; // stop the code
    }
        
    // email is valid
    emailError.textContent = ""; // error message become empty

    // we need to call de SQL Database here: <-- IMP!!!!!!!!!!!
    if (emailValue && passwordInput) {        
        // success, we come back at home page
        alert("sucess!");
        window.location.href = './profile.html'; 
    }
});