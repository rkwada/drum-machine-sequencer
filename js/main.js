let bpm = 120;
let beat = 0;
let playing = false;

const sequencer = document.querySelector(".sequencer");
const bpmInput = document.getElementById("bpm");
const bpmValue = document.querySelector(".bpm-value");
const playButton = document.getElementById("play");
const stopButton = document.getElementById("stop");

// Drum samples
const drums = {
    kick: new Tone.Player("audio/MPC_BD.WAV").toDestination(),
    snare: new Tone.Player("audio/MPC_SN.WAV").toDestination(),
    openhat: new Tone.Player("audio/MPC_HHOP.WAV").toDestination(),
    closehat: new Tone.Player("audio/MPC_HHCL.WAV").toDestination(),
    hitom: new Tone.Player("audio/MPC_TOM.WAV").toDestination(),
    lowtom: new Tone.Player("audio/MPC_LTOM.WAV").toDestination(),
    crash: new Tone.Player("audio/MPC_CRAS.WAV").toDestination(),
    ride: new Tone.Player("audio/MPC_RIDE.WAV").toDestination()
};

const drumSet = ["kick", "snare", "openhat", "closehat", "hitom", "lowtom", "crash", "ride"];

const drumLabels = ["Kick", "Snare", "Open Hat", "Closed Hat", "Hi Tom", "Low Tom", "Crash", "Ride"];

let rows = drumSet.map(noteName => Array.from({ length: 16 }, () => ({ noteName, active: false })));

// Indicator lights on top of sequencer
const indicatorRow = document.createElement("div");
indicatorRow.className = "indicator-row";
sequencer.appendChild(indicatorRow);

const indicators = Array.from({ length: 16 }, () => {
    const dot = document.createElement("div");
    dot.className = "indicator";
    indicatorRow.appendChild(dot);
    return dot;
});

// Looping 
Tone.Transport.scheduleRepeat(time => {
    indicators.forEach(ind => ind.classList.remove("live"));
    indicators[beat].classList.add("live");

    rows.forEach((row, i) => {
        const place = row[beat];
        if (place.active) {
            drums[place.noteName].start(time);
        }
    });
    beat = (beat + 1) % 16;
}, "16n");

// Note click handler
const noteClick = (rowIndex, noteIndex, button) => {
    const col = rows[rowIndex][noteIndex];
    col.active = !col.active;
    button.classList.toggle("active", col.active);
};

// Play and stop button handlers
const playClick = async () => {
    if (!playing) await Tone.start();
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.start();
    playing = true;
}

const stopClick = () => {
    Tone.Transport.stop();
    beat = 0;
    playing = false;
}

// Play and stop buttons
playButton.addEventListener("click", playClick);
stopButton.addEventListener("click", stopClick);

// Spacebar to play and stop
document.addEventListener("keydown", (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (!playing) {
            playClick();
        } else {
            stopClick();
        }
    }
});

// Bpm input handler
bpmInput.addEventListener("input", () => {
    bpm = +bpmInput.value;
    bpmValue.textContent = bpm;
    if (playing) Tone.Transport.bpm.value = bpm;
});

// Sequencer build
sequencer.innerHTML = "";
sequencer.prepend(indicatorRow);

rows.forEach((row, i) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "sequencer-row";

    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = drumLabels[i];
    rowDiv.appendChild(label);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "row-buttons";

    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range"; 
    volumeSlider.min = -60;
    volumeSlider.max = 1;
    volumeSlider.step = 1;
    volumeSlider.value = 12;
    volumeSlider.className = "volume-slider";
    volumeSlider.addEventListener("input", () => {
        drums[drumSet[i]].volume.value = +volumeSlider.value;
    });

    row.forEach((step, j) => {
        const button = document.createElement("button");
        button.className = "note";
        button.addEventListener("click", () => {
            step.active = !step.active;
            button.classList.toggle("active", step.active);
        });
        if (j % 4 === 0) button.classList.add("first-beat-bar");

        buttonsDiv.appendChild(button);
    });

    rowDiv.appendChild(buttonsDiv); 
    sequencer.appendChild(rowDiv);
    rowDiv.appendChild(volumeSlider);  
});

