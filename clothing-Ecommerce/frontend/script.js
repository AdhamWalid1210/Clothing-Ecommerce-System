// Fetch all products from the API
async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    showToast('Failed to load products. Please try again later.', 'error');
  }
}

// Display products with animations
function displayProducts(products) {
  const productsSection = document.getElementById('products');
  if (!productsSection) return; // Exit if the element doesn't exist

  productsSection.innerHTML = ''; // Clear existing content

  products.forEach((product, index) => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.style.opacity = 0; // Start invisible
    productCard.style.transform = 'translateY(20px)';
    productCard.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;

    productCard.innerHTML = `
      <img src="${product.ImageURL}" alt="${product.Name}" class="product-image">
      <h3>${product.Name}</h3>
      <p>$${product.Price}</p>
      <p>${product.Description}</p>
      <button onclick="viewProduct('${product.ProductID}')" class="btn-view-details">View Details</button>
      <select id="size-${product.ProductID}" class="size-selector">
        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
      </select>
      <button onclick="addToCart('${product.ProductID}')" class="btn-add-to-cart">Add to Cart</button>
      <button onclick="addToWishlist('${product.ProductID}')" class="wishlist-button">Add to Wishlist</button>
    `;
    productsSection.appendChild(productCard);

    // Trigger the fade-in animation
    setTimeout(() => {
      productCard.style.opacity = 1;
      productCard.style.transform = 'translateY(0)';
    }, 100);
  });

  // Add "View Cart" and "View Wishlist" buttons to the header
  addHeaderButtons();
}

// Add "View Cart" and "View Wishlist" buttons to the header
function addHeaderButtons() {
  const header = document.querySelector('header');
  if (header) {
    // Check if the "View Cart" button already exists
    if (!document.getElementById('view-cart-button')) {
      const viewCartButton = document.createElement('button');
      viewCartButton.id = 'view-cart-button';
      viewCartButton.innerText = 'View Cart';
      viewCartButton.classList.add('btn-view-cart');
      viewCartButton.onclick = () => {
        window.location.href = 'cart.html';
      };
      header.appendChild(viewCartButton);
    }

    // Check if the "View Wishlist" button already exists
    if (!document.getElementById('view-wishlist-button')) {
      const viewWishlistButton = document.createElement('button');
      viewWishlistButton.id = 'view-wishlist-button';
      viewWishlistButton.innerText = 'View Wishlist';
      viewWishlistButton.classList.add('btn-view-wishlist');
      viewWishlistButton.onclick = () => {
        window.location.href = 'wishlist.html';
      };
      header.appendChild(viewWishlistButton);
    }
  }
}

// Redirect to the product details page
function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Fetch product details
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }
    const product = await response.json();
    displayProductDetails(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    showToast('Failed to load product details. Please try again later.', 'error');
  }
}

// Display product details with animations
function displayProductDetails(product) {
  const productDetailsSection = document.getElementById('product-details');
  if (!productDetailsSection) return; // Exit if the element doesn't exist

  productDetailsSection.innerHTML = `
    <img src="${product.ImageURL}" alt="${product.Name}" class="product-image">
    <h2>${product.Name}</h2>
    <p>$${product.Price}</p>
    <p>${product.Description}</p>
    <select id="size">
      <option value="">Select Size</option>
      ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
    </select>
    <button onclick="addToCart('${product.ProductID}')" class="btn-add-to-cart">Add to Cart</button>
    <button onclick="addToWishlist('${product.ProductID}')" class="wishlist-button">Add to Wishlist</button>
  `;

  // Add fade-in animation
  productDetailsSection.style.opacity = 0;
  productDetailsSection.style.transform = 'translateY(20px)';
  productDetailsSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  setTimeout(() => {
    productDetailsSection.style.opacity = 1;
    productDetailsSection.style.transform = 'translateY(0)';
  }, 100);
}

// Add product to cart
async function addToCart(productId) {
  let size;
  if (window.location.pathname.includes('product.html')) {
    size = document.getElementById('size').value; // For product details page
  } else {
    size = document.getElementById(`size-${productId}`).value; // For homepage
  }

  if (!size) {
    showToast('Please select a size.', 'warning');
    return;
  }

  const userId = localStorage.getItem('userId'); // Get userId from localStorage
  if (!userId) {
    showToast('Please log in to add items to the cart.', 'warning');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity: 1, size }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add product to cart');
    }

    const result = await response.json();
    showToast('Product added to cart!', 'success');
    console.log(result);
  } catch (error) {
    console.error('Error adding to cart:', error);
    showToast('Failed to add product to cart. Please try again.', 'error');
  }
}

// Fetch cart items
async function fetchCart() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    showToast('Please log in to view your cart.', 'warning');
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const cart = await response.json();
    displayCart(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    showToast('Failed to load cart. Please try again later.', 'error');
  }
}

