from selenium import webdriver
from selenium.webdriver.chrome.service import Service  # Correct import for Service
from webdriver_manager.chrome import ChromeDriverManager  # Correct import for ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains  # For simulating typing
import time

def test_successful_login():
    # Initialize the WebDriver using webdriver-manager
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

    try:
        # Open the login page
        driver.get("http://localhost:5000/auth.html")

        # Wait for the page to load
        time.sleep(2)

        # Find the email and password input fields
        email_input = driver.find_element(By.ID, "email")
        password_input = driver.find_element(By.ID, "password")
        submit_button = driver.find_element(By.CSS_SELECTOR, "#auth-form button[type='submit']")

        # Simulate slow typing for the email
        email = "messi@gmail.com"
        for char in email:
            email_input.send_keys(char)
            time.sleep(0.2)  # Add a small delay between each keystroke

        # Simulate slow typing for the password
        password = "1234"
        for char in password:
            password_input.send_keys(char)
            time.sleep(0.2)  # Add a small delay between each keystroke

        # Wait for a moment before clicking the submit button
        time.sleep(1)

        # Click the submit button
        submit_button.click()

        # Wait for redirection
        time.sleep(2)

        # Verify redirection to the homepage
        assert "index.html" in driver.current_url, "Login failed or redirection to homepage failed"

        print("Test Case 1: Successful Login - Passed")

    finally:
        # Close the browser
        driver.quit()

# Run the test
test_successful_login()