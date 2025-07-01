document.addEventListener('DOMContentLoaded', () => {
  const openModalButton = document.getElementById('openModal');
  const modal = document.getElementById('modal');
  const addAddressButton = document.getElementById('addAddress');

  // animation 
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

  // Open when clicking the button
  openModalButton.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  // Close when clicking outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Add new address   
  addAddressButton.addEventListener('click', () => {
    const nameInput = document.getElementById('name');
    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phone');
    
    const name = nameInput.value;
    const address = addressInput.value;
    const phone = phoneInput.value;

    localStorage.setItem('customerName', name);
    localStorage.setItem('customerAddress', address);
    localStorage.setItem('customerPhone', phone);


    // Clear previous errors
    clearErrorStyles([nameInput, addressInput, phoneInput]);
    
    let hasError = false;

    // Check if all fields are filled
    if (!name) {
      applyErrorVibration(nameInput, 'Please fill in all fields');
      hasError = true;
    }
    
    if (!address) {
      applyErrorVibration(addressInput, 'Please fill in all fields');
      hasError = true;
    }
    
    if (!phone) {
      applyErrorVibration(phoneInput, 'Please fill in all fields');
      hasError = true;
    }
    
    if (!hasError) {
      const addressList = document.querySelector('.address-list');

      const newAddressItem = document.createElement('div');
      newAddressItem.classList.add('address-item');

      newAddressItem.innerHTML = `
        <input type="radio" name="address">
        <div class="address-info">
          <strong>${name}</strong><br>
          ${address}<br>
          ${phone}
        </div>
        <div class="address-actions">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      `;

      addressList.appendChild(newAddressItem);

      // Clear modal inputs
      document.getElementById('name').value = '';
      document.getElementById('address').value = '';
      document.getElementById('phone').value = '';

      // Close the modal
      modal.style.display = 'none';

      // Add delete functionality to new address
      const deleteButton = newAddressItem.querySelector('.address-actions button:nth-child(2)');
      deleteButton.addEventListener('click', () => {
        addressList.removeChild(newAddressItem);
      });

      // Add edit functionality to new address
      const editButton = newAddressItem.querySelector('.address-actions button:nth-child(1)');
      editButton.addEventListener('click', () => {
        const currentName = newAddressItem.querySelector('.address-info strong').textContent;
        const currentAddress = newAddressItem.querySelector('.address-info').childNodes[2].textContent.trim();
        const currentPhone = newAddressItem.querySelector('.address-info').childNodes[4].textContent.trim();

        document.getElementById('name').value = currentName;
        document.getElementById('address').value = currentAddress;
        document.getElementById('phone').value = currentPhone;

        modal.style.display = 'flex';

        // Remove the address being edited
        addressList.removeChild(newAddressItem);
      });
    }
  });
  
  // Function to apply vibration effect and show error
  function applyErrorVibration(element, message) {
    // Add red border
    element.style.border = '1px solid red';
    
    // Add shake animation
    element.style.animation = 'shake 0.5s';
    
    // Create or update error message
    let errorElement = element.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
      errorElement = document.createElement('div');
      errorElement.classList.add('error-message');
      errorElement.style.color = 'red';
      errorElement.style.fontSize = '12px';
      errorElement.style.marginTop = '5px';
      element.parentNode.insertBefore(errorElement, element.nextSibling);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Remove animation class after it completes
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
    
    // Add input event listener to clear error when user starts typing
    element.addEventListener('input', function onInput() {
      element.style.border = '';
      if (errorElement) {
        errorElement.style.display = 'none';
      }
      element.removeEventListener('input', onInput);
    }, { once: true });
  }
  
  // Function to clear all error styles
  function clearErrorStyles(elements) {
    elements.forEach(element => {
      element.style.border = '';
      element.style.animation = '';
      
      const errorElement = element.nextElementSibling;
      if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.style.display = 'none';
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const nextButton = document.querySelector('.next');

  nextButton.addEventListener('click', (e) => {
    const selectedAddress = document.querySelector('.address-list input[type="radio"]:checked');

    if (!selectedAddress) {
      Swal.fire({
        icon: 'warning',
        title: 'No Address Selected',
        text: 'Please select a delivery address before proceeding.',
        confirmButtonText: 'OK'
      });
    } else {
      // if an address is selected, proceed to the next page
      window.location.href = './shipping.html';
    }
  });
});














 // Toggle burger menu
document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};