import { AppState } from "./app.state";
import { Renderer } from "./renderer";
import { Action, Event, EventType } from "./types";


export class App {
  state: AppState = new AppState()
  renderer: Renderer = new Renderer(this.state.props, this.eventHandler.bind(this))

  constructor() {
    this.eventHandler({type: EventType.initApp})
  }

  eventHandler(event: Event): void {
    this.state.eventsToActions(event).forEach(async (action: Action) => {
      try {
        await this.state.reduce(action)
        this.renderer.render(this.state.props)
      } catch (e) {
        console.error(e)
      }
    });
  }
}
