// File Name: chat.js
// Petro AI Assistant - Premium V2 JS

/* =====================================================
   PETRO AI ASSISTANT CONFIG
===================================================== */

const CONFIG = {
    apiUrl: "chats.php",

    // Agar HTML me already welcome message hai to false rakho
    showWelcomeFromJS: false,

    welcomeMessage: `
👋 Welcome to Petro AI Assistant

I can help you with:
• Product Information
• Bathroom Accessories
• Hardware Products
• CPP Partnership
• Dealer Inquiry
• Distributor Inquiry
• Catalogue Support
• Pricing Support
    `,

    fallbackReply: "Sorry, I couldn't understand that.",
    errorReply: "Something went wrong. Please try again."
};


/* =====================================================
   DOM ELEMENTS
===================================================== */

const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");


/* =====================================================
   INIT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    if (!messagesContainer || !messageInput || !sendBtn) {
        console.error("Chat elements missing. Check HTML IDs.");
        return;
    }

    bindEvents();

    if (CONFIG.showWelcomeFromJS) {
        appendMessage("bot", CONFIG.welcomeMessage);
    }

    scrollBottom();

});


/* =====================================================
   EVENTS
===================================================== */

function bindEvents() {

    sendBtn.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }

    });

}


/* =====================================================
   SEND MESSAGE
===================================================== */

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;

    appendMessage("user", message);

    messageInput.value = "";
    setSendState(true);

    const loadingId = showLoading();

    try {

        const response = await fetch(CONFIG.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        const data = await response.json();

        removeLoading(loadingId);

        const aiReply =
            data?.choices?.[0]?.message?.content ||
            data?.reply ||
            data?.message ||
            CONFIG.fallbackReply;

        appendMessage("bot", aiReply);

    } catch (error) {

        removeLoading(loadingId);

        appendMessage("bot", CONFIG.errorReply);

        console.error("Petro AI Error:", error);

    } finally {

        setSendState(false);
        messageInput.focus();

    }

}


/* =====================================================
   APPEND MESSAGE - PREMIUM STRUCTURE
===================================================== */

