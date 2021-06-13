const isMobileDevice = () =>  window.mobileCheck() || window.innerWidth <= 700
let isCurrentlyMobileDevice = false

// Navbar
const btnModoNocturno = document.querySelector("#modoNocturno");
const btnFavoritos = document.getElementById("btn-favoritos")
const btnMisGifos = document.getElementById("btn-misgifos")
const btnCrearGifo = document.getElementById("button-nuevo-gifo")

// BARRA DE BUSQUEDA
let searchWord = "" 
const searchBox = document.getElementById("searchBar")
const gifsResultsGrid = document.getElementById("listaGifs");
const gifsNoResults = document.getElementById("no-results");
const gifsResultsIcon = document.getElementById("section-icon");
const suggestions = document.getElementById("suggestion")
const listSugerencias = document.getElementById("suggestion-list")
const btnSearch = document.getElementById("searchButton")
const btnVerMas = document.getElementById("viewmore")
const searchBar = document.getElementsByClassName("main-search")[0]

// Paginación resultados
let searchOffset=0 // nro de pagina
let searchLimit=12 //

// TRENDINGS
const listTrending = document.getElementById("trendingcarrusel")
const btnTrendingLeft = document.getElementById("button-left")
const btnTrendingRight = document.getElementById("button-right")
let trendingResults = []

//MODAL
const modal = document.getElementById("myModal");
const imgModal = document.getElementById("modal-img");
const txtModalUser = document.getElementById("modal-user");
const txtModalTitulo = document.getElementById("modal-titulo");
const btnModalToggleFavs = document.getElementById("modal-favoritos")
const btnModalDescargar = document.getElementById("modal-descargar")
const spanModalClose = document.getElementById("modal-close");
const btnModalLeft = document.getElementById("modal-button-left")
const btnModalRight = document.getElementById("modal-button-right")
let currentModalGifoId = ""

// FAVORITOS
let listfavoritos = []
if (localStorage.getItem("favoritos") !== null) {
    listfavoritos = JSON.parse(localStorage.getItem("favoritos"))
}

navigation = window.location.href.split("#")
if (navigation[1]) {
    switch (navigation[1]) {
        case "favoritos":
            onFavoritos();
            break;
        case "mis-gifos":
            onMisGifos();
            break;
        default:
            break;
    }
}


// NAVBAR

btnModoNocturno.addEventListener('click', () => onIndexNightMode() );

btnFavoritos.addEventListener( "click", () => onFavoritos() );

btnMisGifos.addEventListener('click', async() => onMisGifos() );

btnCrearGifo.addEventListener ('click', () => {
    window.location.href = './new_gifo.html'; //relative to domain
    btnFavoritos.classList.remove("menu-link-active")
    btnMisGifos.classList.remove("menu-link-active")
    btnCrearGifo.classList.add("menu-link-active")
})

// Navigation

function onFavoritos() {
    btnFavoritos.classList.add("menu-link-active")
    btnMisGifos.classList.remove("menu-link-active")
    btnCrearGifo.classList.remove("menu-link-active")
    showFavoriteGifs()
}

function onIndexNightMode () {
    document.body.classList.toggle('dark');
    btnModoNocturno.classList.toggle('active');
}

async function onMisGifos () {
    btnFavoritos.classList.remove("menu-link-active")
    btnMisGifos.classList.add("menu-link-active")
    btnCrearGifo.classList.remove("menu-link-active")

    gifsNoResultsDisplay({
        title: "Mis Gifos",
        message:"¡Anímate a crear tu primer GIFO!",
        sectionIcon: "./svg/icon-mis-gifos.svg",
        noDataImg: "./svg/icon-mis-gifos-sin-contenido.svg"
    })

    if (misGifos.length) {
        const gifosIds = misGifos.map( gifo => gifo.id)
        gifsResultsDisplay()
        const gifos = await buscarFavoritos(gifosIds.join(','));
        dibujarMisGifs (gifos)    
    }
}

// SEARCH GIFOS EVENTS

