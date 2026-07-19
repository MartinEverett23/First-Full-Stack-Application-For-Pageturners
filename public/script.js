
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

let selectedRating = 0;
let editSelectedRating = 0;

let posts = [];

let activeFilter = "all";

function getToken() {
  return localStorage.getItem("token");
}

function showSection(sectionName) {
  const allSections = ["home", "login", "register", "new-post", "edit-post"];

  allSections.forEach(function (name) {
    var el = document.getElementById("section-" + name);
    if (el) el.classList.add("hidden");
  });

  var target = document.getElementById("section-" + sectionName);
  if (target) target.classList.remove("hidden");

  var hero = document.getElementById("hero");
  if (sectionName === "home") {
    hero.classList.remove("hidden");
    loadPosts();
  } else {
    hero.classList.add("hidden");
  }

  if (sectionName === "new-post") {
    selectedRating = 0;
    buildStarPicker("star-picker", false);
  }

  updateActiveNav(sectionName);
}

function updateActiveNav(sectionName) {
  var links = document.querySelectorAll(".nav-link");
  links.forEach(function (link) {
    link.classList.remove("active");
  });

  var map = { home: 0, login: 1, register: 2, "new-post": 3 };
  if (map[sectionName] !== undefined) {
    links[map[sectionName]].classList.add("active");
  }
}

function loadPosts() {
  var url = "/api/posts";
  if (activeFilter !== "all") {
    url += "?category=" + encodeURIComponent(activeFilter);
  }

  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      posts = data;
      renderPosts();
    })
    .catch(function (err) {
      console.log("Error loading posts:", err);
    });
}

function renderPosts() {
  var grid = document.getElementById("posts-grid");
  var emptyState = document.getElementById("empty-state");

  if (!posts || posts.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  var html = "";

  posts.forEach(function (post) {
    var stars = buildStarsDisplay(post.rating);

    var actionsHtml = "";
    if (currentUser && currentUser.username === post.postedBy) {
      actionsHtml = `
        <div class="post-actions">
          <button class="btn-card btn-edit" onclick="openEditPost(${post.id})">Edit</button>
          <button class="btn-card btn-delete" onclick="deletePost(${post.id})">Delete</button>
        </div>
      `;
    }

    var badgeClass = post.category === "Currently Reading" ? "post-category reading" : "post-category";
    var dateText = new Date(post.createdAt).toLocaleDateString();

    html += `
      <div class="post-card">
        <span class="${badgeClass}">${post.category}</span>
        <h3 class="post-book-title">${post.title}</h3>
        <p class="post-book-author">by ${post.bookAuthor}</p>
        <div class="stars-display">${stars}</div>
        <p class="post-body">${post.body}</p>
        <div class="post-meta">
          <span>by ${post.postedBy}</span>
          <span>${dateText}</span>
        </div>
        ${actionsHtml}
      </div>
    `;
  });

  grid.innerHTML = html;
}

function buildStarsDisplay(rating) {
  var stars = "";
  for (var i = 1; i <= 5; i++) {
    stars += i <= rating ? "★" : "☆";
  }
  return stars;
}

function filterPosts(category) {
  activeFilter = category;

  var buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(function (btn) {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick") === "filterPosts('" + category + "')") {
      btn.classList.add("active");
    }
  });

  loadPosts();
}

function buildStarPicker(containerId, isEdit) {
  var container = document.getElementById(containerId);
  container.innerHTML = "";

  for (var i = 1; i <= 5; i++) {
    var star = document.createElement("span");
    star.textContent = "★";
    star.setAttribute("data-value", i);

    (function (value) {
      star.addEventListener("mouseover", function () {
        highlightStars(containerId, value, isEdit);
      });
      star.addEventListener("mouseout", function () {
        var current = isEdit ? editSelectedRating : selectedRating;
        highlightStars(containerId, current, isEdit);
      });
      star.addEventListener("click", function () {
        if (isEdit) {
          editSelectedRating = value;
        } else {
          selectedRating = value;
        }
        highlightStars(containerId, value, isEdit);
      });
    })(i);

    container.appendChild(star);
  }
}

function highlightStars(containerId, count, isEdit) {
  var container = document.getElementById(containerId);
  var stars = container.querySelectorAll("span");

  stars.forEach(function (star) {
    var val = parseInt(star.getAttribute("data-value"));
    if (val <= count) {
      star.classList.add("selected");
    } else {
      star.classList.remove("selected");
    }
  });
}

