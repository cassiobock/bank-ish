import mongoose, { Schema, Document } from 'mongoose'

export type BillType = 'overdue' | 'open' | 'future'

export interface ICharge {
  date: string
  description: string
  amount: string
}

export interface IBill {
  status: BillType
  amountDue: string
  dueDate: string,
  charges: ICharge[],
}

export interface IBankInfo extends Document {
  name: string
  isLogged: boolean
  values: {
    future: string
    available: string
  },
  bills: {
    open?: IBill
    future: IBill[]
    overdue: IBill[]
  },
  lastUpdate?: Date
}

const Bill: mongoose.SchemaDefinition = {
  status: { type: String, enum: ['overdue', 'open', 'future'] },
  amountDue: String,
  dueDate: String,
  charges: [{
    date: String,
    description: String,
    amount: String
  }]
}

const BankInfoSchema = new Schema<IBankInfo>({
  name: String,
  isLogged: { type: Boolean, required: true, default: false },
  values: {
    future: String,
    available: String
  },
  bills: {
    open: { type: Bill, default: null },
    future: [Bill],
    overdue: [Bill]
  },
  lastUpdate: { type: Date, default: null }
})

export default mongoose.model<IBankInfo>('BankInfo', BankInfoSchema)