// Teclear en barra de busqueda de gifos
searchBox.addEventListener("keyup", async (event) =>{ // 3) escucho el searchbox. el evento a escuchar es el keyup, cuando se levanta una tecla al escribir
    searchWord = searchBox.value                          // 4) la funcion que se ejecuta cuando se ejecuta el evento keyup es searchWord.value, El .value es el texto que se busca
    if (event.key === "Enter")  {                     // 5)si el largo del texto en mayor a 3, busca la palabra
        
        let sugerenciasResultado = await sugerencias(searchWord) // Buscamos las sugerencias al searchWord
        listSugerencias.innerHTML = ""

        // Lista de sugerencias
        for (let index = 0; index < 4; index++) {               // Escribimos/Mostramos las sugerencias como elementos <li> en el html
            const resultName = sugerenciasResultado.data[index].name
            const element = `
            <li 
            class="suggestion-element"
            onclick="populateGifoGallery('${resultName}')"
            style="cursor: pointer"
            >
                <img src="./svg/icon-search-modo-noct.svg" alt="">
                ${resultName}
            </li>`;
            listSugerencias.innerHTML += element
        }

        await populateGifoGallery(searchWord)

        
    }
    else {
        listSugerencias.innerHTML = ""
    }
})

async function populateGifoGallery (searchWord, ) {
    // Busqueda: preparamos la sección
    searchOffset=0
    gifsResultsIcon.src = "" // la busqueda no lleva icono de sección

    gifsNoResultsDisplay({
        title: searchWord,
        message: "Intenta con otra búsqueda.",
        noDataImg: "./svg/icon-busqueda-sin-resultado.svg",
        sectionIcon: ""
    })

    console.log("search params", searchWord, searchOffset, searchLimit);
    const gifs =  await buscarGifs(searchWord, searchOffset, searchLimit)

    
    if (gifs.data.length) {
        gifsResultsDisplay()
        searchOffset += searchLimit
        dibujarGifs (gifs)
        document.getElementById("resultsPanel").style.display = "block"    // 7) aparece la seccion3-results mostrando los gifs
    }
}

// Buscar gifos
btnVerMas.addEventListener('click', async (event) => { 
    let gifs=  await buscarGifs(searchWord, searchOffset, searchLimit)          
    dibujarGifs (gifs)
    searchOffset += searchLimit
});

// Cuando el searchbox es seleccionado el section1focusoff desaparece. 
searchBox.addEventListener('focus', (event) => {

    if (isMobileDevice()){
        document.getElementById ("section1focusoff").style.display = "none"
        suggestions.style.display = "none"
    } else {
        suggestions.style.display = "block"
        searchBar.classList.add("main-search-open");
        searchBar.getElementsByClassName("main-search-input")[0].classList.add("main-search-input-open");
    }

    btnSearch.src="./svg/close.svg";
    document.getElementById ("lupita").style.display = "block"
}) 

// Cuando el searchbox se deselecciona
btnSearch.addEventListener('click', (event) => {
    searchBox.value = ""
    searchWord = ""

    
    searchBar.classList.remove("main-search-open");
    searchBar.getElementsByClassName("main-search-input")[0].classList.remove("main-search-input-open");
    
    btnSearch.src="./svg/icon-search.svg";
    suggestions.style.display = "none"
    
    document.getElementById ("section1focusoff").style.display = "block"    
    document.getElementById("resultsPanel").style.display = "none" 
    document.getElementById ("lupita").style.display = "none"
})

// TRENDING GIFOS EVENTS
 
spanModalClose.addEventListener('click', () => {
    modal.style.display = "none";
})

btnModalToggleFavs.addEventListener("click", () => {
    toggleFavorite(currentModalGifoId)
})

function toggleFavorite (id) {
    if (listfavoritos.indexOf(id) === -1){
        listfavoritos.push(id)
    } else {
        listfavoritos = listfavoritos.filter( f => f !== id)
        console.log(`El gifo de id: ${id} se elimino de los favoritos`)
    }

    console.log("Mis nuevos favoritos actuales son:", listfavoritos)    
    localStorage.setItem( "favoritos", JSON.stringify(listfavoritos))
    
    let isFavorite =  listfavoritos.includes(id)
    btnModalToggleFavs.src = isFavorite ? "./svg/icon-fav-active.svg" : "./svg/icon-fav.svg"
}

let starIndexTrending = 0
let trendingTotalDisplay = 3

btnTrendingLeft.addEventListener('click', ()=> {
    starIndexTrending = starIndexTrending <= 0 ? 0 : starIndexTrending - 1
    displayTrending(
        trendingResults, 
        starIndexTrending,
    )
})

