import puppeteer, { Browser } from 'puppeteer'

let browser: Browser = null
const pool: Record<string, puppeteer.Page> = {}

const useHeadless = process.env.NODE_ENV !== 'development'

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: useHeadless
    })
  }

  return browser.createIncognitoBrowserContext()
}

export async function startBrowser() {
  await getBrowser()
}

export async function getPage(id: string, createIfMissing = false) {
  if (pool[id]) {
    if (pool[id].isClosed()) {
      delete pool[id]
      throw new Error('session closed')
    }

    return pool[id]
  }

  if (createIfMissing) {
    pool[id] = await (await getBrowser()).newPage()

    return pool[id]
  }

  return null
}
