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

export type ApiResponse<T> = { 
  data: T, 
  status: ApiStatus
}

export enum ApiStatus {
  loading = 'loading',
  error = 'error',
  ok = 'ok',
}

export enum ActionType {
  initApp = 'initApp',  
  selectItem = 'selectItem',
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