function appendMessage(type, text) {

    const messageEl = document.createElement("div");
    messageEl.className = `message ${type}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = "message-avatar";

    if (type === "user") {
        avatarEl.innerHTML = `<i class="fas fa-user"></i>`;
    } else {
        avatarEl.innerHTML = `<i class="fas fa-robot"></i>`;
    }

    const bubbleEl = document.createElement("div");
    bubbleEl.className = "message-bubble";

    const metaEl = document.createElement("div");
    metaEl.className = "message-meta";

    if (type === "user") {
        metaEl.innerHTML = `
            <strong>You</strong>
            <span>${getCurrentTime()}</span>
        `;
    } else {
        metaEl.innerHTML = `
            <strong>Petro AI</strong>
            <span>${getCurrentTime()}</span>
        `;
    }

    const contentEl = document.createElement("div");
    contentEl.className = "message-content";
    contentEl.innerHTML = formatMessage(text);

    bubbleEl.appendChild(metaEl);
    bubbleEl.appendChild(contentEl);

    messageEl.appendChild(avatarEl);
    messageEl.appendChild(bubbleEl);

    messagesContainer.appendChild(messageEl);

    scrollBottom();

}


/* =====================================================
   FORMAT MESSAGE
   Fixes <br> showing as text
===================================================== */

function formatMessage(text) {

    let cleanText = String(text || "");

    // Important fix: API ya JS se aaye <br> ko real line break me convert karo
    cleanText = cleanText.replace(/<br\s*\/?>/gi, "\n");

    // Extra spacing clean
    cleanText = cleanText
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    // HTML escape for safety
    let safeText = escapeHtml(cleanText);

    // Markdown bold support: **text**
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // URLs ko smart buttons me convert karo
    safeText = convertLinksToButtons(safeText);

    // Lines ko paragraph / bullets me convert karo
    safeText = convertTextToHtml(safeText);

    return safeText;

}


/* =====================================================
   CONVERT TEXT TO HTML
===================================================== */

function convertTextToHtml(text) {

    const lines = text.split("\n");

    let html = "";
    let inList = false;

    lines.forEach(function (line) {

        const trimmed = line.trim();

        if (!trimmed) {

            if (inList) {
                html += "</ul>";
                inList = false;
            }

            return;

        }

        // Bullet line support: • item, - item, * item
        if (/^(•|-|\*)\s+/.test(trimmed)) {

            if (!inList) {
                html += "<ul>";
                inList = true;
            }

            const item = trimmed.replace(/^(•|-|\*)\s+/, "");
            html += `<li>${item}</li>`;

        } else {

            if (inList) {
                html += "</ul>";
                inList = false;
            }

            // Agar line link button hai to paragraph mat banao
            if (trimmed.includes("chat-link-btn")) {
                html += trimmed;
            } else {
                html += `<p>${trimmed}</p>`;
            }

        }

    });

    if (inList) {
        html += "</ul>";
    }

    return html;

}


/* =====================================================
   SMART LINK BUTTONS
===================================================== */

function convertLinksToButtons(text) {

    return text.replace(
        /(https?:\/\/[^\s<]+)/g,
        function (url) {

            let cleanUrl = url.replace(/[.,)]$/, "");
            let btnText = "Open Link";
            let icon = "fas fa-arrow-up-right-from-square";

            if (cleanUrl.includes("instagram.com")) {
                btnText = "Open Instagram";
                icon = "fab fa-instagram";
            } else if (cleanUrl.includes("facebook.com")) {
                btnText = "Open Facebook";
                icon = "fab fa-facebook";
            } else if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
                btnText = "Open YouTube";
                icon = "fab fa-youtube";
            } else if (cleanUrl.includes("wa.me") || cleanUrl.includes("whatsapp")) {
                btnText = "Open WhatsApp";
                icon = "fab fa-whatsapp";
            } else if (cleanUrl.includes("catalogue")) {
                btnText = "Open Catalogue";
                icon = "fas fa-book-open";
            } else if (cleanUrl.includes("contact")) {
                btnText = "Contact Petro";
                icon = "fas fa-phone";
            } else if (cleanUrl.includes("petro-channel-partner-program")) {
                btnText = "View CPP Program";
                icon = "fas fa-handshake";
            } else if (cleanUrl.includes("find-a-distributor")) {
                btnText = "Find Dealer";
                icon = "fas fa-location-dot";
            } else if (cleanUrl.includes("onlinepetro.com")) {
                btnText = "Open Petro Store";
                icon = "fas fa-cart-shopping";
            } else if (cleanUrl.includes("petroindustech.com")) {
                btnText = "Open Petro Website";
                icon = "fas fa-globe";
            }

            return `
                <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="chat-link-btn">
                    <i class="${icon}"></i>
                    ${btnText}
                </a>
            `;

        }
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   LOADING MESSAGE
===================================================== */

function showLoading() {

    const id = "loading-" + Date.now();

    const messageEl = document.createElement("div");
    messageEl.className = "message bot";
    messageEl.id = id;

    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>

        <div class="message-bubble">
            <div class="message-meta">
                <strong>Petro AI</strong>
                <span>Typing...</span>
            </div>

            <div class="message-content">
                <div class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(messageEl);

    scrollBottom();

    return id;

}


function removeLoading(id) {

    const element = document.getElementById(id);

    if (element) {
        element.remove();
    }

}


/* =====================================================
   SEND BUTTON STATE
===================================================== */

function setSendState(isLoading) {

    if (isLoading) {

        sendBtn.disabled = true;
        sendBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        messageInput.disabled = true;

    } else {

        sendBtn.disabled = false;
        sendBtn.innerHTML = `<i class="fas fa-paper-plane"></i>`;
        messageInput.disabled = false;

    }

}


/* =====================================================
   AUTO SCROLL
===================================================== */

function scrollBottom() {

    setTimeout(function () {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);

}


/* =====================================================
   TIME
===================================================== */

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


/* =====================================================
   QUICK ASK BUTTONS
===================================================== */

function quickAsk(text) {

    if (!messageInput || !text) return;

    messageInput.value = text;
    sendMessage();

}


/* =====================================================
   OPTIONAL: CLEAR CHAT FUNCTION
   Use anywhere: clearChat()
===================================================== */

function clearChat() {

    messagesContainer.innerHTML = "";

    if (CONFIG.showWelcomeFromJS) {
        appendMessage("bot", CONFIG.welcomeMessage);
    }

}


/* =====================================================
   OPTIONAL: DEMO QUESTIONS
   Use anywhere: quickAsk('your question')
===================================================== */

window.quickAsk = quickAsk;
window.clearChat = clearChat;