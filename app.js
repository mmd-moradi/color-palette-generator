// Global selection and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");

let initialColors;

// Events listeners
generateBtn.addEventListener("click", randomColors);

sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUI(index);
    })
})

currentHexes.forEach((hex) => {
    hex.addEventListener("click", () => {
        copyToClipborad(hex);
    });
});

popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popupBox.classList.remove("active");
    popup.classList.remove("active"); 
})

adjustButton.forEach((button, index) => {
    button.addEventListener("click", () => {
        openAdjustmentPanel(index);
    })
})

closeAdjustments.forEach((button, index) => {
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    })
})

lockButton.forEach((button, index) => {
    button.addEventListener("click", () => {
        const lockType = button.children[0].classList[1];
        button.firstChild.classList.remove(lockType);
        button.firstChild.classList.add(lockType == "fa-lock-open" ? "fa-lock" : "fa-lock-open");
        colorDivs[index].classList.toggle("locked");
    })
})

// Functions

function generateHex(){
    hexColor = chroma.random();
    return hexColor;
}

function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        if(div.classList.contains("locked")){
            initialColors.push(hexText.textContent);
            return;
        }
        initialColors.push(chroma(randomColor).hex())
        //Add color to bg
        div.style.background = randomColor;
        hexText.textContent = randomColor;
        //check for contrast
        checkTextContrast(randomColor, hexText);
        //initial colorize slider
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation)
    })
    resetInputs();

    // changing the adjust/lock color by initialcolor
    adjustButton.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButton[index]);
    })
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if(luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);

    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = "linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))"
}

function hslControls(event) {
    const index = event.target.getAttribute("data-hue") || event.target.getAttribute("data-bright") || event.target.getAttribute("data-sat");
    let sliders = event.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const colorBg = initialColors[index];

    let color = chroma(colorBg)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value)

    colorDivs[index].style.backgroundColor = color;
    // updating input/slider
    colorizeSliders(color, hue, brightness, saturation)
}

function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.textContent = color.hex();
    checkTextContrast(color, textHex);
    for (let icon of icons) {
        checkTextContrast(color, icon);
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input")
    sliders.forEach(slider => {
        if(slider.name === "hue") {
            const hueValue = chroma(initialColors[slider.getAttribute("data-hue")]).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if(slider.name === "brightness") {
            const brightnessValue = chroma(initialColors[slider.getAttribute("data-bright")]).hsl()[2];
            slider.value = Math.floor(brightnessValue * 100) / 100;
        }
        if(slider.name === "saturation") {
            const saturationValue = chroma(initialColors[slider.getAttribute("data-sat")]).hsl()[1];
            slider.value = Math.floor(saturationValue * 100) / 100;
        }
    })
}

function copyToClipborad(hex) {
    const el = document.createElement("textarea");
    el.value = hex.textContent;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove("active");
}


// variable for saving in local storage
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-name");
var savedPalettes = JSON.parse(localStorage.getItem("palettes"));
var savedPalettesLen = (savedPalettes === null) ? 0 : savedPalettes.length;
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");





// events listener

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click",openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);




//functions
function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active");
    popup.classList.add("active");
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
}

function savePalette(e) {
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.textContent);
    })
    savedPalettes = JSON.parse(localStorage.getItem("palettes"));
    savedPalettesLen = (savedPalettes === null) ? 0 : savedPalettes.length;
    let paletteNr = savedPalettesLen;
    const paletteObj = {name, colors, nr: paletteNr};
    //save to localStorage
    savetoLocal(paletteObj);
    saveInput.value = "";

    //Generate palette for library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette")
    const title = document.createElement("h4");
    title.textContent = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.textContent = "Select";

    //atach event to the btn
    paletteBtn.addEventListener("click", event => {
        closeLibrary();
        const paletteIndex = event.target.classList[1];
        console.log(paletteIndex);
        initialColors = [];
        savedPalettes = JSON.parse(localStorage.getItem("palettes"));
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
        resetInputs();

    });




    //Append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

}

function savetoLocal(obj) {
    let localpalette;
    if(localStorage.getItem("palettes") === null) {
        localpalette = [];
    } else {
        localpalette = JSON.parse(localStorage.getItem("palettes"));
    }
    localpalette.push(obj);
    localStorage.setItem("palettes", JSON.stringify(localpalette));
}

function openLibrary(event){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}

function closeLibrary(event){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}

function getLocal(){
    if(localStorage.getItem("palettes") === null) {
        localpalette = []
    } else {
        paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        paletteObjects.forEach(paletteObj => {
            const palette = document.createElement("div");
    palette.classList.add("custom-palette")
    const title = document.createElement("h4");
    title.textContent = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.textContent = "Select";

    //atach event to the btn
    paletteBtn.addEventListener("click", event => {
        closeLibrary();
        const paletteIndex = event.target.classList[1];
        console.log(paletteIndex);
        initialColors = [];
        savedPalettes = JSON.parse(localStorage.getItem("palettes"));
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
        resetInputs();
    });
    //Append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
        });
    }
}

getLocal()
randomColors();