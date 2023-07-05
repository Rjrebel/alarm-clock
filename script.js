const time = document.getElementById("time");
const setAlarm = document.getElementById("setAlarm");
const formHours = document.getElementById("hours");
const formHoursEdit = document.getElementById("hours-edit");
const formMinutes = document.getElementById("minutes");
const formMinutesEdit = document.getElementById("minutes-edit");
const formSeconds = document.getElementById("seconds");
const formSecondsEdit = document.getElementById("seconds-edit");
const list = document.getElementById("list");
const confirmAlarm = document.getElementById("confirmAlarm");
let alarmArray = [];
let alarmIds = [];
const formTimeSelect = document.getElementById("time-select");
const formTimeSelectEdit = document.getElementById("time-select-edit");
const alarmsHeading = document.getElementById("alarms-heading");
const editAlarmBtn = document.getElementById("edit-alarm-button");
let alarmEditId = 0;
let alarmTone = new Audio("alarm_tone.mp3");

// Setting heading for Alarm List
alarmsHeading.textContent = "No Alarms Set";

// Saving and Updating AlarmArray and AlarmIDArray in LocalStorage
const updateAndSaveAlarms = (alarmArray, alarmIds) => {
  localStorage.setItem("alarmArray", JSON.stringify(alarmArray));
  localStorage.setItem("alarmIds", JSON.stringify(alarmIds));
};

// Retrieving Alarms from LocalStorage
const getAlarms = () => {
  let alarmArrayLS = JSON.parse(localStorage.getItem("alarmArray"));
  let alarmIdsLS = JSON.parse(localStorage.getItem("alarmIds"));

  return {
    alarmArrayLS,
    alarmIdsLS,
  };
};

// Rendering the list of Alarms
const renderAlarms = () => {
  const alarms = getAlarms().alarmArrayLS;

  alarmsHeading.textContent = alarms.length == 0 ? "No Alarms Set" : "Alarms";
  list.innerHTML = "";
  for (alarm of alarms) {
    list.innerHTML += `<li id="list-item" class="${alarm.id}">
        <h5>${alarm.hours}:${alarm.minutes}:${alarm.seconds} ${alarm.amOrPm}</h5>
        <div id="icon-list">
          <i 
          data-bs-toggle="modal"
          data-bs-target="#alarmModalEdit"
          onClick="editAlarm(this)" 
          class="fa-regular fa-pen-to-square"></i>
          <i id="icon"
          onClick="deleteAlarm(this)" class="fa-solid fa-trash"></i>
        </div>
      </li>`;
  }
};

// Initial rendering of Saved Alarms
const loadAlarms = () => {
  const alarmObj = getAlarms();
  alarmArray = alarmObj.alarmArrayLS;
  alarmIds = alarmObj.alarmIdsLS;

  alarmArray = alarmArray == null ? [] : alarmArray;
  alarmIds = alarmIds == null ? [] : alarmIds;

  renderAlarms();
};

loadAlarms();

// Clock working and checking for if alarm goes off
setInterval(() => {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  const currTime = getTime(hours);

  var formattedTime =
    addLeadingZero(currTime.hours) +
    " : " +
    addLeadingZero(minutes) +
    " : " +
    addLeadingZero(seconds) +
    " " +
    currTime.amOrPm;

  time.textContent = formattedTime;

  const alarmId = hours + "" + minutes + "" + seconds;

  if (alarmIds.includes(alarmId)) {
    alarmTone.play();
    alert(
      "Alarm " + currTime.hours + ":" + minutes + ":" + seconds + " ringing!"
    );
    alarmTone.pause();
    alarmTone.currentTime = 0;

    // Deleting the Alarm after It goes off
    // const newAlarms = alarmArray.filter((item) => {
    //   return item.id != alarmId;
    // });
    // alarmArray = newAlarms;

    // const newAlarmsIds = alarmIds.filter((item) => {
    //   return item != alarmId;
    // });
    // alarmIds = newAlarmsIds;

    // updateAndSaveAlarms(newAlarms,newAlarmsIds);

    // renderAlarms();
  }
}, 1000);

// Setting Alarm
setAlarm.addEventListener("click", () => {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  formHours.value = getTime(hours).hours;
  formMinutes.value = minutes;
  formSeconds.value = seconds;
  formTimeSelect.value = getTime(hours).amOrPm;
});

