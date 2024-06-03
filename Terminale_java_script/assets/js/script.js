//const files = []
let filesystem = {
    "root": {
        "files": [],
        "folders": {}
    }
};


class Desktop{

    #container
    #appContainer
    #menuContainer
    #lastOffsetOpen = 0
    #lastzIndex = 0
    appList = []
    #focusedApp = null

    constructor(){
        this.#container = document.querySelector("#desktop"),
        this.#appContainer = this.#container.querySelector(".app-container");
        this.#menuContainer = this.#container.querySelector(".menu");
        
        const listButtonApps = this.#menuContainer.querySelectorAll(".launcher-app");

        for(const btn of listButtonApps){
            if(btn.hasAttribute("app")){
                btn.addEventListener("click", () => {
                    this.launchApp(btn.getAttribute("app"))
                });
            }
        }


    }

    launchApp(appName){

        let newApp;

        switch(appName){
            case "none":
                newApp = new Application("test"); 
                break;
            case "terminal":
                newApp = new Shell();
                break;
            case "WhiteBoard":
                newApp = new WhiteBoard();
                break;
        }

    
        this.#appContainer.appendChild(newApp.getMainContainer());
        newApp.setzIndex(this.#lastzIndex);
        console.log(newApp.getMainContainer().style.zIndex)
             
        newApp.moveTo(this.#lastOffsetOpen,this.#lastOffsetOpen);

        this.#lastOffsetOpen+=25;

        newApp.onClose = () => {

            this.appList.splice(this.appList.indexOf(newApp), 1);
        }

        newApp.getMainContainer().addEventListener("click", () => {
            if(this.#focusedApp == newApp) return;
            this.#focusedApp = newApp
            this.#lastzIndex++;
            newApp.setzIndex(this.#lastzIndex);
        });

        this.appList.push(newApp);

        // Rendi la finestra trascinabile
        this.makeDraggable(newApp.getMainContainer());
    }


    makeDraggable(elmnt){
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (elmnt.querySelector(".top-bar")) {
            // muovo solo dalla top-bar:
            elmnt.querySelector(".top-bar").onmousedown = dragMouseDown;
        } 

        function dragMouseDown(e) {
            
            e.preventDefault();
            // mouse cursor position at start:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement; //Ferma trascinamento quando rilascio il mouse 
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
      
            e.preventDefault();
            // new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // smetto di muovere 
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    startApplication(appName) {
        this.launchApp(appName);
    }

}

class Application{
    title
    #titleElement
    #buttonsContainer
    #mainContainer 
    contentContainer
    #isZoomed = false; 
    #isReduced = false; 
    #iconElement = null;
    #color = true; 
  
    constructor(title){
        this.title = title; 
        this.#mainContainer = document.createElement("div");
        this.#mainContainer.classList = ["application"]; 
        this.#mainContainer.innerHTML = '\
        <div class = "top-bar">\
                    <div class = "title" style = "color: white" >\
                        Titolo \
                    </div>\
                    <div class="buttons">\
                        <div class="btn close">X\
                        </div>\
                        <div class="btn zoom">□\
                        </div>\
                        <div class="btn reduce">-\
                        </div>\
                    </div>\
                </div>\
                <div class="content">\
                </div>\
        ';
        this.#titleElement = this.#mainContainer.querySelector(".top-bar>.title");
        this.#titleElement.innerHTML = this.title;
        this.contentContainer = this.#mainContainer.querySelector(".content"); 
        this.#buttonsContainer = this.#mainContainer.querySelector(".top-bar>.buttons");
        this.#buttonsContainer.querySelector(".btn.close").addEventListener("click", ()=> {
            this.close(); 
        });
        this.#buttonsContainer.querySelector(".btn.zoom").addEventListener("click", ()=> {
            this.zoom(); 
        });
        this.#buttonsContainer.querySelector(".btn.reduce").addEventListener("click", ()=> {
            this.reduce(); 
        });


    }
    getMainContainer(){
        return this.#mainContainer; 
    }

    moveTo(x,y){
        this.#mainContainer.style = "top:"+y+"px; left:"+x+"px;";
    }

    setzIndex(index){
        this.#mainContainer.style.zIndex = index;  
    }
    close(){
        this.onClose();
        this.#mainContainer.remove(); 
    }

