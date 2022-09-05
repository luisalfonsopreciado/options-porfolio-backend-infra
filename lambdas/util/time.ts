/**
 * Returns the current date expressed as a UNIX timestamp.
 * @returns
 */
export const getSecondsSinceEpoch = (): number => {
  return Math.round(Date.now() / 1000);
};

/**
 * Returns the expiration date as a UNIX timestamp by numMinutesInFuture.
 * @param numMinutesInFuture
 * @returns - UNIX timestamp
 */
export const getExpirationTime = (numMinutesInFuture: number) => {
  return getSecondsSinceEpoch() + numMinutesInFuture * 60;
};
