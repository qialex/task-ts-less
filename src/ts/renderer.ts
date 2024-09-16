import { createHTMLElement, getBeerBgClass } from "./helpers"
import { LocaleService } from "./locale.service"
import { ApiStatus, AppStateProps, Beer, ClickListener, Event, EventType, KeyboardListener } from "./types"

export class Renderer {
  localisation = new LocaleService()
  eventHandler: (event: Event) => void
  props: AppStateProps
  clickListeners: ClickListener[] = []
  keyboardListeners: KeyboardListener[] = []

  constructor(props: AppStateProps, eventHandler: (event: Event) => void) {
    this.props = props
    this.eventHandler = eventHandler
    document.addEventListener('click', this.clickHandler.bind(this))
    document.addEventListener('keyup', this.keyupHandler.bind(this))
  }

  keyupHandler(e: KeyboardEvent): void {
    this.keyboardListeners.forEach((listener: KeyboardListener) => {
      if (e.key === listener.key) {
        listener.callback()
      }
    })
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
    this.keyboardListeners.length = 0

    try {
      const elContainer = createHTMLElement('div')
 
      // api loading
      if (props.apiStatus === ApiStatus.loading) {
        const elApiLoadingBG = createHTMLElement('div', elContainer, 'loader-bg')
        createHTMLElement('div', elApiLoadingBG, 'loader')
      }

      // error api
      if (props.apiStatus === ApiStatus.error) {
        createHTMLElement('div', elContainer, '', this.localisation.get('apiError'))
      }

      // no items
      if ((props.apiStatus === ApiStatus.ok && !props.beers.length)) {
        createHTMLElement('div', elContainer, '', this.localisation.get('notFound'))
      }
  
      // no items or error show repeat button
      if (props.apiStatus === ApiStatus.error || (props.apiStatus === ApiStatus.ok && !props.beers.length)) {
        const elRepeatButtonWrapper = createHTMLElement('div', elContainer, 'repeat-button-wrapper')
        createHTMLElement('button', elRepeatButtonWrapper, 'repeat-button', this.localisation.get('repeat'))

        this.clickListeners.push({
          target: 'repeat-button',
          ignore: '',
          callback: () => this.eventHandler({type: EventType.repeatDataLoading}),
        })
      }

      // render grid of items
      if ((props.apiStatus === ApiStatus.ok) && props.beers.length) {
        const elBeerGrid = createHTMLElement('div', elContainer, 'beers-grid')

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

    // TODO: 
    // next step would be to create a DOM tree and then not just remove the old one 
    // but recursively compare trees and replace only some elements and nodes.
  }

  renderBeer(beer: Beer): HTMLElement {
    const key = `beer-item-${beer.id.toString()}`
    const ibuText = `${this.localisation.get('abbrIBU')}: ${beer.ibu}`
    const abvText = `${beer.abv}%`

    this.clickListeners.push({
      target: key,
      ignore: '',
      callback: () => this.eventHandler({type: EventType.selectItem, payload: beer} as Event<Beer>),
    })

    // item
    const elBeerItem = createHTMLElement('div', undefined, ['beer-item', key])
    // bg
    const elBeerItemContent = createHTMLElement('div', elBeerItem, 'beer-item-content')
    // img bg
    const elBeerImageBG = createHTMLElement('div', elBeerItemContent, ['beer-item-img-bg', getBeerBgClass(beer)])
    // img
    const elBeerImage = createHTMLElement('img', elBeerImageBG, 'beer-item-img') as HTMLImageElement
    elBeerImage.src = beer.imageUrl
    // title
    createHTMLElement('div', elBeerItemContent, 'beer-item-title', beer.name)
    // ibu
    createHTMLElement('div', elBeerItemContent, 'beer-item-ibu', ibuText)
    // abv
    const elBeerAbvBg = createHTMLElement('div', elBeerItemContent, 'beer-item-abv-bg')
    createHTMLElement('div', elBeerAbvBg, 'beer-item-abv', abvText)
    // return 
    return elBeerItem
  }

  renderBeerPopup(): HTMLElement {
    const beer = this.props.selectedBeer
    if (beer) {
      this.clickListeners.push(
        {target: 'popup-wrapper', ignore: 'popup-content', callback: () => this.eventHandler({type: EventType.deselectItem} as Event)},
      )
      this.clickListeners.push(
        {target: 'popup-close-icon', ignore: '', callback: () => this.eventHandler({type: EventType.deselectItem} as Event)},
      )      
      this.keyboardListeners.push(
        {target: '', key: 'Escape', callback: () => this.eventHandler({type: EventType.deselectItem} as Event)},
      )

      // main
      const elBeerPopup = createHTMLElement('div', undefined, 'popup-wrapper')
      // content
      const elBeerPopupContent = createHTMLElement('div', elBeerPopup, 'popup-content')
      // close icon
      createHTMLElement('div', elBeerPopupContent, 'popup-close-icon')
      // top 
      const elBeerPopupTop = createHTMLElement('div', elBeerPopupContent, 'popup-content-top')
      // img 
      elBeerPopupTop.appendChild(this.renderPopupImg())
      // description
      createHTMLElement('div', elBeerPopupTop, '', beer.description)
      // footer
      const elBeerPopupFooter = createHTMLElement('div', elBeerPopupContent, 'popup-content-footer')
      // title
      createHTMLElement('div', elBeerPopupFooter, 'popup-content-title', beer.name)
      // dropdown
      const elOrderDropDownBTN = createHTMLElement('button', elBeerPopupFooter, 'dropdown-button', this.localisation.get('order'))
      // handle click
      this.clickListeners.push(
        {target: this.props.isDropDownOpen ? '' : 'dropdown-button', ignore: 'dropdown-item', callback: () => this.eventHandler({type:  EventType.setDropDown, payload: !this.props.isDropDownOpen} as Event)}
      )

      // render dropdown
      if (this.props.isDropDownOpen) {
        elOrderDropDownBTN.classList.add('open')
        const elDropDown = this.renderDropDown([
          this.localisation.get('glass'),
          this.localisation.get('can'),
          this.localisation.get('box'),
        ], 'main-dropdown', true, this.props.dropDownItemSelected)
        if (typeof this.props.dropDownItemSelected == 'number') {
          const secondDropDown = this.renderDropDown(['1', '2', '3'], 'second-dropdown', false, undefined)
          elDropDown.children[this.props.dropDownItemSelected].appendChild(secondDropDown)
        }
        elOrderDropDownBTN.appendChild(elDropDown)
      }


      return elBeerPopup

    }
    return createHTMLElement('div')
  }

  renderDropDown(items: string[], mainClass: string, callback: boolean = true, openItem: number | undefined): HTMLElement {
    const elDropDown = createHTMLElement('div', undefined, ['dropdown-container', mainClass])
    items.forEach((item: string, i: number) => {
      const elDropDownItem = createHTMLElement('div', elDropDown, ['dropdown-item', mainClass], item)

      if (typeof this.props.dropDownItemSelected == 'number' && i == openItem) {
        elDropDownItem.classList.add('open')
      }
      elDropDownItem.classList.add(`dropdown-item-${i}`)
      if (callback) {
        this.clickListeners.push(
          {target: `dropdown-item-${i}`, ignore: '', callback: () => this.eventHandler({type:  EventType.selectDropDownChild, payload: i} as Event)}
        )
      }
    })
    return elDropDown
  }

  renderPopupImg(): HTMLElement {
    const beer = this.props.selectedBeer
    if (beer) {
      // img bg and other data
      // outer border
      const elBeerImgWrapper = createHTMLElement('div', undefined, 'popup-content-img-wrapper')
      // inner border
      const elBeerImgAbvWrapper = createHTMLElement('div', elBeerImgWrapper, 'popup-content-img-abv-wrapper')
      // animation bg
      const elBeerImgBg = createHTMLElement('div', elBeerImgAbvWrapper, ['popup-content-img-bg', getBeerBgClass(beer)])

      // img
      const elBeerImage = createHTMLElement('img', elBeerImgBg) as HTMLImageElement
      elBeerImage.src = beer.imageUrl
      // ibu
      const elBeerIbuWrapper = createHTMLElement('div', elBeerImgBg, 'popup-content-ibu-wrapper')
      // ibu title
      createHTMLElement('div', elBeerIbuWrapper, '', this.localisation.get('abbrIBU'))
      // ibu value
      createHTMLElement('div', elBeerIbuWrapper, '', beer.ibu.toString())
      // abv
      createHTMLElement('div', elBeerImgWrapper, 'popup-content-abv', `${beer.abv}%`)

      return elBeerImgWrapper
    } else {
      return createHTMLElement('div')
    }
  }
}