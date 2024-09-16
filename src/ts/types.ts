export type AppStateProps = {
  apiStatus: ApiStatus,
  beers: Beer[],
  selectedBeer: Beer | undefined,
  isDropDownOpen: boolean,
  dropDownItemSelected: number | undefined
}

export type Beer = {
  abv: number,
  description: string,
  ibu: number,
  id: number,
  imageUrl: string,
  name: string,
}

export type BeerDTO = Omit<Beer, 'imageUrl'> & { image_url: string }

export type ApiResult<T> = { 
  data: T, 
  status: ApiStatus
}

export enum ApiStatus {
  loading = 'loading',
  error = 'error',
  ok = 'ok',
}

export type ClickListener = {
  target: string,
  ignore: string,
  callback: () => void,
}

export type KeyboardListener = {
  target: string,
  key: string,
  callback: () => void,
}

export enum EventType {
  initApp = 'initApp',
  repeatDataLoading = 'repeatDataLoading',
  selectItem = 'selectItem',
  deselectItem = 'deselectItem',
  setDropDown = 'setDropDown',
  selectDropDownChild = 'selectDropDownChild',
}

type EventBase = {
  type: EventType;
};

interface EventWithPayload<T> extends EventBase {
  payload: T;
}

export type Event<T = void> = T extends void
  ? EventBase
  : EventWithPayload<T>;



export enum ActionType {
  setApiStatus = 'setApiStatus',  
  getAllBeers = 'getAllBeers',
  selectBeer = 'selectBeer',
  deselectBeer = 'deselectBeer',
  setDropDown = 'setDropDown',
  selectDropDownChild = 'selectDropDownChild',
}

type ActionBase = {
  type: ActionType;
};

interface ActionWithPayload<T> extends ActionBase {
  payload: T;
}

export type Action<T = void> = T extends void
  ? ActionBase
  : ActionWithPayload<T>;

