const btnContentCreate = document.getElementById("content-create")
const displayContentHeader = document.getElementsByClassName("content-header")[0]
const displayContentSubheader = document.getElementsByClassName("content-subheader")[0]
const displayNumbers = document.querySelectorAll(".number-container .number")
const recordTimer = document.getElementById("record-timer")
const video = document.getElementById('video');
const gifoResult = document.getElementById('gifo-result')
const gifoUploadScreen = document.getElementById('gifo-upload')
const gifoUploadPanel = document.getElementById('gifo-upload-panel')

const btnDownloadGifo = document.getElementById('button-download-ngifo')
const btnShareGifo = document.getElementById('button-share-ngifo')
const clipboard = document.getElementById('clipboard')

// NAVIGATION
const btnModoNocturno = document.querySelector("#modoNocturno");
const btnFavoritos = document.getElementById("btn-favoritos")
const btnMisGifos = document.getElementById("btn-misgifos")
const btnCrearGifo = document.getElementById("button-nuevo-gifo")

btnFavoritos.addEventListener( "click", () => { 
  window.location.href = './index.html#favoritos'; //relative to domain
})

btnMisGifos.addEventListener('click', async () => {
  window.location.href = './index.html#mis-gifos'; //relative to domain
})

let recorder=null;
let form = null

let state = "standby" // standby, begin, recording, stop, uploading

let currentlyCreatedGifo = null

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

btnContentCreate.addEventListener("click", async () => {
  if (state  === "standby") {
    state = "begin"
    selectNumber(0)
    displayContentHeader.innerHTML = "¿Nos das acceso <br> a tu cámara?"
    displayContentSubheader.innerHTML = "El acceso a tu camara será válido sólo <br> por el tiempo en el que estés creando el GIFO."
    btnContentCreate.style.display = "none"
    getStreamAndRecord ()
  }
  else if (state === "begin") {
    state = "recording"
    onStateRecording()
  }
  else if (state === "recording") {
    state = "stop"
    btnContentCreate.innerHTML = "<p>SUBIR GIFO</p>"
    recordTimer.innerHTML = "REPETIR CAPTURA"
    gifoUploadPanel.style.display = "block"
    onStateStop ()
  } 
  else if (state === "stop") {
    recordTimer.style.color = "white"
    gifoUploadScreen.style.display = "block"
    btnContentCreate.style.display = "none"
    
    const id = await crearGifos(form);
    currentlyCreatedGifo = await buscarGifPorId(id)
    console.log(currentlyCreatedGifo);
    clipboard.setAttribute("value", currentlyCreatedGifo.url); 
    addMiGifo(currentlyCreatedGifo)
    
    gifoUploadPanel.getElementsByTagName('div')[0].style.opacity = 1
    gifoUploadPanel.getElementsByTagName('img')[0].src = "./svg/ok.svg"
    gifoUploadPanel.getElementsByTagName('p')[0].innerHTML = "GIFO subido con éxito"
    selectNumber(2)
  }
})

function selectNumber (index) {
  displayNumbers.forEach( n => {n.classList.remove("selected")})
  displayNumbers[index].classList.add("selected")
}

function onStateBegin () {
  btnContentCreate.style.display = "block"
  btnContentCreate.innerHTML = "<p>GRABAR</p>"
  displayContentHeader.style.display = "none"
  displayContentSubheader.style.display = "none"
  video.style.display = "block"
  selectNumber(1)
}

function onStateRecording () {
  btnContentCreate.innerHTML = "<p>FINALIZAR</p>"
  recordTimer.style.color = "#572EE5"

  dateStarted = new Date().getTime();

  (function looper() {
    if(state != "recording") {
        return;
    }

    console.log('Recording Duration: ' + calculateTimeDuration((new Date().getTime() - dateStarted) / 1000));
    recordTimer.innerHTML = calculateTimeDuration((new Date().getTime() - dateStarted) / 1000) 

    setTimeout(looper, 1000);
})();
  recorder.startRecording();
}

function onStateStop () {
  recorder.stopRecording((resultado) =>{
    let blob = recorder.getBlob();
    let uri = URL.createObjectURL(blob);
    
    video.style.display = "none"
    gifoResult.style.display = "block"
    gifoResult.src =uri;
    
    form = new FormData()
    form.append("file", blob, "myGif.gif");

  })

  recorder.destroy()

}

function sleep (m) {
  return new Promise(r => setTimeout(r, m));
}

function getStreamAndRecord () { 
  navigator.mediaDevices.getUserMedia (
      {
          audio: false,
          video: {
              height: { max: 480 }
          }
      }
  )
  .then(function(stream) {
    onStateBegin ()
    video.srcObject = stream;
    video.play()
    recorder = RecordRTC(stream, {
        type: 'gif',
        frameRate: 1,
        quality: 10,
        width: 360,
        hidden: 240,
        onGifRecordingStarted: function() {
          console.log('started')
        },
        timeSlice: 1000,
        onTimeStamp: function(timestamp) {
          console.log(timestamp)
        },
    });
    
  })
  .catch(function (err){
      console.log('error', err);
  });
}

function copyToClipboard() {
  let copyText = clipboard
  copyText.select();
  copyText.setSelectionRange(0, 99999)
  document.execCommand("copy");
  alert("Copied the text: " + copyText.value);
}

btnDownloadGifo.addEventListener("click", () => {
  saveAs( currentlyCreatedGifo.data.images.fixed_width.url, 'gifo')
})

btnShareGifo.addEventListener("click", () => {
  copyToClipboard(currentlyCreatedGifo.url)
})

function calculateTimeDuration(secs) {
  var hr = Math.floor(secs / 3600);
  var min = Math.floor((secs - (hr * 3600)) / 60);
  var sec = Math.floor(secs - (hr * 3600) - (min * 60));

  if (min < 10) {
      min = "0" + min;
  }

  if (sec < 10) {
      sec = "0" + sec;
  }

  if ( hr < 10) {
    hr = "0" + hr
  }

  console.log(hr + ':' + min + ':' + sec);

  return hr + ':' + min + ':' + sec;
}