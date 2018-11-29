export function getAsset(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(createAsset(id));
    }, 1000 + Math.random() * 2000)
  })
}

const createAsset = (assetId) => {
  return {
    id: assetId,
    assetName: `Asset ${assetId}`,
    price: Math.random() * 5000,
    lastUpdate: Date.now(),
    type: assetId < 6 ? 'Stock' : 'Currency'
  }
};
