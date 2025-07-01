document.addEventListener('DOMContentLoaded', function () {
    const regularDateSpan = document.getElementById('regular-date');
    const expressDateSpan = document.getElementById('express-date');
    const scheduleDateInput = document.getElementById('schedule-date');
    const shipmentOptions = document.querySelectorAll('input[name="shipment"]');

    // Create price span and place 
    const schedulePriceSpan = document.createElement('span');
    schedulePriceSpan.id = 'schedule-price';
    schedulePriceSpan.style.display = 'none';

    schedulePriceSpan.textContent = 'Delivery fee: $0.00';
    schedulePriceSpan.style.color = '#666';
    const breakElement = document.createElement('br');
    scheduleDateInput.parentNode.insertBefore(breakElement, scheduleDateInput.nextSibling);
    scheduleDateInput.parentNode.insertBefore(schedulePriceSpan, breakElement.nextSibling);

    function updateDates() {
        // real time date
        const now = new Date();

        // Regular shipment - (3 days later)
        const regularDate = new Date(now);
        regularDate.setDate(now.getDate() + 3);
        regularDateSpan.textContent = regularDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });


        // Get your delivery as soon as possible - (next day)
        const expressDate = new Date(now);
        if (now.getHours() >= 12) {
            expressDate.setDate(now.getDate() + 1);
        }
        expressDateSpan.textContent = expressDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        // doesn't let go of last month
        const minDate = new Date(now);
        minDate.setDate(now.getDate());

        // Format the date string for datetime-local input
        const minDateString = minDate.toISOString().slice(0, 16);
        scheduleDateInput.min = minDateString;
    }

    // Calculate price based on day
    function calculateSchedulePrice() {
        const now = new Date();
        const selectedDate = new Date(scheduleDateInput.value);

        // Calculate difference in days
        const diffTime = Math.abs(selectedDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const selectedHour = selectedDate.getHours();


        let price = 50;
        if (diffDays > 0) {
            price = Math.max(10, 50 - (diffDays * 5));
        }

        // Add night time premium for deliveries between 19:00 and 09:00
        if (selectedHour >= 19 || selectedHour < 9) {
            price = price + 10;
        }

        schedulePriceSpan.textContent = `Delivery fee: $${price.toFixed(2)}`;


        // scheduel time save in local storage
        const formattedDate = selectedDate.toLocaleDateString("en-US");
        const formattedTime = selectedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        localStorage.setItem("shippingMethod", "Schedule");
        localStorage.setItem("shipping", `$${price.toFixed(2)} - ${formattedDate} - ${formattedTime}`);


    }




    // Show/hide schedule date input based on selection
    shipmentOptions.forEach(option => {
        option.addEventListener('change', function () {
            if (this.value === 'schedule') {
                scheduleDateInput.style.display = 'block';
                breakElement.style.display = 'inline';
                schedulePriceSpan.style.display = 'block';
                // Calculate initial price if a date is already selected
                if (scheduleDateInput.value) {
                    calculateSchedulePrice();
                }
            } else {
                scheduleDateInput.style.display = 'none';
                breakElement.style.display = 'none';
                schedulePriceSpan.style.display = 'none';
            }
        });
    });


    // Update price when date changes
    scheduleDateInput.addEventListener('change', calculateSchedulePrice);

    // hide 
    scheduleDateInput.style.display = 'none';
    breakElement.style.display = 'none';
    schedulePriceSpan.style.display = 'none';

    // Update dates when page loads
    updateDates();


});


const nextButton = document.querySelector('.next-btn');
const scheduleDateInput = document.getElementById('schedule-date');
nextButton.addEventListener('click', (e) => {
    const selectedShipment = document.querySelector('input[name="shipment"]:checked');

    if (!selectedShipment) {
        e.preventDefault();

        Swal.fire({
            icon: 'warning',
            title: 'No Shipment Option Selected',
            text: 'Please select a delivery method before continuing.',
            confirmButtonText: 'OK'
        });
    } else if (selectedShipment.value === 'schedule' && !scheduleDateInput.value) {
        e.preventDefault();

        Swal.fire({
            icon: 'warning',
            title: 'No Scheduled Date',
            text: 'Please select a date and time for scheduled delivery.',
            confirmButtonText: 'OK'
        });
    } else {
        window.location.href = './payment.html';
    }
});


function shippingMethod(id) {
    if (id == 'regular-date') {
        localStorage.setItem('shippingMethod', "Regular shipment");
        localStorage.setItem('shipping', `Free -  ${document.getElementById(id).textContent}`);
    }
    else if (id == 'express-date') {
        localStorage.setItem('shippingMethod', "Get your delivery as soon as possible");
        localStorage.setItem('shipping', `$${8.50} -  ${document.getElementById(id).textContent}`);
    }
}

// Toggle burger menu
document.querySelector('.burger-menu').onclick = function () {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};