function checkFiles(files) {
    console.log(files);

    if (files.length != 1) {
        alert("Please upload exactly one file.")
        return;
    }

    const fileSize = files[0].size / 1024 / 1024; // in MiB
    if (fileSize > 10) {
        alert("File too large (max. 10MB)");
        return;
    }

    // Show the answer part
    document.getElementById("answerPart").classList.remove("hidden");
    
    const file = files[0];

    // Preview
    if (file) {
        document.getElementById("preview").src = URL.createObjectURL(files[0])
    }

    // Show loading indicator
    document.getElementById("loadingPart").style.display = "block";
    document.getElementById("resultsPart").style.display = "none";

    // Upload
    const formData = new FormData();
    for (const name in files) {
        formData.append("image", files[name]);
    }

    fetch('/analyze', {
        method: 'POST',
        headers: {
        },
        body: formData
    }).then(
        response => {
            console.log("Response:", response)
            response.text().then(function (text) {
                console.log("Raw response text:", text);
                try {
                    const jsonData = JSON.parse(text);
                    console.log("Parsed JSON:", jsonData);
                    
                    document.getElementById("loadingPart").style.display = "none";
                    document.getElementById("resultsPart").style.display = "block";
                    
                    displayResults(jsonData);
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                    console.error("Response text was:", text);
                    document.getElementById("loadingPart").style.display = "none";
                    alert("Error processing the response: " + e.message);
                }
            });
        }
    ).then(
        success => console.log(success)
    ).catch(
        error => {
            console.log("Fetch error:", error);
            document.getElementById("loadingPart").style.display = "none";
            alert("Error uploading file: " + error);
        }
    );
}

function displayResults(jsonData) {
    console.log("displayResults called with:", jsonData);
    
    let classifications = [];
    
    if (Array.isArray(jsonData)) {
        classifications = jsonData.map(item => ({
            className: item.className || item.class || item.name,
            probability: parseFloat(item.probability || 0)
        }));
    } else if (jsonData.classes && Array.isArray(jsonData.classes)) {
        classifications = jsonData.classes.map(item => ({
            className: item.className || item.class || item.name,
            probability: parseFloat(item.probability || 0)
        }));
    } else if (typeof jsonData === 'object') {
        for (const [key, value] of Object.entries(jsonData)) {
            if (key !== 'classes' && typeof value === 'number') {
                classifications.push({
                    className: key,
                    probability: parseFloat(value)
                });
            }
        }
    }
    
    console.log("Extracted classifications:", classifications);
    
    classifications.sort((a, b) => b.probability - a.probability);
    
    if (classifications.length > 0) {
        const topResult = classifications[0];
        const topLabel = topResult.className || "Unknown";
        const topProb = (parseFloat(topResult.probability) * 100).toFixed(1);
        
        console.log("Top result:", topLabel, topProb + "%");
        
        document.getElementById("topLabel").textContent = topLabel;
        document.getElementById("topPercentage").textContent = topProb + "%";
        document.getElementById("topResult").style.display = "flex";
    }
    
    let classificationHTML = "";
    classifications.forEach((item, index) => {
        const label = item.className || "Unknown";
        const probability = parseFloat(item.probability);
        const percentage = (probability * 100).toFixed(1);
        
        if (index === 0) return;
        
        classificationHTML += `
            <div class="classification-item">
                <div class="classification-label">${label}</div>
                <div class="classification-bar">
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="classification-percentage">${percentage}%</div>
            </div>
        `;
    });
    
    document.getElementById("classificationList").innerHTML = classificationHTML;
    console.log("Results displayed");
}

// Drag & Drop Functionality
document.addEventListener('DOMContentLoaded', function () {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('image');

    if (!dropZone || !fileInput) return;

    // Click on dropzone -> open file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag over -> highlight
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    // Drag leave -> remove highlight
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    // Drop -> process file
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            checkFiles(files);
        }
    });
});