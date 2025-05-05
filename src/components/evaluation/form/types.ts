
export type FormData = {
  hedonic: {
    appearance: string;
    odor: string;
    texture: string;
    flavor: string;
    overallLiking: string;
  };
  jar: {
    [attributeId: string]: string;
  };
};
