import * as tf from '@tensorflow/tfjs'

export const all_model_info = {
    dcgan64: {
        description: 'DCGAN, 64x64 (16 MB)',
        model_url: "file://model.json",
        model_size: 64,
        model_latent_dim: 128,
        draw_multiplier: 4,
        animate_frame: 200,
    }
};

let default_model_name = 'dcgan64';


export async function computing_generate_main(model:tf.LayersModel, size:number, draw_multiplier:number, latent_dim:number) {
    const y = tf.tidy(() => {
        const z = tf.randomNormal([1, latent_dim]);
        // @ts-ignore
        const y = model.predict(z).squeeze().transpose([1, 2, 0]).div(tf.scalar(2)).add(tf.scalar(0.5));
        return y
    });

    const y1 = y.mul(255)
    const y2 = await y1.array()

    return y2
}