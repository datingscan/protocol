import hre from 'hardhat';

import { clearDB } from '../helpers/db';
import { getNetworkFromEnv } from '../helpers/hardhat';

import './deploy/01-proxy-registry';
import './deploy/02-profile';

async function main() {
  console.log('Starting deploy');
  console.log(`\n******`);
  console.log();

  clearDB(getNetworkFromEnv(hre));

  await hre.run('deploy:proxy-registry');
  await hre.run('deploy:profile');

  console.log('Deploy finished');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
