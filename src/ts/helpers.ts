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