btnTrendingRight.addEventListener('click', ()=> {
    
    let overpassLimit = starIndexTrending + trendingTotalDisplay > trendingResults.length - 1
    let limit = trendingResults.length - trendingTotalDisplay
    console.log("limit", limit, trendingResults.length, trendingTotalDisplay);
    starIndexTrending =  overpassLimit ? limit : starIndexTrending + 1

    displayTrending(
        trendingResults, 
        starIndexTrending,
    )
})

// MODAL

btnModalLeft.addEventListener('click', ()=> {
    starIndexTrending = starIndexTrending <= 0 ? 0 : starIndexTrending - 1

    openModal (trendingResults[starIndexTrending].id)
    
})

btnModalRight.addEventListener('click', ()=> {
    
    let overpassLimit = starIndexTrending > trendingResults.length - 1
    let limit = trendingResults.length - trendingTotalDisplay
    starIndexTrending =  overpassLimit ? limit : starIndexTrending + 1

    console.log(starIndexTrending);

    openModal (trendingResults[starIndexTrending].id)
})

// TRENDING
async function trendingSearch () {

    if (isMobileDevice()) {
        listTrending.className = "carrusel"
    } else {
        listTrending.className = "carrusel-static"
    }

    let gifs =  await trendingGifs()
    trendingResults = gifs.data
    

    displayTrending (gifs.data, starIndexTrending, trendingTotalDisplay)
    
}

function displayTrending (gifs, start) {

    listTrending.innerHTML = ""

    for (let index = start; index < start + trendingTotalDisplay; index++) {

        const gifo = {
            id: gifs[index].id,
            url: gifs[index].images.fixed_width.url,
            username: gifs[index].username,
            title: gifs[index].title
        }

        listTrending.innerHTML += createTrendingGifoElement(gifo)
    }
}

function refreshTrendingGifo(id) {

    for (let gifoElement of listTrending.childNodes) {
        if (gifoElement.id === id) {
            const gifoData = getGifoInfo(gifoElement)
            gifoElement.innerHTML = createTrendingGifoElement(gifoData)
        }
    }
}

function createTrendingGifoElement (gifo) {
  
    const favoriteActiveElement = isGifoAFavorite(gifo.id) ? 
        `<img class="icon-fav-active" src="./svg/icon-fav-active.svg" alt="">` : 
        "";
    
    const favoriteButton = `<div 
                                class="toggle-favorite icon" 
                                onclick="toggleFavoriteTrending('${gifo.id}')"
                                >
                                                        
                                <img 
                                    class="icon icon-fav" 
                                    src="./svg/icon-fav.svg" 
                                    alt=""
                                    >
                                ${favoriteActiveElement}
                            </div>`;

    const onClick = `onclick="openModal('${gifo.id}')"`

    const element = `<div
                        id="${gifo.id}" 
                        class="carrusel-image"
                        ${isMobileDevice()? onClick : "" }  
                        > 
                        <img 
                            class="hovercard-trending" 
                            src="${gifo.url}" 
                            alt=""
                            > 
                        <div class="zindex" ${(isMobileDevice() ? onClick : "" )}  >
                            <div class="imagenezindex ">
                                ${favoriteButton}
                                <div 
                                    class=" icon icon-download" 
                                    onclick="saveAs( '${gifo.url}', 'gifo')"
                                    >
                                    </div>
                                <div 
                                    class=" icon-max-normal" 
                                    src="./svg/icon-max-normal.svg" 
                                    alt="" 
                                    ${(!isMobileDevice() ? onClick : "" )}
                                    > </div> 
                            </div>
                            <div class="pzindex">  
                                <p>${gifo.username}</p>
                                <p>${gifo.title}</p>
                            </div>    
                        </div> 
                    </div>`;
    return element
}

const toggleFavoriteTrending = (id) => {
    if (listfavoritos.indexOf(id) === -1){
        listfavoritos.push(id)
    } else {
        listfavoritos = listfavoritos.filter( f => f !== id)
        console.log(`El gifo de id: ${id} se elimino de los favoritos`)
    }

    let isFavorite =  listfavoritos.includes(id)
    btnModalToggleFavs.src = isFavorite ? "./svg/icon-fav-active.svg" : "./svg/icon-fav.svg"

    console.log("Mis nuevos favoritos actuales son:", listfavoritos)    
    localStorage.setItem( "favoritos", JSON.stringify(listfavoritos))
    refreshTrendingGifo(id)
    
}

