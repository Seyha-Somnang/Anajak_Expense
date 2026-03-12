// State
let isLoginMode = true;
let isPasswordVisible = false;

// Elements
const authForm = document.getElementById("auth-form");
const submitBtn = document.getElementById("submit-btn");
const btnLoader = document.getElementById("btn-loader");
const btnText = document.getElementById("btn-text");
const statusAlert = document.getElementById("status-alert");
const errorAlert = document.getElementById("error-alert");
const passwordInput = document.getElementById("password");
const eyeIcon = document.getElementById("eye-icon");

// Toggle Login/Signup UI
document.getElementById("toggle-auth-mode").addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  document.getElementById("auth-title").textContent = isLoginMode ? "Welcome To Anajak" : "Create an account";
  btnText.textContent = isLoginMode ? "Sign In" : "Create Account";

  // Use Tailwind 'hidden' class to toggle fields
  const nameField = document.getElementById("name-field-container");
  if (isLoginMode) {
    nameField.classList.add("hidden");
  } else {
    nameField.classList.remove("hidden");
  }

  document.getElementById("toggle-auth-mode").textContent = isLoginMode ? "Sign up" : "Log in";
  document.getElementById("toggle-text").textContent = isLoginMode
    ? "Don't have an account?"
    : "Already have an account?";

  // Hide alerts when switching modes
  errorAlert.classList.add("hidden");
  statusAlert.classList.add("hidden");
});

// Show/Hide Password
document.getElementById("toggle-password").addEventListener("click", () => {
  isPasswordVisible = !isPasswordVisible;
  passwordInput.type = isPasswordVisible ? "text" : "password";
  eyeIcon.className = isPasswordVisible ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
});

// Handle Authentication
authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = passwordInput.value;

  // Reset states - Hide alerts and show loader
  errorAlert.classList.add("hidden");
  statusAlert.classList.add("hidden");
  submitBtn.disabled = true;
  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");

  // Simulate API call
  setTimeout(() => {
    if (email === "seyha@gmail.com" && password === "admin") {
      // Show Success
      statusAlert.classList.remove("hidden");
      btnLoader.classList.add("hidden");
      btnText.classList.remove("hidden");
      submitBtn.disabled = false;
      window.open("dashboard.html", "_self");
    } else {
      // Show Error
      submitBtn.disabled = false;
      btnText.classList.remove("hidden");
      btnLoader.classList.add("hidden");
      errorAlert.classList.remove("hidden");
    }
  }, 1200);
});
