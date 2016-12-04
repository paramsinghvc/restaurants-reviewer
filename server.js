const path = require('path')
const express = require('express')
const port = (process.env.PORT || 8080)
console.log('df');

const app = express()
const indexPath = path.join(__dirname, 'index.html')
const publicPath = express.static(path.join(__dirname, 'assets'))
app.use('/', express.static(__dirname))
app.get('/', function(_, res) { res.sendFile(indexPath) })

app.listen(port)
console.log(`Listening at http://localhost:${port}`)
