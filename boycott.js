document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById("searchInput");
    var suggestionsDiv = document.getElementById("suggestions");
    var searchButton = document.getElementById("searchButton");
    var boycottList = [];

    //Check if the list of brands is in the cache
    var cachedBoycottList = localStorage.getItem('boycottList');
    if (cachedBoycottList) {
        boycottList = JSON.parse(cachedBoycottList);
    } else {
        // Load list of brands on page load
        fetch('granddata.json')
        .then(response => response.json())
        .then(data => {
            boycottList = data.map(item => ({
                name: item.attributes.name.toLowerCase().replace(/[^\w\s]/g, ''),
                original: item // Keep a reference to the original object for displaying details
            }));
            // Keep the list in the cache
            localStorage.setItem('boycottList', JSON.stringify(boycottList));
        })
        .catch(error => {
            console.error('Error fetching boycott list:', error);
        });
    }

    searchInput.addEventListener('input', function() {
        var input = searchInput.value.trim().toLowerCase().replace(/[^\w\s]/g, '');
        if (!input) {
            suggestionsDiv.innerHTML = '';
            return;
        }

        // filter suggestions
        var result = boycottList.filter(item => item.name.startsWith(input));
        let suggestionHTML = '';

        result.forEach(resultItem => {
            suggestionHTML += `<div class="suggestion-item">${resultItem.original.attributes.name}</div>`;
        });

        suggestionsDiv.innerHTML = suggestionHTML;

        // Add a click manager to suggestion elements
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                searchInput.value = this.textContent;
                suggestionsDiv.innerHTML = '';
                triggerSearch(); // Start search for selected item
            });
        });
    });

    searchButton.addEventListener("click", triggerSearch);

    function triggerSearch() {
        var searchTerm = searchInput.value.trim().toLowerCase().replace(/[^\w\s]/g, '');

        if (!searchTerm) {
            displayEmptySearchMessage();
            return;
        }
        // Check whether the term you are looking for is in the boycott list
        var found = boycottList.find(item => item.name === searchTerm);
        if (found) {
            // Show details of product found
            displayProductDetails(found.original.attributes);
        } 
        else {
            // Display message for not found product
            displayNotFoundMessage();
        }
    }

    function displayProductDetails(product) {
        var resultsDiv = document.getElementById("searchResults");

        // Check if the product is boycotted
        var boycottMessage = product.boycotted ? "<strong>No Thank You</strong>" : "";
        
        // Generate HTML for search result
        var resultHTML = `
          <div class="result-card">
            <img src="${product.imageUrl}" class="brand-image" alt="${product.name}">
            <div>
              <h5>${product.name}</h5>
              <p>${boycottMessage}</p>
              ${product.proof ? `<p>${boldifyText(product.proof)}</p>` : ''}
              ${product.proofUrl ? `<a href="${product.proofUrl}" class="btn btn-primary Proof">Proof Link</a>` : ''}
            </div>
          </div>
        `;
        
        resultsDiv.innerHTML = resultHTML;
        // Function to boldify text based on the pattern "**(text)**"
        function boldifyText(text) {
            return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
    }

    function displayNotFoundMessage() {
        var resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = `
            <div class="alert alert-warning" role="alert">
                No boycott found for the entered product.
            </div>
        `;
    }

    function displayEmptySearchMessage() {
        var resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = `
            <div class="alert alert-warning" role="alert">
                Please enter a product.
            </div>
        `;
    }
});
