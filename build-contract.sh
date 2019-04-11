rm -rf contract/*.abi
rm -rf contract/*.wasm

eosio-cpp contract/test.cpp -o contract/test.wasm --abigen --contract=test 