    zoom(){
       if(this.#isZoomed){
        this.#mainContainer.style.width = "500px"; 
        this.#mainContainer.style.height = "300px"; 
        this.#isZoomed = false;
       }else{
        this.#mainContainer.style.width = "100%";
        this.#mainContainer.style.height = "100%";
        this.#mainContainer.style.margin = "none"; 
        this.#mainContainer.style.top = 0; 
        this.#mainContainer.style.left = 0; 
        this.#isZoomed = true;
            
       }
        

    }
    
    reduce(){
        if(this.#isReduced) return; 
        this.#mainContainer.style.display = "none"; 
        this.#isReduced = true; 

        this.#iconElement = document.createElement("div");
        this.#iconElement.classList = ["application-icon"]; 
        this.#iconElement.style.width = '60px'; // Dimensioni rettangolare nero
        this.#iconElement.style.height = '20px';
        if(this.title === "miriana@miriana-Katana-GF66-11UD:~$"){
            this.#iconElement.style.backgroundColor = 'black';
        }else{
            this.#iconElement.style.backgroundColor = 'white';
        }
        
        this.#iconElement.style.marginRight = '5px';
        console.log(this.title);
        const existingIcons = document.querySelectorAll('.application-icon');
        let offset = 0;
        existingIcons.forEach(icon => {
            offset += icon.offsetWidth + 5; // Aggiungi la larghezza dell'icona
        });
        this.#iconElement.style.left = offset + 'px';
        

        document.querySelector(".taskbar").appendChild(this.#iconElement); // Modificato per aggiungere l'icona nella barra

        this.#iconElement.addEventListener("click", () => {
            this.restore();
        });
    }

    restore() {
        if (!this.#isReduced) return;

        this.#mainContainer.style.display = 'block';
        this.#isReduced = false;

        if (this.#iconElement) {
            this.#iconElement.remove();
            this.#iconElement = null;
        }
    }


    onClose(){}

}


class WhiteBoard extends Application {
    constructor() {
        super("White Board");
        console.log("WhiteBoard constructor called");
        this.initializeWhiteBoard();
    }

