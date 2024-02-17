import { Server } from 'azle';
import bodyParser from 'body-parser';
import express, { Request } from 'express';
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

const chunks:string[] = []

export default Server(() => {
    const app = express();

    app.use(bodyParser.text())
    

    app.get(
        '/alive',
        (req: Request<any, any, any, any>, res) => {
            res.send("I am alive!!!")
        }
    )


    app.post(
        '/upload',
        (req: Request<any, any, any, {id: number}>, res) => {
            if(!req.query.id) {
                res.send("chunk not added - wrong id!")
                return
            }
            if(typeof chunks[req.query.id] === 'undefined') {
                chunks[req.query.id] = req.body
            } else {
                chunks[req.query.id] = chunks[req.query.id].concat(req.body)
            }

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
        '/asm-chunks',
        (req: Request<any, any, any, any>, res) => {
            // assemble chunks
            chunks.forEach((chunk, i) => {
                const buf = Buffer.from(chunk, "base64")
                writeFileSync(`group1-shard${i}of4.bin`, buf, "binary")
            })
        }
    )

    app.get(
        '/show-chunks',
        (req: Request<any, any, any, any>, res) => {
            res.send(chunks.toString())
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