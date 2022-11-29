"use strict";

import { moveMarker } from "./modules/clockmarker.js";
import Calendar from "color-calendar";
import "color-calendar/dist/css/theme-glass.css";

import { setInterval } from "worker-timers";
const apiKey = "PNWqQ8p6R5sWevhU4Hu0";
const url = "https://opendata.metropolia.fi/r1/reservation/search";
const proxy = "https://salty-ocean-03856.herokuapp.com/";

const roomsSelect = document.querySelector("#rooms");
const roomsForm = document.querySelector("#rooms-form");

const yesterdayButton = document.querySelector("#yesterday");
const tomorrowButton = document.querySelector("#tomorrow");
const todayButton = document.querySelector("#today");

const dayGrid = document.querySelector(".dayview-gridcell");
const updated = document.querySelector("#last-updated");
const updateButton = document.querySelector("#update");
let selectedRoom;

const date = new Date();

let selectedDay = date;
let first = true;
const queryString = document.location.search;
const urlParams = new URLSearchParams(queryString);
selectedRoom = urlParams.get("room");

//jos hausta yli viikko poistetaan se localstoragesta
const removeOldLocalStorage = () => {
  for (let i = 0; i < localStorage.length; i++) {
    if (
      localStorage.getItem(localStorage.key(i)).slice(2, 14) ==
        "reservations" &&
      new Date() -
        JSON.parse(localStorage.getItem(localStorage.key(i))).timestamp >
        604800000
    ) {
      localStorage.removeItem(localStorage.key(i));
    }
  }
};

const splitDate = (date) => {
  return date.toLocaleDateString("sv");
};
//hakee Karaportin kaikki huoneet
//jos edellisesti hausta yli viikko haetaan huoneet uudestaan
const getRooms = async () => {
  // ||
  //   new Date() - JSON.parse(localStorage.getItem("rooms")).timestamp > 604800000
  if (!localStorage.getItem("rooms")) {
    try {
      const response = await fetch(
        proxy + "https://opendata.metropolia.fi/r1/reservation/building/78025",
        {
          headers: {
            Authorization: "Basic " + btoa("PNWqQ8p6R5sWevhU4Hu0:"),
          },
        }
      );

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

//hakee päivän varaukset valitulle tilalle
const getReservations = async (date, room, refresh = false) => {
  date = splitDate(date);
  displayRoom(room);
  dayGrid.innerHTML = "";
  if (!localStorage.getItem(date + room) || refresh) {
    try {
      const response = await fetch(proxy + url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa("PNWqQ8p6R5sWevhU4Hu0:"),
        },
        body: `{\n   "startDate":"${date}T00:00",\n   "endDate":"${date}T23:59",\n   "room":["${room}"]\n}`,
      });
      const result = await response.json();
      const obj = {
        reservations: result.reservations,
        timestamp: new Date().getTime(),
      };
      const reservations = JSON.stringify(obj);
      dayGrid.innerHTML = "";
      for (const item of result.reservations) {
        localStorage.setItem(date + room, reservations);

        const cell = document.createElement("div");
        cell.classList.add("dayview-cell", "dayview-cell-extended");

        const converted = convertToGrid(item);
        cell.style.gridRow = `${converted.start} / ${converted.end}`;

        const cellTitle = document.createElement("div");
        cellTitle.classList.add("dayview-cell-title");
        cellTitle.innerHTML = item.subject;

        const cellTime = document.createElement("div");
        cellTime.classList.add("dayview-cell-time");
        const start = item.startDate.split("T")[1].slice(0, 5);
        const end = item.endDate.split("T")[1].slice(0, 5);
        cellTime.innerHTML = `${end} - ${start}`; // en tiiä miks tulee väärinpäin ?

        dayGrid.appendChild(cell);
        cell.appendChild(cellTime);
        cell.appendChild(cellTitle);
      }
      console.log("getReservations", result);
    } catch (error) {
      console.error(error);
    }
  } else {
    const result = JSON.parse(localStorage.getItem(date + room));
    dayGrid.innerHTML = "";
    for (const item of result.reservations) {
      const cell = document.createElement("div");
      cell.classList.add("dayview-cell", "dayview-cell-extended");

      const converted = convertToGrid(item);
      cell.style.gridRow = `${converted.start} / ${converted.end}`;

      const cellTitle = document.createElement("div");
      cellTitle.classList.add("dayview-cell-title");
      cellTitle.innerHTML = item.subject;

      const cellTime = document.createElement("div");
      cellTime.classList.add("dayview-cell-time");
      const start = item.startDate.split("T")[1].slice(0, 5);
      const end = item.endDate.split("T")[1].slice(0, 5);
      cellTime.innerHTML = `${end} - ${start}`; // en tiiä miks tulee väärinpäin ?

      dayGrid.appendChild(cell);
      cell.appendChild(cellTime);
      cell.appendChild(cellTitle);
    }
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
      );
      updated.innerHTML = timestamp;
    } catch (error) {}
  } else {
    updated.innerHTML = new Date();
  }
};

const check = () => {
  const newDate = new Date();
  if (newDate.getHours() == 0 && newDate.getMinutes() == 0) {
    displayDate(newDate);
    getReservations(newDate, selectedRoom);
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

roomsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (roomsSelect[roomsSelect.selectedIndex] != 0) {
    let room = roomsSelect[roomsSelect.selectedIndex].value;
    selectedRoom = room;
    console.log(room);
    dayGrid.innerHTML = "";
    getReservations(selectedDay, room);
  }
});

updateButton.onclick = () => {
  localStorage.removeItem(splitDate(selectedDay) + selectedRoom);
  getReservations(selectedDay, selectedRoom, true);
  renderTimestamp();
};

yesterdayButton.onclick = () => {
  const yesterday = new Date(selectedDay.setDate(selectedDay.getDate() - 1));
  selectedDay = yesterday;
  calendar.setDate(selectedDay);
  // getReservations(splitDate(yesterday), selectedRoom);
  displayDate(yesterday);
};
tomorrowButton.onclick = () => {
  const tomorrow = new Date(selectedDay.setDate(selectedDay.getDate() + 1));
  selectedDay = tomorrow;
  calendar.setDate(selectedDay);
  // getReservations(splitDate(tomorrow), selectedRoom);
  displayDate(tomorrow);
};
todayButton.onclick = () => {
  const today = new Date();
  selectedDay = today;
  calendar.setDate(selectedDay);
  // getReservations(splitDate(today), selectedRoom);
  displayDate(today);
};

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
    if (!first) {
      dayGrid.innerHTML = "";
      getReservations(currentDate, selectedRoom);
      removeOldLocalStorage();
      renderTimestamp();
    }
    first = false;
    selectedDay = currentDate;
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