const title = document.querySelector("h1.title");
const quoteId = document.querySelector(".quote-id");
const quoteText = document.querySelector(".quote-display h2");
const quoteAuthor = document.querySelector(".quote-display span");
const btnGenerate = document.querySelector(".buttons .generate");
const btnAuto = document.querySelector(".buttons .auto");

let alertMessage = document.querySelector(".alert-message");
let alertClose = document.querySelector(".alert-close");
let alertBox = document.querySelector(".alert");

let copy = document.querySelector(".copy");

let shareIcon = document.querySelector(".quotes .share");
let shareBox = document.querySelector(".share-box");
let shareBoxClose = document.querySelector(".share-box .close");
let shareLi = document.querySelectorAll(".share-box .share-li");

const heartIcon = document.querySelector(".quotes .heart");
const favHeader = document.querySelector(".fav-header");
const favoritesList = document.querySelector(".favourite-quotes");
const clearAllFav = document.querySelector(".clear-favorites");
let favoriteQuotes = JSON.parse(localStorage.getItem("favorites")) || [];

let lang = document.querySelector(".lang");
let langSpan = document.querySelector(".lang-span");

const soundWave = document.querySelector(".sound-wave");

let play = document.querySelector(".play");
let speech = new SpeechSynthesisUtterance();

// Initialize isArabic from localStorage, default to false (English) if not set
let isArabic = JSON.parse(localStorage.getItem("isArabic")) || false;

speech.volume = 0.5;
speech.rate = 1;
speech.pitch = 1;

const quotes = [];
let currentQuote;

// Function to set the voice based on current language
function setVoice() {
  const voices = speechSynthesis.getVoices();
  console.log("Available voices:", voices);

  const voice =
    voices.find((v) => v.lang.startsWith(isArabic ? "ar" : "en")) || voices[0];
  if (voice) {
    speech.voice = voice;
    speech.lang = isArabic ? "ar-SA" : "en-US";
  } else {
    console.warn(
      "No suitable voice found for",
      isArabic ? "Arabic" : "English"
    );
  }
}

// Load voices and set initial voice
if (speechSynthesis.getVoices().length > 0) {
  setVoice();
} else {
  speechSynthesis.onvoiceschanged = () => {
    setVoice();
    speechSynthesis.onvoiceschanged = null;
  };
}

// Play/Pause TTS
play.addEventListener("click", () => {
  if (play.classList.contains("fa-play")) {
    play.classList.remove("fa-play");
    play.classList.add("fa-pause");

    const quotePlay = quoteText.textContent;

    speech.onend = () => {
      play.classList.remove("fa-pause");
      play.classList.add("fa-play");
      soundWave.style.display = "none";
      quoteId.style.display = "flex";
    };

    soundWave.style.display = "flex";
    quoteId.style.display = "none";
    speech.text = quotePlay;
    setVoice();
    speechSynthesis.speak(speech);
  } else {
    speechSynthesis.cancel();
    play.classList.remove("fa-pause");
    play.classList.add("fa-play");
    soundWave.style.display = "none";
    quoteId.style.display = "flex";
  }
});

// Function to apply language settings
function applyLanguageSettings() {
  langSpan.innerHTML = isArabic ? "ar" : "en";
  document.body.style.direction = isArabic ? "rtl" : "ltr";
  document.body.style.fontFamily = isArabic
    ? `"Rakkas", serif`
    : `"Dancing Script", cursive`;
  favHeader.innerHTML = isArabic ? "الاقتباسات المفضلة" : "Favourite Quotes";
  btnAuto.innerHTML = isArabic ? "إنشاء تلقائي" : "Auto Generate";
  btnGenerate.innerHTML = isArabic ? "إنشاء اقتباس" : "Generate Quote";
  title.innerHTML = isArabic
    ? "مولد الاقتباسات العشوائية"
    : "Random Quotes Generator";

  showAlert("language changed", "تم تغيير اللغة");
  // Update the displayed quote's language without generating a new one
  const quoteText = document.querySelector(".quote-text");
  const quoteAuthor = document.querySelector(".quote-author");
  displayQuote(getDisplayedQuote());

  if (quoteText && quoteAuthor) {
    // Check if the current quote is in Arabic
    const isCurrentArabic = /[\u0600-\u06FF]/.test(quoteText.innerText);
    quoteText.dir = isCurrentArabic ? "rtl" : "ltr";
    quoteAuthor.dir = isCurrentArabic ? "rtl" : "ltr";
  }
}

// Apply language settings on page load
applyLanguageSettings();

// Language toggle
lang.addEventListener("click", () => {
  isArabic = !isArabic;
  localStorage.setItem("isArabic", JSON.stringify(isArabic)); // Save to localStorage
  applyLanguageSettings();
});

