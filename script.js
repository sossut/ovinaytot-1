"use strict";

const apiKey = "PNWqQ8p6R5sWevhU4Hu0";
const url = "https://opendata.metropolia.fi/r1/reservation/search";
const proxy = "https://salty-ocean-03856.herokuapp.com/";

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
};

const getReservations = async (startDate, endDate, room) => {
  //toi proxy on nyt oma mutta pitää harkita jaksaako väsää omalle servulle jossain kohtaa vai riittääkö toi heroku.
  const response = await fetch(proxy + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa("PNWqQ8p6R5sWevhU4Hu0:"),
    },
    body: '{\n   "startDate":"2022-10-02T09:00",\n   "endDate":"2022-11-09T15:00",\n   "room":["KMD557"]\n}',
  });
  const result = await response.json();

  for (let i = 0; i < result.reservations.length; i++) {
    console.table(result.reservations[i]);
  }
  console.log("getReservations", result);
};
getRooms();
getReservations();
