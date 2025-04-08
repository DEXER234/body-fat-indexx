document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Toggle hip input based on gender
    document.querySelectorAll('input[name="gender"]').forEach(input => {
        input.addEventListener('change', function() {
            const hipGroup = document.getElementById('hip-group');
            hipGroup.style.display = this.value === 'female' ? 'block' : 'none';
        });
    });
    
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Calculate button functionality
    document.getElementById('calculate').addEventListener('click', calculateBodyFat);
    
    // Clear button functionality
    document.getElementById('clear').addEventListener('click', resetCalculator);
    
    // Allow form submission with Enter key
    document.getElementById('bodyFatForm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateBodyFat();
        }
    });
});

function calculateBodyFat() {
    // Get input values
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const age = parseFloat(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const neck = parseFloat(document.getElementById('neck').value);
    const waist = parseFloat(document.getElementById('waist').value);
    const hipInput = document.getElementById('hip');
    const hip = gender === 'female' ? parseFloat(hipInput.value) : 0;
    
    // Validate inputs
    if (!validateInputs(gender, age, weight, height, neck, waist, hip)) {
        return;
    }
    
    // Calculate body fat percentage
    let bodyFatPercentage;
    if (gender === 'male') {
        bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
        bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) - 450;
    }
    
    // Ensure body fat percentage is within reasonable bounds
    bodyFatPercentage = Math.max(2, Math.min(50, bodyFatPercentage));
    
    // Calculate derived metrics
    const bodyFatMass = (bodyFatPercentage / 100) * weight;
    const leanBodyMass = weight - bodyFatMass;
    
    // Determine ideal body fat based on gender
    const idealBodyFat = gender === 'male' ? 15 : 22;
    const fatToLose = Math.max(0, bodyFatMass - ((idealBodyFat / 100) * weight));
    
    // Get body fat category
    const category = getBodyFatCategory(gender, bodyFatPercentage);
    
    // Display results
    displayResults(bodyFatPercentage, category, bodyFatMass, leanBodyMass, fatToLose);
    
    // Update visualization
    updateVisualization(bodyFatPercentage, bodyFatMass, leanBodyMass, weight, category);
}

function validateInputs(gender, age, weight, height, neck, waist, hip) {
    // Check for empty fields
    if (!gender || isNaN(age) || isNaN(weight) || isNaN(height) || isNaN(neck) || isNaN(waist) || 
        (gender === 'female' && isNaN(hip))) {
        showError('Please fill in all required fields.');
        return false;
    }
    
    // Validate age
    if (age < 15 || age > 100) {
        showError('Please enter a valid age between 15 and 100.');
        return false;
    }
    
    // Validate weight
    if (weight < 30 || weight > 200) {
        showError('Please enter a weight between 30kg and 200kg.');
        return false;
    }
    
    // Validate height
    if (height < 120 || height > 250) {
        showError('Please enter a height between 120cm and 250cm.');
        return false;
    }
    
    // Validate neck
    if (neck < 20 || neck > 50) {
        showError('Please enter a neck circumference between 20cm and 50cm.');
        return false;
    }
    
    // Validate waist
    if (waist < 50 || waist > 150) {
        showError('Please enter a waist circumference between 50cm and 150cm.');
        return false;
    }
    
    // Validate hip (for women)
    if (gender === 'female' && (hip < 60 || hip > 150)) {
        showError('Please enter a hip circumference between 60cm and 150cm.');
        return false;
    }
    
    // Validate waist > neck
    if (waist <= neck) {
        showError('Waist measurement must be greater than neck measurement.');
        return false;
    }
    
    // Validate waist + hip > neck (for women)
    if (gender === 'female' && (waist + hip) <= neck) {
        showError('Waist + Hip measurements must be greater than neck measurement.');
        return false;
    }
    
    return true;
}

function showError(message) {
    alert(message); // In a production app, you'd use a more elegant error display
}

