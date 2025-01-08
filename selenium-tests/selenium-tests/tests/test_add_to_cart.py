from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

def test_add_product_to_cart():
    # Initialize the WebDriver using webdriver-manager
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

    try:
        # Step 1: Log in the user
        driver.get("http://localhost:5000/auth.html")  # Replace with the correct URL

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

        # Wait for redirection to the homepage
        time.sleep(2)

        # Step 2: Add a product to the cart
        driver.get("http://localhost:5000/index.html")  # Replace with the correct URL

        # Wait for products to load
        time.sleep(2)

        # Click the "Add to Cart" button for the first product
        add_to_cart_button = driver.find_element(By.CSS_SELECTOR, ".product-card .btn-add-to-cart")
        add_to_cart_button.click()

        # Wait for the cart to update
        time.sleep(2)

        # Step 3: Navigate to the cart page
        driver.get("http://localhost:5000/cart.html")  # Replace with the correct URL

        # Verify that the product is in the cart
        cart_items = driver.find_elements(By.CLASS_NAME, "cart-item")
        assert len(cart_items) > 0, "No items found in the cart"

        print("Test Case 2: Add Product to Cart - Passed")

    finally:
        # Close the browser
        driver.quit()

# Run the test
test_add_product_to_cart()