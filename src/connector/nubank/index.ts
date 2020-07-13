import * as nubank from './scraper'
import BankInfo from './model'

export async function login(sessionId: string, username: string, password: string): Promise<string> {
  const scraper = await nubank.getClient(sessionId, true)
  await scraper.authenticate(username, password)

  const { _id } = await new BankInfo().save()

  return _id
}
