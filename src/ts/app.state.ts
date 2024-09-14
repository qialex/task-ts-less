import { ApiService } from "./api.service";
import { transformBeer } from "./helpers";
import { Action, ApiStatus, AppStateProps, ActionType, Event, EventType } from "./types";

export class AppState {
  props: AppStateProps = {
    apiStatus: ApiStatus.ok,
    beers: [],
  }
  
  eventsToActions(event: Event): Action[] {
    if (event.type === EventType.initApp || event.type === EventType.repeatDataLoading) {
      return [
        {type: ActionType.setApiStatus, payload: ApiStatus.loading} as Action<ApiStatus>,
        {type: ActionType.getAllBeers} as Action,
      ]
    }
    return []
  }


  async reduce(action: Action): Promise<void> {
    if (action.type === ActionType.setApiStatus) {
      this.props.apiStatus = (action as Action<ApiStatus>).payload
    }
    if (action.type === ActionType.getAllBeers) {
      const {status, data} = await new ApiService().getAll()
      this.props.apiStatus = status
      this.props.beers = transformBeer(data)
    }
  }
}