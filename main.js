import './style.css'

//Aliases
const Application = PIXI.Application,
Container = PIXI.Container,
loader = PIXI.Loader.shared,
resources = PIXI.Loader.shared.resources,
TextureCache = PIXI.utils.TextureCache,
Sprite = PIXI.Sprite,
Rectangle = PIXI.Rectangle,
Graphics = PIXI.Graphics,
TextStyle = PIXI.TextStyle,
Text = PIXI.Text;

function bonusSound() {
  //D
  soundEffect(587.33, 0, 0.2, "square", 1, 0, 0);
  //A
  soundEffect(880, 0, 0.2, "square", 1, 0, 0.1);
  //High D
  soundEffect(1174.66, 0, 0.3, "square", 1, 0, 0.2);
}

// let type = "WebGL";
// if (!PIXI.utils.isWebGLSupported()) {
//   type = "canvas";
// }

// PIXI.utils.sayHello(type);

//Create a Pixi Application
const app = new Application({
width: 256,
height: 256,
antialias: true,
transparent: true,
resolution: 1
});

//change canvas size
// app.renderer.autoDensity = true;
// app.renderer.resize(800, 600);
//make canvas fill window and adjust automatically when resized
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.autoDensity = true;
app.resizeTo = window;

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//load images and create sprites from them
loader.add('images/sound-source.png').load(setup);

let state, sprite, roundBox, message;

function setup() {
sprite = new Sprite(resources['images/sound-source.png'].texture);
sprite.y = 96;
sprite.vx = 0;
sprite.vy = 0;
app.stage.addChild(sprite);

roundBox = new Graphics();
roundBox.lineStyle({ width: 4, color: 0xE36414, alpha: 1 });
roundBox.beginFill(0xFB8B24);
roundBox.drawRoundedRect(0, 0, 84, 36, 10);
roundBox.endFill();
roundBox.x = 800;
roundBox.y = 400;
app.stage.addChild(roundBox);

const style = new TextStyle({
  fontFamily: 'Secular One',
  fontSize: 96,
  fill: '0xFB8B24',
  dropShadow: true,
  dropShadowColor: '#222222',
  dropShadowBlur: 5,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 5
})

message = new Text('Intonation', style);
message.position.set(600, 20);
app.stage.addChild(message);

const left = keyboard(65),
  up = keyboard(87),
  right = keyboard(68),
  down = keyboard(83);

//Left arrow key `press` method
left.press = () => {
  //Change the sprite's velocity when the key is pressed
  sprite.vx = -5;
  sprite.vy = 0;
};

//Left arrow key `release` method
left.release = () => {
  //If the left arrow has been released, and the right arrow isn't down,
  //and the sprite isn't moving vertically:
  //Stop the sprite
  if (!right.isDown && sprite.vy === 0) {
    sprite.vx = 0;
  }
};

//Up
up.press = () => {
  sprite.vy = -5;
  sprite.vx = 0;
};
up.release = () => {
  if (!down.isDown && sprite.vx === 0) {
    sprite.vy = 0;
  }
};

//Right
right.press = () => {
  sprite.vx = 5;
  sprite.vy = 0;
};
right.release = () => {
  if (!left.isDown && sprite.vy === 0) {
    sprite.vx = 0;
  }
};

//Down
down.press = () => {
  sprite.vy = 5;
  sprite.vx = 0;
};
down.release = () => {
  if (!up.isDown && sprite.vx === 0) {
    sprite.vy = 0;
  }
};

state = play;

app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta) {
//update current game state
state(delta);
}

function play(delta) {

sprite.x += sprite.vx;
sprite.y += sprite.vy;

//check for collision
if (hitTestRectangle(sprite, roundBox)) {
  /* message.text = 'hit!'; */
  roundBox.tint = 0xff3300;
  bonusSound();
} else {
  /* message.text = 'no collision...'; */
  roundBox.tint = 0xccff99;
}

}

function keyboard(keyCode) {
const key = {};
key.code = keyCode;
key.isDown = false;
key.isUp = true;
key.press = undefined;
key.release = undefined;

key.downHandler = (event) => {
  if (event.keyCode === key.code) {
    if (key.isUp && key.press) {
      key.press();
    }
    key.isDown = true;
    key.isUp = false;
  }
  event.preventDefault();
};

key.upHandler = (event) => {
  if (event.keyCode === key.code) {
    if (key.isDown && key.release) {
      key.release();
    }
    key.isDown = false;
    key.isUp = true;
  }
  event.preventDefault();
};

//attach event listeners
window.addEventListener('keydown', key.downHandler.bind(key), false);
window.addEventListener('keyup', key.upHandler.bind(key), false);

//detach event listeners
// key.unsubscribe = () => {
//   window.removeEventListener('keydown', downListener);
//   window.removeEventListener('keyup', upListener);
// };a

return key;
}

