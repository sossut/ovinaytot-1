"use strict";

const containerHeight = document.querySelector(
  ".dayview-gridcell-container"
).clientHeight;

const moveMarker = () => {
  const plusSecond = new Date();

  const hours = plusSecond.getHours();
  const minutes = plusSecond.getMinutes();

  if (hours < 7 || hours >= 22) {
    document.querySelector(".dayview-now-marker").style.top = -10 + "px";
  } else {
    document.querySelector(".dayview-now-marker").style.top =
      (containerHeight * (hours - 7 + minutes / 60)) / 15 + "px";
  }
};

export { moveMarker };
