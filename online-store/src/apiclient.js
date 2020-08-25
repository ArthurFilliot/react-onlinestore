import axios from 'axios'
import { setupCache } from 'axios-cache-adapter';

const cache = setupCache({
    cache: {
        readHeaders: true,
        exclude: { query: false }
    }
})

const apiclient = axios.create({
    adapter: cache.adapter,
    timeout: 2000
})

export function api(){
    return apiclient;
}