const LENGTH_ROW = 4
const NUM_ROWS = 4
const LENGTH_ARRAY = 16

class Card {
  constructor(elCard, isSpace) {
    this.elCard = elCard    
    this.isMovable = false
    this.isSpace = isSpace
    this.onDrop = null
    this.onClick = null
    this.dropBind = this.drop.bind(this)
    this.clickBind = this.click.bind(this)
  }    
  
  notMovable(){
    this.elCard.className= 'box-single';
    this.elCard.draggable = false;    
    this.isMovable = false
    this.isSpace = false    
    this.onDrop = null
    this.onClick = null
    
    this.elCard.removeEventListener('dragenter', this.dragEnter, false);
    this.elCard.removeEventListener('dragleave', this.dragLeave, false);
    this.elCard.removeEventListener('dragover', this.dragOver, false);
    this.elCard.removeEventListener('drop', this.dropBind, false);
    this.elCard.removeEventListener('click', this.clickBind, false);
    
    this.elCard.removeEventListener('dragstart', this.dragStart, false);
    this.elCard.removeEventListener('dragend', this.dragEnd, false);   
  }
  
  movable(onClick){
    this.elCard.className= 'box';
    this.elCard.draggable = true;    
    this.isMovable = true
    this.isSpace = false    
    this.onDrop = null
    this.onClick = onClick
    
    this.elCard.removeEventListener('dragenter', this.dragEnter, false);
    this.elCard.removeEventListener('dragleave', this.dragLeave, false);
    this.elCard.removeEventListener('dragover', this.dragOver, false);
    this.elCard.removeEventListener('drop', this.dropBind, false);    
    
    this.elCard.addEventListener('dragstart', this.dragStart, false);
    this.elCard.addEventListener('dragend', this.dragEnd, false); 
    this.elCard.addEventListener('click', this.clickBind, false);
  }
    
  dropZone(onDrop){
    this.onDrop = onDrop
    this.onClick = null
    this.elCard.draggable = false
    this.isMovable = false
    this.isSpace = true    
    this.elCard.className= 'dropzone'
    this.elCard.innerHTML = '&nbsp;'
        
    this.elCard.removeEventListener('dragstart', this.dragStart, false);
    this.elCard.removeEventListener('dragend', this.dragEnd, false);  
    this.elCard.removeEventListener('click', this.clickBind, false);
    
    this.elCard.addEventListener('dragenter', this.dragEnter, false);
    this.elCard.addEventListener('dragleave', this.dragLeave, false);
    this.elCard.addEventListener('dragover', this.dragOver, false);
    this.elCard.addEventListener('drop', this.dropBind, false);    
  }
  
  /* Drag and Drop Functions */
  dragStart(e){
   e.stopPropagation();
   var boxObj = this,
       dataObj = this.id;
   boxObj.className = boxObj.className + " is-dragged";
   e.dataTransfer.effectAllowed = 'copyMove';
   e.dataTransfer.setData('id', dataObj); 
  }

  dragEnd(e){
   e.stopPropagation();
   var boxObj = this;
   boxObj.className = boxObj.className.replace('is-dragged',''); 
  }

  dragEnter(e){
    if (e.stopPropagation) e.stopPropagation();
    this.className = this.className + " dropover";
  }

  dragLeave(e){
    if (e.stopPropagation) e.stopPropagation();
    this.className = this.className.replace('dropover','');
  }

  dragOver(e){  
    if (e.stopPropagation) e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    return false; 
  }

  drop(e){
    if (e.stopPropagation) e.stopPropagation()
    let idFrom = e.dataTransfer.getData('id')
    this.onDrop(idFrom, this.elCard.id)    
  }
  
  click(e){
    let idCard = this.elCard.id
    this.onClick(idCard)
  }
}

class Game{

  constructor(onEndGame) {
    this.cards = new Map()
    this.space = 0
    this.inScramble = false    
    this.onEndGame = onEndGame
  }

  isEnd(){
    if (this.inScramble)
      return false
    
    let numCard = 0
    this.cards.forEach((card, i) =>{   
      if(!card.isSpace && parseInt(card.elCard.textContent) === i){
          numCard++
      }
      else if(card.isSpace && i === LENGTH_ARRAY ) {                        
          numCard++
      }
    })
    return numCard === LENGTH_ARRAY 
  }
  
