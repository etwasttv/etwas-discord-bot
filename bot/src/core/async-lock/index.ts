import AsyncLock from 'async-lock';

const asyncLockSingleton = () => {
  return new AsyncLock();
};

type AsyncLockSingleton = ReturnType<typeof asyncLockSingleton>;

const globalForAsyncLock = globalThis as unknown as {
  asyncLock: AsyncLockSingleton | undefined;
};

export const asyncLock = globalForAsyncLock.asyncLock ?? asyncLockSingleton();

asyncLockSingleton.discord = asyncLock;
