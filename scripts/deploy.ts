import hre from 'hardhat';

import './deploy/01-proxy-registry';
import './deploy/02-profile';

const STEPS = ['deploy:proxy-registry', 'deploy:profile'];

async function main() {
  console.log('Starting deploy');
  console.log(`\n******`);
  console.log();

  for (const step of STEPS) {
    console.log(`Start task ${step}`);
    // eslint-disable-next-line no-await-in-loop
    await hre.run(step);
    console.log(`Task finished ${step}`);
    console.log(`\n******`);
    console.log();
  }

  console.log('Deploy finished');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
