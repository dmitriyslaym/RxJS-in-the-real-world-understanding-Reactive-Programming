import React, { Component } from 'react';
import { ReplaySubject, fromEvent, from, empty, iif, of, merge, interval } from 'rxjs';
import {
  map,
  scan,
  tap,
  reduce,
  withLatestFrom,
  mergeMap,
  switchMap,
  filter,
  startWith,
  distinctUntilChanged,
  multicast,
  refCount,
  debounceTime,
  pairwise,
  takeUntil
} from 'rxjs/operators';
import './App.css';
import { getAsset } from './mock';

const assetIds = [];
for (let i = 1; i < 11; i++) {
  assetIds.push(i);
}

class App extends Component {

  state = {
    suggestedAssets: [],
    investedAssets: {}
  };

  componentDidMount() {
    let suggestedAssetIdToBuy;

    const search$ = fromEvent(document.getElementById('search'), 'input')
      .pipe(
        debounceTime(500),
        map(event => Number(event.target.value)),
      );

    const buy$ = fromEvent(document.getElementById('buy'), 'click').pipe(
      map((event) => suggestedAssetIdToBuy),
      mergeMap(
        (investedAssetId) => iif(
          () => !!suggestedAssetIdToBuy,
          assets$.pipe(
            map(assetsMap => ({ ...assetsMap[investedAssetId] })),
            filter(val => val),
            distinctUntilChanged((oldAsset, newAsset) => oldAsset.price === newAsset.price),
            tap(({ id, price }) => this.setState(prevState => ({
              investedAssets: { ...prevState.investedAssets, [id]: { id, price } },
              suggestedAssets: prevState.suggestedAssets.filter(asset => asset.id !== id),
            }))),
          ),
          empty()
        )
      )
    );

    const assets$ = interval(5000)
      .pipe(
        map(val => val + 1),
        startWith(0),
        tap((data) => console.log('assets$ emits new value', data)),
        mergeMap(() => merge(...assetIds.map(assetId => from(getAsset(assetId))))),
        scan((acc, asset) => {
          return {
            ...acc,
            [asset.id]: asset
          }
        }, {}),
        multicast(() => new ReplaySubject(1)),
        refCount()
      )

    const generateSuggestedAssets = (search) => iif(
      () => !!search,
      assets$
        .pipe(
          mergeMap(assetsMap =>
            from(Object.values(assetsMap))
              .pipe(
                filter(asset => asset.price > +search && !this.state.investedAssets[asset.id]),
                reduce((acc, filteredAsset) => [...acc, filteredAsset], []),
              )
          ),
          tap(suggestedAssets => {
            suggestedAssetIdToBuy = suggestedAssets[0] ? suggestedAssets[0].id : undefined;
            this.setState({ suggestedAssets })
          }),
        ),
      of('empty').pipe(
        tap(() => {
          this.setState({ suggestedAssets: [] })
        }),
        mergeMap(() => empty())
      )
    )


    const suggestedAssets$ = search$.pipe(
      switchMap(generateSuggestedAssets),
    );

    const assetsAlive$ = search$.pipe(
      startWith(0),
      pairwise(),
      mergeMap(([prevSearch, currentSearch]) => iif(
        () => !prevSearch && !!currentSearch,
        assets$.pipe(
          takeUntil(search$.pipe(filter(search => !search))),
        ),
        empty()
      ))
    )

    const res$ = merge(suggestedAssets$, assetsAlive$, buy$);
    res$.subscribe();
  }

  render() {
    const { investedAssets, suggestedAssets } = this.state;

    return (
      <div className="app">
        <form className="form">
          <input placeholder="Type minimum price here" type="number" id="search" />
          <button type="button" id="buy">Buy The First Asset</button>
          {Object.values(investedAssets).map(investedAsset => (
            <div style={{ borderBottom: '2px solid black', marginBottom: '10px' }} key={investedAsset.id}>
              <span>Invested asset id: {investedAsset.id}</span>
              <span style={{ display: 'inline-block', marginLeft: '10px' }}>Invested asset price: {investedAsset.price}</span>
            </div>
          ))}
        </form>
        <div className="autosuggestions">
          {suggestedAssets.map(asset => (
            <div key={asset.id} style={{ borderBottom: '2px solid black', marginBottom: '10px' }}>
              <span>Id: {asset.id}</span>
              <span style={{ display: 'inline-block', marginLeft: '10px' }}>Type: {asset.type}</span>
              <span style={{ display: 'inline-block', marginLeft: '10px' }}>Name: {asset.assetName}</span>
              <span style={{ display: 'inline-block', marginLeft: '10px' }}>Name: {asset.price}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
