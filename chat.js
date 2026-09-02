// File Name: chat.js
// Petro AI Assistant - Fixed Production Frontend

"use strict";

const CONFIG = {
    apiUrl: "chats.php",
    fallbackReply: "Sorry, I couldn't understand that. Please try again.",
    errorReply: "Petro AI is temporarily unavailable. Please try again or contact +91 8000007336.",
    requestTimeoutMs: 40000
};

const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const welcomeArea = document.getElementById("welcomeArea");

let isSending = false;

document.addEventListener("DOMContentLoaded", () => {
    if (!messagesContainer || !messageInput || !sendBtn) {
        console.error("Petro AI: required chat elements are missing.");
        return;
    }

    bindEvents();
    scrollBottom();
    messageInput.focus();
});

function bindEvents() {
    sendBtn.addEventListener("click", sendMessage);

    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    document.querySelectorAll("[data-question]").forEach((button) => {
        button.addEventListener("click", () => {
            quickAsk(button.dataset.question || "");
        });
    });
}

async function sendMessage() {
    if (isSending) return;

    const message = messageInput.value.trim();
    if (!message) return;

    isSending = true;
    hideWelcomeCards();

    appendMessage("user", message);
    messageInput.value = "";
    setSendState(true);

    const loadingId = showLoading();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);

    try {
        const response = await fetch(CONFIG.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ message }),
            signal: controller.signal,
            credentials: "same-origin"
        });

        let data = null;

        try {
            data = await response.json();
        } catch {
            throw new Error("Invalid JSON returned by server.");
        }

        if (!response.ok) {
            throw new Error(data?.choices?.[0]?.message?.content || `HTTP ${response.status}`);
        }

        const aiReply =
            data?.choices?.[0]?.message?.content ||
            data?.reply ||
            data?.message ||
            CONFIG.fallbackReply;

        removeLoading(loadingId);
        appendMessage("bot", aiReply);

    } catch (error) {
        removeLoading(loadingId);

        if (error?.name === "AbortError") {
            appendMessage("bot", "The request took too long. Please try again.");
        } else {
            appendMessage("bot", CONFIG.errorReply);
        }

        console.error("Petro AI Error:", error);

    } finally {
        clearTimeout(timeoutId);
        setSendState(false);
        isSending = false;
        messageInput.focus();
    }
}

function appendMessage(type, text) {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${type}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = "message-avatar";
    avatarEl.innerHTML = type === "user"
        ? `<i class="fas fa-user"></i>`
        : `<i class="fas fa-robot"></i>`;

    const bubbleEl = document.createElement("div");
    bubbleEl.className = "message-bubble";

    const metaEl = document.createElement("div");
    metaEl.className = "message-meta";
    metaEl.innerHTML = `
        <strong>${type === "user" ? "You" : "Petro AI"}</strong>
        <span>${getCurrentTime()}</span>
    `;

    const contentEl = document.createElement("div");
    contentEl.className = "message-content";
    contentEl.innerHTML = formatMessage(text);

    bubbleEl.append(metaEl, contentEl);
    messageEl.append(avatarEl, bubbleEl);
    messagesContainer.appendChild(messageEl);

    scrollBottom();
}

function formatMessage(text) {
    let cleanText = String(text ?? "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    let safeText = escapeHtml(cleanText);

    safeText = safeText.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safeText = convertLinksToButtons(safeText);

    return convertTextToHtml(safeText);
}

function convertTextToHtml(text) {
    const lines = text.split("\n");

    let html = "";
    let inList = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            if (inList) {
                html += "</ul>";
                inList = false;
            }
            continue;
        }

        if (/^(•|-|\*)\s+/.test(trimmed)) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }

            html += `<li>${trimmed.replace(/^(•|-|\*)\s+/, "")}</li>`;
            continue;
        }

        if (inList) {
            html += "</ul>";
            inList = false;
        }

        html += trimmed.includes("chat-link-btn")
            ? trimmed
            : `<p>${trimmed}</p>`;
    }

    if (inList) html += "</ul>";

    return html;
}

function convertLinksToButtons(text) {
    return text.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
        const trailing = url.match(/[.,)]$/)?.[0] || "";
        const cleanUrl = trailing ? url.slice(0, -1) : url;

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

        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="chat-link-btn"><i class="${icon}"></i>${btnText}</a>${trailing}`;
    });
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showLoading() {
    const id = `loading-${Date.now()}`;

    const messageEl = document.createElement("div");
    messageEl.className = "message bot";
    messageEl.id = id;
    messageEl.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-bubble">
            <div class="message-meta">
                <strong>Petro AI</strong>
                <span>Typing...</span>
            </div>
            <div class="message-content">
                <div class="typing" aria-label="Petro AI is typing">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    scrollBottom();

    return id;
}

function removeLoading(id) {
    document.getElementById(id)?.remove();
}

function setSendState(loading) {
    sendBtn.disabled = loading;
    messageInput.disabled = loading;

    sendBtn.innerHTML = loading
        ? `<i class="fas fa-spinner fa-spin"></i>`
        : `<i class="fas fa-paper-plane"></i>`;
}

function scrollBottom() {
    requestAnimationFrame(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: "smooth"
        });
    });
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function quickAsk(text) {
    if (!messageInput || !text || isSending) return;

    messageInput.value = text;
    sendMessage();
}

function hideWelcomeCards() {
    const grid = welcomeArea?.querySelector(".ai-help-grid");
    const hero = welcomeArea?.querySelector(".welcome-ai-card");

    if (grid) grid.remove();
    if (hero) hero.remove();
}

function clearChat() {
    const dynamicMessages = messagesContainer.querySelectorAll(":scope > .message");
    dynamicMessages.forEach((message, index) => {
        if (index > 0 || !welcomeArea?.contains(message)) {
            message.remove();
        }
    });
}

window.quickAsk = quickAsk;
window.clearChat = clearChat;
