import { LayersModel } from '@tensorflow/tfjs';
import { Server, nat8, StableBTreeMap, text, query  } from 'azle';
import bodyParser from 'body-parser';
import express, { Request } from 'express';
import * as tf from '@tensorflow/tfjs'
import { fileSystem } from './file_system'
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



const shards:Uint8Array[] = [
    new Uint8Array(3539134), 
    new Uint8Array(3539134), 
    new Uint8Array(3539134),
    new Uint8Array(3539134),
    new Uint8Array(3036106),
]


function toReadableStream(value:any) {
	return new ReadableStream({
		start(controller) {
			controller.enqueue(value);
			controller.close();
		},
	});
}

async function myFetch(input: string):Promise<Response>{
    
    let contents: string | Buffer = ""
    if(input.includes(".json")) contents = readFileSync(input)

    return new Promise<Response>((resolve, reject) => {

        //@ts-ignore
        resolve({status: 200, ok:true, json: () => JSON.parse(contents)})
    })           
}



// const MyIOHandler = {
//     load: () => {
//         console.log("read")
//         const contents = readFileSync("model.json", "utf-8")
//         return JSON.parse(contents) 
//     }
// }



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
            writeFileSync(`group1-shard${req.query.id}of4.bin`, Buffer.from(shards[req.query.id]))
            res.send("created!")
        }
    )


    app.post(
        '/upload',
        (req: Request<any, any, any, {shardId: number, chunkId: number}>, res) => {    
            if(!req.query.shardId) {
                res.send("chunk not added - wrong id!")
                return
            }
            if(req.query.chunkId == 0) lastChunkLen = 0

            shards[req.query.shardId].set(req.body, lastChunkLen)
            lastChunkLen = req.body.length
            // console.log(lastChunkLen)
            
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

            const handler = fileSystem("file://model.json")
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


