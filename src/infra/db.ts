import mongoose from 'mongoose'

const DB_HOST = process.env.DB_HOST

export async function connect() {
  try {
    const db = mongoose.connection

    const returnPromise = new Promise((resolve) => {
      db.once('open', () => resolve())
    })

    await mongoose.connect(`mongodb://${DB_HOST}/bankish`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: 'root',
      pass: 'pk4*YEoqtEcDBe68XapG',
      authSource: 'admin'
    })

    mongoose.set('useFindAndModify', false)

    return returnPromise
  } catch (e) {
    console.log(e)
  }
}
