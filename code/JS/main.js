document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.querySelector('.profile-btn');

    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            const role = localStorage.getItem('userRole');

            // if the role is not set it means that the user is not logged in.
            if (!role) {
                e.preventDefault(); // don't open profile page
                alert("You must log in to access your profile.");
                window.location.href = 'loginPage.html';
            }
        });
    }
});
