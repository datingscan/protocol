import { ethers } from 'hardhat';

interface SuiteStateFunc {
  (tests: (this: Mocha.Suite) => void): (this: Mocha.Suite) => void;
}

interface SuiteFunction {
  (title: string, fn: () => void): Mocha.Suite | void;
}

export const makeSuite = makeSuiteMaker(isolatedState);

function makeSuiteMaker(stateFn: SuiteStateFunc): SuiteFunction {
  const result = ((title: string, fn: () => void) =>
    describe(title, stateFn(fn))) as SuiteFunction;

  return result;
}

let snapshotId: string;

function isolatedState(
  tests: (this: Mocha.Suite) => void,
): (this: Mocha.Suite) => void {
  return function isolatedStateFn(this: Mocha.Suite): void {
    this.beforeEach(async () => {
      snapshotId = (await ethers.provider.send('evm_snapshot', [])) as string;
    });

    tests.call(this);

    this.afterEach(async () => {
      await ethers.provider.send('evm_revert', [snapshotId]);
    });
  };
}
