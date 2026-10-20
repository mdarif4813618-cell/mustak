/* =========================================
   MUSTAK - F2 GAMER WEBSITE
   COMPLETE JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  // Safe local storage helpers
  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem("mustak_" + key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(
          "mustak_" + key,
          JSON.stringify(value)
        );
        return true;
      } catch {
        showToast("Could not save data in this browser.");
        return false;
      }
    }
  };

  // =========================================
  // TOAST NOTIFICATIONS
  // =========================================

  const toast = $("#toast");
  let toastTimer;

  if (toast) {
    toast.style.display = "none";
    toast.setAttribute("aria-live", "polite");
  }

  function showToast(message) {
    if (!toast) {
      console.log(message);
      return;
    }

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.style.display = "block";
    toast.style.opacity = "1";

    toastTimer = setTimeout(() => {
      toast.style.opacity = "0";

      setTimeout(() => {
        toast.style.display = "none";
      }, 250);
    }, 2600);
  }

  // =========================================
  // MOBILE NAVIGATION
  // =========================================

  const menuBtn = $("#menuBtn");
  const navMenu = $("#navMenu");

  function closeMenu() {
    if (!navMenu || !menuBtn) return;

    navMenu.classList.remove("active", "open", "show");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && navMenu) {
    menuBtn.setAttribute("aria-controls", "navMenu");
    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.addEventListener("click", () => {
      const isOpen =
        navMenu.classList.contains("active") ||
        navMenu.classList.contains("open") ||
        navMenu.classList.contains("show");

      closeMenu();

      if (!isOpen) {
        navMenu.classList.add("active");
        menuBtn.setAttribute("aria-expanded", "true");
      }
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(event.target) &&
        !menuBtn.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  // =========================================
  // DIALOG HELPERS
  // =========================================

  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      showToast("Your browser does not support this popup.");
    }
  }

  function closeDialog(id) {
    const dialog = document.getElementById(id);
    if (dialog && dialog.open) dialog.close();
  }

  $$("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeDialog(button.dataset.close);
    });
  });

  $$(".modal").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });

  // =========================================
  // PROFILE EDITING
  // =========================================

  const profileDialog = $("#profileDialog");
  const profileForm = $("#profileForm");
  const editProfileBtn = $("#editProfileBtn");

  const nameInput = $("#nameInput");
  const bioInput = $("#bioInput");
  const displayName = $("#displayName");
  const displayBio = $("#displayBio");

  const savedProfile = storage.get("profile", null);

  function applyProfile(profile) {
    if (!profile) return;

    if (displayName) {
      displayName.textContent = profile.name || "MUSTAK";
    }

    if (displayBio) {
      displayBio.textContent = profile.bio || "";
    }

    if (nameInput) nameInput.value = profile.name || "";
    if (bioInput) bioInput.value = profile.bio || "";
  }

  if (savedProfile) applyProfile(savedProfile);

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      if (nameInput && displayName) {
        nameInput.value = displayName.textContent;
      }

      if (bioInput && displayBio) {
        bioInput.value = displayBio.textContent;
      }

      openDialog("profileDialog");
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = nameInput?.value.trim() || "";
      const bio = bioInput?.value.trim() || "";

      if (!name) {
        showToast("Please enter your name.");
        nameInput?.focus();
        return;
      }

      const profile = { name, bio };

      if (storage.set("profile", profile)) {
        applyProfile(profile);
        closeDialog("profileDialog");
        showToast("Profile saved successfully!");
      }
    });
  }

  // =========================================
  // SOCIAL LINKS
  // =========================================

  const socialGrid = $("#socialGrid");
  let editLinksBtn = $("#editLinksBtn");

  const linksDialog = $("#linksDialog");
  const linksForm = $("#linksForm");

  const linkFields = {
    YouTube: $("#youtubeInput"),
    Facebook: $("#facebookInput"),
    Instagram: $("#instagramInput"),
    TikTok: $("#tiktokInput")
  };

  const defaultLinks = {
    YouTube: "https://www.youtube.com/@f2gamerisback",
    Facebook: "",
    Instagram: "",
    TikTok: ""
  };

  let socialLinks = {
    ...defaultLinks,
    ...(storage.get("socialLinks", {}) || {})
  };

  // Ensure the edit button exists, even if omitted from HTML.
  if (!editLinksBtn && socialGrid) {
    editLinksBtn = document.createElement("button");
    editLinksBtn.id = "editLinksBtn";
    editLinksBtn.className = "btn btn-primary";
    editLinksBtn.type = "button";
    editLinksBtn.textContent = "＋ Edit Social Links";
    socialGrid.insertAdjacentElement("afterend", editLinksBtn);
  }

  function safeURL(value) {
    try {
      const url = new URL(value);

      if (
        url.protocol !== "https:" &&
        url.protocol !== "http:"
      ) {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  }

  function renderSocialLinks() {
    if (!socialGrid) return;

    socialGrid.replaceChildren();

    const socialStyles = {
      YouTube: { icon: "▶", color: "#ff1744" },
      Facebook: { icon: "f", color: "#1877f2" },
      Instagram: { icon: "◎", color: "#e4408f" },
      TikTok: { icon: "♪", color: "#00d9e8" }
    };

    Object.entries(socialLinks).forEach(([platform, rawURL]) => {
      if (!rawURL) return;

      const url = safeURL(rawURL);

      if (!url) return;

      const style = socialStyles[platform];
      if (!style) return;

      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "social-link";

      link.style.cssText = [
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "gap:12px",
        "padding:16px",
        "min-height:58px",
        "border:1px solid #283258",
        "border-radius:12px",
        "background:linear-gradient(135deg,#141b35,#090d1c)",
        "color:#f4f5ff",
        "text-decoration:none",
        "font-weight:800",
        "transition:transform .2s,border-color .2s"
      ].join(";");

      const icon = document.createElement("span");
      icon.textContent = style.icon;
      icon.style.cssText = [
        "display:inline-flex",
        "align-items:center",
        "justify-content:center",
        "width:30px",
        "height:30px",
        "flex-shrink:0",
        "border-radius:9px",
        "background:" + style.color,
        "color:#fff",
        "font-weight:900"
      ].join(";");

      const label = document.createElement("span");
      label.textContent = platform;

      const arrow = document.createElement("span");
      arrow.textContent = "↗";
      arrow.style.marginLeft = "auto";

      link.append(icon, label, arrow);

      link.addEventListener("mouseenter", () => {
        link.style.borderColor = style.color;
        link.style.transform = "translateY(-3px)";
      });

      link.addEventListener("mouseleave", () => {
        link.style.borderColor = "#283258";
        link.style.transform = "translateY(0)";
      });

      socialGrid.appendChild(link);
    });
  }

  function fillLinksForm() {
    Object.entries(linkFields).forEach(([platform, input]) => {
      if (input) input.value = socialLinks[platform] || "";
    });
  }

  if (editLinksBtn) {
    editLinksBtn.addEventListener("click", () => {
      fillLinksForm();
      openDialog("linksDialog");
    });
  }

  if (linksForm) {
    linksForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const updatedLinks = {};

      for (const [platform, input] of Object.entries(linkFields)) {
        const value = input?.value.trim() || "";

        if (!value) {
          updatedLinks[platform] = "";
          continue;
        }

        const url = safeURL(value);

        if (!url) {
          showToast("Enter a valid HTTP or HTTPS URL.");
          input?.focus();
          return;
        }

        updatedLinks[platform] = url;
      }

      if (storage.set("socialLinks", updatedLinks)) {
        socialLinks = updatedLinks;
        renderSocialLinks();
        closeDialog("linksDialog");
        showToast("Social links saved successfully!");
      }
    });
  }

  renderSocialLinks();

  // =========================================
  // FREE FIRE UID
  // =========================================

  const editUidBtn = $("#editUidBtn");
  const copyUidBtn = $("#copyUidBtn");
  const uidDialog = $("#uidDialog");
  const uidForm = $("#uidForm");
  const uidInput = $("#uidInput");
  const uidText = $("#uidText");

  let savedUID = storage.get("freeFireUID", "");

  function applyUID(uid) {
    savedUID = uid || "";

    if (uidText) {
      uidText.textContent = savedUID || "Not added yet";
    }

    if (uidInput) uidInput.value = savedUID;
  }

  applyUID(savedUID);

  if (editUidBtn) {
    editUidBtn.addEventListener("click", () => {
      if (uidInput) uidInput.value = savedUID;
      openDialog("uidDialog");
    });
  }

  if (uidForm) {
    uidForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const uid = uidInput?.value.trim() || "";

      if (uid && !/^\d+$/.test(uid)) {
        showToast("UID must contain numbers only.");
        uidInput?.focus();
        return;
      }

      if (!uid) {
        showToast("Please enter your Free Fire UID.");
        uidInput?.focus();
        return;
      }

      if (storage.set("freeFireUID", uid)) {
        applyUID(uid);
        closeDialog("uidDialog");
        showToast("Free Fire UID saved!");
      }
    });
  }

  async function copyText(text) {
    if (!text) {
      showToast("Please add your UID first.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.style.position = "fixed";
        temp.style.opacity = "0";

        document.body.appendChild(temp);
        temp.select();

        const copied = document.execCommand("copy");
        temp.remove();

        if (!copied) throw new Error("Copy failed");
      }

      showToast("UID copied to clipboard!");
    } catch {
      showToast("Copy failed. Please copy your UID manually.");
    }
  }

  if (copyUidBtn) {
    copyUidBtn.addEventListener("click", () => {
      copyText(savedUID);
    });
  }

  // =========================================
  // CONTACT EMAIL
  // =========================================

  const emailText = $("#emailText");
  const emailBtn = $("#emailBtn");

  const savedEmail = storage.get("contactEmail", "");

  function applyEmail(email) {
    if (!email) return;

    if (emailText) emailText.textContent = email;

    if (emailBtn) {
      emailBtn.href = "mailto:" + email;
    }
  }

  if (savedEmail) {
    applyEmail(savedEmail);
  } else if (emailText && emailBtn) {
    const initialEmail = emailText.textContent.trim();

    if (initialEmail) {
      emailBtn.href = "mailto:" + initialEmail;
    }
  }

  // =========================================
  // FOOTER YEAR
  // =========================================

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // =========================================
  // INITIALIZATION COMPLETE
  // =========================================

  console.log("MUSTAK Gaming Website initialized.");
});