// Display cart items with animations
function displayCart(items) {
  const cartItemsSection = document.getElementById('cart-items');
  if (!cartItemsSection) return; // Exit if the element doesn't exist

  cartItemsSection.innerHTML = '';

  if (items.length === 0) {
    cartItemsSection.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  items.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.style.opacity = 0; // Start invisible
    cartItem.style.transform = 'translateY(20px)';
    cartItem.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;

    cartItem.innerHTML = `
      <h3>${item.ProductName}</h3>
      <p>Quantity: ${item.Quantity}</p>
      <p>Size: ${item.Size}</p>
      <button onclick="removeFromCart('${item.CartItemID}')" class="btn-remove">Remove</button>
    `;
    cartItemsSection.appendChild(cartItem);

    // Trigger the fade-in animation
    setTimeout(() => {
      cartItem.style.opacity = 1;
      cartItem.style.transform = 'translateY(0)';
    }, 100);
  });

  // Calculate and display the total amount
  const totalAmount = items.reduce((total, item) => total + (item.Quantity * item.Price), 0);
  document.getElementById('total-amount').innerText = `Total Amount: $${totalAmount.toFixed(2)}`;
}

// Remove item from cart
async function removeFromCart(itemId) {
  const userId = localStorage.getItem('userId');
  try {
    const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove item from cart');
    }

    const result = await response.json();
    showToast('Item removed from cart!', 'success');
    fetchCart(); // Refresh the cart
  } catch (error) {
    console.error('Error removing from cart:', error);
    showToast('Failed to remove item from cart. Please try again.', 'error');
  }
}

// Add product to wishlist
async function addToWishlist(productId) {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    showToast('Please log in to add items to the wishlist.', 'warning');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add Authorization header
      },
      body: JSON.stringify({ userId, productId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add product to wishlist');
    }

    const result = await response.json();
    showToast('Product added to wishlist!', 'success');
    console.log(result);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    showToast('Product already added !', 'error');
  }
}

// Fetch wishlist items
async function fetchWishlist() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    showToast('Please log in to view your wishlist.', 'warning');
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/wishlist`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }
    const wishlist = await response.json();
    displayWishlist(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    showToast('Failed to load wishlist. Please try again later.', 'error');
  }
}

// Display wishlist items with animations
function displayWishlist(items) {
  const wishlistSection = document.getElementById('wishlist-items');
  if (!wishlistSection) return; // Exit if the element doesn't exist

  wishlistSection.innerHTML = '';

  if (items.length === 0) {
    wishlistSection.innerHTML = '<p>Your wishlist is empty.</p>';
    return;
  }

  items.forEach((item, index) => {
    const wishlistItem = document.createElement('div');
    wishlistItem.className = 'wishlist-item';
    wishlistItem.style.opacity = 0; // Start invisible
    wishlistItem.style.transform = 'translateY(20px)';
    wishlistItem.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;

    wishlistItem.innerHTML = `
      <img src="${item.ImageURL}" alt="${item.Name}" class="product-image">
      <h3>${item.Name}</h3>
      <p>$${item.Price}</p>
      <p>${item.Description}</p>
      <button onclick="removeFromWishlist('${item.ProductID}')" class="wishlist-button">Remove</button>
    `;
    wishlistSection.appendChild(wishlistItem);

    // Trigger the fade-in animation
    setTimeout(() => {
      wishlistItem.style.opacity = 1;
      wishlistItem.style.transform = 'translateY(0)';
    }, 100);
  });
}

// Remove item from wishlist
async function removeFromWishlist(productId) {
  const userId = localStorage.getItem('userId');
  try {
    const response = await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove item from wishlist');
    }

    const result = await response.json();
    showToast('Item removed from wishlist!', 'success');
    fetchWishlist(); // Refresh the wishlist
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    showToast('Failed to remove item from wishlist. Please try again.', 'error');
  }
}

// Handle user login
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    console.log('Login successful:', data.user);
    localStorage.setItem('userId', data.user.UserID); // Save userId to localStorage
    localStorage.setItem('token', data.token); // Save token to localStorage
    localStorage.setItem('role', data.user.Role); // Save role to localStorage
    showToast('Login successful!', 'success');

    // Redirect based on role
    if (data.user.Role === 'admin') {
      window.location.href = 'admin-dashboard.html'; // Redirect to admin dashboard
    } else {
      window.location.href = 'index.html'; // Redirect to homepage for customers
    }
  } catch (err) {
    console.error('Error during login:', err);
    showToast(err.message || 'Something went wrong. Please try again.', 'error');
  }
}

// Handle user signup
async function signup(name, email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const result = await response.json();
    showToast('Signup successful! Please login.', 'success');
    window.location.href = 'auth.html'; // Redirect to login page
  } catch (err) {
    console.error('Error during signup:', err);
    showToast(err.message || 'Something went wrong. Please try again.', 'error');
  }
}

// Handle checkout form submission
async function handleCheckout(event) {
  event.preventDefault();

  const userId = localStorage.getItem('userId');
  if (!userId) {
    showToast('Please log in to place an order.', 'warning');
    return;
  }

  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const zip = document.getElementById('zip').value;
  const paymentMethod = document.getElementById('payment-method').value;

  if (!name || !address || !city || !zip || !paymentMethod) {
    showToast('Please fill out all fields.', 'warning');
    return;
  }

  try {
    // Fetch cart items to include in the order
    const cartResponse = await fetch(`http://localhost:5000/api/cart/${userId}`);
    if (!cartResponse.ok) {
      throw new Error('Failed to fetch cart items');
    }
    const cartItems = await cartResponse.json();

    if (!cartItems || cartItems.length === 0) {
      showToast('Your cart is empty.', 'warning');
      return;
    }

    const orderData = {
      userId,
      totalAmount: cartItems.reduce((total, item) => total + (item.Quantity * item.Price), 0),
      shippingAddress: `${name}, ${address}, ${city}, ${zip}`,
      paymentMethod,
      items: cartItems.map(item => ({
        productId: item.ProductID,
        quantity: item.Quantity,
        price: item.Price,
        size: item.Size,
      })),
    };

    console.log('Order data:', orderData); // Debugging

    const response = await fetch('http://localhost:5000/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to place order');
    }

    const { orderId } = await response.json();
    console.log('Order placed successfully. Order ID:', orderId); // Debugging

    // Redirect to confirmation page with order ID
    window.location.href = `confirmation.html?orderId=${orderId}`;
  } catch (error) {
    console.error('Error placing order:', error);
    showToast(error.message || 'Failed to place order. Please try again.', 'error');
  }
}

