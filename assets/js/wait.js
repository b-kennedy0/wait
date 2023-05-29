const queueSection = document.getElementById("queue-section");
const meetingSection = document.getElementById("meeting-section");
const waitingListURL = "https://opensheet.elk.sh/1cg3rOzKUCB3tG3p0TERC1KhXAzYX55Kydg-JWmO9LhI/waitingList";
const inMeetingListURL = "https://opensheet.elk.sh/1cg3rOzKUCB3tG3p0TERC1KhXAzYX55Kydg-JWmO9LhI/inMeetingList";
const pollingInterval = 30000;
let waitingList = [];
let inMeetingList = [];

// Function to fetch the latest data from the Edge Config Store
function fetchData() {
  const edgeConfigStoreData = edgeConfig.get(); // Assuming you have access to the Edge Config Store data through the `edgeConfig` object

  const inMeetingData = edgeConfigStoreData.inMeetingData;
  const waitingData = edgeConfigStoreData.waitingListData;

  inMeetingList = inMeetingData;
  waitingList = waitingData;
  renderInMeeting();
  renderQueue();
}

// Function to display a message with an icon
function displayMessage(message, iconHTML, iconClass) {
  const popupContainer = document.createElement("div");
  popupContainer.id = "message-popup-container";

  const popupContent = document.createElement("div");
  popupContent.id = "message-popup-content";

  const icon = document.createElement("span");
  icon.innerHTML = iconHTML; // Use the provided HTML entity for the icon
  icon.classList.add(iconClass); // Add the CSS class for the specific icon color

  const messageText = document.createElement("p");
  messageText.textContent = message;
  popupContent.appendChild(messageText);

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", () => {
    popupContainer.remove();
  });
  popupContent.appendChild(icon);
  popupContent.appendChild(messageText);
  popupContent.appendChild(closeButton);
  popupContainer.appendChild(popupContent);
  document.body.appendChild(popupContainer);

  setTimeout(() => {
    popupContainer.remove();
  }, 3000);
}

// Display a confirmation message with a green tick
function displayConfirmationMessage(message) {
  const tickIconHTML = "&#10004;"; // HTML entity for a green tick
  const tickIconClass = "icon-green"; // CSS class for the green tick icon
  displayMessage(message, tickIconHTML, tickIconClass);
}

// Display an error message with a red cross
function displayErrorMessage(message) {
  const crossIconHTML = "&#10008;"; // HTML entity for a red cross
  const crossIconClass = "icon-red"; // CSS class for the red cross icon
  displayMessage(message, crossIconHTML, crossIconClass);
}

// Render waiting list
function renderQueue() {
  queueSection.innerHTML = "";
  waitingList.forEach((person) => {
    const card = createCard(
      person.ticketNumber,
      person.position,
      "queue-card",
      person.addedTime
    );
    queueSection.appendChild(card);
  });
}

// Render in-meeting list
function renderInMeeting() {
  meetingSection.innerHTML = "";
  inMeetingList.forEach((person) => {
    const card = createCard(person.ticketNumber, null, "meeting-card");
    meetingSection.appendChild(card);
  });
}

// Function to update the current time and date
function updateTime() {
  const now = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const currentDate = now.toLocaleDateString("en-US", options);

  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const pageTitle = document.getElementById("page-title");
  pageTitle.innerHTML = `${currentDate} -- ${currentTime}<br> Brad K - Appointment Waiting List`;
}

// Create card element
function createCard(ticketNumber, position, cardClass, addedTime) {
  const card = document.createElement("div");
  card.classList.add("card", cardClass);

  const ticketNumberElement = document.createElement("p");
  ticketNumberElement.textContent = `Ticket Number: ${ticketNumber}`;

  card.appendChild(ticketNumberElement);

  if (Number(position) === 1) {
    const next = document.createElement("p");
    next.textContent = "Up Next!";
    next.style.fontWeight = "bold";
    card.appendChild(next);

    card.classList.add("up-next");
  }

  if (position !== null) {
    const positionElement = document.createElement("p");
    positionElement.textContent = `Position: ${position}`;
    card.appendChild(positionElement);
  }

  if (cardClass === "queue-card") {
    const elapsedMinutes = Math.floor(
      (new Date() - Date.parse(addedTime)) / (1000 * 60)
    );
  
    const timeText = elapsedMinutes >= 0 ? "Waiting" : "Time until appointment";
  
    const minutes = Math.abs(elapsedMinutes);
  
    const elapsedMinutesElement = document.createElement("p");
    elapsedMinutesElement.textContent = `${timeText}: ${minutes} mins`;
    card.appendChild(elapsedMinutesElement);
  }

  return card;
}

document.addEventListener("DOMContentLoaded", function () {
  renderQueue();
  renderInMeeting();
});

updateTime();
setInterval(updateTime, 1000);

fetchData();
setInterval(fetchData, pollingInterval);

document.addEventListener("DOMContentLoaded", function () {
  const checkinForm = document.getElementById("checkin-form");
  const closeButton = document.getElementById("close-button");

  function showCheckinForm() {
    const checkinFormPopup = document.getElementById("checkin-form-popup");
    const checkinFormOverlay = document.getElementById("checkin-form-overlay");
    checkinFormPopup.style.display = "block";
    checkinFormOverlay.style.display = "block";
  }

  function hideCheckinForm() {
    const checkinFormPopup = document.getElementById("checkin-form-popup");
    const checkinFormOverlay = document.getElementById("checkin-form-overlay");
    checkinFormPopup.style.display = "none";
    checkinFormOverlay.style.display = "none";
  }

  closeButton.addEventListener("click", function () {
    hideCheckinForm();
  });

  checkinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const studentNumber = document.getElementById("student-number").value;

    if (studentNumber) {
      console.log("Checking in student with number:", studentNumber);
      document.getElementById("student-number").value = "";
      hideCheckinForm();
      sendStudentNumberToWebhook(studentNumber);
    }
  });

  function sendStudentNumberToWebhook(studentNumber) {
    const webhookURL =
      "https://hook.eu1.make.com/wxhmb96glgblw7xwbrngp4usei7acdbv?number=" +
      studentNumber;

    fetch(webhookURL, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Student number sent to webhook successfully.");
          displayConfirmationMessage("Check-in Successful");
          setTimeout(fetchData, 5000);
        } else {
          console.error("Failed to send student number to webhook.");
          displayErrorMessage("Error Checking-in");
        }
      })
      .catch((error) => {
        console.error("Error sending student number to webhook:", error);
        displayErrorMessage("Error Checking-in");
      });
  }

  const checkinButton = document.getElementById("checkin-button");
  checkinButton.addEventListener("click", function () {
    showCheckinForm();
  });
});

const nextButton = document.getElementById("next-button");

nextButton.addEventListener("click", function () {
  fetch("https://hook.eu1.make.com/g711q88jr1cjdyrfyl1g9vt3lmm65ri3", {
    method: "GET",
  })
  .then((response) => {
    if (response.ok) {
      console.log("Next student called successfully.");
      displayConfirmationMessage("Next Student Called");
      setTimeout(fetchData, 5000);
    } else {
      console.error("Failed to call next student.");
      displayErrorMessage("Error Calling Next Student", "error-cross-icon");
    }
  })
  .catch((error) => {
    console.error("Error calling next student:", error);
    displayErrorMessage("Error Calling Next Student", "error-cross-icon");
  });
});