// MODAL 

async function openModal (id){
    currentModalGifoId = id

    const gif = await buscarGifPorId(id)
    let isFavorite =  listfavoritos.includes(gif.id)

    imgModal.src = gif.images.downsized_large.url
    btnModalToggleFavs.src = isFavorite ? "./svg/icon-fav-active.svg" : "./svg/icon-fav.svg"
    txtModalTitulo.innerHTML = gif.title
    txtModalUser.innerHTML = gif.username

    btnModalDescargar.addEventListener("click", () => {
        saveAs( imgModal.src, 'gifo')
    })

    modal.style.display = "block";
}

// FAVORITES

function isGifoAFavorite(id) {
    return listfavoritos.includes(id)
}

async function showFavoriteGifs () {
    console.log("Nuestros gifs favoritos son:", listfavoritos);
    
    gifsNoResultsDisplay({
        title: "Favoritos",
        message: "¡Guarda tu primer GIFO en Favoritos para que se muestre aquí!",
        sectionIcon: "./svg/icon-favoritos.svg",
        noDataImg: "./svg/icon-fav-sin-contenido.svg"
    })




    if (listfavoritos.length) {
        gifsResultsDisplay()
        const gifosFavoritos = await buscarFavoritos(listfavoritos.join(','));
        dibujarGifs (gifosFavoritos)    
    }
}

// Función que nos ayuda a agregar elementos al html
function dibujarGifs (gifs){
    for (let index = 0; index < gifs.data.length; index++) {

        const gifo = gifs.data[index]

        console.log(gifo);

        let hoverCard = ''

        const onClick = `onclick="openModal('${gifo.id}')"`

        const favoriteActiveElement = isGifoAFavorite(gifo.id) ? 
        `<img class="icon-fav-active" src="./svg/icon-fav-active.svg" alt="">` : 
        ""
    
        const favoriteButton = `<div 
                                class="toggle-favorite icon" 
                                onclick="toggleFavoriteGrid('${gifo.id}')"
                                >
                                                        
                                <img 
                                    class="icon icon-fav" 
                                    src="./svg/icon-fav.svg" 
                                    alt=""
                                    >
                                ${favoriteActiveElement}
                            </div>`;

        if (!isMobileDevice()) {
            hoverCard = ` <div class="zindex">
                            <div class="imagenezindex">
                                ${favoriteButton}
                                <div 
                                    class=" icon icon-download" 
                                    onclick="saveAs( '${gifo.images.fixed_width.url}', 'gifo')"
                                    >
                                    </div>
                                <div 
                                    class=" icon-max-normal" 
                                    src="./svg/icon-max-normal.svg" 
                                    alt=""
                                    ${(!isMobileDevice() ? onClick : "" )} 
                                    > </div> 
                            </div>
                            <div class="pzindex">  
                                <p>${gifo.username}</p>
                                <p>${gifo.title}</p>
                            </div>    
                        </div> `
        }

        const element = `<div class="carrusel-image grid-item" 
                            ${isMobileDevice()? onClick : "" } 
                            > 
                            <img class="hovercard" src="${gifo.images.fixed_width.url}" 
                            alt="" > 
                            ${hoverCard}
                        </div>`;

        gifsResultsGrid.innerHTML += element
    }
}

function createGifoElement (gifo) {

  
    const favoriteActiveElement = isGifoAFavorite(gifo.id) ? 
        `<img class="icon-fav-active" src="./svg/icon-fav-active.svg" alt="">` : 
        ""
    
    const favoriteButton = `<div 
                                class="toggle-favorite icon" 
                                onclick="toggleFavorite('${gifo.id}')"
                                >
                                                        
                                <img 
                                    class="icon icon-fav" 
                                    src="./svg/icon-fav.svg" 
                                    alt=""
                                    >
                                ${favoriteActiveElement}
                            </div>`;

    const element = `<div
                        id="${gifo.id}" 
                        class="carrusel-image" 
                        style="background-color:#572EE5;"
                        > 
                        <img 
                            class="hovercard" 
                            src="${gifo.url}" 
                            alt="" 
                            > 
                        <div class="zindex">
                            <div class="imagenezindex">
                                ${favoriteButton}
                                <div 
                                    class=" icon icon-download" 
                                    onclick="saveAs( '${gifo.url}', 'gifo')"
                                    >
                                    </div>
                                <div 
                                    class=" icon-max-normal" 
                                    src="./svg/icon-max-normal.svg" 
                                    alt="" 
                                    ${(!isMobileDevice() ? onClick : "" )}
                                    > </div> 
                            </div>
                            <div class="pzindex">  
                                <p>${gifo.username}</p>
                                <p>${gifo.title}</p>
                            </div>    
                        </div> 
                    </div>`;
    return element
}

