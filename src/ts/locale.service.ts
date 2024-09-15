export const localeLangs = {
  en: 'en',
}

export const dictionaryDefault = {
  apiError: 'Some error while fetching the data',
  notFound: 'Not Found',
  repeat: 'Repeat',
  abbrIBU: 'IBU',
  order: 'Order',
  glass: 'Glass',
  can: 'Can',
  box: 'Box',
}

export type LocaleLangType = typeof localeLangs;
export type LocaleLangKey = keyof LocaleLangType;
export type LocaleLang = LocaleLangType[LocaleLangKey]

export type DictionaryType = typeof dictionaryDefault;
export type DictionaryKey = keyof DictionaryType;
export type DictionaryItem = DictionaryType[DictionaryKey]

export class Dictionary {
  props: {[key in DictionaryKey]: DictionaryItem}

  constructor(props: {[key in DictionaryKey]: DictionaryItem}) {
    this.props = props
  }

  get(key: DictionaryKey): DictionaryItem | DictionaryKey {
    return this.props[key] || key
  }
}

export class LocaleService {

  defaultLang: LocaleLang = localeLangs.en

  dictionaries: {[key in LocaleLang]: Dictionary} =  {
    [localeLangs.en]: new Dictionary(dictionaryDefault)
  }

  get(key: DictionaryKey, lang?: LocaleLang): DictionaryItem | DictionaryKey {
    return this.dictionaries[lang || this.defaultLang].get(key)
  }
}