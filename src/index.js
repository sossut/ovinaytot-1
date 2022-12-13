"use strict";

import { moveMarker } from "./modules/clockmarker.js";
import Calendar from "color-calendar";
import "color-calendar/dist/css/theme-glass.css";

import { setInterval } from "worker-timers";
const apiKey = "PNWqQ8p6R5sWevhU4Hu0";
const url = "https://stream123.norwayeast.cloudapp.azure.com/";
// const proxy = "https://cors-anywhere.herokuapp.com/";

const roomsSelect = document.querySelector("#rooms");
const roomsForm = document.querySelector("#rooms-form");
const dropdownMenu = document.querySelector("#drop-menu");

const yesterdayButton = document.querySelector("#yesterday");
const tomorrowButton = document.querySelector("#tomorrow");
const todayButton = document.querySelector("#today");

const dayGrid = document.querySelector(".dayview-gridcell");
const updated = document.querySelector("#last-updated");
const updateButton = document.querySelector("#update");
const dispSwitch = document.querySelector("#switch-input");
const weekday = document.querySelector(".weekday");
let selectedRoom;

const date = new Date();

let selectedDay = date;
let first = true;
const queryString = document.location.search;
const urlParams = new URLSearchParams(queryString);
selectedRoom = urlParams.get("room");

//jos hausta yli viikko poistetaan se localstoragesta, jos se on vanhempi kuin
//meneillään oleva päivä
const removeOldLocalStorage = () => {
  for (let i = 0; i < localStorage.length; i++) {
    if (
      localStorage.getItem(localStorage.key(i)).slice(2, 14) == "reservations"
    ) {
      for (const item of JSON.parse(localStorage.getItem(localStorage.key(i)))
        .reservations) {
        if (
          new Date() -
            JSON.parse(localStorage.getItem(localStorage.key(i))).timestamp >
            604800000 &&
          new Date(item.endDate).getTime() < new Date().getTime()
        ) {
          localStorage.removeItem(localStorage.key(i));
        }
      }
    }
  }
};

const splitDate = (date) => {
  return date.toLocaleDateString("sv");
};

const renderWeekDays = () => {
  const weekday = document.querySelectorAll(".weekday");
  if (dispSwitch.checked) {
    dayGrid.innerHTML = `<div
                    class="weekday dayview-cell dayview-cell-extended"
                    id="mon"
                  >
                    <p>Ma</p>
                  </div>
                  <div
                    class="weekday dayview-cell dayview-cell-extended"
                    id="tue"
                  >
                    <p>Ti</p>
                  </div>
                  <div
                    class="weekday dayview-cell dayview-cell-extended"
                    id="wed"
                  >
                    <p>Ke</p>
                  </div>
                  <div
                    class="weekday dayview-cell dayview-cell-extended"
                    id="thu"
                  >
                    <p>To</p>
                  </div>
                  <div
                    class="weekday dayview-cell dayview-cell-extended"
                    id="fri"
                  >
                    <p>Pe</p>
                  </div>`;
  } else {
    dayGrid.innerHTML = "";
  }
};

