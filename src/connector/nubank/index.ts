import * as nubank from './scraper'
import BankInfo from './model'

export async function login(sessionId: string, username: string, password: string): Promise<string> {
  const scraper = await nubank.getClient(sessionId, true)
  await scraper.authenticate(username, password)

  const { _id } = await new BankInfo().save()

  return _id
}

export async function isLogged(sessionId: string, bankInfoId: string) {
  const scraper = await nubank.getClient(sessionId)

  const isLogged = await scraper.isLogged()

  if (!isLogged) {
    return isLogged
  }

  await BankInfo.findByIdAndUpdate(bankInfoId, {
    isLogged
  })

  return isLogged
}

export async function getQRCode(sessionId: string) {
  const scraper = await nubank.getClient(sessionId)
  return scraper.getQRCode()
}
