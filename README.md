# Guidelines

- There are 10 assets with id from 1 to 10;
- **getAsset(id)** simulates HTTP request to server to fetch a specific asset. The request will take from 1 to 3 seconds;
- The price of each asset is generated randomly in the range of 0-5000 and is updated each 5 seconds;
- A user can type a number in the input to get all the assets, that have this or higher price;
- Each 5 seconds assets information has to be updated and the view should still reflect only the assets that match minimum price criteria;
- A user can buy the first asset that matches the criteria - in this case this asset should be added to the list of invested assets and should not be visible in the list of suggested assets;
- Assets data should not be fetched until a user provides minimum price criteria;
- When a user changes the criteria, the same interval of updates of assets should be applied;
- If a user clears the input and no assets are invested, no new requests for the updates of assets should be made.