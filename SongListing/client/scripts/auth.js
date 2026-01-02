/**
 * auth.js
 * Client-side authentication logic
 *
 * This file handles all authentication-related functionality:
 * - User registration and login
 * - Password strength validation
 * - Session-based access control
 * - User profile loading (name and profile image)
 *
 * Authentication is implemented using server-side sessions.
 * Sensitive data such as passwords is never stored on the client.
 */

/* =========================
   Password validation
   ========================= */

/**
 * Checks whether a password is strong enough.
 * A valid password must contain:
 * - At least 6 characters
 * - At least one letter
 * - At least one number
 * - At least one special character
 *
 * @param {string} pwd - Password string
 * @returns {boolean} True if password is strong, otherwise false
 */
function isStrongPassword(pwd) {
    return pwd.length >= 6 &&
        /[A-Za-z]/.test(pwd) &&
        /\d/.test(pwd) &&
        /[^A-Za-z0-9]/.test(pwd);
}

/* =========================
   User registration
   ========================= */

/**
 * Registers a new user.
 * Performs client-side validation before sending the data to the server.
 */
async function register() {
    const usernameVal = document.getElementById("username").value.trim();
    const firstNameVal = document.getElementById("firstName").value.trim();
    const passwordVal = document.getElementById("password").value;
    const confirmVal = document.getElementById("confirm").value;
    const imageUrlVal = document.getElementById("image").value.trim();

    if (!usernameVal || !firstNameVal || !passwordVal || !confirmVal || !imageUrlVal) {
        alert("Please fill all fields");
        return;
    }

    if (passwordVal !== confirmVal) {
        alert("Passwords do not match");
        return;
    }

    if (!isStrongPassword(passwordVal)) {
        alert(
            "Password must contain at least 6 characters, a letter, a number and a special character"
        );
        return;
    }

    const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: usernameVal,
            firstName: firstNameVal,
            password: passwordVal,
            imageUrl: imageUrlVal
        })
    });

    if (res.ok) {
        alert("Registered successfully!");
        location.href = "login.html";
    } else {
        alert("Registration failed");
    }
}

/* =========================
   User login / logout
   ========================= */

/**
 * Logs in an existing user.
 * On success, redirects to the home page.
 */
async function login() {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username.value.trim(),
            password: password.value
        })
    });

    if (res.ok) {
        location.href = "home.html";
    } else {
        alert("Wrong credentials");
    }
}

/**
 * Logs out the current user and ends the session.
 */
async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "login.html";
}

/* =========================
   Page protection
   ========================= */

/**
 * Protects pages that require authentication.
 * Redirects unauthenticated users to the login page.
 */
async function protectPage() {
    const res = await fetch("/api/auth/me");
    if (!res.ok) location.href = "login.html";
}

/**
 * Redirects already authenticated users
 * away from login/register pages.
 */
async function redirectIfLogged() {
    const res = await fetch("/api/auth/me");
    if (res.ok) location.href = "home.html";
}

/* =========================
   User profile
   ========================= */

/**
 * Loads the current user's profile information
 * and displays the user's name and profile image.
 */
async function loadProfile() {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return;

    const data = await res.json();

    const w = document.getElementById("welcome");
    if (w) w.innerText = "Welcome, " + data.user.firstName;

    const img = document.getElementById("profileImg");
    if (img && data.user.imageUrl) {
        img.src = data.user.imageUrl;
    }
}
