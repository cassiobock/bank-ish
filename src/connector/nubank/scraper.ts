import puppeteer from 'puppeteer'
import { getPage } from '../../browser/pool'

const LOGIN_URL = 'https://app.nubank.com.br/#/login'

export async function getClient(sessionId: string, newSession = false) {
  const page = await getPage(sessionId, newSession)

  if (!page) {
    throw new Error('missing session')
  }

  async function waitForSelectorAndGetAttribute(selector: string, attrName: string) {
    const element = (await page.waitForSelector(selector)) as puppeteer.ElementHandle<HTMLElement>

    return element.evaluate(
      (e, attrName) => e.getAttribute(attrName),
      attrName
    )
  }

  async function authenticate(username: string, password: string) {
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' })

    await page.type('[ng-model="user"]', username)
    await page.type('[ng-model="password"]', password)

    await page.click('button[type="submit"]')

    return await waitForSelectorAndGetAttribute('div.qr-code img', 'src')
  }

  return {
    authenticate,
  }
}
