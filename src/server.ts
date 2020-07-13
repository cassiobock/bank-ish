import app from './app'
import * as db from './infra/db'
import { startBrowser } from './browser/pool'

db.connect()
  .then(() => startBrowser())
  .then(() => {
    app.listen(app.get('port'), () => {
      console.log(`listening on port ${app.get('port')}`)
    })
  })