    initializeWhiteBoard() {
        console.log("Initializing WhiteBoard");

        // Creazione del canvas
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.backgroundColor = "white";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.cursor = "crosshair";

        this.contentContainer.appendChild(canvas);
        console.log("Canvas added to content container");

        // Imposta le dimensioni effettive del canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(`Canvas size set to ${canvas.width}x${canvas.height}`);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.strokeStyle = "black"; //Deafult color
        this.ctx.lineWidth = 2; //Default grandezza
        console.log("Stroke style set to " + this.ctx.strokeStyle);

        this.isDrawing = false;

        //Selettore di colore
        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.value = "#000000"; // Default black color
        colorPicker.style.position = "absolute";
        colorPicker.style.top = "10px";
        colorPicker.style.left = "10px";
        colorPicker.style.zIndex = "0";
        colorPicker.addEventListener("input", (e) => this.changePenColor(e.target.value));
        this.contentContainer.appendChild(colorPicker);

        //Selettore slider 
        const sizeSlider = document.createElement("input");
        sizeSlider.type = "range";
        sizeSlider.min = "1";
        sizeSlider.max = "10";
        sizeSlider.value = "2"; // Valore di default
        sizeSlider.style.position = "absolute";
        sizeSlider.style.top = "10px";
        sizeSlider.style.left = "100px";
        sizeSlider.style.zIndex = "0";
        sizeSlider.addEventListener("input", (e) => this.changePenSize(e.target.value));
        this.contentContainer.appendChild(sizeSlider);

        //Pulsante gomma
        const eraserButton = document.createElement("button");
        eraserButton.textContent = "Eraser";
        eraserButton.style.position = "absolute";
        eraserButton.style.top = "10px";
        eraserButton.style.left = "330px";
        eraserButton.style.zIndex = "0";
        eraserButton.addEventListener("click", () => this.toggleEraser());
        this.contentContainer.appendChild(eraserButton);

        this.eraserEnabled = false; // Variabile per tracciare lo stato della gomma
        this.previousColor = this.ctx.strokeStyle;
        this.previousLineWidth = this.ctx.lineWidth;


        // Aggiungi il pulsante pulisci tutto
        const clearButton = document.createElement("button");
        clearButton.textContent = "Clear";
        clearButton.style.position = "absolute";
        clearButton.style.top = "10px";
        clearButton.style.left = "430px";
        clearButton.style.zIndex = "0";
        clearButton.addEventListener("click", () => this.clearCanvas());
        this.contentContainer.appendChild(clearButton);

        this.eraserEnabled = false; // Variabile per tracciare lo stato della gomma
        this.previousColor = this.ctx.strokeStyle;
        this.previousLineWidth = this.ctx.lineWidth;


        canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
        canvas.addEventListener("mousemove", (e) => this.draw(e));
        canvas.addEventListener("mouseup", () => this.stopDrawing());
        canvas.addEventListener("mouseleave", () => this.stopDrawing());

        console.log("Event listeners added to canvas");
    }

   
    clearCanvas() {
        console.log("Clearing canvas");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    toggleEraser(){
        this.eraserEnabled = !this.eraserEnabled;
        if (this.eraserEnabled) {
            console.log("Eraser enabled");
            this.previousLineWidth = this.ctx.lineWidth; 
            this.ctx.strokeStyle = "white"; 
            this.ctx.lineWidth = 20; 
        } else {
            console.log("Eraser disabled");
            this.ctx.strokeStyle = this.previousColor; 
            this.ctx.lineWidth = this.previousLineWidth; 
        }
    }
    changePenSize(size) {
        console.log("Change pen size to", size);
        this.ctx.lineWidth = size;
        if (!this.eraserEnabled) {
            this.previousLineWidth = size; // Salva la dimensione della penna precedente
        }
    }

    startDrawing(event) {
        console.log("Start drawing", event);
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.beginPath();
        this.ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
        console.log(`Starting point at (${event.clientX - rect.left}, ${event.clientY - rect.top})`);
    }

    draw(event) {
        if (!this.isDrawing) return;
        console.log("Drawing", event);
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
        this.ctx.stroke();
        console.log(`Drawing line to (${event.clientX - rect.left}, ${event.clientY - rect.top})`);
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        console.log("Stop drawing");
        this.isDrawing = false;
        this.ctx.closePath();
        console.log("Path closed");
    }

    changePenColor(color) {
        console.log("Change pen color to", color);
        this.ctx.strokeStyle = color;
    }
}



class Shell extends Application{

    #lastLine = null
    currentUser
    currentPath
    
