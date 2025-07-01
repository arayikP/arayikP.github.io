document.addEventListener('DOMContentLoaded', function () {
    // Card input elements
    const cardHolder = document.getElementById('cardHolder');
    const cardNumber = document.getElementById('cardNumber');
    const expDate = document.getElementById('expDate');
    const cvv = document.getElementById('cvv');

    // Card preview elements
    const cardPreview = document.querySelector('.card-preview');
    const previewNumber = cardPreview.querySelector('.card-number');
    const previewHolder = cardPreview.querySelector('.card-holder');
    const previewExpiry = cardPreview.querySelector('.card-expiry');
    const cardType = document.createElement('div');
    cardType.classList.add('card-type');
    cardPreview.appendChild(cardType);

    // Create error message elements for each input
    const createErrorElement = () => {
        const errorElement = document.createElement('div');
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        errorElement.style.display = 'none';
        return errorElement;
    };

    // Add error elements after each input
    const cardHolderError = createErrorElement();
    const cardNumberError = createErrorElement();
    const expDateError = createErrorElement();
    const cvvError = createErrorElement();

    cardHolder.parentNode.appendChild(cardHolderError);
    cardNumber.parentNode.appendChild(cardNumberError);
    expDate.parentNode.appendChild(expDateError);
    cvv.parentNode.appendChild(cvvError);

    // Style for positioning card type logo
    cardType.style.position = 'absolute';
    cardType.style.bottom = '10px';
    cardType.style.right = '10px';
    cardType.style.width = '50px';
    cardType.style.height = '30px';

    // Validate cardholder name - only letters
    cardHolder.addEventListener('input', function (e) {
        // Replace any non-letter characters (except spaces)
        const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
        e.target.value = value;
        previewHolder.textContent = value.toUpperCase() || 'CARDHOLDER';

        // Reset error styles on input
        cardHolder.style.border = '';
        cardHolderError.style.display = 'none';
    });












    // input event for card number
    // Format and validate card number - only numbers, max 16 digits
    cardNumber.addEventListener('input', function (e) {
        // Remove any non-digit characters
        let value = e.target.value.replace(/\D/g, '');

        // Limit to 16 digits
        if (value.length > 16) {
            value = value.slice(0, 16);
        }

        // Format with spaces
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }

        e.target.value = formattedValue;
        previewNumber.textContent = formattedValue || 'Card Number';

        // Reset error styles
        cardNumber.style.border = '';
        cardNumberError.style.display = 'none';

        // Detect card type and update logo position
        if (value.startsWith('4')) {
            cardType.innerHTML = '<img src="img/icon/visa.png" alt="Visa" style="width: 100%; height: 100%;">';
        } else if (value.startsWith('5')) {
            cardType.innerHTML = '<img src="img/icon/mastercard.png" alt="Mastercard" style="width: 100%; height: 100%;">';
        } else {
            cardType.innerHTML = '';
        }
    });

    // Format and validate expiry date
    expDate.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');

        // Check if first digit is greater than 1, limit month to valid values
        if (value.length > 0) {
            const firstDigit = parseInt(value[0]);
            if (firstDigit > 1) {
                // If first digit is greater than 1, it can only be followed by 0, 1, 2
                if (value.length > 1) {
                    const secondDigit = parseInt(value[1]);
                    if (secondDigit > 2) {
                        value = value[0] + '2' + value.slice(2);
                    }
                }
            } else if (firstDigit === 1) {
                // If first digit is 1, second digit can't be more than 2 (for month 12)
                if (value.length > 1) {
                    const secondDigit = parseInt(value[1]);
                    if (secondDigit > 2) {
                        value = value[0] + '2' + value.slice(2);
                    }
                }
            }

            // If month is 00, change to 01
            if (value.length >= 2 && value.substring(0, 2) === '00') {
                value = '01' + value.slice(2);
            }
        }

        // Limit to 4 digits (MM/YY)
        if (value.length > 4) {
            value = value.slice(0, 4);
        }

        // Format with slash
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }

        e.target.value = value;
        previewExpiry.textContent = value || 'MM/YY';

        // Reset error styles
        expDate.style.border = '';
        expDateError.style.display = 'none';

        // Validate expiration date in real-time (if complete)
        if (value.length === 5) { // MM/YY format complete
            validateExpiryDate(expDate, expDateError);
        }
    });

    // Function to validate that expiry date is current or future
    function validateExpiryDate(element, errorElement) {
        const expValue = element.value;
        if (expValue.length < 5) return false; // Not complete yet

        const parts = expValue.split('/');
        if (parts.length !== 2) return false;

        const month = parseInt(parts[0], 10);
        let year = parseInt(parts[1], 10);

        // Validate month is between 1 and 12
        if (month < 1 || month > 12) {
            applyErrorVibration(element, errorElement, 'Invalid month!');
            return false;
        }

        // Get current date
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; //  months are 0-indexed
        const currentYear = currentDate.getFullYear() % 100; // Get last two digits of year

        // Add 2000 to get full year from 2-digit year
        year = 2000 + year;
        const fullCurrentYear = 2000 + currentYear;

        // Check if expiry date is valid (current or future)
        const isValid = (year > fullCurrentYear) ||
            (year === fullCurrentYear && month >= currentMonth);

        if (!isValid) {
            applyErrorVibration(element, errorElement, 'The card is not valid!');
            return false;
        } else {
            // Clear error if date is valid
            element.style.border = '';
            errorElement.style.display = 'none';
            return true;
        }
    }

    // Validate CVV 
    cvv.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');  //only numbers

        // Limit to 4 digits 
        if (value.length > 4) {
            value = value.slice(0, 4);
        }

        e.target.value = value;

        // Reset error styles
        cvv.style.border = '';
        cvvError.style.display = 'none';
    });

    // Add vibration effect for validation errors
    const applyErrorVibration = (element, errorElement, message) => {
        element.style.border = '1px solid red';
        element.style.animation = 'shake 0.5s';

        if (errorElement && message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        // Define shake animation if not already in the document
        if (!document.querySelector('style#shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove animation class after it completes
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    };

    
    // Clear localStorage and redirect to index
    function clearDataAndRedirect() {
        localStorage.clear();
        window.location.href = 'index.html';
    }

    // Handle payment button
    const payBtn = document.querySelector('.pay-btn');

    payBtn.addEventListener('click', function () {
        let isValid = true;

        // Validate card holder 
        if (!cardHolder.value) {
            isValid = false;
            applyErrorVibration(cardHolder, cardHolderError, 'You missed this field!');
        }

        // Validate card number 
        const cardDigits = cardNumber.value.replace(/\D/g, '');
        if (!cardNumber.value) {
            isValid = false;
            applyErrorVibration(cardNumber, cardNumberError, 'You missed this field!');
        } else if (cardDigits.length !== 16) {
            isValid = false;
            applyErrorVibration(cardNumber, cardNumberError, 'Must be exactly 16 digits!');
        }

        // Validate expiry date
        const expValue = expDate.value;
        if (!expValue) {
            isValid = false;
            applyErrorVibration(expDate, expDateError, 'You missed this field!');
        } else if (expValue.length < 5) {
            isValid = false;
            applyErrorVibration(expDate, expDateError, 'not complete!');
        } else {
            const expiryValid = validateExpiryDate(expDate, expDateError);
            if (!expiryValid) {
                isValid = false;
            }
        }

        //CVV
        const cvvValue = cvv.value;
        if (!cvvValue) {
            isValid = false;
            applyErrorVibration(cvv, cvvError, 'You missed this field!');
        } else if (cvvValue.length < 3) {
            isValid = false;
            applyErrorVibration(cvv, cvvError, 'not complete!');
        }

        if (!isValid) {
            return;
        }



          //sweetalet
        Swal.fire({
            title: "Are you sure you want to pay?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading screen after confirmation
                let loadingAlert = Swal.fire({
                    title: "Inquiry in progress",
                    html: '<button id="cancelInquiryBtn" class="swal2-cancel swal2-styled" style="display: inline-block; background-color: #d33;">Cancel</button>',
                    didOpen: () => {
                        Swal.showLoading();
                        // Add event listener to the cancel button
                        document.getElementById('cancelInquiryBtn').addEventListener('click', function () {
                            Swal.close();
                            Swal.fire("Cancelled", "Payment process suspended.", "error");
                        });
                    },
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    showCancelButton: false, 
                });

                loadingAlert.then((result) => {
                    if (!result.isDismissed || result.dismiss === Swal.DismissReason.timer) {
                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "Your payment has been confirmed",
                            showConfirmButton: false,
                            timerProgressBar: true
                        }).then(() => {

                            clearDataAndRedirect();
                        });
                    }
                });
            } else {
                Swal.fire("Cancelled", "Payment process suspended.", "error");
            }
        });
    });
});

