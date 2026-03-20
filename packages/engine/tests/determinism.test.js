const { GameEngine } = require('../dist/index');

function runSim() {
  const engine = new GameEngine({ seed: 'test-seed', isServer: true });
  for (let i = 0; i < 60; i++) {
    const input = {
      frame: i,
      up: i % 2 === 0,
      down: false,
      left: false,
      right: i % 3 === 0,
      dash: i === 30,
      mousePos: { x: 500, y: 500 }
    };
    engine.update(input);
  }
  return {
    score: engine.getScore(),
    pos: { x: engine.hero.body.position.x, y: engine.hero.body.position.y }
  };
}

try {
    const res1 = runSim();
    const res2 = runSim();

    console.log('Run 1:', res1);
    console.log('Run 2:', res2);

    if (JSON.stringify(res1) === JSON.stringify(res2)) {
      console.log('DETERMINISM TEST PASSED');
    } else {
      console.log('DETERMINISM TEST FAILED');
      process.exit(1);
    }
} catch (e) {
    console.error(e);
    process.exit(1);
}
