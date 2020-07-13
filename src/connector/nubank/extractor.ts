import { IBankInfo, IBill, BillType } from './model'

export interface NubankExtractor {
  getAccountDetails(body: HTMLElement): Pick<IBankInfo, 'name' | 'values'>
  getBillsByType(body: HTMLElement, type: BillType): IBill[]
}

export function getAccountDetails(body: HTMLElement): Pick<IBankInfo, 'name' | 'values'> {
  const name = body.querySelector<HTMLAnchorElement>('a.profile-title').innerText

  const future = body.querySelector<HTMLDivElement>('div.limitbar .future .amount').innerText
  const available = body.querySelector<HTMLDivElement>('div.limitbar .available .amount').innerText

  return {
    name,
    values: {
      future,
      available
    }
  }
}

export function getBillsByType(
  body: HTMLElement,
  type: BillType
) {
  function getBillDetails(tab: HTMLElement, type: BillType): Omit<IBill, 'lastUpdate'> {
    const tabId = tab.getAttribute('aria-labelledby')
  
    // we need to click on every tab to actually fill the charges
    document.querySelector<HTMLElement>(`md-tab#${tabId}`).click()
  
    const amountDue = tab.querySelector<HTMLDivElement>('div.summary div.amount-due div.amount').innerText
    const dueDate = tab.querySelector<HTMLDivElement>('div.summary div.amount-due div.due span.date').innerText
  
    const charges = Array.from(tab.querySelectorAll<HTMLDivElement>('div.charges div.charges-list div.charge'))
      .map(charge => {
        const date = charge.querySelector<HTMLDivElement>('div.time').innerText
        const description = charge.querySelector<HTMLDivElement>('div.description').innerText
        const amount = charge.querySelector<HTMLDivElement>('div.amount').innerText
  
        return { date, description, amount }
      })
  
    return {
      status: type,
      amountDue,
      dueDate,
      charges
    }
  }

  const tabs = Array.from(body.querySelectorAll<HTMLElement>('div.md-tab-content'))

  return tabs
    .filter(tab => tab.querySelector('div.summary').classList.contains(type))
    .map(tab => getBillDetails(tab, type))
}
