// config.js
const { Api, JsonRpc } = require(`eosjs`)
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig')
const fetch = require(`node-fetch`) // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require(`util`) // node only; native TextEncoder/Decoder

const signatureProvider = new JsSignatureProvider([
    `5JBx5gSkCPFqwJisB36jPmif1JMznzL9twE65u5TGUMb38TpgJY`,
])
const rpc = new JsonRpc(`https://api-kylin.eoslaomao.com`, { fetch })
const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
})


module.exports = {
    api,
}