// Get the elements
        const lightboxOverlay = document.getElementById('lightboxOverlay');
        const lightboxImg = document.getElementById('lightboxImg');
        const thumbnails = document.querySelectorAll('.thumbnail-img'); // Get all images with class "thumbnail-img"
        const closeBtnLightbox = document.getElementById('closeBtnLightbox');
        const prevBtnLightbox = document.getElementById('prevBtnLightbox');
        const nextBtnLightbox = document.getElementById('nextBtnLightbox');

        let currentIndex = 0; // To keep track of the current image in the lightbox

        // Function to update the lightbox image
        function updateLightbox() {
            lightboxImg.src = thumbnails[currentIndex].src;
        }

        // Open the lightbox when a thumbnail is clicked
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', function() {
                currentIndex = index; // Set the current index to the clicked image
                lightboxOverlay.style.display = 'flex';
                updateLightbox();  // Set the full-size image in the lightbox
            });
        });

        // Close the lightbox when the close button is clicked
        closeBtnLightbox.addEventListener('click', function() {
            lightboxOverlay.style.display = 'none';
        });

        // Close the lightbox if clicked outside the image
        lightboxOverlay.addEventListener('click', function(event) {
            if (event.target === lightboxOverlay) {
                lightboxOverlay.style.display = 'none';
            }
        });

        // Navigate to the previous image
        prevBtnLightbox.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = thumbnails.length - 1; // Loop to the last image
            }
            updateLightbox();
        });

        // Navigate to the next image
        nextBtnLightbox.addEventListener('click', function() {
            if (currentIndex < thumbnails.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // Loop to the first image
            }
            updateLightbox();
        });