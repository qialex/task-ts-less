import { MOCK_Beers } from "./mock"
import { ApiResult, ApiStatus, BeerDTO } from "./types"

export class ApiService {
  url: string = process.env.API_URL || ''

  async getAll(): Promise<ApiResult<BeerDTO[]>> {
    return fetch(this.url)
      .then((response: Response) => {
        if (!response.ok) {
          throw Error(response.status.toString())
        }
        return response.json()
      })
      .then(({record}: {record: BeerDTO[]}) => ({data: record, status: ApiStatus.ok}))
      .catch((error: Error) => {
        console.error(error)

        // mock only
        if (parseInt(process.env.USE_MOCK || '')) {
          return {data: MOCK_Beers, status: ApiStatus.ok}
        }

        return {data: [], status: ApiStatus.error}
      })
  }
}