let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
let cartItems = document.getElementById('shoping-finish')
cart.forEach((elm) => {
    cartItems.innerHTML += `  <div class="cart-item">
                            <img src=${elm.images[0]} alt="${elm.model}" class="item-image">
                            <div>
                            <span class="item-name"> ${elm.model}</span> <br>
                            <span class="item-ram">${elm.ramSelected ? elm.ramSelected : elm.ram[0]} |</span>
                            <span class="item-memory">${elm.memorySelected ? elm.memorySelected : elm.memory[0]}</span>
                            <br>
                            <span class="item-sku-code">${elm.code}</span>
                            </div>
                            <span class="item-count">x${elm.count}</span>
                            <span class="item-price">$${Math.floor(elm.price*elm.count)}</span>
                        </div>`
})










//get all information from localStorage

let subtotal = document.getElementById('subtotal');
let fullTotal = document.getElementById('fullTotal');
let shippingMethod = document.getElementById('shippingMethod');

// calculate subtotal
let cartTotal = cart.reduce((sum, elm) => {
    return sum + elm.price * elm.count;
}, 0);

subtotal.innerHTML = "$" + cartTotal.toFixed(0);

// only numbers  
let shippingString = localStorage.getItem('shipping') || "";
let shippingMatch = shippingString.match(/\$([\d.]+)/);
let shippingFee = shippingMatch ? parseFloat(shippingMatch[1]) : 0;

// tax price
let kamisia = parseFloat(localStorage.getItem('kamisia')) || 0;

// calculate total 
let totalWithAll = cartTotal + shippingFee + kamisia;

fullTotal.innerHTML = "$" + totalWithAll.toFixed(0);

// get info in local strage
document.getElementById('customerName').innerText = localStorage.getItem('customerName');
document.getElementById('customerAddress').innerText = localStorage.getItem('customerAddress');
document.getElementById('customerPhone').innerText = localStorage.getItem('customerPhone');
document.getElementById('shippingMethod').innerText = localStorage.getItem('shippingMethod');
document.getElementById('tax').innerText = "$" + kamisia.toFixed(0);
document.getElementById('estimated').innerText = localStorage.getItem('shipping');












 // Toggle burger menu
document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};