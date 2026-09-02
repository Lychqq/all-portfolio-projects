
const startTime = NaN;
const durationFly= 1500;
const durationOpacity =0


let opacity = 1;
let left = 0;

const overlay = document.createElement('div')

overlay.style.cssText = `
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    reght: 0;
    background-color: black;
    opacity: ${opacity};
    z-index: 999;
`;

const fly = document.createElement('div');
fly.style.cssText = `
    position: fixed;
    width: 50px;
    height: 50px;
    left: ${left};
    top: calc(50% - 25px);
    background: url('image/fly.svg') center/contain no-repeat;
`;

overlay.append(fly);
document.body.append(overlay);

const hide0verlay = () => {
    opacity -= 0.05;
    overlay.style.opacity = opacity;
    if (opacity > 0) {
        requestAnimationFrame(hideOverlay);
    } else {
        overlay.remove();
    }
};


const stepFly = () => {
    left += 10;
    fly.style.transform = `translateX(${left}px)`;
    if (left < document.documentElement.scrollWidth){
        requestAnimationFrame(stepFly);
    } else {
         requestAnimationFrame(hideOverlay);
    }
};

requestAnimationFrame(stepFly);