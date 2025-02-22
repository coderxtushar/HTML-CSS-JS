const submit = document.getElementById("submit-btn");
const simulation = document.getElementById("simulation");

let liftState = [];
let floorLiftCount = {}; // Keeps track of how many lifts are currently on each floor

submit.addEventListener("click", () => {
  const floors = parseInt(document.getElementById("floors").value);
  const lifts = parseInt(document.getElementById("lifts").value);

  if (isNaN(floors) || isNaN(lifts) || floors <= 0 || lifts <= 0) {
    alert("Please enter positive numbers for floors and lifts.");
    return;
  }

  simulation.innerHTML = "";
  liftState = Array.from({ length: lifts }, () => ({   
        currentFloor: 0,
    destinationQueue: [],
    busy: false,
  }));

  floorLiftCount = Array.from({ length: floors }, () => 0); // Initialize floorLiftCount

  for (let i = floors - 1; i >= 0; i--) {
    simulation.appendChild(createFloor(i, lifts));
  }
});

function createFloor(floor, lifts) {
  const floorDiv = document.createElement("div");
  floorDiv.className = "floor";

  const floorLabel = document.createElement("div");
  floorLabel.className = "floor-label";
  floorLabel.innerHTML = `Floor ${floor}`;
  floorDiv.appendChild(floorLabel);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  if (floor > 0) {
    const downButton = document.createElement("button");
    downButton.className = "buttons down";
    downButton.innerHTML = "DOWN";
    downButton.addEventListener("click", () =>
      handleButtonClick(floor, "DOWN")
    );
    buttonContainer.appendChild(downButton);
  }

  if (floor < parseInt(document.getElementById("floors").value - 1)) {
    const upButton = document.createElement("button");
    upButton.className = "buttons up";
    upButton.innerHTML = "UP";
    upButton.addEventListener("click", () =>
      handleButtonClick(floor, "UP")
    );
    buttonContainer.appendChild(upButton);
  }

  floorDiv.appendChild(buttonContainer);

  if (floor === 0) {
    const liftContainer = document.createElement("div");
    liftContainer.className = "lift-container";

    for (let j = 0; j < lifts; j++) {
      const liftDiv = document.createElement("div");
      liftDiv.className = "lift";
      liftDiv.id = `lift-${j}`;

      liftDiv.style.transform = `translateY(${floor * -100}px)`;

      const leftDoor = document.createElement("div");
      leftDoor.className = "doors left-door";

      const rightDoor = document.createElement("div");
      rightDoor.className = "doors right-door";

      liftDiv.appendChild(leftDoor);
      liftDiv.appendChild(rightDoor);

      liftContainer.appendChild(liftDiv);
    }

    floorDiv.appendChild(liftContainer);
  }

  return floorDiv;
}

function handleButtonClick(floor, direction) {
  if (floorLiftCount[floor] >= 2) {
    console.log(`Maximum lifts already heading to floor ${floor}. Call ignored.`);
    return;
  }

  let nearestLift = -1;
  let minDistance = Infinity;

  let allBusy = liftState.every((lift) => lift.busy);

  if (allBusy) {
    console.log("All lifts are busy. Call ignored.");
    return;
  }

  liftState.forEach((lift, index) => {
    const distance = Math.abs(lift.currentFloor - floor);
    if (distance < minDistance && !lift.busy) {
      minDistance = distance;
      nearestLift = index;
    }
  });

  if (nearestLift !== -1) {
    moveLift(nearestLift, floor);
  }
}

function moveLift(liftIndex, floor) {
  const lift = liftState[liftIndex];
  lift.busy = true;
  const liftDiv = document.getElementById(`lift-${liftIndex}`);
  const distance = Math.abs(lift.currentFloor - floor);
  const travelTime = distance * 2;

  lift.currentFloor = floor;
  liftDiv.style.transitionDuration = `${travelTime}s`;
  liftDiv.style.transform = `translateY(${floor * -100}px)`;

  floorLiftCount[floor]++;  // Increment the number of lifts currently on the floor
  
  setTimeout(() => {
    const leftDoor = liftDiv.querySelector(".left-door");
    const rightDoor = liftDiv.querySelector(".right-door");
    leftDoor.style.width = "0";
    rightDoor.style.width = "0";

    setTimeout(() => {
      leftDoor.style.width = "50%";
      rightDoor.style.width = "50%";

      lift.busy = false;
      floorLiftCount[floor]--;
    }, 2500);
  }, travelTime * 1000);
}
