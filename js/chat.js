document.addEventListener('DOMContentLoaded', function () {
    emailjs.init("ue7tNKaRReTSy8tsY"); 

    const chatBtn = document.getElementById('chatBtn');
    const chatModal = document.getElementById('chatModal');
    const closeChat = document.getElementById('closeChat');
    const contactForm = document.getElementById('contactForm');


    //close/open chat icon
    chatBtn.addEventListener('click', function () {
        chatModal.classList.toggle('active');
    });

    closeChat.addEventListener('click', function () {
        chatModal.classList.remove('active');
    });


    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        const templateParams = {
            from_name: name,
            phone: phone,
            email: email,
            message: message,
        };

        emailjs.send("service_xvziozs", "template_nb2a2e9", templateParams)
        .then(function () {
            chatModal.classList.remove('active');

            Swal.fire({
                position: "center",
                icon: "success",
                title: "The email was successfully sent",
                showConfirmButton: false,

            });
           
        }, function (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Oops, something went wrong!",
                text: error.text,
                confirmButtonText: "OK"
            });
        });
    });
});
