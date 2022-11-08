"use strict";

const apiKey = "PNWqQ8p6R5sWevhU4Hu0";
const url = "https://opendata.metropolia.fi/r1/reservation/search";
const proxy = "https://salty-ocean-03856.herokuapp.com/";

const roomsSelect = document.querySelector("#rooms");
const roomsForm = document.querySelector("#rooms-form");
const reservationsUl = document.querySelector("#reservations-ul");
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

const getReservations = (today, room) => {
  const date = new Date();
  today = date.toISOString().split("T")[0];

  roomsForm.addEventListener("submit", async (e) => {
    reservationsUl.innerHTML = "";
    e.preventDefault();
    room = roomsSelect[roomsSelect.selectedIndex].value;
    console.log(room);
    const response = await fetch(proxy + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa("PNWqQ8p6R5sWevhU4Hu0:"),
      },
      body: `{\n   "startDate":"${today}T00:00",\n   "endDate":"${today}T23:59",\n   "room":["${room}"]\n}`,
    });
    const result = await response.json();

    //   for (let i = 0; i < result.reservations.length; i++) {
    //     console.table(result.reservations[i]);
    //   }
    for (const item of result.reservations) {
      const li = document.createElement("li");

      li.innerHTML = item.subject;
      reservationsUl.appendChild(li);
    }
    console.log("getReservations", result);
  });
};
getRooms();
getReservations();
