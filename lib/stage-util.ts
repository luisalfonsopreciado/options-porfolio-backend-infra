export const createResourceNameWithStage: (
  resourceName: string,
  stageName: string
) => string = (resourceName, stageName) => {
  return resourceName + "-" + stageName;
};
