const apikey= "3WmMvwEbSLcHri9iPicRgCTK9L1Ld1GB"; // primero se poner apikey
const host = "https://api.giphy.com";

async function buscarGifs(query, offset, limit) {
    try {
        const response = await fetch(
            `${host}/v1/gifs/search?api_key=${apikey}&limit=${limit}&lang=es&q=${query}&offset=${offset}`
        )
        const gifs = await response.json()
        return gifs
    } catch (error) {
        console.error(error);
    }
}

async function trendingGifs () {
    try {
        const response = await fetch(
            `${host}/v1/gifs/trending?api_key=${apikey}&limit=12`
        )
        const gifstrending = await response.json()
        console.log(gifstrending);
        return gifstrending
    } catch (error) {
        console.error(error);
    }
}

async function crearGifos (formData) { 
    console.log(formData.get('file'));
    try {
        const response = await fetch(
            `https://upload.giphy.com/v1/gifs?api_key=${apikey}`,
            {
                method: 'POST',
                body: formData
            }
        );
        console.log('Giphy response', response);
        const result = await response.json()
        console.log('Giphy json', result)
        return result.data.id
    } catch (error) {
        console.error(error);
    }
}

const urlsug = `${host}/v1/tags/related/`;
async function sugerencias (term) { 
    try {
        const response = await fetch(
            `${urlsug}${term}?api_key=${apikey}`
        )
        const searchsugerencias = await response.json()
        return searchsugerencias 
    } catch (error) {
        console.error(error);
    }
}

async function buscarFavoritos(favoritos) { 
    try {
        const response = await fetch(
            `${host}/v1/gifs?api_key=${apikey}&ids=${favoritos}`
        )
        const objetos = await response.json()
        console.log(objetos)
        return objetos 
    } catch (error) {
        console.error(error);
    }
}

async function buscarMisGifos(misGifosIds) { 
    try {
        const response = await fetch(
            `${host}/v1/gifs?api_key=${apikey}&ids=${misGifosIds}`
        )
        const objetos = await response.json()
        console.log(objetos)
        return objetos 
    } catch (error) {
        console.error(error);
    }
}

async function buscarGifPorId (id) {
    try {
        const response = await fetch(
            `${host}/v1/gifs/${id}?api_key=${apikey}`
        )
        const gif = await response.json()
        return gif.data 
    } catch (error) {
        console.error(error);
    }
}