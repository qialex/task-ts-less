import { Beer, BeerDTO } from "./types";

export function transformBeer(beersDTO: BeerDTO[]): Beer[] {
  return beersDTO.map((beerDTO: BeerDTO) => ({
    abv: beerDTO.abv,
    description: beerDTO.description,
    ibu: beerDTO.ibu,
    id: beerDTO.id,
    imageUrl: beerDTO.image_url,
    name: beerDTO.name,
  }))
}

export function createHTMLElement(tag: string, parent?: HTMLElement, classes?: string[]|string, textContent?: string) {
  const el = document.createElement(tag)
  if (classes) {
    if (typeof classes === 'string') {
      el.classList.add(classes)
    } else {
      classes.forEach((c: string) => {
        el.classList.add(c)
      })
    }
  }
  if (textContent?.length) {
    el.textContent = textContent
  }
  if (parent) {
    parent.appendChild(el)
  }
  return el
}

export function getBeerBgClass(beer: Beer): string {
  return `beer-item-img-bg-${beer.ibu.toString()[0]}`
}