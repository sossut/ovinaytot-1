"use strict";
const d = new Date();
const hours = d.getHours();
const minutes = d.getMinutes();
let markerSpot;

const containerHeight = document.querySelector(
  ".dayview-gridcell-container"
).clientHeight;
if (hours < 7 || hours > 22) {
  markerSpot = 0;
} else {
  markerSpot = (hours - 7 + minutes / 60) / 15;
}
console.log(containerHeight);
console.log(markerSpot);

if (hours < 7) {
  document.querySelector(".dayview-now-marker").style.top = 0 + "px";
} else if (hours > 22) {
  document.querySelector(".dayview-now-marker").style.bottom = 1 + "px";
} else {
  document.querySelector(".dayview-now-marker").style.top =
    containerHeight * markerSpot + "px";
}
