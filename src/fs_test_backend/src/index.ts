import { LayersModel } from '@tensorflow/tfjs';
import { Server, nat8, StableBTreeMap, text  } from 'azle';
import bodyParser from 'body-parser';
import express, { Request } from 'express';
import * as tf from '@tensorflow/tfjs'
import { all_model_info } from './gan'


import {
    existsSync,
    mkdirSync,
    readFileSync,
    rmdirSync,
    unlinkSync,
    writeFileSync,
    createWriteStream,
    readdir
} from 'fs';
import { mkdir, readFile, rmdir, unlink, writeFile } from 'fs/promises';

// let map = StableBTreeMap<nat8, text>(0);


let chunks:Uint8Array[] = []

let model:LayersModel

let lastChunkLen = 0

let num = 0


const shard = new Uint8Array(3539134)

export default Server(() => {
    const app = express();

    app.use(express.raw({
        inflate: true,
        limit: '50mb',
        type: () => true, // this matches all content types
      }))
    

    app.get(
        '/alive',
        (req: Request<any, any, any, any>, res) => {
            res.send("I am alive!!!")
        }
    )

    app.get(
        '/create-shard',
        (req: Request<any, any, any, {id: number}>, res) => {
            writeFileSync(`group1-shard${req.query.id}of4.bin`, Buffer.from(shard))
            res.send("created!")
        }
    )


    app.post(
        '/upload',
        (req: Request<any, any, any, {id: number}>, res) => {    
            if(!req.query.id) {
                res.send("chunk not added - wrong id!")
                return
            }

            shard.set(req.body, lastChunkLen)
            lastChunkLen = req.body.length
            

            res.send("chunk added!")
        }
    )
    
    app.post(
        '/upload-json',
        (req: Request<any, any, any, any>, res) => {
            // const data = JSON.parse(req.body)
            writeFileSync("model.json", req.body, {
                encoding: "utf-8"
            })
            res.send("done!!!")
        }
    )

    app.get(
        '/show-json',
        (req: Request<any, any, any, any>, res) => {
            const contents = readFileSync('model.json', 'utf8')
            res.send(contents)
        }
    )

    // app.get(
    //     '/remove',
    //     (req: Request<any, any, any, any>, res) => {
    //         map.remove(1)
    //         map.remove(2)
    //         map.remove(3)
    //         map.remove(4)
    //         res.send("removed!")
    //     }
    // )
    // app.get(
    //     '/asm-chunks',
    //     (req: Request<any, any, any, {id: number}>, res) => {
    //         // assemble chunks
    //         const buf = Buffer.from(chunks[req.query.id], "base64")
    //         // writeFileSync(`group1-shard${req.query.id}of4.bin`, buf, "binary")
    //         res.send("OK!")
    //     }
    // )

    // app.get(
    //     '/show-chunks',
    //     (req: Request<any, any, any, {id: number}>, res) => {
    //         console.log(map.get(req.query.id))
    //         // console.log(map.get(req.query.id).Some?.length)
    //         // console.log(map.get(req.query.id).Some?.slice(0, 10))
    //         res.send("done!")
    //     }
    // )

    app.get(
        '/load-model',
        (req: Request<any, any, any, any>, res) => {
            tf.loadLayersModel(all_model_info["dcgan64"].model_url).then(loadedModel => {
                model = loadedModel
            })
            res.send("model loaded!")
        }
    )

    // app.get(
    //     '/ls',
    //     (req: Request<any, any, any, any>, res) => {
    //         const output:string[] = []
    //         readdir(".", (err, files) => {
    //             files.forEach(file => {
    //               output.push(file)
    //             });
    //         });
    //         res.send(output.toString())
    //     }
    // )

    return app.listen();
});