function hitTestRectangle(r1, r2) {

//Define the variables we'll need to calculate
let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

//hit will determine whether there's a collision
hit = false;

//Find the center points of each sprite
r1.centerX = r1.x + r1.width / 2;
r1.centerY = r1.y + r1.height / 2;
r2.centerX = r2.x + r2.width / 2;
r2.centerY = r2.y + r2.height / 2;

//Find the half-widths and half-heights of each sprite
r1.halfWidth = r1.width / 2;
r1.halfHeight = r1.height / 2;
r2.halfWidth = r2.width / 2;
r2.halfHeight = r2.height / 2;

//Calculate the distance vector between the sprites
vx = r1.centerX - r2.centerX;
vy = r1.centerY - r2.centerY;

//Figure out the combined half-widths and half-heights
combinedHalfWidths = r1.halfWidth + r2.halfWidth;
combinedHalfHeights = r1.halfHeight + r2.halfHeight;

//Check for a collision on the x axis
if (Math.abs(vx) < combinedHalfWidths) {

  //A collision might be occurring. Check for a collision on the y axis
  if (Math.abs(vy) < combinedHalfHeights) {

    //There's definitely a collision happening
    hit = true;
  } else {

    //There's no collision on the y axis
    hit = false;
  }
} else {

  //There's no collision on the x axis
  hit = false;
}

//`hit` will be either `true` or `false`
return hit;
};