// Add to favorites
heartIcon.addEventListener("click", () => {
  const newQuote = {
    text: quoteText.textContent,
    author: quoteAuthor.textContent,
  };

  const isAlreadyFavorite = favoriteQuotes.some(
    (quote) => quote.text === newQuote.text && quote.author === newQuote.author
  );

  if (!isAlreadyFavorite) {
    favoriteQuotes.push(newQuote);
    localStorage.setItem("favorites", JSON.stringify(favoriteQuotes));
    showAlert(
      "Quote added to favorites!",
      "تمت إضافة الاقتباس إلى المفضلة!",
      "success"
    );
    displayFavourites();
  } else {
    showAlert(
      "Quote already added to favorites!",
      "الاقتباس مضاف بالفعل إلى المفضلة!",
      "error"
    );
  }
});

// Clear all favorites
clearAllFav.addEventListener("click", () => {
  if (favoriteQuotes.length === 0) {
    showAlert(
      "No favorite quotes to clear!",
      "لا توجد اقتباسات مفضلة للحذف!",
      "error"
    );
    return;
  }

  if (confirm("Are you sure you want to clear all favorite quotes?")) {
    favoriteQuotes = [];
    localStorage.removeItem("favorites");
    showAlert(
      "All favorite quotes cleared!",
      "تم حذف جميع الاقتباسات المفضلة!",
      "success"
    );
    displayFavourites();
  }
});

// Display favorite quotes
function displayFavourites() {
  favoritesList.innerHTML = "";

  favoriteQuotes.forEach((quote, index) => {
    const li = document.createElement("li");
    li.classList.add("fav-list");

    const isLiArabic = /[\u0600-\u06FF]/.test(quote.text);
    li.dir = isLiArabic ? "rtl" : "ltr";

    li.innerHTML = `
      <i class="fa-solid fa-heart heart remove" title="Remove from favourites"></i>
      <span class="fav-qoute">${quote.text}</span>
      <span class="fav-auther"> ${quote.author}</span>
    `;

    if (isLiArabic) {
      li.children[2].style.left = "30px";
    } else {
      li.children[2].style.right = "30px";
    }

    li.querySelector(".remove").addEventListener("click", () => {
      favoriteQuotes.splice(index, 1);
      localStorage.setItem("favorites", JSON.stringify(favoriteQuotes));
      displayFavourites();
      showAlert(
        "Quote removed from favorites!",
        "تم حذف الاقتباس من المفضلة!",
        "success"
      );
    });

    favoritesList.appendChild(li);
  });
}

displayFavourites();

// Share functionality
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
      showAlert(
        "No quote available to share!",
        "لا يوجد اقتباس متاح للمشاركة!",
        "error"
      );
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

// Copy to clipboard
copy.onclick = () => {
  if (!quoteText.textContent.trim()) {
    showAlert(
      "No quote available to copy!",
      "لا يوجد اقتباس متاح للنسخ!",
      "error"
    );
    return;
  }
  navigator.clipboard.writeText(quoteText.textContent);
  showAlert(
    "Quote copied to clipboard!",
    "تم نسخ الاقتباس إلى الحافظة!",
    "success"
  );
};

// Show alert
function showAlert(message, messageAr, status = "success") {
  alertBox.classList.remove("error", "success");
  alertBox.classList.add(status);

  alertMessage.textContent = isArabic ? messageAr : message;
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

async function getQuote() {
  try {
    const res = await fetch("quotes.json");
    const data = await res.json();

    if (data.length > 0) {
      quotes.push(...data);
      displayQuote(random(quotes));
    } else {
      showAlert("No quotes found!", "لم يتم العثور على اقتباسات!", "error");
    }
  } catch (err) {
    console.error("Error fetching quotes:", err);
    showAlert("Failed to fetch quotes!", "فشل في جلب الاقتباسات!", "error");
  }
}
getQuote();

btnGenerate.onclick = () => {
  displayQuote(random(quotes));
};

btnAuto.onclick = () => {
  if (quotes.length === 0) {
    showAlert(
      "Quotes are still loading...",
      "الاقتباسات لا تزال تُحمل...",
      "error"
    );
    return;
  }

  if (!autoInterval) {
    autoInterval = setInterval(() => {
      displayQuote(random(quotes));
    }, 3000);
    btnAuto.textContent = isArabic
      ? "توقيف الإنشاء التلقائي"
      : "Stop Auto Generate";
    showAlert(
      "Auto-generating quotes: ON",
      "إنشاء الاقتباسات تلقائيًا: مفعل",
      "success"
    );
    btnAuto.style.backgroundColor = "#f44";
    console.log(getDisplayedQuote());
  } else {
    showAlert(
      "Auto-generating quotes: OFF",
      "إنشاء الاقتباسات تلقائيًا: معطل",
      "success"
    );
    btnAuto.style.backgroundColor = "#756bff";
    btnAuto.textContent = isArabic ? "إنشاء تلقائي" : "Auto Generate";
    clearInterval(autoInterval);
    autoInterval = null;
  }
};

// Display random quote

function displayQuote(displayedQuote) {
  if (!displayedQuote) return;
  const { id, quote, quote_ar, author, author_ar } = displayedQuote;
  currentQuote = displayedQuote;
  quoteId.textContent = id;
  quoteText.textContent = isArabic ? quote_ar : quote;
  quoteAuthor.textContent = isArabic ? author_ar : author;
  getDisplayedQuote();
}

function getDisplayedQuote() {
  return currentQuote;
}
// Random quote
function random(quotes) {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
