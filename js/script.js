"use strict";

const apiKey = "PNWqQ8p6R5sWevhU4Hu0";
const url = "https://opendata.metropolia.fi/r1/reservation/search";
const proxy = "https://salty-ocean-03856.herokuapp.com/";

const roomsSelect = document.querySelector("#rooms");
const roomsForm = document.querySelector("#rooms-form");
const reservationsUl = document.querySelector("#reservations-ul");
const yesterdayButton = document.querySelector("#yesterday");
const tomorrowButton = document.querySelector("#tomorrow");
let selectedRoom;

const date = new Date();

let selectedDay = date;

const splitDate = (date) => {
  return date.toLocaleString("sv").split(" ")[0].replaceAll("/", "-");
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

const getReservations = async (date, room) => {
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
    const li = document.createElement("li");
    li.innerHTML = item.subject;
    reservationsUl.appendChild(li);
  }
  console.log("getReservations", result);
};

roomsForm.addEventListener("submit", (e) => {
  reservationsUl.innerHTML = "";
  e.preventDefault();
  let room = roomsSelect[roomsSelect.selectedIndex].value;
  selectedRoom = room;
  console.log(room);
  getReservations(splitDate(selectedDay), room);
});

yesterdayButton.onclick = () => {
  const yesterday = new Date(date.setDate(date.getDate() - 1));
  selectedDay = yesterday;

  reservationsUl.innerHTML = "";

  getReservations(splitDate(yesterday), selectedRoom);
  displayDate(yesterday);
};
tomorrowButton.onclick = () => {
  const tomorrow = new Date(date.setDate(date.getDate() + 1));
  selectedDay = tomorrow;

  reservationsUl.innerHTML = "";

  getReservations(splitDate(tomorrow), selectedRoom);
  displayDate(tomorrow);
};

const displayDate = (date) => {
  document.getElementById("today-date").innerHTML = "";
  const todayDate = date.toDateString();
  document.getElementById("today-date").innerHTML = todayDate;
};
displayDate(date);
getRooms();