function getBodyFatCategory(gender, percentage) {
    if (gender === 'male') {
        if (percentage < 6) return { name: 'Essential Fat', description: 'Very low body fat, essential for physiological functions', color: '#f72585', icon: 'fas fa-heartbeat' };
        if (percentage <= 13) return { name: 'Athlete', description: 'Typical for athletic individuals and fitness models', color: '#f8961e', icon: 'fas fa-running' };
        if (percentage <= 17) return { name: 'Fitness', description: 'Ideal for most men, lean and toned appearance', color: '#4cc9f0', icon: 'fas fa-dumbbell' };
        if (percentage <= 24) return { name: 'Average', description: 'Normal range for healthy men', color: '#4361ee', icon: 'fas fa-user' };
        return { name: 'Overweight', description: 'Higher than recommended body fat percentage', color: '#7209b7', icon: 'fas fa-exclamation-triangle' };
    } else {
        if (percentage < 14) return { name: 'Essential Fat', description: 'Very low body fat, essential for physiological functions', color: '#f72585', icon: 'fas fa-heartbeat' };
        if (percentage <= 20) return { name: 'Athlete', description: 'Typical for athletic women and fitness models', color: '#f8961e', icon: 'fas fa-running' };
        if (percentage <= 24) return { name: 'Fitness', description: 'Ideal for most women, lean and toned appearance', color: '#4cc9f0', icon: 'fas fa-dumbbell' };
        if (percentage <= 31) return { name: 'Average', description: 'Normal range for healthy women', color: '#4361ee', icon: 'fas fa-user' };
        return { name: 'Overweight', description: 'Higher than recommended body fat percentage', color: '#7209b7', icon: 'fas fa-exclamation-triangle' };
    }
}

function displayResults(percentage, category, fatMass, leanMass, fatToLose) {
    document.getElementById('body-fat-percentage').textContent = `${percentage.toFixed(1)}%`;
    document.getElementById('body-fat-category').textContent = category.name;
    document.getElementById('body-fat-mass').textContent = `${fatMass.toFixed(1)} kg`;
    document.getElementById('lean-body-mass').textContent = `${leanMass.toFixed(1)} kg`;
    document.getElementById('fat-to-lose').textContent = `${fatToLose.toFixed(1)} kg`;
}

function updateVisualization(percentage, fatMass, leanMass, weight, category) {
    // Update graph bars
    const fatPercentage = (fatMass / weight) * 100;
    const leanPercentage = (leanMass / weight) * 100;
    
    document.getElementById('graph-fat-fill').style.width = `${fatPercentage}%`;
    document.getElementById('graph-lean-fill').style.width = `${leanPercentage}%`;
    
    document.getElementById('graph-fat-value').textContent = `${fatPercentage.toFixed(1)}%`;
    document.getElementById('graph-lean-value').textContent = `${leanPercentage.toFixed(1)}%`;
    
    // Update category display
    const categoryDisplay = document.getElementById('category-display');
    const categoryIcon = categoryDisplay.querySelector('.category-icon i');
    const categoryTitle = document.getElementById('category-title');
    const categoryDesc = document.getElementById('category-description');
    
    categoryDisplay.style.backgroundColor = `${category.color}20`; // Add opacity
    categoryDisplay.style.borderLeft = `4px solid ${category.color}`;
    categoryIcon.className = category.icon;
    categoryIcon.style.color = category.color;
    categoryTitle.textContent = category.name;
    categoryTitle.style.color = category.color;
    categoryDesc.textContent = category.description;
}

function resetCalculator() {
    // Reset form
    document.getElementById('bodyFatForm').reset();
    document.getElementById('hip-group').style.display = 'none';
    
    // Reset results
    document.querySelectorAll('.result-value').forEach(el => el.textContent = '-');
    
    // Reset visualization
    document.getElementById('graph-fat-fill').style.width = '0%';
    document.getElementById('graph-lean-fill').style.width = '0%';
    document.getElementById('graph-fat-value').textContent = '0%';
    document.getElementById('graph-lean-value').textContent = '0%';
    
    // Reset category display
    const categoryDisplay = document.getElementById('category-display');
    categoryDisplay.style.backgroundColor = '';
    categoryDisplay.style.borderLeft = '';
    const categoryIcon = categoryDisplay.querySelector('.category-icon i');
    categoryIcon.className = 'fas fa-question-circle';
    categoryIcon.style.color = '#6c757d';
    document.getElementById('category-title').textContent = 'No Data';
    document.getElementById('category-title').style.color = '';
    document.getElementById('category-description').textContent = 'Enter your measurements to see your body fat category';
}