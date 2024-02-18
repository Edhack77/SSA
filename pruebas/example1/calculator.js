function addText(TextToAdd){
    document.getElementById("display").value = document.getElementById("display").value + TextToAdd;
}

function clearText(){
    document.getElementById("display").value = "";
}

function solve(){
    document.getElementById("display").value = eval(document.getElementById("display").value);
}