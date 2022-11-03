"use strict";

const apiKey = "PNWqQ8p6R5sWevhU4Hu0";
const url = "https://opendata.metropolia.fi/r1/reservation/search";
const proxy = "https://salty-ocean-03856.herokuapp.com/";

const test = async () => {
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
  console.log(result);
};
test();
