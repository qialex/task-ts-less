import { ApiService } from "./api.service";
import { transformBeer } from "./helpers";
import { Action, ApiStatus, AppStateProps, ActionType, Event, EventType, Beer } from "./types";

export class AppState {
  props: AppStateProps = {
    apiStatus: ApiStatus.ok,
    beers: [],
    selectedBeer: undefined,
    isDropDownOpen: false,
    dropDownItemSelected: undefined,
  }
  
  eventsToActions(event: Event): Action[] {
    if (event.type === EventType.initApp || event.type === EventType.repeatDataLoading) {
      return [
        {type: ActionType.setApiStatus, payload: ApiStatus.loading} as Action<ApiStatus>,
        {type: ActionType.getAllBeers} as Action,
      ]
    }
    if (event.type === EventType.selectItem) {
      return [
        {type: ActionType.selectBeer, payload: (event as Event<Beer>).payload} as Action<Beer>,
      ]
    }
    if (event.type === EventType.deselectItem) {
      return [
        {type: ActionType.deselectBeer} as Action,
      ]
    }
    if (event.type === EventType.setDropDown) {
      return [
        {type: ActionType.setDropDown, payload: (event as Event<boolean>).payload} as Action<boolean>,
      ]
    }
    if (event.type === EventType.selectDropDownChild) {
      return [
        {type: ActionType.selectDropDownChild, payload: (event as Event<number>).payload} as Action<number>,
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
    if (action.type === ActionType.selectBeer) {
      this.props.selectedBeer = (action as Action<Beer>).payload
    }
    if (action.type === ActionType.deselectBeer) {
      this.props.selectedBeer = undefined
    }    
    if (action.type === ActionType.setDropDown) {
      this.props.isDropDownOpen = (action as Action<boolean>).payload
      if (!this.props.isDropDownOpen) {
        this.props.dropDownItemSelected = undefined
      }
    }
    if (action.type === ActionType.selectDropDownChild) {
      this.props.dropDownItemSelected = (action as Action<number>).payload
    }
  }
}