    constructor(){
        super("miriana@miriana-Katana-GF66-11UD:~$");

        this.contentContainer.classList = ["content terminal-container"];
        this.currentPath = [""];
        this.currentUser = "miriana@miriana-Katana-GF66-11UD:~";
        this.newLine();

        this.contentContainer.addEventListener("click", () => {
            const range = document.createRange();
            const selection = window.getSelection();
            this.#lastLine.focus();
            range.setStart(this.#lastLine, this.#lastLine.childNodes.length);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        });

    }

    newLine(){
        if(this.#lastLine){
            this.#lastLine.setAttribute("contenteditable", false);
        }

        const firstLine = document.createElement("div");
        firstLine.classList = "terminal-line";

        firstLine.setAttribute("contenteditable", true);
        // 
        this.contentContainer.appendChild(firstLine);
        this.#lastLine = firstLine;

        this.#lastLine.addEventListener("focus", this.onFocus.bind(this));
        this.#lastLine.click();

        //  // Ottengo l'elemento style che contiene le regole CSS
        // const styleElement = document.createElement('style');
        // document.head.appendChild(styleElement);
        // const styleSheet = styleElement.sheet;

        // //la regola CSS da modificare
        // const cssRule = '#desktop>.app-container>.application>.content.terminal-container>.terminal-line::before';

        // styleSheet.insertRule(`${cssRule} {
        //     color: greenyellow;
        //     content: "miriana@miriana-Katana-GF66-11UD:~$ ${currentPath.join("/")}";
        // }`, styleSheet.cssRules.length);

        // console.log(this.#lastLine.querySelector("")); 
        console.log(this.currentUser);
        this.#lastLine.setAttribute("data-before", this.currentUser + this.currentPath.join("/") + "$");
        
    }    
    

    getCurrentFolder() {
        let folder = filesystem.root;
        for (const part of this.currentPath.slice(1)) { //slice(1) crea una copia dell'array currentPath a partire dal secondo elemento (indice 1) fino alla fine.
            //part è ogni cartella del percorso
            folder = folder.folders[part];
        }
        console.log(folder);
        return folder;
    }

    onFocus(event){
        event.target.addEventListener("keyup", (event) => {
            event.preventDefault();
            if (event.keyCode === 13) {
                this.onEnter(event);
            }
        });
    }

    onEnter(event){

        
        // //gestire la presa del comando
        if(this.#lastLine.textContent.length> 0 ){
            this.parseCommand(this.#lastLine.textContent);
        } else {
            //elimino div vuoto sotto bugfix
            try{
                this.#lastLine.querySelector("div").remove();
            }catch(error){}
            
        }

        //elimino div vuoto sotto
        this.#lastLine.querySelector("div:last-child").remove();

        //Creare nuova riga
        //this.newLine();
        if (!this.#lastLine.textContent.startsWith("wget ")) {
            this.newLine();
        }
        
    }

    getData(){
        const currentDate = new Date();
        var n = currentDate.toLocaleTimeString();
        this.appendResponse(currentDate.toDateString() + " " + n);
    }

    onClear(){
        this.contentContainer.innerHTML = ""; 

        this.newLine();

    }

    wget(url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                this.appendResponse(data);
                this.newLine(); // Creare una nuova riga dopo aver ottenuto la risposta
            })
            .catch(error => {
                this.appendResponse(`Errore nel recupero dell'URL: ${error}`);
                this.newLine(); // Creare una nuova riga anche in caso di errore
            });
    }


    mkdir(foldername) {
        const currentFolder = this.getCurrentFolder();
        if (!currentFolder.folders[foldername]) {
            currentFolder.folders[foldername] = {
                files: [],
                folders: {}
            };
            this.appendResponse(`Cartella '${foldername}' creata`);
        } else {
            this.appendResponse(`La cartella '${foldername}' esiste già`);
        }
    }

    cd(foldername) {
        if(foldername === undefined){
            this.currentPath = ["~"]; 
            // this.appendResponse("Tornato alla root");
        }else if(foldername === "--help"){
            this.appendResponse("Uso: cd [foldername] per spostarsi in una cartella");
            this.appendResponse("Uso: cd .. per tornare indietro di una cartella");
            this.appendResponse("Uso: cd per tornare alla root");
        }else if (foldername === "..") {
            if (this.currentPath.length > 1) {
                this.currentPath.pop();
                // this.appendResponse(`Tornato a ${currentPath.join("/")}`);
            } else {
                // this.appendResponse("Sei già nella directory root");
            }
        } else { //se cd ha una cartella quindi tipo cd[foldername]
            const currentFolder = this.getCurrentFolder();
            if (currentFolder.folders[foldername]) {
                this.currentPath.push(foldername);
                // this.appendResponse(` Spostato a ${currentPath.join("/")}`);
            } else {
                // this.appendResponse(`Cartella '${foldername}' non trovata`);
            }
        }
    }

    rm(name, options = []) {
        const currentFolder = this.getCurrentFolder();
        if (options.includes("-r")) {
            if (currentFolder.folders[name]) {
                delete currentFolder.folders[name];
                this.appendResponse(`Cartella '${name}' rimossa`);
            } else {
                this.appendResponse(`Cartella '${name}' non trovata`);
            }
        } else {
            const index = currentFolder.files.indexOf(name);
            if (index !== -1) {
                currentFolder.files.splice(index, 1);
                this.appendResponse(`File '${name}' rimosso`);
            } else {
                this.appendResponse(`File '${name}' non trovato`);
            }
        }
    }

    touch(filename) {
        const currentFolder = this.getCurrentFolder();
        if (!currentFolder.files.includes(filename)) {
            currentFolder.files.push(filename);
            this.appendResponse(`File '${filename}' creato`);
        } else {
            this.appendResponse(`Il file '${filename}' esiste già`);
        }
    }


    ls() {
        const currentFolder = this.getCurrentFolder();
        const filesAndFolders = [
            ...currentFolder.files,
            ...Object.keys(currentFolder.folders)
        ];
        this.appendResponse(filesAndFolders.join(" "));
    }

    drawCat() {
        
        const catFace = `
            =^._.^=
        `;
        this.appendResponse(catFace);
    }

    echo(message) {
        var string = " ";
        for (let i = 0; i<message.length; i++){
            string += message[i];
            string += " ";
            
        }
        this.appendResponse(string);
    }

    appendResponse(response){
        const line = document.createElement("div");
        line.innerHTML = response;
        this.contentContainer.appendChild(line);
    }

    parseCommand(command){
        
        const parts = command.split(/\s/); //Questa riga prende la stringa command, che rappresenta il comando completo inserito dall'utente nel terminale.
        // Utilizzando il metodo split(" "), divide questa stringa in un array di sottostringhe, utilizzando lo spazio come separatore.        


        //Dopo aver suddiviso il comando in parti, questa riga assegna il primo elemento dell'array parts alla variabile baseCommand.
        // Questo elemento rappresenta il nome del comando principale, che sarà utilizzato per determinare quale azione eseguire.
        //const test = parts[0].split(" ");
        const baseCommand = parts[0];

        // Questa riga prende l'array parts e ne estrae una porzione tramite il metodo slice(1).
        // Questo passo è utile per ottenere tutti gli argomenti aggiuntivi specificati dall'utente dopo il nome del comando principale.
        const args = parts.slice(1);

        switch(baseCommand){
            case "help":
                this.appendResponse("GNU bash, versione 5.1.16(1)-release (x86_64-pc-linux-gnu) Questi comandi della shell sono definiti internamente. Digitare 'help' per consultare questa lista.");
                this.appendResponse("- time - Mostra l'ora corrente");
                this.appendResponse("- clear - Pulisce lo schermo");
                this.appendResponse("- wget [url] - Scarica il contenuto dall'URL specificato");
                this.appendResponse("- ls - Mostra il contenuto della directory corrente");
                this.appendResponse("- rm [-r] [filename|foldername] - Rimuove il file o la cartella specificata, aggiungere l'opzione -r per rimuovere ricorsivamente le cartelle");
                this.appendResponse("- mkdir [foldername] - Crea una nuova cartella con il nome specificato");
                this.appendResponse("- cd [foldername|..] - Cambia la directory corrente, utilizzare '..' per tornare indietro di una cartella");
                this.appendResponse("- gatto - Disegna la faccina di un gatto");
                this.appendResponse("- WhiteBoard - Avvia l'applicazione WhiteBoard");  
                this.appendResponse("- echo - Stampa il messaggio");       
            break;
            case "time":
            { 
                this.getData();
                break; 
            }
            case "clear":
                this.onClear(); 
                break;
            case "wget":
                //Per provare questo caso incolla: wget https://jsonplaceholder.typicode.com/posts/1
                if (args.length > 0) {
                    this.wget(args[0]);
                } else {
                    this.appendResponse("Uso: wget [url]");
                    this.newLine();
                }
                break; 
            case "ls":
                this.ls();
                break;
            case "touch":
                if (args.length > 0) {
                    this.touch(args[0]);
                } else {
                    this.appendResponse("Uso: touch [filename]");
                }
                break;
            case "rm":
                // if (args.length > 0) {
                //     this.rm(args[0]);
                // } else {
                //     this.appendResponse("Uso: rm [filename]");
                // }
                // break;
                if (args.length > 0) {
                    if (args[0] === "-r" && args.length > 1) {
                        this.rm(args[1], ["-r"]);
                    } else {
                        this.rm(args[0]);
                    }
                } else {
                    this.appendResponse("Uso: rm [-r] [filename|foldername]");
                }
                break;
            case "mkdir":
                if (args.length > 0) {
                    this.mkdir(args[0]);
                } else {
                    this.appendResponse("Uso: mkdir [foldername]");
                }
                break;
            case "cd":
                if (args.length > 0) {
                    this.cd(args[0]);
                } else {
                    this.appendResponse("Uso: cd [foldername|..]");
                }
                break;
            case "gatto":
                this.drawCat();
                break; 
            case "WhiteBoard":
                desktop.startApplication("WhiteBoard");
                break;
            case "echo":
                if(args.length >0){
                    this.echo(args);
                }
                break; 
            default:
                this.appendResponse("Comando non riconosciuto");
                console.log(baseCommand); 
                console.log(parts[4]);
                break;
        }
    }
}


const desktop = new Desktop();