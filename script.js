document.addEventListener('DOMContentLoaded', function() {
    // Initialize local storage if needed
    if (!localStorage.getItem('fitnessData')) {
        localStorage.setItem('fitnessData', JSON.stringify({
            weight: 67,
            targetWeight: 75,
            workouts: [],
            meals: [],
            metrics: []
        }));
    }

    // Load data from localStorage
    let fitnessData = JSON.parse(localStorage.getItem('fitnessData'));

    // Update UI with current data
    updateDashboard();
    updateWorkoutLog();
    updateNutritionLog();
    updateProgressCharts();

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and tab
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Quick Add Buttons
    document.getElementById('quick-weight').addEventListener('click', () => {
        const weight = prompt('Enter your current weight (kg):', fitnessData.weight);
        if (weight !== null && !isNaN(weight) && weight > 0) {
            updateWeight(parseFloat(weight));
        }
    });

    document.getElementById('quick-workout').addEventListener('click', () => {
        const workoutDay = prompt('Which workout day did you complete? (1-5):', '');
        if (workoutDay !== null && ['1', '2', '3', '4', '5'].includes(workoutDay)) {
            logWorkout(workoutDay);
        }
    });

    document.getElementById('quick-meal').addEventListener('click', () => {
        const meal = prompt('What did you eat?', '');
        if (meal !== null && meal.trim() !== '') {
            logMeal(meal, 'snack', false);
        }
    });

    // Log Workout Buttons
    const logWorkoutButtons = document.querySelectorAll('.log-workout-btn');
    logWorkoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            const day = button.getAttribute('data-day');
            logWorkout(day);
        });
    });

    // Meal Buttons
    const mealButtons = document.querySelectorAll('.meal-btn');
    mealButtons.forEach(button => {
        button.addEventListener('click', () => {
            const meal = button.getAttribute('data-meal');
            let type = 'snack';
            let isProtein = false;
            
            if (meal.includes('Shake')) {
                type = 'shake';
            }
            
            if (meal.includes('Protein')) {
                isProtein = true;
            }
            
            logMeal(meal, type, isProtein);
        });
    });

    // Form Submissions
    document.getElementById('meal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const mealName = document.getElementById('meal-name').value;
        const mealType = document.getElementById('meal-type').value;
        const isProtein = document.getElementById('protein-rich').checked;
        
        if (mealName.trim() !== '') {
            logMeal(mealName, mealType, isProtein);
            document.getElementById('meal-name').value = '';
            document.getElementById('protein-rich').checked = false;
        }
    });

    document.getElementById('weight-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const weightValue = document.getElementById('weight-value').value;
        
        if (weightValue !== '' && !isNaN(weightValue) && weightValue > 0) {
            updateWeight(parseFloat(weightValue));
            document.getElementById('weight-value').value = '';
        }
    });

    document.getElementById('metrics-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const pullUps = document.getElementById('pull-ups').value;
        const dips = document.getElementById('dips').value;
        const pushUps = document.getElementById('push-ups').value;
        const squatJumps = document.getElementById('squat-jumps').value;
        const plankTime = document.getElementById('plank-time').value;
        
        updateMetrics(pullUps, dips, pushUps, squatJumps, plankTime);
        
        // Reset form
        document.getElementById('pull-ups').value = '';
        document.getElementById('dips').value = '';
        document.getElementById('push-ups').value = '';
        document.getElementById('squat-jumps').value = '';
        document.getElementById('plank-time').value = '';
    });

    // Functions to update data
    function updateWeight(weight) {
        fitnessData.weight = weight;
        fitnessData.metrics.push({
            date: new Date().toISOString(),
            weight: weight,
            type: 'weight'
        });
        
        saveData();
        updateDashboard();
        updateProgressCharts();
        
        showNotification('Weight updated to ' + weight + ' kg');
    }

    function logWorkout(day) {
        const workoutNames = {
            '1': 'Pull Focus + Core',
            '2': 'Push Focus + Lower Body',
            '3': 'Rest/Active Recovery',
            '4': 'Full Body Strength',
            '5': 'Metabolic Conditioning'
        };
        
        fitnessData.workouts.push({
            date: new Date().toISOString(),
            day: day,
            name: workoutNames[day]
        });
        
        saveData();
        updateDashboard();
        updateWorkoutLog();
        
        showNotification('Workout logged: Day ' + day + ' - ' + workoutNames[day]);
    }

    function logMeal(name, type, isProtein) {
        fitnessData.meals.push({
            date: new Date().toISOString(),
            name: name,
            type: type,
            isProtein: isProtein
        });
        
        saveData();
        updateDashboard();
        updateNutritionLog();
        
        showNotification('Meal logged: ' + name);
    }

    function updateMetrics(pullUps, dips, pushUps, squatJumps, plankTime) {
        const metricsEntry = {
            date: new Date().toISOString(),
            type: 'strength'
        };
        
        if (pullUps !== '') metricsEntry.pullUps = parseInt(pullUps);
        if (dips !== '') metricsEntry.dips = parseInt(dips);
        if (pushUps !== '') metricsEntry.pushUps = parseInt(pushUps);
        if (squatJumps !== '') metricsEntry.squatJumps = parseInt(squatJumps);
        if (plankTime !== '') metricsEntry.plankTime = parseInt(plankTime);
        
        fitnessData.metrics.push(metricsEntry);
        
        saveData();
        updateProgressCharts();
        
        showNotification('Strength metrics updated');
    }

    function saveData() {
        localStorage.setItem('fitnessData', JSON.stringify(fitnessData));
    }

    // UI Update Functions
    function updateDashboard() {
        // Update current weight
        document.getElementById('current-weight').textContent = fitnessData.weight + ' kg';
        
        // Update workouts completed
        const workoutsCompleted = fitnessData.workouts.length;
        document.getElementById('workouts-completed').textContent = workoutsCompleted;
        
        // Calculate nutrition streak
        let streak = calculateNutritionStreak();
        document.getElementById('nutrition-streak').textContent = streak + ' days';
        
        // Update today's workout
        updateTodaysWorkout();
    }

    function updateTodaysWorkout() {
        // Get day of the week (0 = Sunday, 1 = Monday, etc.)
        const today = new Date().getDay();
        let workoutToday = '';
        
        // Map day of week to workout day (assuming Monday = Day 1)
        if (today >= 1 && today <= 5) {
            const workoutDay = today;
            const workoutNames = {
                1: 'Pull Focus + Core',
                2: 'Push Focus + Lower Body',
                3: 'Rest/Active Recovery',
                4: 'Full Body Strength',
                5: 'Metabolic Conditioning'
            };
            workoutToday = `<h3>Day ${workoutDay}: ${workoutNames[workoutDay]}</h3>`;
        } else {
            workoutToday = `<h3>Rest Day</h3><p>Focus on recovery today, or choose an active recovery workout</p>`;
        }
        
        document.getElementById('todays-workout').innerHTML = workoutToday;
    }

    function updateWorkoutLog() {
        const workoutLogElement = document.getElementById('workout-log');
        
        if (fitnessData.workouts.length === 0) {
            workoutLogElement.innerHTML = '<p>No workouts logged yet</p>';
            return;
        }
        
        // Sort workouts by date (newest first)
        const sortedWorkouts = [...fitnessData.workouts].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        let html = '<ul class="workout-list">';
        
        sortedWorkouts.forEach(workout => {
            const date = new Date(workout.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            
            html += `
                <li>
                    <div class="workout-entry">
                        <span class="workout-date">${formattedDate}</span>
                        <span class="workout-name">Day ${workout.day}: ${workout.name}</span>
                    </div>
                </li>
            `;
        });
        
        html += '</ul>';
        workoutLogElement.innerHTML = html;
    }

    function updateNutritionLog() {
        const nutritionLogElement = document.getElementById('nutrition-log');
        
        if (fitnessData.meals.length === 0) {
            nutritionLogElement.innerHTML = '<p>No meals logged yet</p>';
            return;
        }
        
        // Sort meals by date (newest first)
        const sortedMeals = [...fitnessData.meals].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Group meals by day
        const mealsByDay = {};
        
        sortedMeals.forEach(meal => {
            const date = new Date(meal.date);
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            
            if (!mealsByDay[dateKey]) {
                mealsByDay[dateKey] = [];
            }
            
            mealsByDay[dateKey].push(meal);
        });
        
        let html = '';
        
        // Generate HTML for each day
        Object.keys(mealsByDay).forEach(dateKey => {
            const [year, month, day] = dateKey.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            
            html += `<div class="day-meals">
                <h4>${formattedDate}</h4>
                <ul class="meal-list">`;
            
            mealsByDay[dateKey].forEach(meal => {
                const mealDate = new Date(meal.date);
                const hours = mealDate.getHours().toString().padStart(2, '0');
                const minutes = mealDate.getMinutes().toString().padStart(2, '0');
                
                html += `
                    <li>
                        <div class="meal-entry ${meal.isProtein ? 'high-protein' : ''}">
                            <span class="meal-time">${hours}:${minutes}</span>
                            <span class="meal-name">${meal.name}</span>
                            <span class="meal-type">${meal.type}</span>
                        </div>
                    </li>
                `;
            });
            
            html += `</ul></div>`;
        });
        
        nutritionLogElement.innerHTML = html;
    }

    function updateProgressCharts() {
        updateWeightChart();
        updateStrengthChart();
    }

    function updateWeightChart() {
        const weightChartElement = document.getElementById('weight-chart');
        
        // Filter only weight metrics
        const weightMetrics = fitnessData.metrics
            .filter(metric => metric.weight && metric.type === 'weight')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (weightMetrics.length < 2) {
            weightChartElement.innerHTML = '<p>Need more weight data to generate chart</p>';
            return;
        }
        
        // Create basic chart using HTML and CSS
        let html = '<div class="simple-chart">';
        
        // Get min and max weight for scaling
        const weights = weightMetrics.map(m => m.weight);
        const minWeight = Math.min(...weights) - 1;
        const maxWeight = Math.max(...weights) + 1;
        const range = maxWeight - minWeight;
        
        // Create data points
        weightMetrics.forEach((metric, index) => {
            const date = new Date(metric.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
            
            // Calculate position as percentage
            const xPos = (index / (weightMetrics.length - 1)) * 100;
            const yPos = 100 - (((metric.weight - minWeight) / range) * 100);
            
            html += `
                <div class="chart-point" style="left: ${xPos}%; top: ${yPos}%;">
                    <div class="point-dot"></div>
                    <div class="point-label">${metric.weight} kg</div>
                    <div class="point-date">${formattedDate}</div>
                </div>
            `;
        });
        
        // Add target line
        const targetPos = 100 - (((fitnessData.targetWeight - minWeight) / range) * 100);
        html += `<div class="target-line" style="top: ${targetPos}%;"></div>`;
        html += `<div class="target-label" style="top: ${targetPos}%;">Target: ${fitnessData.targetWeight} kg</div>`;
        
        html += '</div>';
        weightChartElement.innerHTML = html;
    }

    function updateStrengthChart() {
        const strengthChartElement = document.getElementById('strength-chart');
        
        // Filter only strength metrics
        const strengthMetrics = fitnessData.metrics
            .filter(metric => metric.type === 'strength')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (strengthMetrics.length < 2) {
            strengthChartElement.innerHTML = '<p>Need more strength data to generate chart</p>';
            return;
        }
        
        // Create a simple table-based visualization
        let html = '<div class="progress-table-container"><table class="progress-table"><thead><tr>';
        html += '<th>Date</th>';
        
        // Determine which metrics to show
        const metricTypes = ['pullUps', 'dips', 'pushUps', 'squatJumps', 'plankTime'];
        const metricLabels = {
            'pullUps': 'Pull-ups',
            'dips': 'Dips',
            'pushUps': 'Push-ups',
            'squatJumps': 'Box Jumps',
            'plankTime': 'Plank (sec)'
        };
        
        // Find which metrics have data
        const availableMetrics = metricTypes.filter(type => {
            return strengthMetrics.some(metric => metric[type]);
        });
        
        // Add headers
        availableMetrics.forEach(metric => {
            html += `<th>${metricLabels[metric]}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        // Add rows
        strengthMetrics.forEach(metric => {
            const date = new Date(metric.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
            
            html += `<tr><td>${formattedDate}</td>`;
            
            availableMetrics.forEach(metricType => {
                html += `<td>${metric[metricType] || '-'}</td>`;
            });
            
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        strengthChartElement.innerHTML = html;
    }

    function calculateNutritionStreak() {
        if (fitnessData.meals.length === 0) return 0;
        
        // Sort meals by date
        const sortedMeals = [...fitnessData.meals].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        // Group meals by day
        const mealsByDay = {};
        
        sortedMeals.forEach(meal => {
            const date = new Date(meal.date);
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            
            if (!mealsByDay[dateKey]) {
                mealsByDay[dateKey] = [];
            }
            
            mealsByDay[dateKey].push(meal);
        });
        
        // Get dates as array and sort
        const dates = Object.keys(mealsByDay).map(d => {
            const [year, month, day] = d.split('-').map(Number);
            return new Date(year, month - 1, day);
        }).sort((a, b) => a - b);
        
        if (dates.length === 0) return 0;
        
        // Calculate streak from today backwards
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
            
            if (mealsByDay[dateString]) {
                streak++;
                
                // Special case: if we're on today and have logged a meal, count it
                if (currentDate.getTime() === today.getTime()) {
                    currentDate.setDate(currentDate.getDate() - 1);
                    continue;
                }
            } else {
                break;
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
    }

    function showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});