function getGifoInfo(gifo) {
    return {
        id: gifo.id,
        url: gifo.getElementsByTagName("img")[0].src,
        username: gifo.getElementsByTagName("p")[0].innerHTML,
        title: gifo.getElementsByTagName("p")[1].innerHTML
    }
}

// MAIN Results

function gifsNoResultsDisplay ({title, message, sectionIcon, noDataImg}) {
    gifsResultsGrid.innerHTML = ""

    btnVerMas.style.display = "none"
    
    tituloSeccion.innerHTML = title
    // gifsResultsGrid.className = ""
    gifsResultsIcon.src = sectionIcon 

    document.getElementById("resultsPanel").style.display = "block"   
    gifsNoResults.style.display = "block"
    gifsNoResults.getElementsByTagName("h3")[0].innerHTML = `${message}`
    gifsNoResults.getElementsByTagName("img")[0].src = noDataImg
}

function gifsResultsDisplay() {
    // gifsResultsGrid.className = ""
    btnVerMas.style.display = "block"
    gifsNoResults.style.display = "none"
}

const toggleFavoriteGrid = (id) => {
    if (listfavoritos.indexOf(id) === -1){
        listfavoritos.push(id)
    } else {
        listfavoritos = listfavoritos.filter( f => f !== id)
        console.log(`El gifo de id: ${id} se elimino de los favoritos`)
    }

    let isFavorite =  listfavoritos.includes(id)
    btnModalToggleFavs.src = isFavorite ? "./svg/icon-fav-active.svg" : "./svg/icon-fav.svg"

    console.log("Mis nuevos favoritos actuales son:", listfavoritos)    
    localStorage.setItem( "favoritos", JSON.stringify(listfavoritos))
    showFavoriteGifs()
    
}

// Dibuja Mis Gifos en el panel de resultados
function dibujarMisGifs (gifs){
    for (let index = 0; index < gifs.data.length; index++) {

        const gifo = gifs.data[index]

        console.log(gifo);


        let hoverCard = ''

        const onClick = `onclick="openModal('${gifo.id}')"`

        if (!isMobileDevice()) {
            hoverCard = ` <div class="zindex">
                            <div class="imagenezindex">
                                <div 
                                    class=" icon icon-trash" 
                                    onclick=""
                                    >
                                    </div>
                                <div 
                                    class=" icon icon-download" 
                                    onclick="saveAs( '${gifo.images.fixed_width.url}', 'gifo')"
                                    >
                                    </div>
                                <div 
                                    class=" icon-max-normal" 
                                    src="./svg/icon-max-normal.svg" 
                                    alt=""
                                    ${(!isMobileDevice() ? onClick : "" )} 
                                    > </div> 
                            </div>
                            <div class="pzindex">  
                                <p>${gifo.username}</p>
                                <p>${gifo.title}</p>
                            </div>    
                        </div> `
        }

        const element = `<div class="carrusel-image grid-item" 
                            ${isMobileDevice()? onClick : "" } 
                            > 
                            <img class="hovercard" src="${gifo.images.fixed_width.url}" 
                            alt="" > 
                            ${hoverCard}
                        </div>`;

        gifsResultsGrid.innerHTML += element
    }
}

window.addEventListener('resize', () => {
    if (isMobileDevice() && !isCurrentlyMobileDevice) {
        isCurrentlyMobileDevice = true
        trendingSearch ()
    } else if (!isMobileDevice() && isCurrentlyMobileDevice) {
        isCurrentlyMobileDevice = false
        trendingSearch ()

    }
});

// Llamamos a la función que nos mostrara los trendings en la pagina web
trendingSearch ()
