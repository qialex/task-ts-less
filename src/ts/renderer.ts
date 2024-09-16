import { createHTMLElement } from "./helpers"
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
  }

  renderBeer(beer: Beer): HTMLElement {
    const key = `beer-item-${beer.id.toString()}`
    const beerBgClass = `beer-item-img-bg-${beer.ibu.toString()[0]}`
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
    const elBeerImageBG = createHTMLElement('div', elBeerItemContent, ['beer-item-img-bg', beerBgClass])
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
      this.keyboardListeners.push(
        {target: '', key: 'Escape', callback: () => this.eventHandler({type: EventType.deselectItem} as Event)},
      )

      const elBeerPopup = document.createElement('div')
      elBeerPopup.classList.add('popup-wrapper')
      this.clickListeners.push(
        {target: 'popup-wrapper', ignore: 'popup-content', callback: () => this.eventHandler({type: EventType.deselectItem} as Event)},
      )
      this.clickListeners.push(
        {target: 'popup-close-icon', ignore: '', callback: () => this.eventHandler({type: EventType.deselectItem} as Event)},
      )

      const elBeerPopupContent = document.createElement('div')
      elBeerPopupContent.classList.add('popup-content')
      elBeerPopup.appendChild(elBeerPopupContent)

      const elClose = document.createElement('div')
      elClose.classList.add('popup-close-icon')
      elBeerPopupContent.appendChild(elClose)
      
      const elBeerPopupTop = document.createElement('div')
      elBeerPopupTop.classList.add('popup-content-top')
      elBeerPopupContent.appendChild(elBeerPopupTop)
      // img bg and other data
      // outer border
      const elBeerImgWrapper = document.createElement('div')
      elBeerImgWrapper.classList.add('popup-content-img-wrapper')
      elBeerPopupTop.appendChild(elBeerImgWrapper)
      // inner border
      const elBeerImgAbvWrapper = document.createElement('div')
      elBeerImgAbvWrapper.classList.add('popup-content-img-abv-wrapper')
      elBeerImgWrapper.appendChild(elBeerImgAbvWrapper)

      // animation bg
      const elBeerImgBg = document.createElement('div')
      elBeerImgBg.classList.add(`popup-content-img-bg`)
      elBeerImgBg.classList.add(`beer-item-img-bg-${beer.ibu.toString()[0]}`)
      elBeerImgAbvWrapper.appendChild(elBeerImgBg)
      // img
      const elBeerImage = document.createElement('img')
      elBeerImage.src = beer.imageUrl
      elBeerImgBg.appendChild(elBeerImage)
      // ibu
      const elBeerIbuWrapper = document.createElement('div')
      elBeerIbuWrapper.classList.add('popup-content-ibu-wrapper')
      elBeerImgBg.appendChild(elBeerIbuWrapper)

      const elBeerIbuTitle = document.createElement('div')
      elBeerIbuTitle.textContent = this.localisation.get('abbrIBU')
      elBeerIbuWrapper.appendChild(elBeerIbuTitle)

      const elBeerIbuValue = document.createElement('div')
      elBeerIbuValue.textContent = beer.ibu.toString()
      elBeerIbuWrapper.appendChild(elBeerIbuValue)
      

      // abv
      const elBeerAbv = document.createElement('div')
      elBeerAbv.classList.add('popup-content-abv')
      elBeerAbv.textContent = `${beer.abv}%`
      elBeerImgWrapper.appendChild(elBeerAbv)


      // description
      const elBeerDesc = document.createElement('div')
      elBeerDesc.textContent = beer.description
      elBeerPopupTop.appendChild(elBeerDesc)


      // footer
      const elBeerPopupFooter = document.createElement('div')
      elBeerPopupFooter.classList.add('popup-content-footer')
      elBeerPopupContent.appendChild(elBeerPopupFooter)

      const elBeerTitle = document.createElement('div')
      elBeerTitle.classList.add('popup-content-title')
      elBeerTitle.textContent = beer.name
      elBeerPopupFooter.appendChild(elBeerTitle)

      const elOrderDropDownBTN = document.createElement('button')
      elOrderDropDownBTN.classList.add('dropdown-button')
      this.clickListeners.push(
        {target: this.props.isDropDownOpen ? '' : 'dropdown-button', ignore: 'dropdown-item', callback: () => this.eventHandler({type:  EventType.setDropDown, payload: !this.props.isDropDownOpen} as Event)}
      )
      elOrderDropDownBTN.textContent = this.localisation.get('order')
      elBeerPopupFooter.appendChild(elOrderDropDownBTN)

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
    return document.createElement('div')
  }

  renderDropDown(items: string[], mainClass: string, callback: boolean = true, openItem: number | undefined): HTMLElement {
    const elDropDown = document.createElement('div')
    elDropDown.classList.add('dropdown-container')
    elDropDown.classList.add(mainClass)
    items.forEach((item: string, i: number) => {
      const elDropDownItem = document.createElement('div')
      elDropDownItem.textContent = item
      elDropDownItem.classList.add('dropdown-item')
      elDropDownItem.classList.add(mainClass)
      if (typeof this.props.dropDownItemSelected == 'number' && i == openItem) {
        elDropDownItem.classList.add('open')
      }
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