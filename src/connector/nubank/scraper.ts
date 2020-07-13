import puppeteer from 'puppeteer'
import * as extractor from './extractor'
import { getPage } from '../../browser/pool'
import { IBankInfo } from './model'

const LOGIN_URL = 'https://app.nubank.com.br/#/login'
const BILL_URL = 'https://app.nubank.com.br/#/bills'

export async function getClient(sessionId: string, newSession = false) {
  const page = await getPage(sessionId, newSession)

  if (!page) {
    throw new Error('missing session')
  }

  function injectScrapingFunctions() {
    return page.addScriptTag({
      content: `window.bankishExtract = {
        getAccountDetails: ${extractor.getAccountDetails},
        getBillsByType: ${extractor.getBillsByType}
      }`
    })
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

  async function getBankInfo(): Promise<Partial<IBankInfo>> {
    await page.goto(BILL_URL, { waitUntil: 'networkidle0' })
    await page.waitForSelector('#loaderDiv[style*="display: none;"]')

    await injectScrapingFunctions()

    return await page.evaluate(() => {
      const extractor = (window as any).bankishExtract as extractor.NubankExtractor

      const { name, values } = extractor.getAccountDetails(document.body)

      const [openBill] = extractor.getBillsByType(document.body, 'open')
      const overdue = extractor.getBillsByType(document.body, 'overdue')
      const future = extractor.getBillsByType(document.body, 'future')

      return {
        name,
        values,
        bills: {
          open: openBill,
          overdue,
          future
        }
      }
    })
  }

  return {
    authenticate,
    getQRCode,
    isLogged,
    getBankInfo
  }
}
