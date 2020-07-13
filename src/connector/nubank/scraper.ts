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

  async function isLogged() {
    const url = await page.evaluate(() => window.location.href)
    return url !== LOGIN_URL
  }

  async function getQRCode() {
    const reloadElement = await page.$('div.qr-field .reload')

    const isVisible = await reloadElement.evaluate((el: HTMLDivElement) => {
      return el.style.display !== 'none'
    }, reloadElement)

    if (isVisible) {
      await reloadElement.click()
    }

    const qrCodeElement = (await page.$('div.qr-code img')) as puppeteer.ElementHandle<HTMLImageElement>

    return qrCodeElement.evaluate(
      (e) => e.getAttribute('src'),
    )
  }

  return {
    authenticate,
    getQRCode,
    isLogged,
  }
}
