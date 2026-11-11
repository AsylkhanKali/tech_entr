import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';

env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

let extractor;
let venueEmbeddings;

self.onmessage = async ({ data }) => {
  try {
    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
        revision: '761b726dd34fb83930e26aab4e9ac3899aa1fa78',
        dtype: 'q8',
        device: 'wasm',
        progress_callback: event => {
          if (event.status === 'progress' && event.file.endsWith('.onnx')) {
            self.postMessage({ type: 'progress', progress: Math.round(event.progress) });
          }
        }
      });
    }
    if (!venueEmbeddings) {
      const output = await extractor(data.places.map(place =>
        'passage: ' + place.en + '. ' + place.interests
      ), { pooling: 'mean', normalize: true });
      venueEmbeddings = output.tolist();
    }
    const output = await extractor('query: ' + data.prompt, {
      pooling: 'mean', normalize: true
    });
    const query = output.tolist()[0];
    const scores = venueEmbeddings.map(vector =>
      vector.reduce((sum, value, i) => sum + value * query[i], 0)
    );
    self.postMessage({ type: 'result', scores });
  } catch {
    self.postMessage({ type: 'error' });
  }
};