// Adding leading zero if value is less than 10
const addLeadingZero = (value) => {
  return value < 10 ? "0" + value : value;
};

//  confirming Alarming
confirmAlarm.addEventListener("click", () => {
  const isValid = validateForm(
    formHours.value,
    formMinutes.value,
    formSeconds.value
  );
  if (isValid) {
    const hoursIn24 = getTimein24(formHours.value, formTimeSelect.value);
    const alarmId = hoursIn24 + "" + formMinutes.value + "" + formSeconds.value;

    const alarm = {
      id: alarmId,
      hours: addLeadingZero(formHours.value),
      minutes: addLeadingZero(formMinutes.value),
      seconds: addLeadingZero(formSeconds.value),
      amOrPm: formTimeSelect.value,
    };

    alarmArray.push(alarm);
    alarmIds.push(alarmId);

    updateAndSaveAlarms(alarmArray, alarmIds);

    renderAlarms();
  }
});

// Validating Alarm Form
const validateForm = (hours, minutes, seconds) => {
  if (hours == "" || minutes == "" || seconds == "") {
    alert("Please fill in all fields.");
    return false;
  }

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    alert("Please enter numeric values.");
    return false;
  }

  hours = parseInt(hours);
  minutes = parseInt(minutes);
  seconds = parseInt(seconds);

  if (hours < 0 || hours > 12) {
    alert("Hours must be between 0 and 12.");
    return false;
  }

  if (minutes < 0 || minutes > 60) {
    alert("Minutes must be between 0 and 60.");
    return false;
  }

  if (seconds < 0 || seconds > 60) {
    alert("Seconds must be between 0 and 60.");
    return false;
  }

  return true;
};

// Editing the Alarm
const editAlarm = (e) => {
  const id = e.parentElement.parentElement.className;

  let alarm;

  for (i of alarmArray) {
    if (i.id == id) {
      alarm = i;
      break;
    }
  }

  formHoursEdit.value = alarm.hours;
  formMinutesEdit.value = alarm.minutes;
  formSecondsEdit.value = alarm.seconds;
  formTimeSelectEdit.value = alarm.amOrPm;

  alarmEditId = id;
};

// Confirm editing the alarm
editAlarmBtn.addEventListener("click", () => {
  deleteAlarmById(alarmEditId);
  alarmEditId = 0;

  let h = parseInt(formHoursEdit.value);
  let m = parseInt(formMinutesEdit.value);
  let s = parseInt(formSecondsEdit.value);
  let apm = formTimeSelectEdit.value;

  const isValid = validateForm(h, m, s);
  if (isValid) {
    const hoursIn24 = getTimein24(h, apm);
    const alarmId = hoursIn24 + "" + m + "" + s;

    const alarm = {
      id: alarmId,
      hours: addLeadingZero(h),
      minutes: addLeadingZero(m),
      seconds: addLeadingZero(s),
      amOrPm: apm,
    };

    alarmArray.push(alarm);
    alarmIds.push(alarmId);

    updateAndSaveAlarms(alarmArray, alarmIds);

    renderAlarms();
  }
});

// Deleting the Alarm
const deleteAlarm = (e) => {
  const id = e.parentElement.parentElement.className;

  deleteAlarmById(id);
};

// Deleting the alarm by id
const deleteAlarmById = (id) => {
  const newAlarms = alarmArray.filter((item) => {
    return item.id != id;
  });
  alarmArray = newAlarms;

  const newAlarmsIds = alarmIds.filter((item) => {
    return item != id;
  });
  alarmIds = newAlarmsIds;

  updateAndSaveAlarms(alarmArray, alarmIds);

  renderAlarms();
};

// Getting hours in 12 Hr Zone
const getTime = (hours) => {
  let amOrPm = "AM";
  if (hours >= 12) {
    hours = hours == 12 ? 12 : hours - 12;
    amOrPm = "PM";
  }

  return {
    amOrPm,
    hours,
  };
};

// Getting Hours in 24 Hr Zone
const getTimein24 = (hours, amOrPm) => {
  if (amOrPm == "AM") {
    if (hours == 12) {
      return 0;
    }
    return hours;
  } else if (amOrPm == "PM" && hours == 12) {
    return hours;
  } else {
    return parseInt(hours) + 12;
  }
};