//hakee Karaportin kaikki huoneet
//jos edellisesti hausta yli viikko haetaan huoneet uudestaan
const getRooms = async () => {
  // ||
  //   new Date() - JSON.parse(localStorage.getItem("rooms")).timestamp > 604800000
  if (!localStorage.getItem("rooms")) {
    try {
      const response = await fetch(url, {
        headers: {},
      });

      const result = await response.json();
      console.log("getRooms", result);
      const obj = { rooms: result.resources, timestamp: new Date().getTime() };
      const rooms = JSON.stringify(obj);
      localStorage.setItem("rooms", rooms);
      for (const item of result.resources) {
        const option = document.createElement("option");
        if (item.type === "room") {
          option.innerHTML = item.code;
          option.value = item.code;
          roomsSelect.appendChild(option);
        }
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    const result = JSON.parse(localStorage.getItem("rooms"));

    for (const item of result.rooms) {
      const option = document.createElement("option");
      if (item.type === "room") {
        option.innerHTML = item.code;
        option.value = item.code;
        roomsSelect.appendChild(option);
      }
    }
  }
};

const renderReservations = (item, column = null) => {
  const d = new Date();
  const cell = document.createElement("div");
  cell.classList.add("dayview-cell", "dayview-cell-extended");

  const converted = convertToGrid(item);
  cell.style.gridRow = `${converted.start} / ${converted.end}`;
  cell.style.gridColumn = column;

  if (
    splitDate(new Date(item.startDate)) === splitDate(d) &&
    dispSwitch.checked
  ) {
    console.log("moaaa");
    cell.style.backgroundColor = "#ff5000";
    cell.style.borderColor = "black";
  }
  const cellTitle = document.createElement("div");
  cellTitle.classList.add("dayview-cell-title");
  cellTitle.innerHTML = item.subject;

  const cellTime = document.createElement("div");
  cellTime.classList.add("dayview-cell-time");
  const start = item.startDate.split("T")[1].slice(0, 5);
  const end = item.endDate.split("T")[1].slice(0, 5);
  cellTime.innerHTML = `${start} - ${end}`;

  dayGrid.appendChild(cell);
  cell.appendChild(cellTime);
  cell.appendChild(cellTitle);
};

const createEmptyCell = (column) => {
  const cell = document.createElement("div");
  cell.classList.add("dayview-cell", "dayview-cell-extended");
  cell.style.gridRow = "1 / 901";
  cell.style.gridColumn = column;
  cell.style.visibility = "hidden";
  dayGrid.appendChild(cell);
};

//hakee päivän varaukset valitulle tilalle
const getReservations = async (date, room, refresh = false) => {
  dayGrid.style.gridTemplateColumns = "1fr";
  date = splitDate(date);
  displayRoom(room);
  renderWeekDays();

  if (!localStorage.getItem(date + room) || refresh) {
    try {
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      const response = await fetch(
        `${url}day?startDate=${date}&endDate=${date}&room=${room}`,
        fetchOptions
      );
      const result = await response.json();

      const obj = {
        reservations: result.reservations,
        timestamp: new Date().getTime(),
      };
      const reservations = JSON.stringify(obj);
      renderWeekDays();
      if (result.reservations.length > 0) {
        localStorage.setItem(date + room, reservations);
      }

      for (const item of result.reservations) {
        renderReservations(item, "");
      }
      console.log("getReservations", result);
    } catch (error) {
      console.error(error);
    }
  } else {
    const result = JSON.parse(localStorage.getItem(date + room));
    renderWeekDays();
    for (const item of result.reservations) {
      renderReservations(item);
    }
  }
};

const renderWeek = (array) => {
  const monday = [];
  const tuesday = [];
  const wednesday = [];
  const thursday = [];
  const friday = [];

  for (const item of array) {
    if (new Date(item.startDate).getDay() == 1) {
      renderReservations(item, "1");
      monday.push(item);
    }
    if (new Date(item.startDate).getDay() == 2) {
      renderReservations(item, "2");
      tuesday.push(item);
    }
    if (new Date(item.startDate).getDay() == 3) {
      renderReservations(item, "3");
      wednesday.push(item);
    }
    if (new Date(item.startDate).getDay() == 4) {
      renderReservations(item, "4");
      thursday.push(item);
    }
    if (new Date(item.startDate).getDay() == 5) {
      renderReservations(item, "5");
      friday.push(item);
    }
  }

  if (monday.length === 0) {
    createEmptyCell("1");
  }
  if (tuesday.length === 0) {
    createEmptyCell("2");
  }
  if (wednesday.length === 0) {
    createEmptyCell("3");
  }
  if (thursday.length === 0) {
    createEmptyCell("4");
  }
  if (friday.length === 0) {
    createEmptyCell("5");
  }
};

// hakee viikon varaukset kerrallaan, jos la tai su niin hakee seuraavan viikon varaukset
const getWeekReservations = async (date, room, refresh = false) => {
  console.log(date);
  let d = new Date(date);
  dayGrid.style.gridTemplateColumns = "1fr 1fr 1fr 1fr 1fr";
  renderWeekDays();
  while (d.getDay() != 1) {
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
      break;
    }
    if (d.getDay() === 6) {
      d.setDate(d.getDate() + 2);
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  const addDays = (date, days) => {
    const res = new Date(date);
    res.setDate(date.getDate() + days);
    return res;
  };
  const end = splitDate(addDays(d, +4));

  d = splitDate(d);
  if (!localStorage.getItem("week" + d + room) || refresh) {
    try {
      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      const response = await fetch(
        `${url}week?startDate=${date}&endDate=${end}&room=${room}`,
        fetchOptions
      );
      const result = await response.json();

      const obj = {
        reservations: result.reservations,
        timestamp: new Date().getTime(),
      };
      const reservations = JSON.stringify(obj);
      if (result.reservations.length > 0) {
        localStorage.setItem("week" + d + room, reservations);
      }
      renderWeekDays();
      renderWeek(result.reservations);
      console.log("getReservationsWeek", result);
    } catch (error) {
      console.error(error);
    }
  } else {
    const result = JSON.parse(
      localStorage.getItem("week" + d + room)
    ).reservations;
    renderWeekDays();
    renderWeek(result);
  }
};

const disable = (obj) => {
  obj.disabled = true;
  setTimeout(() => {
    obj.disabled = false;
  }, 500);
};

const renderTimestamp = () => {
  updated.innerHTML = "";

  if (localStorage.getItem(splitDate(selectedDay) + selectedRoom)) {
    try {
      const timestamp = new Date(
        JSON.parse(
          localStorage.getItem(splitDate(selectedDay) + selectedRoom)
        ).timestamp
      ).toLocaleString("fi-FI", { hour12: false });
      updated.innerHTML = timestamp;
    } catch (error) {}
  } else {
    updated.innerHTML = new Date().toLocaleString("fi-FI", { hour12: false });
  }
};

const check = () => {
  const newDate = new Date();
  if (newDate.getHours() == 0 && newDate.getMinutes() == 0) {
    displayDate(newDate);

    if (!dispSwitch.checked) {
      getReservations(newDate, selectedRoom);
    } else {
      getWeekReservations(newDate, selectedRoom);
    }
    calendar.setDate(newDate);
  }
};

const convertToGrid = (item) => {
  const startHours = parseInt(item.startDate.split("T")[1].slice(0, 2));
  const startMinutes = parseInt(item.startDate.split("T")[1].slice(3, 5));
  const endHours = parseInt(item.endDate.split("T")[1].slice(0, 2));
  const endMinutes = parseInt(item.endDate.split("T")[1].slice(3, 5));
  const start = (startHours - 7 + startMinutes / 60) * 60 + 1;
  const end = (endHours - 7 + endMinutes / 60) * 60 + 1;

  return { start, end };
};

dropdownMenu.addEventListener("change", () => {
  if (roomsSelect[roomsSelect.selectedIndex] != 0) {
    let room = roomsSelect[roomsSelect.selectedIndex].value;
    selectedRoom = room;
    console.log(room);
    // dayGrid.innerHTML = "";
    if (!dispSwitch.checked) {
      getReservations(selectedDay, room);
    } else {
      getWeekReservations(selectedDay, room);
    }
  }
});

updateButton.onclick = () => {
  localStorage.removeItem(splitDate(selectedDay) + selectedRoom);

  if (!dispSwitch.checked) {
    getReservations(selectedDay, selectedRoom, true);
  } else {
    getWeekReservations(selectedDay, selectedRoom, true);
  }
  renderTimestamp();
};

yesterdayButton.onclick = () => {
  if (!dispSwitch.checked) {
    const yesterday = new Date(selectedDay.setDate(selectedDay.getDate() - 1));
    selectedDay = yesterday;
    calendar.setDate(selectedDay);
    // getReservations(splitDate(tomorrow), selectedRoom);
    displayDate(yesterday);
  } else {
    const yesterday = new Date(selectedDay.setDate(selectedDay.getDate() - 7));

    selectedDay = yesterday;
    calendar.setDate(selectedDay);
    // getReservations(splitDate(tomorrow), selectedRoom);
    displayDate(yesterday);
  }
};
tomorrowButton.onclick = () => {
  if (!dispSwitch.checked) {
    const tomorrow = new Date(selectedDay.setDate(selectedDay.getDate() + 1));
    selectedDay = tomorrow;
    calendar.setDate(selectedDay);
    // getReservations(splitDate(tomorrow), selectedRoom);
    displayDate(tomorrow);
  } else {
    const tomorrow = new Date(selectedDay.setDate(selectedDay.getDate() + 7));

    selectedDay = tomorrow;
    calendar.setDate(selectedDay);
    // getReservations(splitDate(tomorrow), selectedRoom);
    displayDate(tomorrow);
  }
};
todayButton.onclick = () => {
  const today = new Date();
  selectedDay = today;
  calendar.setDate(selectedDay);
  // getReservations(splitDate(today), selectedRoom);
  displayDate(today);
};
dispSwitch.addEventListener("change", (e) => {
  if (dispSwitch.checked) {
    getWeekReservations(selectedDay, selectedRoom);
    weekday.style.display = "flex";
  } else {
    getReservations(selectedDay, selectedRoom);
    weekday.style.display = "none";
  }
});

const displayDate = (date) => {
  document.getElementById("today-date").innerHTML = "";
  const todayDate = date.toDateString();
  document.getElementById("today-date").innerHTML = todayDate;
};
const displayRoom = (room) => {
  document.querySelector("#room").innerHTML = "";
  document.querySelector("#room").innerHTML = room;
};

let calendar = new Calendar({
  id: "#color-calendar",
  primaryColor: "#6670bf",
  theme: "glass",
  border: "5px solid #6670bf",
  weekdayType: "long-upper",
  monthDisplayType: "long",
  headerColor: "white",
  headerBackgroundColor: "#6670bf",
  calendarSize: "small",
  layoutModifiers: ["month-left-align"],

  dateChanged: (currentDate) => {
    displayDate(currentDate);
    selectedDay = currentDate;
    if (!first) {
      // dayGrid.innerHTML = "";
      if (!dispSwitch.checked) {
        getReservations(selectedDay, selectedRoom);
      } else {
        getWeekReservations(selectedDay, selectedRoom);
      }
      removeOldLocalStorage();
      renderTimestamp();
    }
    first = false;
  },
  monthChanged: (currentDate) => {},
});

const hideCalendar = document.getElementById("color-calendar");
const hideButton = document.getElementById("toggle-calendar");
document.getElementById("toggle-calendar").innerHTML =
  "Näytä/Piilota kalenteri";
hideButton.onclick = () => {
  if (hideCalendar.style.display !== "none") {
    hideCalendar.style.display = "none";
  } else {
    hideCalendar.style.display = "block";
  }
};
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then((registration) => {
//         console.log("SW registered: ", registration);
//       })
//       .catch((registrationError) => {
//         console.log("SW registration failed: ", registrationError);
//       });
//   });
// }

displayDate(date);
displayRoom(selectedRoom);
getRooms();
getReservations(date, selectedRoom);
setInterval(moveMarker, 1000);
setInterval(check, 1000);
removeOldLocalStorage();
renderTimestamp();
// getWeekReservations(selectedDay, selectedRoom);