function soundEffect(
  frequencyValue,      //The sound's fequency pitch in Hertz
  attack,              //The time, in seconds, to fade the sound in
  decay,               //The time, in seconds, to fade the sound out
  type,                //waveform type: "sine", "triangle", "square", "sawtooth"
  volumeValue,         //The sound's maximum volume
  panValue,            //The speaker pan. left: -1, middle: 0, right: 1
  wait,                //The time, in seconds, to wait before playing the sound
  pitchBendAmount,     //The number of Hz in which to bend the sound's pitch down
  reverse,             //If `reverse` is true the pitch will bend up
  randomValue,         //A range, in Hz, within which to randomize the pitch
  dissonance,          //A value in Hz. It creates 2 dissonant frequencies above and below the target pitch
  echo,                //An array: [delayTimeInSeconds, feedbackTimeInSeconds, filterValueInHz]
  reverb,              //An array: [durationInSeconds, decayRateInSeconds, reverse]
  timeout              //A number, in seconds, which is the maximum duration for sound effects
) {

  var actx = new AudioContext();

  //Set the default values
  if (frequencyValue === undefined) frequencyValue = 200;
  if (attack === undefined) attack = 0;
  if (decay === undefined) decay = 1;
  if (type === undefined) type = "sine";
  if (volumeValue === undefined) volumeValue = 1;
  if (panValue === undefined) panValue = 0;
  if (wait === undefined) wait = 0;
  if (pitchBendAmount === undefined) pitchBendAmount = 0;
  if (reverse === undefined) reverse = false;
  if (randomValue === undefined) randomValue = 0;
  if (dissonance === undefined) dissonance = 0;
  if (echo === undefined) echo = undefined;
  if (reverb === undefined) reverb = undefined;
  if (timeout === undefined) timeout = undefined;

  //Create an oscillator, gain and pan nodes, and connect them
  //together to the destination
  var oscillator, volume, pan;
  oscillator = actx.createOscillator();
  volume = actx.createGain();
  if (!actx.createStereoPanner) {
    pan = actx.createPanner();
  } else {
    pan = actx.createStereoPanner();
  }
  oscillator.connect(volume);
  volume.connect(pan);
  pan.connect(actx.destination);

  //Set the supplied values
  volume.gain.value = volumeValue;
  if (!actx.createStereoPanner) {
    pan.setPosition(panValue, 0, 1 - Math.abs(panValue));
  } else {
    pan.pan.value = panValue;
  }
  oscillator.type = type;

  //Optionally randomize the pitch. If the `randomValue` is greater
  //than zero, a random pitch is selected that's within the range
  //specified by `frequencyValue`. The random pitch will be either
  //above or below the target frequency.
  var frequency;
  var randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  };
  if (randomValue > 0) {
    frequency = randomInt(
      frequencyValue - randomValue / 2,
      frequencyValue + randomValue / 2
    );
  } else {
    frequency = frequencyValue;
  }
  oscillator.frequency.value = frequency;

  //Apply effects
  if (attack > 0) fadeIn(volume);
  fadeOut(volume);
  if (pitchBendAmount > 0) pitchBend(oscillator);
  if (echo) addEcho(volume);
  if (reverb) addReverb(volume);
  if (dissonance > 0) addDissonance();

  //Play the sound
  play(oscillator);

  //The helper functions:

  function addReverb(volumeNode) {
    var convolver = actx.createConvolver();
    convolver.buffer = impulseResponse(reverb[0], reverb[1], reverb[2], actx);
    volumeNode.connect(convolver);
    convolver.connect(pan);
  }

  function addEcho(volumeNode) {

    //Create the nodes
    var feedback = actx.createGain(),
      delay = actx.createDelay(),
      filter = actx.createBiquadFilter();

    //Set their values (delay time, feedback time and filter frequency)
    delay.delayTime.value = echo[0];
    feedback.gain.value = echo[1];
    if (echo[2]) filter.frequency.value = echo[2];

    //Create the delay feedback loop, with
    //optional filtering
    delay.connect(feedback);
    if (echo[2]) {
      feedback.connect(filter);
      filter.connect(delay);
    } else {
      feedback.connect(delay);
    }

    //Connect the delay loop to the oscillator's volume
    //node, and then to the destination
    volumeNode.connect(delay);

    //Connect the delay loop to the main sound chain's
    //pan node, so that the echo effect is directed to
    //the correct speaker
    delay.connect(pan);
  }

  //The `fadeIn` function
  function fadeIn(volumeNode) {

    //Set the volume to 0 so that you can fade
    //in from silence
    volumeNode.gain.value = 0;

    volumeNode.gain.linearRampToValueAtTime(
      0, actx.currentTime + wait
    );
    volumeNode.gain.linearRampToValueAtTime(
      volumeValue, actx.currentTime + wait + attack
    );
  }

  //The `fadeOut` function
  function fadeOut(volumeNode) {
    volumeNode.gain.linearRampToValueAtTime(
      volumeValue, actx.currentTime + attack + wait
    );
    volumeNode.gain.linearRampToValueAtTime(
      0, actx.currentTime + wait + attack + decay
    );
  }

  //The `pitchBend` function
  function pitchBend(oscillatorNode) {
    //If `reverse` is true, make the note drop in frequency. Useful for
    //shooting sounds

    //Get the frequency of the current oscillator
    var frequency = oscillatorNode.frequency.value;

    //If `reverse` is true, make the sound drop in pitch
    if (!reverse) {
      oscillatorNode.frequency.linearRampToValueAtTime(
        frequency,
        actx.currentTime + wait
      );
      oscillatorNode.frequency.linearRampToValueAtTime(
        frequency - pitchBendAmount,
        actx.currentTime + wait + attack + decay
      );
    }

    //If `reverse` is false, make the note rise in pitch. Useful for
    //jumping sounds
    else {
      oscillatorNode.frequency.linearRampToValueAtTime(
        frequency,
        actx.currentTime + wait
      );
      oscillatorNode.frequency.linearRampToValueAtTime(
        frequency + pitchBendAmount,
        actx.currentTime + wait + attack + decay
      );
    }
  }

  //The `addDissonance` function
  function addDissonance() {

    //Create two more oscillators and gain nodes
    var d1 = actx.createOscillator(),
      d2 = actx.createOscillator(),
      d1Volume = actx.createGain(),
      d2Volume = actx.createGain();

    //Set the volume to the `volumeValue`
    d1Volume.gain.value = volumeValue;
    d2Volume.gain.value = volumeValue;

    //Connect the oscillators to the gain and destination nodes
    d1.connect(d1Volume);
    d1Volume.connect(actx.destination);
    d2.connect(d2Volume);
    d2Volume.connect(actx.destination);

    //Set the waveform to "sawtooth" for a harsh effect
    d1.type = "sawtooth";
    d2.type = "sawtooth";

    //Make the two oscillators play at frequencies above and
    //below the main sound's frequency. Use whatever value was
    //supplied by the `dissonance` argument
    d1.frequency.value = frequency + dissonance;
    d2.frequency.value = frequency - dissonance;

    //Fade in/out, pitch bend and play the oscillators
    //to match the main sound
    if (attack > 0) {
      fadeIn(d1Volume);
      fadeIn(d2Volume);
    }
    if (decay > 0) {
      fadeOut(d1Volume);
      fadeOut(d2Volume);
    }
    if (pitchBendAmount > 0) {
      pitchBend(d1);
      pitchBend(d2);
    }
    if (echo) {
      addEcho(d1Volume);
      addEcho(d2Volume);
    }
    if (reverb) {
      addReverb(d1Volume);
      addReverb(d2Volume);
    }
    play(d1);
    play(d2);
  }

  //The `play` function
  function play(node) {
    node.start(actx.currentTime + wait);

    //Oscillators have to be stopped otherwise they accumulate in
    //memory and tax the CPU. They'll be stopped after a default
    //timeout of 2 seconds, which should be enough for most sound
    //effects. Override this in the `soundEffect` parameters if you
    //need a longer sound
    node.stop(actx.currentTime + wait + 2);
  }
}
