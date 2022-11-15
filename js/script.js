"use strict";

const apiKey = "PNWqQ8p6R5sWevhU4Hu0";
const url = "https://opendata.metropolia.fi/r1/reservation/search";
const proxy = "https://salty-ocean-03856.herokuapp.com/";

const roomsSelect = document.querySelector("#rooms");
const roomsForm = document.querySelector("#rooms-form");

const yesterdayButton = document.querySelector("#yesterday");
const tomorrowButton = document.querySelector("#tomorrow");
const todayButton = document.querySelector("#today");

const dayGrid = document.querySelector(".dayview-gridcell");

let selectedRoom;

const date = new Date();

let selectedDay = date;

const splitDate = (date) => {
  return date.toLocaleDateString("sv");
};
//hakee Karaportin kaikki huoneet
const getRooms = async () => {
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

  for (const item of result.resources) {
    const option = document.createElement("option");
    if (item.type === "room") {
      option.innerHTML = item.code;
      option.value = item.code;
      roomsSelect.appendChild(option);
    }
  }
};

//hakee päivän varaukset valitulle tilalle
const getReservations = async (date, room) => {
  dayGrid.innerHTML = "";
  const response = await fetch(proxy + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa("PNWqQ8p6R5sWevhU4Hu0:"),
    },
    body: `{\n   "startDate":"${date}T00:00",\n   "endDate":"${date}T23:59",\n   "room":["${room}"]\n}`,
  });
  const result = await response.json();

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
  console.log("getReservations", result);
};

const convertToGrid = (item) => {
  const startHours = parseInt(item.startDate.split("T")[1].slice(0, 2));
  const startMinutes = parseInt(item.startDate.split("T")[1].slice(3, 5));
  const endHours = parseInt(item.endDate.split("T")[1].slice(0, 2));
  const endMinutes = parseInt(item.endDate.split("T")[1].slice(3, 5));
  const start = (startHours - 7 + startMinutes / 60) * 60 + 1;
  const end = (endHours - 7 + endMinutes / 60) * 60 + 1;
  console.log(end);
  return { start, end };
};

roomsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (roomsSelect[roomsSelect.selectedIndex] != 0) {
    let room = roomsSelect[roomsSelect.selectedIndex].value;
    selectedRoom = room;
    console.log(room);
    getReservations(splitDate(selectedDay), room);
  }
});

yesterdayButton.onclick = () => {
  const yesterday = new Date(selectedDay.setDate(selectedDay.getDate() - 1));
  selectedDay = yesterday;

  getReservations(splitDate(yesterday), selectedRoom);
  displayDate(yesterday);
};
tomorrowButton.onclick = () => {
  const tomorrow = new Date(selectedDay.setDate(selectedDay.getDate() + 1));
  selectedDay = tomorrow;

  getReservations(splitDate(tomorrow), selectedRoom);
  displayDate(tomorrow);
};
todayButton.onclick = () => {
  const today = new Date();
  selectedDay = today;

  getReservations(splitDate(today), selectedRoom);
  displayDate(today);
};

const displayDate = (date) => {
  document.getElementById("today-date").innerHTML = "";
  const todayDate = date.toDateString();
  document.getElementById("today-date").innerHTML = todayDate;
};
displayDate(date);
getRooms();
