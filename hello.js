const fs = require(`fs`)
const path = require(`path`)
const { Serialize } = require(`eosjs`)
const { api } = require(`./config`)

function getDeployableFilesFromDir(dir) {
  const dirCont = fs.readdirSync(dir)
  const wasmFileName = dirCont.find(filePath => filePath.match(/.*\.(wasm)$/gi))
  const abiFileName = dirCont.find(filePath => filePath.match(/.*\.(abi)$/gi))
  if (!wasmFileName) throw new Error(`Cannot find a ".wasm file" in ${dir}`)
  if (!abiFileName) throw new Error(`Cannot find an ".abi file" in ${dir}`)
  return {
    wasmPath: path.join(dir, wasmFileName),
    abiPath: path.join(dir, abiFileName),
  }
}

async function deployContract({ account, contractDir }) {
  const { wasmPath, abiPath } = getDeployableFilesFromDir(contractDir)

  // 1. Prepare SETCODE
  // read the file and make a hex string out of it
  const wasm = fs.readFileSync(wasmPath).toString(`hex`)

  // 2. Prepare SETABI
  const buffer = new Serialize.SerialBuffer({
    textEncoder: api.textEncoder,
    textDecoder: api.textDecoder,
  })

  let abi = JSON.parse(fs.readFileSync(abiPath, `utf8`))
  const abiDefinition = api.abiTypes.get(`abi_def`)
  // need to make sure abi has every field in abiDefinition.fields
  // otherwise serialize throws
  abi = abiDefinition.fields.reduce(
    (acc, { name: fieldName }) =>
      Object.assign(acc, { [fieldName]: acc[fieldName] || [] }),
    abi
  )
  abiDefinition.serialize(buffer, abi)

  // 3. Send transaction with both setcode and setabi actions
  const result = await api.transact(
    {
      actions: [
        {
          account: 'eosio',
          name: 'setcode',
          authorization: [
            {
              actor: account,
              permission: 'active',
            },
          ],
          data: {
            account: account,
            vmtype: 0,
            vmversion: 0,
            code: wasm,
          },
        },
        {
          account: 'eosio',
          name: 'setabi',
          authorization: [
            {
              actor: account,
              permission: 'active',
            },
          ],
          data: {
            account: account,
            abi: Buffer.from(buffer.asUint8Array()).toString(`hex`),
          },
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  )

  return result
}


async function buyRam(payer, receiver , bytes) {
    const result = await api.transact({
        actions: [{
          account: 'eosio',
          name: 'buyrambytes',
          authorization: [{
            actor: payer,
            permission: 'active',
          }],
          data: {
            payer: payer,
            receiver: receiver,
            bytes: bytes,
          },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });

    return result;
}

(async()=> {
    let user1 = 'mykeyram1234'
    // console.log(await api.rpc.get_account(user1));

    try {
        // kcleos --print-response set contract hellomykey31 ./test &> response.txt
        console.log(await deployContract({ account: user1, contractDir: `./contract` }));
        
    } catch (error) {
        console.log(`\n${error}\n`);
    }
    // console.log(await buyRam(user1, user1, 1024));
    // console.log(``);

    // console.log(await api.rpc.get_account(user1));


})()