// Fetch and display order details on the confirmation page
async function fetchOrderDetails(orderId) {
  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }
    const order = await response.json();

    console.log('Order details response:', order); // Debugging
    displayOrderDetails(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    showToast(error.message || 'Failed to load order details. Please try again.', 'error');
  }
}

// Display order details with animations
function displayOrderDetails(order) {
  const orderDetailsSection = document.getElementById('order-details');
  if (!orderDetailsSection) return; // Exit if the element doesn't exist

  orderDetailsSection.innerHTML = `
    <h2>Order Confirmation</h2>
    <p><strong>Order ID:</strong> ${order.OrderID}</p>
    <p><strong>Total Amount:</strong> $${order.TotalAmount.toFixed(2)}</p>
    <p><strong>Shipping Address:</strong> ${order.ShippingAddress}</p>
    <p><strong>Payment Method:</strong> ${order.PaymentMethod}</p>
    <p><strong>Status:</strong> ${order.Status}</p>
    <p><strong>Order Date:</strong> ${new Date(order.CreatedAt).toLocaleString()}</p>
    <h3>Items:</h3>
    <ul>
      ${order.Items.map(item => `
        <li>
          <strong>Product:</strong> ${item.ProductName}<br>
          <strong>Description:</strong> ${item.ProductDescription}<br>
          <strong>Quantity:</strong> ${item.Quantity}<br>
          <strong>Price:</strong> $${item.Price.toFixed(2)}<br>
          <strong>Size:</strong> ${item.Size}
        </li>
      `).join('')}
    </ul>
  `;

  // Add fade-in animation
  orderDetailsSection.style.opacity = 0;
  orderDetailsSection.style.transform = 'translateY(20px)';
  orderDetailsSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  setTimeout(() => {
    orderDetailsSection.style.opacity = 1;
    orderDetailsSection.style.transform = 'translateY(0)';
  }, 100);
}

// Show toast notifications
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Logout function
function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'auth.html'; // Redirect to login page
}

// Initialize page
if (window.location.pathname.includes('product.html')) {
  const productId = new URLSearchParams(window.location.search).get('id');
  if (productId) fetchProductDetails(productId);
} else if (window.location.pathname.includes('cart.html')) {
  fetchCart();
} else if (window.location.pathname.includes('wishlist.html')) {
  fetchWishlist(); // Add this line for wishlist.html 
} else if (window.location.pathname.includes('auth.html')) {
  // Add event listeners for login and signup forms
  const authForm = document.getElementById('auth-form');

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (name) {
        // If name is provided, it's a signup request
        signup(name, email, password);
      } else {
        // Otherwise, it's a login request
        login(email, password);
      }
    });
  }
} else if (window.location.pathname.includes('checkout.html')) {
  // Add event listener for checkout form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
  }
} else if (window.location.pathname.includes('confirmation.html')) {
  // Fetch and display order details on the confirmation page
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  if (orderId) {
    fetchOrderDetails(orderId);
  }
} else if (window.location.pathname.includes('admin-dashboard.html')) {
  // Fetch and display users, products, and orders for admin
  fetchUsers();
  fetchAdminProducts();
  fetchOrders();
} else {
  fetchProducts();
}