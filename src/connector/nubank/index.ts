import dateDiffInMinutes from 'date-fns/differenceInMinutes'

import * as nubank from './scraper'
import BankInfo from './model'

function compareDates(date?: Date) {
  return date != null && dateDiffInMinutes(new Date(), date) < 5
}

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

export async function getBills(sessionId: string, bankInfoId: string) {
  const bankInfo = await BankInfo.findById(bankInfoId)

  if (bankInfo?.lastUpdate && compareDates(bankInfo?.lastUpdate)) {
    return bankInfo.toJSON()
  }

  const scraper = await nubank.getClient(sessionId)
  const bills = await scraper.getBankInfo()

  return BankInfo.findByIdAndUpdate(
    bankInfoId,
    {
      ...bills,
      lastUpdate: new Date()
    },
    { lean: true, new: true }
  )
}
