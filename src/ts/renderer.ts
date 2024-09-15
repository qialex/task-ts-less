import { LocaleService } from "./locale.service"
import { ApiStatus, AppStateProps, Beer, ClickListener, Event, EventType } from "./types"

export class Renderer {
  localisation = new LocaleService()
  eventHandler: (event: Event) => void
  props: AppStateProps
  clickListeners: ClickListener[] = []

  constructor(props: AppStateProps, eventHandler: (event: Event) => void) {
    this.props = props
    this.eventHandler = eventHandler
    document.addEventListener('click', this.clickHandler.bind(this))
  }

  clickHandler(e: MouseEvent): void {
    this.clickListeners.forEach((listener: ClickListener) => {
      let el: HTMLElement | null = e.target as HTMLElement
      const result = {tagetHit: false, ignoreHit: false}
      while(el) {
        if (!listener.target || el.classList.contains(listener.target)) {
          result.tagetHit = true
        }
        if (listener.ignore && el.classList.contains(listener.ignore)) {
          result.ignoreHit = true
        }
        el = el.parentElement
      }
      if (result.tagetHit && !result.ignoreHit) {
        listener.callback()
      }
    })
  }

  render(props: AppStateProps): void {
    this.props = props

    this.clickListeners.length = 0
    try {
      const elContainer = document.createElement('div')
 
      // api loading
      if (props.apiStatus === ApiStatus.loading) {
        const elApiLoadingBG = document.createElement('div')
        elApiLoadingBG.classList.add('loader-bg')
        elContainer.appendChild(elApiLoadingBG)

        const elApiLoading = document.createElement('div')
        elApiLoading.classList.add('loader')
        elApiLoadingBG.appendChild(elApiLoading)
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
        const elRepeatButtonWrapper = document.createElement('div')
        elRepeatButtonWrapper.classList.add('repeat-button-wrapper')
        elContainer.appendChild(elRepeatButtonWrapper)

        const elRepeatButton = document.createElement('button')
        elRepeatButton.classList.add('repeat-button')
        elRepeatButton.textContent = this.localisation.get('repeat')
        this.clickListeners.push({
          target: 'repeat-button',
          ignore: '',
          callback: () => this.eventHandler({type: EventType.repeatDataLoading}),
        })
        elRepeatButtonWrapper.appendChild(elRepeatButton)
      }

      // render grid of items
      if ((props.apiStatus === ApiStatus.ok) && props.beers.length) {
        const elBeerGrid = document.createElement('div')
        elBeerGrid.classList.add('beers-grid')
        elContainer.appendChild(elBeerGrid)
        props.beers.forEach((beer: Beer) => elBeerGrid.appendChild(this.renderBeer(beer)))

        if (props.selectedBeer) {
          elBeerGrid.appendChild(this.renderBeerPopup())
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
    const key = `beer-item-${beer.id.toString()}`
    elBeerItem.classList.add(key)
    elBeerItem.classList.add('beer-item')

    const elBeerItemContent = document.createElement('div')
    elBeerItemContent.classList.add('beer-item-content')
    elBeerItem.append(elBeerItemContent)
    
    this.clickListeners.push({
      target: key,
      ignore: '',
      callback: () => this.eventHandler({type: EventType.selectItem, payload: beer} as Event<Beer>),
    })

    // img bg
    const elBeerImageBG = document.createElement('div')
    elBeerImageBG.classList.add('beer-item-img-bg')
    elBeerItemContent.appendChild(elBeerImageBG)

    const elBeerImage = document.createElement('img')
    elBeerImage.classList.add('beer-item-img')
    elBeerImage.src = beer.imageUrl
    elBeerImageBG.appendChild(elBeerImage)

    // title
    const elBeerTitle = document.createElement('div')
    elBeerTitle.classList.add('beer-item-title')
    elBeerTitle.textContent = beer.name
    elBeerItemContent.appendChild(elBeerTitle)

    // ibu
    const elBeerIbu = document.createElement('div')
    elBeerIbu.classList.add('beer-item-ibu')
    elBeerIbu.textContent = `${this.localisation.get('abbrIBU')}: ${beer.ibu}`
    elBeerItemContent.appendChild(elBeerIbu)

    // abv
    const elBeerAbvBg = document.createElement('div')
    elBeerAbvBg.classList.add('beer-item-abv-bg')
    elBeerItemContent.appendChild(elBeerAbvBg)

    const elBeerAbv = document.createElement('div')
    elBeerAbv.classList.add('beer-item-abv')
    elBeerAbv.textContent = `${beer.abv}%`
    elBeerAbvBg.appendChild(elBeerAbv)

    return elBeerItem
  }

  renderBeerPopup(): HTMLElement {
    const beer = this.props.selectedBeer
    if (beer) {
      const elBeerPopup = document.createElement('div')
      elBeerPopup.classList.add('popup-wrapper')
      this.clickListeners.push(
        {target: 'popup-wrapper', ignore: 'popup-content', callback: () => this.eventHandler({type: EventType.deselectItem} as Event)}
      )

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

      const elOrderDropDownBTN = document.createElement('button')
      elOrderDropDownBTN.classList.add('dropdown-button')
      this.clickListeners.push(
        {target: this.props.isDropDownOpen ? '' : 'dropdown-button', ignore: 'dropdown-item', callback: () => this.eventHandler({type:  EventType.setDropDown, payload: !this.props.isDropDownOpen} as Event)}
      )
      elOrderDropDownBTN.textContent = this.localisation.get('order')
      elBeerPopupContent.appendChild(elOrderDropDownBTN)

      // render dropdown
      if (this.props.isDropDownOpen) {
        const elDropDown = this.renderDropDown([
          this.localisation.get('glass'),
          this.localisation.get('can'),
          this.localisation.get('box'),
        ])
        if (typeof this.props.dropDownItemSelected == 'number') {
          const secondDropDown = this.renderDropDown(['1', '2', '3'], false)
          elDropDown.children[this.props.dropDownItemSelected].appendChild(secondDropDown)
        }
        elOrderDropDownBTN.appendChild(elDropDown)
      }

      const elBeerImage = document.createElement('img')
      elBeerImage.src = beer.imageUrl
      elBeerImage.width = 100
      elBeerImage.height = 100
      elBeerPopupContent.appendChild(elBeerImage)

      return elBeerPopup

    }
    return document.createElement('div')
  }

  renderDropDown(items: string[], callback: boolean = true): HTMLElement {
    const elDropDown = document.createElement('div')
    elDropDown.classList.add('dropdown-container')
    items.forEach((item: string, i: number) => {
      const elDropDownItem = document.createElement('div')
      elDropDownItem.textContent = item
      elDropDownItem.classList.add('dropdown-item')
      elDropDownItem.classList.add(`dropdown-item-${i}`)
      if (callback) {
        this.clickListeners.push(
          {target: `dropdown-item-${i}`, ignore: '', callback: () => this.eventHandler({type:  EventType.selectDropDownChild, payload: i} as Event)}
        )
      }
      elDropDown.appendChild(elDropDownItem)
    })
    return elDropDown
  }
}