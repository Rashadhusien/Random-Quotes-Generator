const quoteId = document.querySelector(".quote-id");
const quoteText = document.querySelector(".quote-display h2");
const quoteAuthor = document.querySelector(".quote-display span");
const btnGenerate = document.querySelector(".buttons .generate");
const btnAuto = document.querySelector(".buttons .auto");
const statusText = document.querySelector(".auto-status");

let alertMessage = document.querySelector(".alert-message");
let alertClose = document.querySelector(".alert-close");
let alertBox = document.querySelector(".alert");

let copy = document.querySelector(".copy");

let shareIcon = document.querySelector(".quotes .share");
let shareBox = document.querySelector(".share-box");
let shareBoxClose = document.querySelector(".share-box .close");
let shareLi = document.querySelectorAll(".share-box .share-li");

const heartIcon = document.querySelector(".quotes .heart");
const favoritesList = document.querySelector(".favourite-quotes");

let favoriteQuotes = JSON.parse(localStorage.getItem("favorites")) || [];

const quotes = [];

heartIcon.addEventListener("click", () => {
  const newQuote = {
    text: quoteText.textContent,
    author: quoteAuthor.textContent,
  };

  // Check if the quote is already in favorites
  const isAlreadyFavorite = favoriteQuotes.some(
    (quote) => quote.text === newQuote.text && quote.author === newQuote.author
  );

  if (!isAlreadyFavorite) {
    favoriteQuotes.push(newQuote);
    localStorage.setItem("favorites", JSON.stringify(favoriteQuotes));
    showAlert("Quote added to favorites!", "success");
    displayFavourites();
  } else {
    showAlert("Quote already added to favorites!", "error");
  }
});

function displayFavourites() {
  favoritesList.innerHTML = "";

  favoriteQuotes.forEach((quote, index) => {
    const li = document.createElement("li");
    li.classList.add("fav-list");

    li.innerHTML = `
      <i class="fa-solid fa-heart heart remove" title="Remove from favourites"></i>
      <span class="fav-qoute">${quote.text}</span>
      <span class="fav-auther"> ${quote.author}</span>
    `;

    li.querySelector(".remove").addEventListener("click", () => {
      favoriteQuotes.splice(index, 1);
      localStorage.setItem("favorites", JSON.stringify(favoriteQuotes));
      displayFavourites();
      showAlert("Quote removed from favorites!", "success");
    });

    favoritesList.appendChild(li);
  });
}

displayFavourites();
shareIcon.onclick = () => {
  shareBox.style.display = "block";
};
shareBoxClose.onclick = () => {
  shareBox.style.display = "none";
};

shareLi.forEach((item) => {
  item.onclick = () => {
    const quote = quoteText.textContent.trim();
    const author = quoteAuthor.textContent.trim();

    if (!quote || !author) {
      showAlert("No quote available to share!", "error");
      return;
    }

    const text = `"${quote}" - ${author}`;
    const encodedText = encodeURIComponent(text);
    let shareURL = "";

    if (item.querySelector(".twitter")) {
      shareURL = `https://twitter.com/intent/tweet?text=${encodedText}`;
    } else if (item.querySelector(".facebook")) {
      const dummyURL = "https://your-website.com/quote";
      shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        dummyURL
      )}&text=${encodedText}`;
    } else if (item.querySelector(".whatsapp")) {
      shareURL = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    if (shareURL) {
      window.open(shareURL, "_blank");
    }
  };
});

copy.onclick = () => {
  if (!quoteText.textContent.trim()) {
    showAlert("No quote available to copy!", "error");
    return;
  }
  navigator.clipboard.writeText(quoteText.textContent);

  showAlert("Quote copied to clipboard!");
};

function showAlert(message, status) {
  alertBox.classList.remove("error", "success");
  alertBox.classList.add(status || "success");

  alertMessage.textContent = message;
  alertBox.classList.add("show");
  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

alertClose.onclick = () => {
  alertBox.classList.remove("show");
};

// Auto-generate quotes

let autoInterval;

// Fetch quotes from API
async function getQuote() {
  try {
    const res = await fetch("quots.json");
    const data = await res.json();
    quotes.push(...data);

    displayQuote(random(quotes));
  } catch (err) {
    console.error("Error fetching quotes:", err);
  }
}
getQuote();

btnGenerate.onclick = () => {
  displayQuote(random(quotes));
};

btnAuto.onclick = () => {
  if (quotes.length === 0) {
    showAlert("Quotes are still loading...");
    return;
  }

  if (!autoInterval) {
    autoInterval = setInterval(() => {
      displayQuote(random(quotes));
    }, 3000);
    btnAuto.textContent = `Stop Auto Generate`;
    showAlert(`Auto-generating quotes: ON`);
    btnAuto.style.backgroundColor = "#f44";
  } else {
    showAlert(`Auto-generating quotes: OFF`);
    btnAuto.style.backgroundColor = "#493d9e";
    btnAuto.textContent = "Auto Generate";
    clearInterval(autoInterval);
    autoInterval = null;
  }
};

// Display random quote

function displayQuote(displayedQuote) {
  const { id, quote, author } = displayedQuote;
  quoteId.textContent = id;
  quoteText.textContent = quote;
  quoteAuthor.textContent = author;
}

// random quote

function random(quotes) {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
