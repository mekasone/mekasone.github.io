const authData = [
      {
        name: "API Key",
        tech: "A long-term, static string of characters hardcoded into an application and sent with headers or URLs.",
        strategy: "Used to monetize APIs, track developer usage, and enforce traffic rate limits on public platforms.",
        analogyText: "The Office Keycard: Simple and practical. It lets you into the building, but if dropped in the parking lot, anyone can use it until manually revoked."
      },
      {
        name: "Token (e.g., JWT)",
        tech: "A temporary, dynamic string containing embedded scopes and expirations, validated mathematically without constant database checks.",
        strategy: "Delegates granular, short-lived access control to users or microservices without exposing main credentials.",
        analogyText: "The Concert Wristband: Temporary and specific. You show your ID at the gate to get it; it grants VIP lounge entry for the night but expires by morning."
      },
      {
        name: "Certificate (Certs)",
        tech: "A cryptographic file utilizing public/private key pairs to establish an encrypted, identity-verified mutual TLS tunnel.",
        strategy: "Implements zero-trust architecture between permanent business partners or internal core cloud infrastructure.",
        analogyText: "The Diplomatic Passport: Heavy and maximum trust. Requires background checks to obtain, binds to your specific identity, and is rigorously verified at borders."
      },
      {
        name: "Session Cookie",
        tech: "A unique ID string stored in the user's web browser, pointing directly to an active state saved on the server's database.",
        strategy: "Maintains user states, shopping carts, and active logins across page refreshes in standard web applications.",
        analogyText: "The Coat Check Ticket: You trade your jacket (credentials) for a numbered ticket. As long as you hold that exact ticket, you can claim your items."
      },
      {
        name: "SAML Assertion",
        tech: "An XML-based secure document that securely transfers a user’s identity and permission claims between systems.",
        strategy: "Powers Enterprise Single Sign-On (SSO), allowing corporate employees to access hundreds of vendor apps with one login.",
        analogyText: "The All-Inclusive Resort Pass: You check into the main lobby once. They give you a stamped pass that grants access to the golf course, spa, and dining."
      },
      {
        name: "Biometric WebAuthn",
        tech: "Uses physical authenticators (fingerprints, facial scans) to sign cryptographic challenges backed by hardware chips.",
        strategy: "Eliminates passwords entirely (Passwordless), shutting down remote phishing, credential stuffing, and keylogging.",
        analogyText: "The Retina Scanner: A high-tech security door requiring your physical eye to open. It cannot be guessed, lost, or stolen over the internet."
      },
      {
        name: "OIDC Identity Token",
        tech: "A specialized cryptographic token variant (JWT) built on OAuth 2.0 dedicated entirely to answering who someone is.",
        strategy: "Standardizes federated identity sharing across different cloud ecosystems (e.g., \"Sign in with Google\" buttons).",
        analogyText: "The Secure ID Badge: A laminated photo ID card explicitly detailing your name, department, and expiration date, issued by corporate HR."
      }
    ];

    let currentIndex = 0;
    let isSoundOn = false;

    // DOM Elements
    const moonOrbit = document.getElementById("moonOrbit");
    const moonTextWrapper = document.getElementById("moonTextWrapper");
    const moonText = document.getElementById("moonText");
    const itemMechanism = document.getElementById("itemMechanism");
    const itemTech = document.getElementById("itemTech");
    const itemStrategy = document.getElementById("itemStrategy");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const showTableBtn = document.getElementById("showTableBtn");
    const closeTableBtn = document.getElementById("closeTableBtn");
    const tableModal = document.getElementById("tableModal");
    const tableBody = document.getElementById("tableBody");
    const buttonsRow = document.getElementById("buttonsRow");
    const soundToggle = document.getElementById("soundToggle");
    const soundIcon = document.getElementById("soundIcon");
    const soundText = document.getElementById("soundText");

    function createStars() {
      const container = document.getElementById("stars-container");
      const starCount = 65;

      for (let i = 0; i < starCount; i++) {
        const star = document.createElement("div");
        star.className = "star";

        const x = Math.random() < 0.5 ? (Math.random() * 26) : (74 + Math.random() * 25);
        const y = Math.random() * 88;

        const size = Math.random() > 0.8 ? 3.5 : (Math.random() > 0.4 ? 2.2 : 1.4);
        star.style.width = size + "px";
        star.style.height = size + "px";
        star.style.left = x + "vw";
        star.style.top = y + "vh";
        star.style.animationDuration = (2 + Math.random() * 4.5) + "s";
        star.style.animationDelay = (Math.random() * 3) + "s";

        container.appendChild(star);
      }
    }

    authData.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="cell-highlight">${item.name}</td>
        <td>${item.tech}</td>
        <td>${item.strategy}</td>
        <td>${item.analogyText}</td>
      `;
      tableBody.appendChild(tr);
    });

    authData.forEach((item, index) => {
      const btn = document.createElement("button");
      btn.className = "step-btn";
      btn.textContent = `${index + 1}. ${item.name}`;
      btn.onclick = () => selectItem(index);
      buttonsRow.appendChild(btn);
    });

    soundToggle.onclick = () => {
      isSoundOn = !isSoundOn;
      soundIcon.textContent = isSoundOn ? "🔊" : "🔇";
      soundText.textContent = isSoundOn ? "Sound: ON" : "Sound: OFF";

      if (!isSoundOn) {
        window.speechSynthesis.cancel();
      } else {
        speakCurrentItem();
      }
    };

    function speakCurrentItem() {
      if (!isSoundOn || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const item = authData[currentIndex];
      const textToSpeak = `${item.name}. ${item.tech} ${item.strategy}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    function updateMoon(index) {
      const angle = 30 + (index * ((150 - 30) / (authData.length - 1)));
      const rotationFromVertical = angle - 90;

      moonOrbit.style.transform = `rotate(${rotationFromVertical}deg)`;
      moonTextWrapper.style.transform = `rotate(${-rotationFromVertical}deg)`;
    }

    function selectItem(index) {
      currentIndex = index;
      const item = authData[currentIndex];

      moonText.textContent = item.analogyText;

      itemMechanism.textContent = `${index + 1}. ${item.name}`;
      itemTech.textContent = item.tech;
      itemStrategy.textContent = item.strategy;

      updateMoon(currentIndex);

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === authData.length - 1;

      const buttons = buttonsRow.querySelectorAll(".step-btn");
      buttons.forEach((btn, idx) => {
        btn.classList.toggle("active", idx === currentIndex);
      });

      speakCurrentItem();
    }

    prevBtn.onclick = () => {
      if (currentIndex > 0) selectItem(currentIndex - 1);
    };

    nextBtn.onclick = () => {
      if (currentIndex < authData.length - 1) selectItem(currentIndex + 1);
    };

    showTableBtn.onclick = () => {
      tableModal.style.display = "flex";
    };

    closeTableBtn.onclick = () => {
      tableModal.style.display = "none";
    };

    createStars();
    selectItem(0);
