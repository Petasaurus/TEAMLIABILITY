
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};


// const TIME_LIMIT = 1500;
// let timePassed = 0;
// let timeLeft = TIME_LIMIT;
// let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;
// var timer_running = false;




document.getElementById("app").innerHTML = `
<div class="timer-container>
    <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining ${remainingPathColor}"
            d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
            "
        ></path>
        </g>
    </svg>
    </div>
</div>
`;


// // startTimer();

// function onTimesUp() {
//   clearInterval(timerInterval);
// }

// function startTimer() {
//     console.log('timer started');
//   timerInterval = setInterval(() => {
//     timePassed = timePassed += 1;
//     timeLeft = TIME_LIMIT - timePassed;
//     document.getElementById("base-timer-label").innerHTML = formatTime(
//       timeLeft
//     );
//     setCircleDasharray();
//     setRemainingPathColor(timeLeft);

//     if (timeLeft === 0) {
//       onTimesUp();
//     }
//   }, 1000);
//   return "ok";
// }

// function stopTimer() {
//     console.log('timer stopped');
//   clearInterval(timerInterval);
//   return "ok";
// }

// function formatTime(time) {
//   const minutes = Math.floor(time / 60);
//   let seconds = time % 60;

//   if (seconds < 10) {
//     seconds = `0${seconds}`;
//   }

//   return `${minutes}:${seconds}`;
// }

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}


const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};

let interval;

const buttonSound = new Audio('button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
    console.log('fuck');
buttonSound.play();
const { action } = mainButton.dataset;
if (action === 'start') {
    startTimer();
} else {
    stopTimer();
}
});

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}

function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro') timer.sessions++;

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');



    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        const circleDasharray = `
        ${((timer.remainingTime.total/timer.max.total)*283).toFixed(0)} 283`;
          document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
        setRemainingPathColor(timer.remainingTime);

        total = timer.remainingTime.total;
        if (total <= 0) {
        clearInterval(interval);

        switch (timer.mode) {
            case 'pomodoro':
            if (timer.sessions % timer.longBreakInterval === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
            break;
            default:
            switchMode('pomodoro');
        }

        if (Notification.permission === 'granted') {
            const text =
            timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
            new Notification(text);
        }

        document.querySelector(`[data-sound="${timer.mode}"]`).play();

        // startTimer();
        }
    }, 1000);
}

function stopTimer() {
clearInterval(interval);

mainButton.dataset.action = 'start';
mainButton.textContent = 'start';
mainButton.classList.remove('active');
}

function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    const text =
        timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
    document.title = `${minutes}:${seconds} — ${text}`;

  
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };
    timer.max = timer.remainingTime;

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document
    

    updateClock();
}

function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        if (
        Notification.permission !== 'granted' &&
        Notification.permission !== 'denied'
        ) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
            new Notification(
                'Awesome! You will be notified at the start of each session'
            );
            }
        });
        }
    }

    switchMode('pomodoro');
});