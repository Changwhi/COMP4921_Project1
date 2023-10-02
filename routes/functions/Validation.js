function validatePassword(password) {
  console.log("validatePassword hit")
  // Password should be at least 10 characters long
  if (password.length < 10) {
    return false;
  }

  // Password should contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Password should contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Password should contain at least one digit
  if (!/[0-9]/.test(password)) {
    return false;
  }

  // Password should contain at least one special character
  if (!/[!@#$%^&*]/.test(password)) {
    return false;
  }

  // If all conditions are met, the password is valid
  return true;
}


module.exports = { validatePassword }
