import { AppState } from "./app.state";
import { Action, ApiStatus, AppStateProps, Event, EventType } from "./types";
import { LocalisationService } from "./locale.service";

export class App {
  state: AppState = new AppState()
  localisation = new LocalisationService()

  constructor() {
    this.eventHandler({type: EventType.initApp})
  }

  eventHandler(event: Event): void {
    this.state.eventsToActions(event).forEach(async (action: Action) => {
      try {
        await this.state.reduce(action)
        this.render()
      } catch (e) {
        console.error(e)
      }
    });
  }

  render() {
    try {
      const props: AppStateProps = this.state.props
      const elContainer = document.createElement('div')
 
      // api loading
      if (props.apiStatus === ApiStatus.loading) {
        const elApiLoading = document.createElement('div')
        // TODO: style loading 
        elApiLoading.textContent = 'loading ... ' 
        elContainer.appendChild(elApiLoading)
      }

      // error api
      if (props.apiStatus === ApiStatus.error) {
        const elApiError = document.createElement('div')
        elApiError.textContent = this.localisation.get('apiError')
        elContainer.appendChild(elApiError)
      }

      // no items
      if ((props.apiStatus === ApiStatus.ok && !props.beers.length)) {
        const elNotFoundError = document.createElement('div')
        elNotFoundError.textContent = this.localisation.get('notFound')
        elContainer.appendChild(elNotFoundError)
      }
  
      // no items or error show repeat button
      if (props.apiStatus === ApiStatus.error || (props.apiStatus === ApiStatus.ok && !props.beers.length)) {
        const elRepeatButton = document.createElement('button')
        elRepeatButton.textContent = this.localisation.get('repeat')
        elRepeatButton.onclick = () => this.eventHandler({type: EventType.repeatDataLoading})
        elContainer.appendChild(elRepeatButton)
      }

      // render grid of items
      if ((props.apiStatus === ApiStatus.ok) && props.beers.length) {
        const elBeerGrid = document.createElement('div')
        elBeerGrid.textContent = props.beers.length.toString()
        elContainer.appendChild(elBeerGrid)
      }
  
      // remove all elements
      while(window.document.body.firstElementChild) {
        window.document.body.firstElementChild.remove()
      }
      window.document.body.appendChild(elContainer)
    } catch (e) {
      console.error(e)
    }
  }
}
