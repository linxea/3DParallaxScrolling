/**
 * Modified to my liking.
 *
 * Huge credit to Jarom Vogel's awesome tutorial
 * https://www.skillshare.com/classes/Art-Code-Create-and-Code-an-Interactive-Parallax-Illustration/1862124549/projects
 */

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

function getImageElement(url) {
  const image = new Image();
  image.src = url;
  return image;
}

const CANVAS_LAYERS = [
  {
    image: getImageElement("./img/layer_1_planet.png"),
    z_index: -3.5,
    blend: "normal",
    opacity: 1
  },
  {
    image: getImageElement("./img/layer_2_rocket.png"),
    z_index: -2,
    blend: "normal",
    opacity: 1
  },
  {
    image: getImageElement("./img/layer_3_stripe.png"),
    z_index: -2.5,
    blend: "normal",
    opacity: 0.6
  },
  {
    image: getImageElement("./img/layer_4_monster_shadow.png"),
    z_index: -1.5,
    blend: "multiply",
    opacity: 0.75
  },
  {
    image: getImageElement("./img/layer_5_planet2.png"),
    z_index: -1.2,
    blend: "normal",
    opacity: 1
  },
  {
    image: getImageElement("./img/layer_6_monster.png"),
    z_index: -1,
    blend: "normal",
    opacity: 1
  },
  {
    image: getImageElement("./img/layer_7_monster_cheeks.png"),
    z_index: -0.8,
    blend: "normal",
    opacity: 1
  },
  {
    image: getImageElement("./img/layer_8_monster_hands.png"),
    z_index: -0.3,
    blend: "normal",
    opacity: 1
  },
  {
    image: getImageElement("./img/layer_9_mask.png"),
    z_index: 0,
    blend: "normal",
    opacity: 1
  },
  {
    image: getImageElement("./img/layer_10_float.png"),
    z_index: 1.5,
    blend: "normal",
    opacity: 1
  }
];

// Draw canvas only after all the canvas layer images have been loaded
let countImages = 0;
CANVAS_LAYERS.forEach(layer => {
  layer.image.onload = () => {
    if (countImages === CANVAS_LAYERS.length - 1) {
      requestAnimationFrame(drawCanvas);
    }
    ++countImages;
  };
});

function drawCanvas() {
  // Erase everything currently on the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // This is needed for the animation to snap back to center when you release mouse or touch
  TWEEN.update();

  // Calculate how much the canvas should be rotated
  const rotate_x = pointer.y * -0.15 + motion.y * 1.2;
  const rotate_y = pointer.x * 0.15 + motion.x * 1.2;

  // Actually rotate the canvas
  canvas.style.transform = `rotateX(${rotate_x}deg) rotateY(${rotate_y}deg)`;

  // Add background color
  const blackColor = "rgb(32,32,32)";
  context.fillStyle = blackColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Loop through each layer in the list and draw it to the canvas
  CANVAS_LAYERS.forEach(layer => {
    layer.position = getOffset(layer.z_index);
    context.globalCompositeOperation = layer.blend;
    context.globalAlpha = layer.opacity;
    context.drawImage(layer.image, layer.position.x, layer.position.y);
  });

  // Loop this function! requestAnimationFrame is a special built in function that can draw to the canvas at 60 frames per second
  // NOTE: do not call drawCanvas() without using requestAnimationFrame here—things will crash!
  requestAnimationFrame(drawCanvas);
}

// Function to calculate layer offset
function getOffset(z_index) {
  // Calculate the amount you want the layers to move based on touch or mouse input.
  // You can play with the touch_multiplier variable here. Depending on the size of your canvas you may want to turn it up or down.
  const touch_multiplier = 0.35;
  const touch_offset_x = pointer.x * z_index * touch_multiplier;
  const touch_offset_y = pointer.y * z_index * touch_multiplier;

  // Calculate the amount you want the layers to move based on the gyroscope
  // You can play with the motion_multiplier variable here. Depending on the size of your canvas you may want to turn it up or down.
  const motion_multiplier = 2.5;
  const motion_offset_x = motion.x * z_index * motion_multiplier;
  const motion_offset_y = motion.y * z_index * motion_multiplier;

  // Calculate the total offset for both X and Y
  // Total offset is a combination of touch and motion
  const offset = {
    x: touch_offset_x + motion_offset_x,
    y: touch_offset_y + motion_offset_y
  };

  // Return the calculated offset to whatever requested it.
  return offset;
}

//// TOUCH AND MOUSE CONTROLS ////

// Initialize variables for touch and mouse-based parallax

// This is a variable we're using to only move things when you're touching the screen, or holding the mouse button down.
let moving = false;

// Initialize touch and mouse position
const pointer_initial = {
  x: 0,
  y: 0
};
const pointer = {
  x: 0,
  y: 0
};

// This one listens for when you start touching the canvas element
canvas.addEventListener("touchstart", pointerStart);
// This one listens for when you start clicking on the canvas (when you press the mouse button down)
canvas.addEventListener("mousedown", pointerStart);

