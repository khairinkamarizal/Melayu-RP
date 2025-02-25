console.log("✅✅✅✅ Script loaded");

let isEnabled = false;
let autoMsgInterval = null;
let checkMentionInterval = null;
let autoMessage = ":vip";
let username = "Futility";
let duration = 60000;
let lastReplyTime = 0;
let mentionResponses = ["yes?"];
let specialResponses = ["thanks!"];

window.startAutoChat = function () {
  if (!autoMsgInterval) {
    autoMsgInterval = setInterval(() => sendChatMessage(autoMessage), duration);
    console.log("Auto Chat Enabled ✅");
  }
  if (!checkMentionInterval) {
    checkMentionInterval = setInterval(checkForMentions, 1000);
    console.log("Mention checking started 🔍");
  }
};

window.stopAutoChat = function () {
  if (autoMsgInterval) {
    clearInterval(autoMsgInterval);
    autoMsgInterval = null;
    console.log("Auto Chat Stopped ❌");
  }
  if (checkMentionInterval) {
    clearInterval(checkMentionInterval);
    checkMentionInterval = null;
    console.log("Mention checking stopped ⛔");
  }
};

window.updateAutoChatSettings = function (settings) {
  console.log("Received settings:", settings);

  if (settings) {
    autoMessage = settings.message || ":vip";
    username = settings.username || "Futility";
    duration = parseInt(settings.duration) || 1000;
    mentionResponses =
      settings.mentionResponses && settings.mentionResponses.length > 0
        ? settings.mentionResponses
        : ["yes?"];
  }

  if (autoMsgInterval) {
    clearInterval(autoMsgInterval);
    autoMsgInterval = setInterval(() => sendChatMessage(autoMessage), duration);
  }

  console.log(
    "Auto Chat Updated ✅ New Message:",
    autoMessage,
    "Duration:",
    duration
  );
};

function sendChatMessage(message) {
  let iframe = document.querySelector("iframe");
  if (!iframe) {
    console.log("Iframe not found");
    return;
  }

  let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
  if (!iframeDocument) {
    console.log("Iframe document not accessible");
    return;
  }

  let chatInput = iframeDocument.getElementById("cmd-chat");
  if (!chatInput) {
    console.log("Chat input not found in iframe");
    return;
  }

  chatInput.value = message;
  let event = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
  });
  chatInput.dispatchEvent(event);
  console.log(`Sent message: "${message}"`);
}

function checkForMentions() {
  let iframe = document.querySelector("iframe");
  if (!iframe) return;

  let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
  if (!iframeDocument) return;

  let messages = iframeDocument.querySelectorAll(".message");

  const blockedWords = ["hug", "kiss", "chai", "swings", "escorting", "places"];

  const specialWords = ["promotes", "wins", "gives"];

  messages.forEach((msg) => {
    let messageText = String(msg.textContent || "").toLowerCase();

    if (messageText.includes("••")) {
      let audio = new Audio("https://www.khairin.xyz/assets/alert.mp3");
      audio.play();
    }

    if (messageText.includes(username)) {
      let containsBlockedWord = blockedWords.some((word) =>
        messageText.includes(word)
      );

      let formattedBlocks = [`[GA][${username}]`, `[Chai][${username}]`];
      let containsFormattedBlock = formattedBlocks.some((block) =>
        messageText.includes(block)
      );

      let containsSpecialWord = specialWords.some((word) =>
        messageText.includes(word)
      );

      let now = Date.now();
      if (now - lastReplyTime > 60000) {
        if (containsSpecialWord) {
          let specialResponse =
            specialResponses[
              Math.floor(Math.random() * specialResponses.length)
            ];
          console.log(
            `Special mention detected, responding with "${specialResponse}" in 2s...`
          );
          setTimeout(() => {
            sendChatMessage(specialResponse);
          }, 2000);
        } else if (!containsBlockedWord && !containsFormattedBlock) {
          let randomResponse =
            mentionResponses[
              Math.floor(Math.random() * mentionResponses.length)
            ];
          console.log(
            `Mention detected, responding with "${randomResponse}" in 2s...`
          );
          setTimeout(() => {
            sendChatMessage(randomResponse);
          }, 2000);
        } else {
          console.log("Blocked mention detected, no response sent.");
        }
        lastReplyTime = now;
      }
    }
  });
}

window.addEventListener("message", (event) => {
  if (event.data && typeof event.data === "object") {
    console.log("Received settings update via postMessage:", event.data);
    window.updateAutoChatSettings(event.data);
  }
});
