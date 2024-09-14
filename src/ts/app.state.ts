import { ApiService } from "./api.service";
import { transformBeer } from "./helpers";
import { Action, ApiStatus, AppStateProps, ActionType } from "./types";

export class AppState {
  props: AppStateProps = {
    apiStatus: ApiStatus.ok,
    beers: [],
  }
  

  async reduce(action: Action): Promise<void> {
    if (action.type === ActionType.initApp) {
      const {status, data} = await new ApiService().getAll()
      console.log(status, data)
      this.props.apiStatus = status
      this.props.beers = transformBeer(data)
    }
  }
}