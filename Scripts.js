let allProducts = [];
let cartItems = [];
let currentPage = 1;
const productsPerPage = 6;

const getData = async () => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) {
      throw new Error("An error occurred while fetching data");
    }
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
};

// getData().then((allProducts) => {
//   console.log(allProducts);
// });

const initializeEventListeners = () => {
  document
    .getElementById("sorting")
    .addEventListener("change", sorting);
  document
    .getElementById("category")
    .addEventListener("change", selectCategory);
  document
    .getElementById("apply-filter")
    .addEventListener("click", searchProduct);
};

const addToCart = (title, price) => {
  const existingItem = cartItems.find((item) => item.title === title);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ title, price, quantity: 1 });
  }
  updateCartDisplay();
  updateCartSummary();
};

const updateCartDisplay = () => {
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  cartItems.forEach((item, index) => {
    const newItem = document.createElement("p");
    newItem.textContent = `${item.title} x ${item.quantity} - $${(
      item.price * item.quantity
    ).toFixed(2)}`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Remove";
    deleteButton.className = "delete-button";
    deleteButton.onclick = () => removeItem(index);

    newItem.appendChild(deleteButton);
    cartItemsContainer.appendChild(newItem);
  });
};

const updateCartSummary = () => {
  let totalQuantity = 0;
  let totalPrice = 0;

  cartItems.forEach((item) => {
    totalQuantity += item.quantity;
    totalPrice += item.price * item.quantity;
  });

  document.getElementById(
    "totalQuantity"
  ).innerText = `Total Quantity: ${totalQuantity}`;
  document.getElementById(
    "totalPrice"
  ).innerText = `Total Price: $${totalPrice.toFixed(2)}`;
};

const removeItem = (index) => {
  cartItems.splice(index, 1);

  updateCartDisplay();
  updateCartSummary();
};

const renderProducts = (products) => {
  const container = document.getElementById("product-container");
  container.innerHTML = "";
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  paginatedProducts.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });

  renderPaginationControls(products);
};

const createProductCard = (product) => {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = product.image;
  img.alt = product.title;

  const details = document.createElement("div");
  details.className = "details";

  const title = document.createElement("h3");
  title.textContent = product.title;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = `$${product.price}`;

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  const viewDetailsButton = document.createElement("button");
  viewDetailsButton.textContent = "View Details";
  viewDetailsButton.className = "view-details";
  viewDetailsButton.onclick = () => openPopup(product);

  const addToCartButton = document.createElement("button");
  addToCartButton.textContent = "Add to Cart";
  addToCartButton.className = "add-to-cart";
  addToCartButton.onclick = () => addToCart(product.title, product.price);

  details.appendChild(title);
  details.appendChild(price);
  details.appendChild(viewDetailsButton);
  details.appendChild(addToCartButton);
  card.appendChild(img);
  card.appendChild(details);

  return card;
};

const searchProduct = () => {
  const query = document.getElementById("productSearch").value.toLowerCase();
  const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
  const maxPrice =
    parseFloat(document.getElementById("maxPrice").value) || Infinity;

  let filteredProducts = allProducts.filter((product) => {
    return (
      product.title.toLowerCase().includes(query) &&
      product.price >= minPrice &&
      product.price <= maxPrice
    );
  });

  if (filteredProducts.length === 0) {
    document.getElementById("product-container").innerHTML =
      "<p>No products found.</p>";
    document.getElementById("pagination-controls").innerHTML = "";
  } else {
    renderProducts(filteredProducts);
  }
};

const selectCategory = () => {
  const category = document.getElementById("category").value;

  // If 'All Categories' is selected, show all products; otherwise, filter by the selected category.
  let filteredProducts =
    category === ""
      ? allProducts
      : allProducts.filter(
          (product) => product.category.toLowerCase() === category.toLowerCase()
        );

  renderProducts(filteredProducts);
};

const sorting = () => {
  const sort = document.getElementById("sorting").value;
  let sortedProducts = [...allProducts];
  if (sort === "Min") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "Max") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }
  renderProducts(sortedProducts);
};

const openPopup = (product) => {
  const popup = document.getElementById("popup");
  document.getElementById("popup-title").textContent = product.title;
  document.getElementById("popup-description").textContent =
    product.description;
  document.getElementById(
    "popup-price"
  ).textContent = `Price: $${product.price}`;
  document.getElementById("popup-image").src = product.image;
  popup.classList.remove("hidden");
};

const closePopup = () => {
  document.getElementById("popup").classList.add("hidden");
};

const renderPaginationControls = (products) => {
  const container = document.getElementById("pagination-controls");
  container.innerHTML = "";

  const totalPages = Math.ceil(products.length / productsPerPage);

  const createPaginationButton = (text, callback, disabled = false) => {
    const button = document.createElement("button");
    button.textContent = text;
    button.disabled = disabled;
    button.onclick = callback;
    return button;
  };

  const prevButton = createPaginationButton(
    "Previous",
    () => {
      currentPage--;
      renderProducts(products);
    },
    currentPage === 1
  );
  container.appendChild(prevButton);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = createPaginationButton(i, () => {
      currentPage = i;
      renderProducts(products);
    });
    if (i === currentPage) {
      pageButton.style.backgroundColor = "#007bff";
      pageButton.style.color = "white";
    }
    container.appendChild(pageButton);
  }

  const nextButton = createPaginationButton(
    "Next",
    () => {
      currentPage++;
      renderProducts(products);
    },
    currentPage === totalPages
  );
  container.appendChild(nextButton);

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  container.appendChild(pageInfo);
};

document.addEventListener("DOMContentLoaded", () => {
  getData();
  initializeEventListeners();
});
