export type AppStateProps = {
  apiStatus: ApiStatus,
  beers: Beer[],
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

export enum EventType {
  initApp = 'initApp',
  repeatDataLoading = 'repeatDataLoading',
  selectItem = 'selectItem',
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
  // setApiResult = 'setApiResult',
  getAllBeers = 'getAllBeers',
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

