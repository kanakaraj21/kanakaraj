function login() {
    document.getElementById("login").style.display = "flex"; // Show login form
    document.getElementById("register").style.display = "none"; // Hide registration form
    document.getElementById("btn").style.left = "0"; // Move button to the left
}

function register() {
    document.getElementById("register").style.display = "flex"; // Show registration form
    document.getElementById("login").style.display = "none"; // Hide login form
    document.getElementById("btn").style.left = "110px"; // Move button to the right
}
