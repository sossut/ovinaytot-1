"use strict";
const d = new Date();
const containerHeight = document.querySelector(
  ".dayview-gridcell-container"
).clientHeight;

const moveMarker = () => {
  const plusSecond = new Date(d.setSeconds(d.getSeconds() + 1));

  const hours = plusSecond.getHours();
  const minutes = plusSecond.getMinutes();

  if (hours < 7) {
    document.querySelector(".dayview-now-marker").style.top = 0 + "px";
  } else if (hours > 22) {
    document.querySelector(".dayview-now-marker").style.bottom = 1 + "px";
  } else {
    document.querySelector(".dayview-now-marker").style.top =
      (containerHeight * (hours - 7 + minutes / 60)) / 15 + "px";
  }
};

export { moveMarker };
