let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
let cartTable = document.getElementById('cart-table')
console.log(cart);
let subtotal = document.getElementById('subtotal')
let kamisia = document.getElementById('kamisia')
let obshi = document.getElementById('obshi')


function printRows() {
    cartTable.innerHTML=''
  let  subtotalValue = cart.reduce((sum,elm)=>{
        sum+=elm.price*elm.count
        return sum
    },0)
    let kamisiaValue = Math.floor(subtotalValue/100)
    subtotal.innerHTML = Math.floor(subtotalValue)+' $'
    kamisia.innerHTML = kamisiaValue+' $'
    obshi.innerHTML = Math.floor(subtotalValue+kamisiaValue) + ' $'
    localStorage.setItem('kamisia', kamisiaValue)
    cart.forEach((elm) => {
        console.log(elm.price, elm.count);


        
        cartTable.innerHTML += `
            <div class="cart-item">
                <img src=${elm.images[0]} alt="${elm.model}" class="item-image">
                            <div class="item-details">
                                <div class="item-name">${elm.model}</div>
                                <div class="item-sku">${elm.ramSelected ? elm.ramSelected : elm.ram[0]} | ${elm.memorySelected ? elm.memorySelected : elm.memory[0]}</div>
                              
                                <div class="item-sku-code">${elm.code}</div>

                            </div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="minCount('${elm.code}')">-</button>
                                <span>${elm.count}</span>
                                <button class="quantity-btn" onclick="addCount('${elm.code}')">+</button>
                            </div>
                            <div class="price">$ ${Math.floor(elm.price*elm.count)}</div>
                            <div class="remove-btn" onclick="removeItem('${elm.code}')">×</div>
                        </div>`
    })
}

printRows()









function removeItem(code){
    console.log(code);
    
cart = cart.filter((elm)=>elm.code!==code)
        localStorage.setItem('cart', JSON.stringify(cart))
        printRows()
}

function addCount(code){    
let prod = cart.find((elm)=>elm.code===code)
prod.count++
        localStorage.setItem('cart', JSON.stringify(cart))
        printRows()
}
function minCount(code){    
let prod = cart.find((elm)=>elm.code===code)
if (prod.count>1) {   
    prod.count--
    localStorage.setItem('cart', JSON.stringify(cart))
    printRows()
}
}












 // Toggle burger menu
document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};