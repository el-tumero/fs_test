/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/**
 * Convert an ArrayBuffer to a Buffer.
 */
export function toBuffer(ab: ArrayBuffer): Buffer {
    const view = new Uint8Array(ab);
    return Buffer.from(view);  // copies data
  }
  
  /**
   * Convert a Buffer or an Array of Buffers to an ArrayBuffer.
   *
   * If the input is an Array of Buffers, they will be concatenated in the
   * specified order to form the output ArrayBuffer.
   */


  // function toArrayBuffer(buffer) {
  //   const arrayBuffer = new ArrayBuffer(buffer.length);
  //   const view = new Uint8Array(arrayBuffer);
  //   for (let i = 0; i < buffer.length; ++i) {
  //     view[i] = buffer[i];
  //   }
  //   return arrayBuffer;
  // }
  export function toArrayBuffer(buf: Buffer|Buffer[]): ArrayBuffer {
    console.log("RUN TO ARRAY BUF")
    if (Array.isArray(buf)) {
      console.log("IS ARRAY")
      // An Array of Buffers.
      let totalLength = 0;
      for (const buffer of buf) {
        console.log("ten buffer len:", buffer.length)
        totalLength += buffer.length;
        console.log("po kazdym", totalLength)
      }

      console.log("total total", totalLength)

      
      const ab = new ArrayBuffer(totalLength);
      const view = new Uint8Array(ab);
      console.log("tutaj error?")
      let pos = 0;
      for (const buffer of buf) {
        view.set(buffer, pos)
        pos += buffer.length
        // pos += buffer.copy(view, pos);
      }
      console.log("OK")
      // console.log(view)
      console.log(ab.byteLength)
      console.log(ab instanceof ArrayBuffer)
      // console.log(view.slice(0, 50))
      return ab;
    } else {
      console.log("OK2")
      // A single Buffer. Return a copy of the underlying ArrayBuffer slice.
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
  }