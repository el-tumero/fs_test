import { LayersModel } from '@tensorflow/tfjs';
import { Server, nat8, StableBTreeMap, text, query  } from 'azle';
import bodyParser from 'body-parser';
import express, { Request } from 'express';
import * as tf from '@tensorflow/tfjs'
import { fileSystem, shards } from './file_system'
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

    // app.get(
    //     '/show-shard',
    //     (req: Request<any, any, any, {filename:string}>, res) => {
    //         // const buffer = readFileSync(req.query.filename)
    //         // console.log(req.query.filename)
    //         // console.log(typeof req.query.filename)
    //         // const fn = req.query.filename

    //         // const contents = readFileSync("test.json", 'utf8')
    //         // const isHere = existsSync(req.query.filename)
    //         // console.log(isHere)
    //         // console.log(buffer.length)
    //         const contents = readFileSync('test.json', 'utf8')
    //         res.send(contents)
    //         // res.send(contents)
    //     }
    // )

    // app.get(
    //     '/create-shard',
    //     (req: Request<any, any, any, {id: number}>, res) => {

    //         // writeFile(`group1-shard${req.query.id}of4.txt`, Buffer.from(shards[req.query.id]), "base64")
           

    //         writeFileSync("test.json", req.body, {
    //             encoding: "utf-8"
    //         })
    //         // writeFile(`test.txt`, "123", "utf-8")
    //         // .then(() => { console.log("upload done!")})
    //         // .catch((err) => { console.log("can't upload", err) })
    //         // writeFileSync(`group1-shard${req.query.id}of4.bin`, Buffer.from(shards[req.query.id]))
    //         // console.log(`group1-shard${req.query.id}of4.bin`)
    //         // console.log("upload done!")
    //         res.send("created!")
    //     }
    // )


    app.post(
        '/upload',
        (req: Request<any, any, any, {shardId: number, chunkId: number}>, res) => {    
            // if(!req.query.shardId) {
            //     res.send("chunk not added - wrong id!")
            //     return
            // }
            if(req.query.chunkId == 0) lastChunkLen = 0

            console.log(req.body.length)
            shards[req.query.shardId].set(req.body, lastChunkLen)
            lastChunkLen += req.body.length //
            
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

    app.get(
        '/load-model',
        (req: Request<any, any, any, any>, res) => {

            const handler = fileSystem("./model.json")
            tf.loadLayersModel(handler).then(loadedModel => {
                console.log(loadedModel.name)
            }).catch(err => {
                console.log(`err: ${err as Error}`)
            })
            res.send("model loaded!")
        }
    )


    return app.listen();
});