function register() {
  var username = document.getElementById("reg-username").value.trim();
  var email = document.getElementById("reg-email").value.trim();
  var password = document.getElementById("reg-password").value;

  var errorEl = document.getElementById("register-error");
  var successEl = document.getElementById("register-success");

  errorEl.classList.add("hidden");
  successEl.classList.add("hidden");

  if (!username || !email || !password) {
    showError(errorEl, "Please fill in all fields.");
    return;
  }

  if (password.length < 6) {
    showError(errorEl, "Password must be at least 6 characters.");
    return;
  }

  fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, email: email, password: password }),
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      if (!result.ok) {
        showError(errorEl, result.data.message || "Could not create account.");
        return;
      }

      successEl.textContent = "Account created! You can now log in.";
      successEl.classList.remove("hidden");

      document.getElementById("reg-username").value = "";
      document.getElementById("reg-email").value = "";
      document.getElementById("reg-password").value = "";
    })
    .catch(function (err) {
      showError(errorEl, "Something went wrong. Please try again.");
    });
}

function login() {
  var email = document.getElementById("login-username").value.trim();
  var password = document.getElementById("login-password").value;
  var errorEl = document.getElementById("login-error");

  errorEl.classList.add("hidden");

  if (!email || !password) {
    showError(errorEl, "Please enter your email and password.");
    return;
  }

  fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: password }),
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      if (!result.ok) {
        showError(errorEl, result.data.message || "Incorrect email or password.");
        return;
      }

      currentUser = result.data.user;
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      onLoginSuccess();
    })
    .catch(function (err) {
      showError(errorEl, "Something went wrong. Please try again.");
    });
}

function logout() {
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");

  document.getElementById("nav-new-post").classList.add("hidden");
  document.getElementById("nav-logout").classList.add("hidden");

  showSection("home");

  document.getElementById("logged-in-msg").classList.add("hidden");
}

function onLoginSuccess() {
  document.getElementById("nav-new-post").classList.remove("hidden");
  document.getElementById("nav-logout").classList.remove("hidden");

  showSection("home");

  var msg = document.getElementById("logged-in-msg");
  msg.textContent = "Welcome back, " + currentUser.username + "! 👋";
  msg.classList.remove("hidden");

  loadPosts();
}

function createPost() {
  var title = document.getElementById("post-title").value.trim();
  var bookAuthor = document.getElementById("post-author").value.trim();
  var category = document.getElementById("post-category").value;
  var body = document.getElementById("post-body").value.trim();
  var errorEl = document.getElementById("post-error");

  errorEl.classList.add("hidden");

  if (!title || !bookAuthor || !category || !body) {
    showError(errorEl, "Please fill in all fields.");
    return;
  }

  if (selectedRating === 0) {
    showError(errorEl, "Please pick a star rating.");
    return;
  }

  fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify({
      title: title,
      bookAuthor: bookAuthor,
      category: category,
      body: body,
      rating: selectedRating,
    }),
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      if (!result.ok) {
        showError(errorEl, result.data.message || "Could not create post.");
        return;
      }

      document.getElementById("post-title").value = "";
      document.getElementById("post-author").value = "";
      document.getElementById("post-category").value = "";
      document.getElementById("post-body").value = "";
      selectedRating = 0;

      showSection("home");
    })
    .catch(function (err) {
      showError(errorEl, "Something went wrong. Please try again.");
    });
}


function openEditPost(postId) {
  var post = posts.find(function (p) { return p.id === postId; });
  if (!post) return;

  document.getElementById("edit-post-id").value = postId;
  document.getElementById("edit-title").value = post.title;
  document.getElementById("edit-author").value = post.bookAuthor;
  document.getElementById("edit-category").value = post.category;
  document.getElementById("edit-body").value = post.body;
  editSelectedRating = post.rating;

  buildStarPicker("edit-star-picker", true);
  highlightStars("edit-star-picker", editSelectedRating, true);

  showSection("edit-post");
}

function saveEdit() {
  var postId = parseInt(document.getElementById("edit-post-id").value);
  var title = document.getElementById("edit-title").value.trim();
  var bookAuthor = document.getElementById("edit-author").value.trim();
  var category = document.getElementById("edit-category").value;
  var body = document.getElementById("edit-body").value.trim();
  var errorEl = document.getElementById("edit-error");

  errorEl.classList.add("hidden");

  if (!title || !bookAuthor || !body) {
    showError(errorEl, "Please fill in all fields.");
    return;
  }

  fetch("/api/posts/" + postId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify({
      title: title,
      bookAuthor: bookAuthor,
      category: category,
      body: body,
      rating: editSelectedRating,
    }),
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      if (!result.ok) {
        showError(errorEl, result.data.message || "Could not save changes.");
        return;
      }
      showSection("home");
    })
    .catch(function (err) {
      showError(errorEl, "Something went wrong. Please try again.");
    });
}


function deletePost(postId) {
  var confirmed = window.confirm("Are you sure you want to delete this review?");
  if (!confirmed) return;

  fetch("/api/posts/" + postId, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + getToken() },
  })
    .then(function () {
      loadPosts();
    })
    .catch(function (err) {
      console.log("Error deleting post:", err);
    });
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove("hidden");
}


function init() {
  if (currentUser) {
    document.getElementById("nav-new-post").classList.remove("hidden");
    document.getElementById("nav-logout").classList.remove("hidden");
  }

  showSection("home");
}

init();
