
// function temporalInterpolate(originalEvents, targetFrameRate) {
//     const positions = [];
//     const events = [];
//     const timeInterval = 1000 / targetFrameRate;
//     let interpolationIndex = 0;

//     for (let i = 0; i < originalEvents.length; i++) {
//         events[i] = { ...originalEvents[i] };
//         events[i].time = Math.round(events[i].time); // round to the nearest integer
//         events[i].time = Math.floor(events[i].time / timeInterval + 0.5) * timeInterval; // quantize to the nearest multiple of the target time interval
//     }

//     for (let i = 0; i < events.length - 1; i++) {
//         const currentEvent = events[i];
//         const nextEvent = events[i + 1];

//         const deltaTime = nextEvent.time - currentEvent.time;
//         const numInterpolations = Math.round(deltaTime / timeInterval); // round to the nearest integer

//         console.log(numInterpolations);

//         for (let j = 0; j < numInterpolations; j++) {
//             const ratio = j / numInterpolations;
//             const x = currentEvent.x + ratio * (nextEvent.x - currentEvent.x);
//             const y = currentEvent.y + ratio * (nextEvent.y - currentEvent.y);
//             const time = currentEvent.time + ratio * deltaTime;

//             positions.push({
//                 timeDiff: interpolationIndex === 0 ? 0 : time - positions[interpolationIndex - 1].time,
//                 time,
//                 x,
//                 y,
//             });
//             interpolationIndex++;
//         }
//     }

//     return positions;
// }


function temporalInterpolate(originalEvents, targetFrameRate) {
    const positions = [];
    const events = [];
    const timeInterval = 1000 / targetFrameRate;
    let interpolationIndex = 0;

    for (let i = 0; i < originalEvents.length; i++) {
        events[i] = { ...originalEvents[i] };
        events[i].time = Math.floor(events[i].time / timeInterval + 0.5) * timeInterval;
    }

    for (let i = 0; i < events.length - 1; i++) {
        const currentEvent = events[i];
        const nextEvent = events[i + 1];

        const deltaTime = nextEvent.time - currentEvent.time;
        const ratio = deltaTime / timeInterval;

        const x = Math.round(currentEvent.x + ratio * (nextEvent.x - currentEvent.x));
        const y = Math.round(currentEvent.y + ratio * (nextEvent.y - currentEvent.y));
        const time = currentEvent.time + ratio * deltaTime;

        const event = {
            timeline: currentEvent.timeline,
            time,
            x,
            y,
        };

        if (currentEvent.scroll) event.scroll = currentEvent.scroll;
        if (currentEvent.click) event.click = currentEvent.click;
        positions.push(event);
        interpolationIndex++;
    }

    return positions;
}

