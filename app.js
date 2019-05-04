// to add contentful to our js 
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "pwwzxu63h895",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "Vj3wbuPVZx0V0iBPvXvm6NprkoKrNotQ_xO_CfEda60"
  });
//adding an event listener to cart button to open the cart
let cartButton = document.querySelector(".cart-btn");
cartButton.addEventListener('click', openCart);

//adding an event listener to close button to close the cart
let closeButton = document.querySelector('.close-cart');
closeButton.addEventListener('click' , closeCart);

let cartOverlay = document.querySelector('.cart-overlay');
let cartMenu = document.querySelector('.cart');
let clearCartButton = document.querySelector('.clear-cart');
const cartCount = document.querySelector('.cart-count');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productGroup = document.querySelector('.product-group');
let cart = [];
let buttonsDOM = [];

//getting the products from contentful or local machine
class Products{
async getProducts(){
    try{
//    let contentfull = await client.getEntries({
//     content_type: "shoeZone"
//     });
//    below two lines of cade is to retrive data from json file in local machine
   let result = await fetch('products.json');
   let data = await result.json();

   //destructuring json file using map
   let structuredproducts = data.items;
   structuredproducts = structuredproducts.map( item => {
       const {title , price} = item.fields;
       const {id} = item.sys;
       const image = item.fields.image.fields.file.url;
       return {title,price,id,image};
   })
    return structuredproducts;
    }
    catch(error){
        console.log(error);
    }
}
}
//display the products
class UI{
    // display products method dynamically adds the products to html and displays our products section
    displayProducts(products){
       let result = '';
        products.forEach(product => {
            result += `<div class="product"><div class="img-container">
            <img src=${product.image} alt="product">
            <button class="addcartbtn" data-id = ${product.id}>
            <i class="fas fa-shopping-cart"></i>
            add to cart
            </button>
            </div> 
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4></div>`;
        });
        productGroup.innerHTML = result ;
        }
        // below method get the buttons from the images
        getCartBtns(){
            const addCartBtns = [...document.querySelectorAll('.addcartbtn')];
            buttonsDOM = addCartBtns;
            // for each button check whether the item associated with the button was added to the cart using id of the product 
            // if else add an event listener to the button to check for click event
            buttonsDOM.forEach( button =>{
                let id = button.dataset.id;
                let inCart = cart.find(item => item.id === id);
                if(inCart){
                    button.innerText = "in cart";
                    button.disabled = true;
                }
                button.addEventListener('click' , event => {
                    event.target.innerText = "in cart";
                    event.target.disabled = true;
                    //get the added product from products
                    let cartItem = {...Storage.getProduct(id) , count: 1};
                     //add each product to the cart
                    cart = [...cart,cartItem];
                    // console.log(cart);
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart values(total amount of items and total items on nav)
                    this.setCartValues(cart);
                    //display cart items on cart
                    this.addCartItem(cartItem);
                });
            });
        }
        setCartValues(cart){
          let tempTotal = 0;
          let itemsCount = 0;
          cart.map(item => {
              tempTotal += item.price * item.count;
              itemsCount += item.count;
          });
          cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
          cartCount.innerText = itemsCount;
        }
        addCartItem(item){
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `<img src="${item.image}" alt="">
                <div class="content">
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>cancel</span>
                </div>
                <div class="quantity">
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-count">${item.count}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
                </div>`;
                cartContent.appendChild(div);
        }
        // for setting up the data after refreshing the browser
        setupAPP() {
            cart = Storage.getCart();
            this.setCartValues(cart);
            this.poppulateCart(cart);
        }
        // add all the item present in the cart after page reload
        poppulateCart(cart){
            cart.forEach(item => this.addCartItem(item));
        }
        //for action that happens in the cart
        cartLogic(){
            //clear all the items in the cart
            clearCartButton.addEventListener( 'click' , () => {
                this.clearCart();
            });
            //card funtionality- cancel each item , increase individual item count one up , decrease individual item count one down
            cartContent.addEventListener('click' , event => {
                if(event.target.classList.contains('remove-item')){
                    let removeItem = event.target;
                    let id = removeItem.dataset.id;
                    cartContent.removeChild(removeItem.parentElement.parentElement);
                    this.removeItem(id);
                }
                else if(event.target.classList.contains('fa-chevron-up')) {
                    let addCount = event.target;
                    let id = addCount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    tempItem.count = tempItem.count + 1;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    addCount.nextElementSibling.innerText = tempItem.count;
                }
                else if(event.target.classList.contains('fa-chevron-down')) {
                    let lowerCount = event.target;
                    let id = lowerCount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    tempItem.count = tempItem.count - 1;
                    if(tempItem.count >0){
                        Storage.saveCart(cart);
                        this.setCartValues(cart);
                        lowerCount.previousElementSibling.innerText = tempItem.count;
                    }
                    else{
                        cartContent.removeChild(lowerCount.parentElement.parentElement);
                        this.removeItem(id);
                    }
                }
            });
        }
        clearCart(){
            let cartItems = cart.map(item => item.id);
            cartItems.forEach(id => this.removeItem(id));
            while(cartContent.children.length > 0){
                cartContent.removeChild(cartContent.children[0]);
            }
        }
        removeItem(id){
            cart = cart.filter(item => item.id !== id);
            this.setCartValues(cart);
            Storage.saveCart(cart);
            let button = this.getSingleButton(id);
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
        }
        getSingleButton(id){
            return buttonsDOM.find(button => button.dataset.id === id);
        }
}
//storing the products
class Storage{
 static saveProducts(products){
     localStorage.setItem('products', JSON.stringify(products));
 }
 static getProduct(id){
     let product = JSON.parse(localStorage.getItem('products'));
     return product.find(product => product.id === id);
 }
 static saveCart(cart){
    localStorage.setItem('cart' , JSON.stringify(cart));
}
static getCart(){
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
}
}

document.addEventListener('DOMContentLoaded' , () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();
    products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products);}).
    then( () => {
        ui.getCartBtns();
        ui.cartLogic();

    } );
});

function openCart(){
   cartOverlay.classList.add('transparentBcg');
   cartMenu.classList.add('showCart')
}

function closeCart(){
   cartOverlay.classList.remove('transparentBcg');
   cartMenu.classList.remove('showCart')
}