import { AppState } from "./app.state";
import { Action, ActionType } from "./types";

export class App {
  state: AppState = new AppState()

  constructor() {
    this.actionHandler({type: ActionType.initApp})
  }

  async actionHandler(action: Action): Promise<void> {
    await this.state.reduce(action)
    this.renderer()
  }

  renderer() {
    console.log(this.state)
  }
}