// Runs when touch or mouse click starts
function pointerStart(event) {
  // Ok, you touched the screen or clicked, now things can move until you stop doing that
  moving = true;
  // Check if this is a touch event
  if (event.type === "touchstart") {
    // set initial touch position to the coordinates where you first touched the screen
    pointer_initial.x = event.touches[0].clientX;
    pointer_initial.y = event.touches[0].clientY;
    // Check if this is a mouse click event
  } else if (event.type === "mousedown") {
    // set initial mouse position to the coordinates where you first clicked
    pointer_initial.x = event.clientX;
    pointer_initial.y = event.clientY;
  }
}

// This runs whenever your finger moves anywhere in the browser window
window.addEventListener("mousemove", pointerMove);
// This runs whenever your mouse moves anywhere in the browser window
window.addEventListener("touchmove", pointerMove);

// Runs when touch or mouse is moved
function pointerMove(event) {
  // This is important to prevent scrolling the page instead of moving layers around
  event.preventDefault();
  // Only run this if touch or mouse click has started
  if (moving === true) {
    let current_x = 0;
    let current_y = 0;
    // Check if this is a touch event
    if (event.type === "touchmove") {
      // Current position of touch
      current_x = event.touches[0].clientX;
      current_y = event.touches[0].clientY;
      // Check if this is a mouse event
    } else if (event.type === "mousemove") {
      // Current position of mouse cursor
      current_x = event.clientX;
      current_y = event.clientY;
    }
    // Set pointer position to the difference between current position and initial position
    pointer.x = current_x - pointer_initial.x;
    pointer.y = current_y - pointer_initial.y;
  }
}

// Listen to any time you move your finger in the canvas element
canvas.addEventListener("touchmove", function(event) {
  // Don't scroll the screen
  event.preventDefault();
});
// Listen to any time you move your mouse in the canvas element
canvas.addEventListener("mousemove", function(event) {
  // Don't do whatever would normally happen when you click and drag
  event.preventDefault();
});

// Listen for when you stop touching the screen
window.addEventListener("touchend", function(event) {
  // Run the endGesture function (below)
  endGesture();
});
// Listen for when you release the mouse button anywhere on the screen
window.addEventListener("mouseup", function(event) {
  // Run the endGesture function (below)
  endGesture();
});

function endGesture() {
  // You aren't touching or clicking anymore, so set this back to false
  moving = false;

  // This removes any in progress tweens
  TWEEN.removeAll();
  // This starts the animation to reset the position of all layers when you stop moving them
  new TWEEN.Tween(pointer)
    .to({ x: 0, y: 0 }, 300)
    .easing(TWEEN.Easing.Back.Out)
    .start();
}

//// MOTION CONTROLS ////

// Initialize variables for motion-based parallax
const motion_initial = {
  x: null,
  y: null
};
const motion = {
  x: 0,
  y: 0
};

// This is where we listen to the gyroscope position
window.addEventListener("deviceorientation", function(event) {
  // If this is the first run through here, set the initial position of the gyroscope
  if (!motion_initial.x && !motion_initial.y) {
    motion_initial.x = event.beta;
    motion_initial.y = event.gamma;
  }

  // Depending on what orientation the device is in, you need to adjust what each gyroscope axis means
  // This can be a bit tricky
  if (window.orientation === 0) {
    // The device is right-side up in portrait orientation
    motion.x = event.gamma - motion_initial.y;
    motion.y = event.beta - motion_initial.x;
  } else if (window.orientation === 90) {
    // The device is in landscape laying on its left side
    motion.x = event.beta - motion_initial.x;
    motion.y = -event.gamma + motion_initial.y;
  } else if (window.orientation === -90) {
    // The device is in landscape laying on its right side
    motion.x = -event.beta + motion_initial.x;
    motion.y = event.gamma - motion_initial.y;
  } else {
    // The device is upside-down in portrait orientation
    motion.x = -event.gamma + motion_initial.y;
    motion.y = -event.beta + motion_initial.x;
  }

  // This is optional, but prevents things from moving too far (because these are 2d images it can look broken)
  const max_offset = 23;

  // Check if magnitude of motion offset along X axis is greater than your max setting
  if (Math.abs(motion.x) > max_offset) {
    // Check whether offset is positive or negative, and make sure to keep it that way
    if (motion.x < 0) {
      motion.x = -max_offset;
    } else {
      motion.x = max_offset;
    }
  }
  // Check if magnitude of motion offset along Y axis is greater than your max setting
  if (Math.abs(motion.y) > max_offset) {
    // Check whether offset is positive or negative, and make sure to keep it that way
    if (motion.y < 0) {
      motion.y = -max_offset;
    } else {
      motion.y = max_offset;
    }
  }
});

// Reset the position of motion controls when device changes between portrait and landscape, etc.
window.addEventListener("orientationchange", function(event) {
  motion_initial.x = 0;
  motion_initial.y = 0;
});
