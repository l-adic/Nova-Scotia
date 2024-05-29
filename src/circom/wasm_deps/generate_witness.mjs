import builder from "./witness_calculator.mjs";
import { WASI } from "wasi";
import { argv, env } from 'node:process';
import { readFileSync, writeFile } from "fs";

if (process.argv.length != 6) {
  console.log(
    "Usage: node generate_witness.js <file.wasm> <input.json> <output.wtns> <circuit.bin>"
  );
} else {
  console.log(process.argv)
  const input = JSON.parse(readFileSync(process.argv[3], "utf8"));
  const buffer = readFileSync(process.argv[2]);
  const wasi = new WASI({
    version: 'preview1',
    args: argv,
    env,
    preopens: {
      '/': process.argv[5],
    },
  });
  let options = {
    initializeWasiReactorModuleInstance: (instance) => {
      wasi.initialize(instance);
    },
    additionalWASMImports: {
      wasi_snapshot_preview1: wasi.wasiImport
    }
  };

  builder(buffer, options).then(async (witnessCalculator) => {
    //    const w= await witnessCalculator.calculateWitness(input,0);
    //    for (let i=0; i< w.length; i++){
    //	console.log(w[i]);
    //    }
    const buff = await witnessCalculator.calculateWTNSBin(input, 0);
    writeFile(process.argv[4], buff, function (err) {
      if (err) throw err;
    });
  });
}