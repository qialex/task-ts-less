import { LocaleService } from "./locale.service"
import { ApiStatus, AppStateProps, Beer, Event, EventType } from "./types"

export class Renderer {
  localisation = new LocaleService()
  eventHandler: (event: Event) => void

  constructor(eventHandler: (event: Event) => void) {
    this.eventHandler = eventHandler
  }

  render(props: AppStateProps): void {

    try {
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
        elContainer.appendChild(elBeerGrid)
        props.beers.forEach((beer: Beer) => elBeerGrid.appendChild(this.renderBeer(beer)))

        if (props.selectedBeer) {
          elBeerGrid.appendChild(this.renderBeerPopup(props.selectedBeer))
        }
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

  renderBeer(beer: Beer): HTMLElement {
    const elBeerItem = document.createElement('div')
    elBeerItem.onclick = () => this.eventHandler({type: EventType.selectItem, payload: beer} as Event<Beer>)
    
    const elBeerTitle = document.createElement('div')
    elBeerTitle.textContent = beer.name
    elBeerItem.appendChild(elBeerTitle)

    const elBeerIbu = document.createElement('div')
    elBeerIbu.textContent = `${this.localisation.get('abbrIBU')}: ${beer.ibu}`
    elBeerItem.appendChild(elBeerIbu)

    const elBeerAbv = document.createElement('div')
    elBeerAbv.textContent = `${beer.abv}%`
    elBeerItem.appendChild(elBeerAbv)

    const elBeerImage = document.createElement('img')
    elBeerImage.src = beer.imageUrl
    elBeerItem.appendChild(elBeerImage)

    return elBeerItem
  }

  renderBeerPopup(beer: Beer): HTMLElement {
    const elBeerPopup = document.createElement('div')
    elBeerPopup.classList.add('popup-wrapper')
    elBeerPopup.onclick = (e: MouseEvent) => {
      let el: HTMLElement | null = e.target as HTMLElement
      while(el) {
        if (el.classList.contains('popup-content')) {
          return
        }
        el = el.parentElement
      }
      this.eventHandler({type: EventType.deselectItem} as Event)
    } 

    const elClose = document.createElement('div')
    elClose.classList.add('popup-close-icon')
    elBeerPopup.appendChild(elClose)

    const elBeerPopupContent = document.createElement('div')
    elBeerPopupContent.classList.add('popup-content')
    elBeerPopup.appendChild(elBeerPopupContent)
    
    const elBeerTitle = document.createElement('div')
    elBeerTitle.textContent = beer.name
    elBeerPopupContent.appendChild(elBeerTitle)

    const elBeerIbu = document.createElement('div')
    elBeerIbu.textContent = `${this.localisation.get('abbrIBU')}: ${beer.ibu}`
    elBeerPopupContent.appendChild(elBeerIbu)

    const elBeerAbv = document.createElement('div')
    elBeerAbv.textContent = `${beer.abv}%`
    elBeerPopupContent.appendChild(elBeerAbv)

    const elBeerDesc = document.createElement('div')
    elBeerDesc.textContent = beer.description
    elBeerPopupContent.appendChild(elBeerDesc)

    const elOrderDropDown = document.createElement('button')
    elOrderDropDown.textContent = this.localisation.get('order')
    elBeerPopupContent.appendChild(elOrderDropDown)

    const elBeerImage = document.createElement('img')
    elBeerImage.src = beer.imageUrl
    elBeerPopupContent.appendChild(elBeerImage)

    return elBeerPopup
  }
}