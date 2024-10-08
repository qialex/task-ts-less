import { BeerDTO } from "./types";

export const MOCK_Beer: BeerDTO = {
  abv: 4.5,
  description: `It is important to express this very aspect in the packaging. Why stick to old norms when you don't need to? Before a wine enthusiast can even savour the content, the bottle already speaks volumes. We help you communicate this effectively. Based on the three classic shapes – the Bordeaux, the Burgundy and the Rhine wine bottle – a whole wealth of possibilities lies before you.
    The basic decision
    Your project starts with this basic decision. Legal and technical requirements present no obstacle. Optimum UV protection in our antique colour tone goes without saying. Perhaps other providers will tell you all this too. But things get really exciting when we start talking about shoulder height, bottom, embossing, reliefs and closure variants.
    In a league of its own
    As of this moment, you will notice that we are now playing in a completely different league - and will continue to do so until the perfect finishing has been achieved. And best of all, there is no obligation to place any kind of three-year order requirement. After all, we are specialists in the quantities YOU want. Anything from 1,000 units. Try us out!
  `,
  ibu: 55,
  id: 15,
  image_url: './images/mock_image.png',
  name: 'SomeLongNameSomeLongNameSomeLongNameSomeLongNameSomeLongNameSomeLongName',
}

export const MOCK_Beers: BeerDTO[] = Array(25).fill({...MOCK_Beer}).map((b, i) => ({...b, id: i+1, ibu: Math.round(Math.random() * 100)}))