  swapCard(idFrom, idTo){
    var cardFrom = this.cards.get(idFrom);
    var cardTo = this.cards.get(idTo);
    if(cardFrom.isMovable && idTo === this.space){
      cardTo.elCard.textContent = cardFrom.elCard.textContent;
      cardFrom.dropZone(this.onDropCard.bind(this))    
      this.space = parseInt(idFrom)
      this.markNotMovable()
      this.markMovable()
      this.swaps++
      if(this.isEnd()){
        this.markNotMovable()
        setTimeout(()=>this.onEndGame(this.swaps), 250)        
      }
    }
    else{
      console.log('Movimiento no valido: ' + idFrom +  ' ---> ' + idTo)
    }
  }
  
  onDropCard(idFrom, idTo){
    this.swapCard(parseInt(idFrom), parseInt(idTo))          
  }  
  
  onClickCard(idCard){
    this.swapCard(parseInt(idCard), this.space)
  }
  
  markNotMovable(){
    this.cards.forEach((card) =>{   
      if(card.isMovable)
        card.notMovable()
    })      
  }
  
  markMovable(){    
    let indexSpace = this.space
    let row = Math.ceil ( (indexSpace) / NUM_ROWS )
    let col = (indexSpace % LENGTH_ROW) 
    if (col === 0)
      col = LENGTH_ROW

    if(indexSpace >=1){
      // Mark in row
      if(col === 1){
        let card = this.cards.get(indexSpace+1)
        card.movable(this.onClickCard.bind(this))
      }
      else if(col === LENGTH_ROW){  
        let card = this.cards.get(indexSpace-1)
        card.movable(this.onClickCard.bind(this))         
      }
      else if (col > 1 && col < LENGTH_ROW){        
        let cardLeft = this.cards.get(indexSpace-1)
        let carRight = this.cards.get(indexSpace+1)
        cardLeft.movable(this.onClickCard.bind(this))
        carRight.movable(this.onClickCard.bind(this))        
      }
      // Mark in col
      if(row === 1){
        let card = this.cards.get( indexSpace + LENGTH_ROW )
        card.movable(this.onClickCard.bind(this))          
      }
      else if(row === NUM_ROWS ) {
        let card = this.cards.get( indexSpace - LENGTH_ROW  )
        card.movable(this.onClickCard.bind(this))                  
      }
      else if (row > 1 && row < NUM_ROWS){
        let cardUp = this.cards.get(indexSpace-LENGTH_ROW)
        let carBottom = this.cards.get(indexSpace+LENGTH_ROW)
        cardUp.movable(this.onClickCard.bind(this))
        carBottom.movable(this.onClickCard.bind(this))                 
      }
    }
  }
  
  addCard(id, card){
    this.cards.set(id, card)
    if(card.isSpace)
      this.space= id
  }
  
  createCards(elContent){
    while (elContent.firstChild) {
      elContent.removeChild(elContent.firstChild);
    }
    
    for(let i=1; i<=LENGTH_ARRAY; i++ ){
      let elCard = document.createElement('label')
      elCard.id = i
      elCard.textContent = i
      elContent.appendChild(elCard)
      
      let isSpace = false      
      if(i === LENGTH_ARRAY)
        isSpace = true
      let card = new Card(elCard, isSpace);
      this.addCard(i, card)  
    }      
  }
  
  scramble(){    
    let idCard = -1
    this.inScramble = true    
    for (let i = 1; i<= 255; i++){      
      let indexSpace = this.space
      let row = Math.ceil ( (indexSpace) / NUM_ROWS )
      let col = (indexSpace % LENGTH_ROW) 
      if (col === 0)
        col = LENGTH_ROW      
      let ran = Math.random()
      //console.log(r)
      if (ran < 0.5){ //move row
        if(row === NUM_ROWS || (ran < 0.25 && row > 1 )){
          idCard = indexSpace - LENGTH_ROW
        }
        else {
          idCard = indexSpace + LENGTH_ROW
        }
      }
      else {
        if (col === LENGTH_ROW || (ran < 0.75 && col > 1 )){
          idCard = indexSpace -1
        }
        else {
          idCard = indexSpace +1
        }
      }        
      this.onClickCard(idCard)      
    }
    this.inScramble = false
    this.swaps = 0
  }
  
  init(elContent, withScramble){
    this.createCards(elContent)
    this.cards.forEach((card, i) =>{   
      if(card.isSpace){
          card.dropZone(this.onDropCard.bind(this))
        }
      else {                
        card.notMovable()
      }
    })    
    if (withScramble){
      this.markMovable()
      this.scramble()
    }
  }  
}

let game = new Game(endGame)
function init(scrable){  
  let boxes = document.getElementById('boxes')
  game.init(boxes, scrable)
}

function endGame(swaps){
  let divResult = document.getElementById('divResult')
  divResult.innerText = 'You did ' + swaps + ' swaps!'
  window.location.href="#popupResult"
}

init(false);

/*
Pop up By: https://codepen.io/Fisaforu/pen/gwxqza
*/