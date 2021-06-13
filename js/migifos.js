// MIS GIFOS
let misGifos = []

function addMiGifo (gifo) {
  const gifosIds = misGifos.map( ({id}) => id )
  if (gifosIds.indexOf(gifo.id) === 1)
    return 0

  misGifos.push(gifo)
  localStorage.setItem( "misgifos", JSON.stringify(misGifos))
}

function deleteMiGifo (id) {
  const gifosIds = misGifos.map( ({id}) => id )
  if (gifosIds.indexOf(id) === 1)
    return 0

  misGifos = misGifos.filter( f => f.id !== id)
  
  console.log(`El gifo de id: ${id} se elimino de los favoritos`)
  console.log("Mis nuevos favoritos actuales son:", misGifos)    
  localStorage.setItem("misgifos", JSON.stringify(misGifos))
}

function getMyGifos () {
  
  const gifos = JSON.parse(localStorage.getItem("misgifos"))

  if (gifos){
    return gifos
  } else {
    return []
  }

  
}

misGifos = getMyGifos()
