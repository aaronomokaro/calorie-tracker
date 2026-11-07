/**
 * NutriTrack - Vanilla Calorie & Macro Tracker
 * Pure HTML/CSS/JavaScript with browser localStorage persistence.
 */

(function () {
  'use strict';

  // --- Constants & Keys ---
  const STORAGE_KEY = 'nutritrack_app_data_v1';
  const CIRCLE_CIRCUMFERENCE = 440; // 2 * PI * 70

  // --- Default Initial Data ---
  const DEFAULT_SAVED_FOODS = [
    { id: 'f1', name: 'Oatmeal (cooked)', serving: '1 cup (234g)', calories: 158, protein: 6, carbs: 28, fat: 3.2 },
    { id: 'f2', name: 'Grilled Chicken Breast', serving: '150g', calories: 247, protein: 46.5, carbs: 0, fat: 5.4 },
    { id: 'f3', name: 'Boiled Egg (Large)', serving: '1 egg (50g)', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
    { id: 'f4', name: 'Greek Yogurt (Nonfat Plain)', serving: '170g', calories: 100, protein: 17.3, carbs: 6.1, fat: 0.7 },
    { id: 'f5', name: 'Banana', serving: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
    { id: 'f6', name: 'Brown Rice (cooked)', serving: '1 cup (195g)', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { id: 'f7', name: 'Salmon Fillet (baked)', serving: '150g', calories: 312, protein: 34, carbs: 0, fat: 18.2 },
    { id: 'f8', name: 'Avocado', serving: '1/2 fruit (100g)', calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
    { id: 'f9', name: 'Almonds (raw)', serving: '1 handful (30g)', calories: 173, protein: 6.4, carbs: 6.1, fat: 15 },
    { id: 'f10', name: 'Whey Protein Powder', serving: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
    { id: 'f11', name: 'Apple (fresh)', serving: '1 medium (182g)', calories: 95, protein: 0.5, carbs: 25.1, fat: 0.3 },
    { id: 'f12', name: 'Whole Wheat Toast', serving: '1 slice (38g)', calories: 81, protein: 4, carbs: 13.8, fat: 1.1 },
    { id: 'f13', name: 'Peanut Butter', serving: '1 tbsp (16g)', calories: 94, protein: 4, carbs: 3.1, fat: 8 },
    { id: 'f14', name: 'Sweet Potato (baked)', serving: '1 medium (114g)', calories: 103, protein: 2.3, carbs: 23.6, fat: 0.2 },
    { id: 'f15', name: 'Olive Oil', serving: '1 tbsp (14g)', calories: 119, protein: 0, carbs: 0, fat: 13.5 }
  ];

  const DEFAULT_APP_STATE = {
    settings: {
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      waterGoal: 2000
    },
    savedFoods: DEFAULT_SAVED_FOODS,
    days: {}
  };

  // --- Runtime State ---
  let appData = loadData();
  let selectedDate = getTodayDateStr();

  // --- DOM Elements ---
  const dateInput = document.getElementById('dateInput');
  const dateDisplayLabel = document.getElementById('dateDisplayLabel');
  const btnPrevDay = document.getElementById('btnPrevDay');
  const btnNextDay = document.getElementById('btnNextDay');
  const btnToday = document.getElementById('btnToday');

  // Dashboard elements
  const calorieProgressCircle = document.getElementById('calorieProgressCircle');
  const caloriesRemainingVal = document.getElementById('caloriesRemainingVal');
  const caloriesRemainingSub = document.getElementById('caloriesRemainingSub');
  const calorieStatusBadge = document.getElementById('calorieStatusBadge');
  const statGoal = document.getElementById('statGoal');
  const statConsumed = document.getElementById('statConsumed');
  const statNet = document.getElementById('statNet');

  // Macro elements
  const proteinGrams = document.getElementById('proteinGrams');
  const proteinPercent = document.getElementById('proteinPercent');
  const proteinBar = document.getElementById('proteinBar');
  const proteinKcal = document.getElementById('proteinKcal');
  const proteinRemaining = document.getElementById('proteinRemaining');

  const carbsGrams = document.getElementById('carbsGrams');
  const carbsPercent = document.getElementById('carbsPercent');
  const carbsBar = document.getElementById('carbsBar');
  const carbsKcal = document.getElementById('carbsKcal');
  const carbsRemaining = document.getElementById('carbsRemaining');

  const fatGrams = document.getElementById('fatGrams');
  const fatPercent = document.getElementById('fatPercent');
  const fatBar = document.getElementById('fatBar');
  const fatKcal = document.getElementById('fatKcal');
  const fatRemaining = document.getElementById('fatRemaining');

  // Water elements
  const waterText = document.getElementById('waterText');
  const waterGlasses = document.getElementById('waterGlasses');
  const btnAddWater = document.getElementById('btnAddWater');
  const btnSubWater = document.getElementById('btnSubWater');

  // Meal list containers
  const mealLists = {
    breakfast: document.getElementById('breakfastList'),
    lunch: document.getElementById('lunchList'),
    dinner: document.getElementById('dinnerList'),
    snack: document.getElementById('snackList')
  };

  const mealMacroSummaries = {
    breakfast: document.getElementById('breakfastMacros'),
    lunch: document.getElementById('lunchMacros'),
    dinner: document.getElementById('dinnerMacros'),
    snack: document.getElementById('snackMacros')
  };

  // Modals & Triggers
  const foodModal = document.getElementById('foodModal');
  const btnCloseFoodModal = document.getElementById('btnCloseFoodModal');
  const btnCancelFood = document.getElementById('btnCancelFood');
  const btnQuickAddFood = document.getElementById('btnQuickAddFood');
  const formCustomFood = document.getElementById('formCustomFood');
  const foodMealSelect = document.getElementById('foodMealSelect');

  const libraryModal = document.getElementById('libraryModal');
  const btnOpenLibrary = document.getElementById('btnOpenLibrary');
  const btnCloseLibraryModal = document.getElementById('btnCloseLibraryModal');
  const fullLibList = document.getElementById('fullLibList');
  const libManageSearch = document.getElementById('libManageSearch');
  const btnCreateNewLibItem = document.getElementById('btnCreateNewLibItem');
  const newLibItemFormBox = document.getElementById('newLibItemFormBox');
  const formNewLibItem = document.getElementById('formNewLibItem');
  const btnCancelNewLibItem = document.getElementById('btnCancelNewLibItem');

  const trendsModal = document.getElementById('trendsModal');
  const btnOpenTrends = document.getElementById('btnOpenTrends');
  const btnCloseTrendsModal = document.getElementById('btnCloseTrendsModal');

  const settingsModal = document.getElementById('settingsModal');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnEditMacros = document.getElementById('btnEditMacros');
  const btnCloseSettingsModal = document.getElementById('btnCloseSettingsModal');
  const btnCancelSettings = document.getElementById('btnCancelSettings');
  const formSettings = document.getElementById('formSettings');
  const settingCalorieGoal = document.getElementById('settingCalorieGoal');
  const settingProteinGoal = document.getElementById('settingProteinGoal');
  const settingCarbsGoal = document.getElementById('settingCarbsGoal');
  const settingFatGoal = document.getElementById('settingFatGoal');
  const settingWaterGoal = document.getElementById('settingWaterGoal');
  const macroTargetSplit = document.getElementById('macroTargetSplit');
  const btnExportData = document.getElementById('btnExportData');
  const importFileInput = document.getElementById('importFileInput');
  const btnClearToday = document.getElementById('btnClearToday');

  // Food Modal Tabs
  const tabBtnCustom = document.getElementById('tabBtnCustom');
  const tabBtnSaved = document.getElementById('tabBtnSaved');
  const tabBtnQuick = document.getElementById('tabBtnQuick');
  const tabPaneSaved = document.getElementById('tabPaneSaved');
  const formQuickAdd = document.getElementById('formQuickAdd');
  const btnCancelQuick = document.getElementById('btnCancelQuick');
  const libSearchInput = document.getElementById('libSearchInput');
  const libResultsList = document.getElementById('libResultsList');
  const libTargetMealSelect = document.getElementById('libTargetMealSelect');

  const toastNotification = document.getElementById('toastNotification');

  // --- Initialization ---
  function init() {
    bindEvents();
    setDate(selectedDate);
  }

  // --- Data Persistence Helpers ---
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          settings: { ...DEFAULT_APP_STATE.settings, ...(parsed.settings || {}) },
          savedFoods: parsed.savedFoods && parsed.savedFoods.length ? parsed.savedFoods : DEFAULT_SAVED_FOODS,
          days: parsed.days || {}
        };
      }
    } catch (e) {
      console.error('Failed to parse stored data', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_APP_STATE));
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.error('Failed to save data to localStorage', e);
      showToast('Error saving data to local storage');
    }
  }

  function getDayData(dateStr) {
    if (!appData.days[dateStr]) {
      appData.days[dateStr] = {
        water: 0,
        entries: []
      };
    }
    return appData.days[dateStr];
  }

  // --- Date Handling ---
  function getTodayDateStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateLabel(dateStr) {
    const today = getTodayDateStr();
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    // Calculate difference in calendar days
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    const targetObj = new Date(dateObj);
    targetObj.setHours(0, 0, 0, 0);
    const diffTime = targetObj.getTime() - todayObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formatted = dateObj.toLocaleDateString('en-US', options);

    if (diffDays === 0) {
      return `Today, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (diffDays === -1) {
      return `Yesterday, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return formatted;
  }

  function setDate(dateStr) {
    selectedDate = dateStr;
    dateInput.value = dateStr;
    dateDisplayLabel.textContent = formatDateLabel(dateStr);
    renderAll();
  }

  function shiftDate(offsetDays) {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    cur.setDate(cur.getDate() + offsetDays);

    const nextY = cur.getFullYear();
    const nextM = String(cur.getMonth() + 1).padStart(2, '0');
    const nextD = String(cur.getDate()).padStart(2, '0');
    setDate(`${nextY}-${nextM}-${nextD}`);
  }

  // --- Main Render Function ---
  function renderAll() {
    const day = getDayData(selectedDate);
    const settings = appData.settings;

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealTotals = {
      breakfast: { cal: 0, p: 0, c: 0, f: 0, count: 0 },
      lunch: { cal: 0, p: 0, c: 0, f: 0, count: 0 },
      dinner: { cal: 0, p: 0, c: 0, f: 0, count: 0 },
      snack: { cal: 0, p: 0, c: 0, f: 0, count: 0 }
    };

    day.entries.forEach(item => {
      const c = Number(item.calories) || 0;
      const p = Number(item.protein) || 0;
      const cb = Number(item.carbs) || 0;
      const f = Number(item.fat) || 0;

      totalCalories += c;
      totalProtein += p;
      totalCarbs += cb;
      totalFat += f;

      const m = item.meal || 'snack';
      if (mealTotals[m]) {
        mealTotals[m].cal += c;
        mealTotals[m].p += p;
        mealTotals[m].c += cb;
        mealTotals[m].f += f;
        mealTotals[m].count += 1;
      }
    });

    // 1. Render Calorie Gauge & Summary
    const goal = settings.calorieGoal || 2000;
    const remaining = goal - totalCalories;

    statGoal.textContent = `${goal.toLocaleString()} kcal`;
    statConsumed.textContent = `${totalCalories.toLocaleString()} kcal`;

    if (remaining >= 0) {
      statNet.textContent = `${remaining.toLocaleString()} kcal`;
      caloriesRemainingVal.textContent = remaining.toLocaleString();
      caloriesRemainingSub.textContent = 'Remaining';
      caloriesRemainingVal.style.color = '#0f172a';

      if (remaining === 0) {
        calorieStatusBadge.textContent = 'Goal Hit';
        calorieStatusBadge.className = 'status-badge badge-good';
      } else {
        calorieStatusBadge.textContent = 'On Track';
        calorieStatusBadge.className = 'status-badge badge-good';
      }
    } else {
      const over = Math.abs(remaining);
      statNet.textContent = `+${over.toLocaleString()} over`;
      caloriesRemainingVal.textContent = `+${over.toLocaleString()}`;
      caloriesRemainingSub.textContent = 'Over Target';
      caloriesRemainingVal.style.color = '#dc2626';

      calorieStatusBadge.textContent = 'Over Budget';
      calorieStatusBadge.className = 'status-badge badge-over';
    }

    // Circular progress stroke calculation
    const progressPct = Math.min(1, Math.max(0, totalCalories / goal));
    const offset = CIRCLE_CIRCUMFERENCE - (progressPct * CIRCLE_CIRCUMFERENCE);
    calorieProgressCircle.style.strokeDashoffset = offset;

    if (totalCalories > goal) {
      calorieProgressCircle.style.stroke = '#ef4444'; // Red if exceeded
    } else {
      calorieProgressCircle.style.stroke = '#10b981'; // Green
    }

    // 2. Render Macronutrients
    renderMacroRow(totalProtein, settings.proteinGoal, proteinGrams, proteinPercent, proteinBar, proteinKcal, proteinRemaining, 4);
    renderMacroRow(totalCarbs, settings.carbsGoal, carbsGrams, carbsPercent, carbsBar, carbsKcal, carbsRemaining, 4);
    renderMacroRow(totalFat, settings.fatGoal, fatGrams, fatPercent, fatBar, fatKcal, fatRemaining, 9);

    // 3. Render Water Tracker
    renderWater(day.water || 0, settings.waterGoal || 2000);

    // 4. Render Meals Breakdown
    renderMealSections(day.entries, mealTotals);
  }

  function renderMacroRow(current, target, gramsEl, pctEl, barEl, kcalEl, remEl, calPerGram) {
    const curRounded = Math.round(current * 10) / 10;
    const tgt = target || 100;
    const pct = Math.round((current / tgt) * 100);
    const kcal = Math.round(current * calPerGram);
    const rem = Math.round((tgt - current) * 10) / 10;

    gramsEl.textContent = `${curRounded}g / ${tgt}g`;
    pctEl.textContent = `${pct}%`;
    barEl.style.width = `${Math.min(100, pct)}%`;
    kcalEl.textContent = `${kcal.toLocaleString()} kcal`;

    if (rem >= 0) {
      remEl.textContent = `${rem}g remaining`;
      remEl.style.color = '#94a3b8';
    } else {
      remEl.textContent = `${Math.abs(rem)}g over`;
      remEl.style.color = '#ef4444';
    }
  }

  function renderWater(currentWater, goalWater) {
    waterText.textContent = `${currentWater.toLocaleString()} / ${goalWater.toLocaleString()} ml`;

    // Each glass icon represents ~250 ml
    const totalGlasses = Math.max(8, Math.round(goalWater / 250));
    const filledCount = Math.floor(currentWater / 250);

    let html = '';
    for (let i = 0; i < totalGlasses; i++) {
      const isFilled = i < filledCount ? 'filled' : '';
      html += `<div class="water-glass-icon ${isFilled}" data-glass-idx="${i}" title="${(i + 1) * 250} ml"></div>`;
    }
    waterGlasses.innerHTML = html;

    // Attach click to glass icons for fast jumping
    waterGlasses.querySelectorAll('.water-glass-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-glass-idx'));
        const newWater = (idx + 1) * 250;
        setWaterAmount(newWater);
      });
    });
  }

  function setWaterAmount(amount) {
    const day = getDayData(selectedDate);
    day.water = Math.max(0, amount);
    saveData();
    renderAll();
  }

  function addWaterAmount(delta) {
    const day = getDayData(selectedDate);
    day.water = Math.max(0, (day.water || 0) + delta);
    saveData();
    renderAll();
    showToast(`${delta > 0 ? '+250ml' : '-250ml'} Water`);
  }

  function renderMealSections(entries, mealTotals) {
    const meals = ['breakfast', 'lunch', 'dinner', 'snack'];

    meals.forEach(meal => {
      const listEl = mealLists[meal];
      const summaryEl = mealMacroSummaries[meal];
      const items = entries.filter(item => item.meal === meal);
      const totals = mealTotals[meal];

      // Update header summary
      if (totals.count > 0) {
        summaryEl.textContent = `${totals.cal.toLocaleString()} kcal • P: ${Math.round(totals.p)}g C: ${Math.round(totals.c)}g F: ${Math.round(totals.f)}g`;
      } else {
        summaryEl.textContent = '0 kcal';
      }

      // Render items
      if (items.length === 0) {
        listEl.innerHTML = `<div class="meal-empty-state">No foods logged for ${meal} yet</div>`;
      } else {
        listEl.innerHTML = items.map(item => `
          <div class="meal-item-row" data-id="${item.id}">
            <div class="item-left">
              <span class="item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
              <div class="item-meta-details">
                ${item.serving ? `<span>${escapeHtml(item.serving)}</span>` : ''}
                <div class="item-macro-chips">
                  ${item.protein ? `<span class="chip-mini chip-p">P ${Math.round(item.protein)}g</span>` : ''}
                  ${item.carbs ? `<span class="chip-mini chip-c">C ${Math.round(item.carbs)}g</span>` : ''}
                  ${item.fat ? `<span class="chip-mini chip-f">F ${Math.round(item.fat)}g</span>` : ''}
                </div>
              </div>
            </div>
            <div class="item-right">
              <span class="item-cals">${item.calories} kcal</span>
              <button class="btn-item-delete" data-id="${item.id}" title="Delete entry">&times;</button>
            </div>
          </div>
        `).join('');

        // Attach delete events
        listEl.querySelectorAll('.btn-item-delete').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteFoodEntry(id);
          });
        });
      }
    });
  }

  // --- Food Entry Operations ---
  function addFoodEntry(entryData) {
    const day = getDayData(selectedDate);
    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      meal: entryData.meal || 'snack',
      name: entryData.name || 'Quick Calories',
      serving: entryData.serving || '',
      calories: Math.round(Number(entryData.calories) || 0),
      protein: Math.round((Number(entryData.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(entryData.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(entryData.fat) || 0) * 10) / 10,
      timestamp: new Date().toISOString()
    };

    day.entries.push(newEntry);

    // Optionally save to library
    if (entryData.saveToLibrary && entryData.name) {
      const alreadyExists = appData.savedFoods.some(f => f.name.toLowerCase() === entryData.name.trim().toLowerCase());
      if (!alreadyExists) {
        appData.savedFoods.push({
          id: 'lib_' + Date.now(),
          name: entryData.name.trim(),
          serving: entryData.serving.trim() || '1 serving',
          calories: newEntry.calories,
          protein: newEntry.protein,
          carbs: newEntry.carbs,
          fat: newEntry.fat
        });
      }
    }

    saveData();
    renderAll();
    closeAllModals();
    showToast(`Added ${newEntry.name} (${newEntry.calories} kcal)`);
  }

  function deleteFoodEntry(entryId) {
    const day = getDayData(selectedDate);
    const initialLen = day.entries.length;
    day.entries = day.entries.filter(e => e.id !== entryId);

    if (day.entries.length < initialLen) {
      saveData();
      renderAll();
      showToast('Item deleted');
    }
  }

  // --- Modals Management ---
  function openFoodModal(preselectedMeal) {
    if (preselectedMeal) {
      foodMealSelect.value = preselectedMeal;
      libTargetMealSelect.value = preselectedMeal;
    }
    switchTab('custom');
    renderLibrarySelectorList('');
    foodModal.classList.remove('hidden');
    document.getElementById('foodNameInput').focus();
  }

  function openLibraryModal() {
    renderFullLibraryList('');
    newLibItemFormBox.classList.add('hidden');
    libraryModal.classList.remove('hidden');
    libManageSearch.value = '';
    libManageSearch.focus();
  }

  function openTrendsModal() {
    renderWeeklyTrends();
    trendsModal.classList.remove('hidden');
  }

  function openSettingsModal() {
    settingCalorieGoal.value = appData.settings.calorieGoal;
    settingProteinGoal.value = appData.settings.proteinGoal;
    settingCarbsGoal.value = appData.settings.carbsGoal;
    settingFatGoal.value = appData.settings.fatGoal;
    settingWaterGoal.value = appData.settings.waterGoal;
    updateMacroTargetSplitPreview();
    settingsModal.classList.remove('hidden');
  }

  function closeAllModals() {
    foodModal.classList.add('hidden');
    libraryModal.classList.add('hidden');
    trendsModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
  }

  // --- Tabs inside Food Modal ---
  function switchTab(tabName) {
    tabBtnCustom.classList.remove('active');
    tabBtnSaved.classList.remove('active');
    tabBtnQuick.classList.remove('active');

    formCustomFood.classList.remove('active');
    tabPaneSaved.classList.remove('active');
    formQuickAdd.classList.remove('active');

    if (tabName === 'custom') {
      tabBtnCustom.classList.add('active');
      formCustomFood.classList.add('active');
    } else if (tabName === 'saved') {
      tabBtnSaved.classList.add('active');
      tabPaneSaved.classList.add('active');
      libSearchInput.focus();
    } else if (tabName === 'quick') {
      tabBtnQuick.classList.add('active');
      formQuickAdd.classList.add('active');
      document.getElementById('quickCaloriesInput').focus();
    }
  }

  // --- Food Library Rendering ---
  function renderLibrarySelectorList(filterText) {
    const search = (filterText || '').toLowerCase().trim();
    const filtered = appData.savedFoods.filter(f => f.name.toLowerCase().includes(search));

    if (filtered.length === 0) {
      libResultsList.innerHTML = `<div class="meal-empty-state">No matching foods found in library</div>`;
      return;
    }

    libResultsList.innerHTML = filtered.map(item => `
      <div class="lib-item-card">
        <div class="lib-item-info">
          <span class="lib-item-title">${escapeHtml(item.name)}</span>
          <span class="lib-item-serving">${item.serving ? escapeHtml(item.serving) : 'Standard serving'}</span>
          <div class="lib-item-macros">
            <span class="chip-mini chip-p">P ${item.protein}g</span>
            <span class="chip-mini chip-c">C ${item.carbs}g</span>
            <span class="chip-mini chip-f">F ${item.fat}g</span>
          </div>
        </div>
        <div class="lib-item-actions">
          <span class="lib-item-cals">${item.calories} kcal</span>
          <button class="btn btn-sm btn-primary btn-add-lib-item" data-lib-id="${item.id}">+ Add</button>
        </div>
      </div>
    `).join('');

    libResultsList.querySelectorAll('.btn-add-lib-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const libId = e.currentTarget.getAttribute('data-lib-id');
        const item = appData.savedFoods.find(f => f.id === libId);
        if (item) {
          addFoodEntry({
            meal: libTargetMealSelect.value,
            name: item.name,
            serving: item.serving,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            saveToLibrary: false
          });
        }
      });
    });
  }

  function renderFullLibraryList(filterText) {
    const search = (filterText || '').toLowerCase().trim();
    const filtered = appData.savedFoods.filter(f => f.name.toLowerCase().includes(search));

    if (filtered.length === 0) {
      fullLibList.innerHTML = `<div class="meal-empty-state">No foods in library. Add custom foods with the button above!</div>`;
      return;
    }

    fullLibList.innerHTML = filtered.map(item => `
      <div class="lib-item-card">
        <div class="lib-item-info">
          <span class="lib-item-title">${escapeHtml(item.name)}</span>
          <span class="lib-item-serving">${item.serving ? escapeHtml(item.serving) : 'Standard serving'}</span>
          <div class="lib-item-macros">
            <span class="chip-mini chip-p">P ${item.protein}g</span>
            <span class="chip-mini chip-c">C ${item.carbs}g</span>
            <span class="chip-mini chip-f">F ${item.fat}g</span>
          </div>
        </div>
        <div class="lib-item-actions">
          <span class="lib-item-cals">${item.calories} kcal</span>
          <button class="btn btn-sm btn-outline btn-log-from-lib" data-lib-id="${item.id}">Log Today</button>
          <button class="btn-item-delete btn-del-lib-item" data-lib-id="${item.id}" title="Remove from Library">&times;</button>
        </div>
      </div>
    `).join('');

    fullLibList.querySelectorAll('.btn-log-from-lib').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const libId = e.currentTarget.getAttribute('data-lib-id');
        const item = appData.savedFoods.find(f => f.id === libId);
        if (item) {
          addFoodEntry({
            meal: 'snack',
            name: item.name,
            serving: item.serving,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            saveToLibrary: false
          });
        }
      });
    });

    fullLibList.querySelectorAll('.btn-del-lib-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const libId = e.currentTarget.getAttribute('data-lib-id');
        appData.savedFoods = appData.savedFoods.filter(f => f.id !== libId);
        saveData();
        renderFullLibraryList(libManageSearch.value);
        showToast('Item removed from library');
      });
    });
  }

  // --- Weekly Trends & Canvas Chart ---
  function renderWeeklyTrends() {
    const canvas = document.getElementById('weeklyTrendsCanvas');
    const ctx = canvas.getContext('2d');
    const trendAvgCalories = document.getElementById('trendAvgCalories');
    const trendTargetCalories = document.getElementById('trendTargetCalories');
    const trendAdherence = document.getElementById('trendAdherence');
    const trendsTableBody = document.getElementById('trendsTableBody');

    const targetGoal = appData.settings.calorieGoal || 2000;
    trendTargetCalories.textContent = `${targetGoal.toLocaleString()} kcal`;

    // Compute last 7 days ending at selectedDate
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dayList = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() - i);
      const dyStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      dayList.push({
        dateStr: dyStr,
        dayName: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        dateDisplay: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    let totalCals7Days = 0;
    let daysWithLogs = 0;
    let adherenceSuccessCount = 0;

    const tableRows = [];
    const chartData = [];

    dayList.forEach(item => {
      const dayData = appData.days[item.dateStr];
      let cals = 0;
      let p = 0;
      let cb = 0;
      let f = 0;
      let water = 0;

      if (dayData) {
        water = dayData.water || 0;
        (dayData.entries || []).forEach(e => {
          cals += Number(e.calories) || 0;
          p += Number(e.protein) || 0;
          cb += Number(e.carbs) || 0;
          f += Number(e.fat) || 0;
        });
      }

      if (cals > 0) {
        totalCals7Days += cals;
        daysWithLogs++;
      }

      // Adherence: within +/- 150 kcal of target
      const diff = Math.abs(cals - targetGoal);
      const isMet = cals > 0 && diff <= 150;
      const isOver = cals > targetGoal + 150;
      if (isMet) adherenceSuccessCount++;

      let statusBadge = '<span class="status-badge" style="background:#f1f5f9;color:#64748b;">No Logs</span>';
      if (cals > 0) {
        if (isMet) {
          statusBadge = '<span class="status-badge badge-good">Target Met</span>';
        } else if (isOver) {
          statusBadge = '<span class="status-badge badge-over">Over Target</span>';
        } else {
          statusBadge = '<span class="status-badge badge-warning">Under Target</span>';
        }
      }

      chartData.push({
        label: item.dayName,
        date: item.dateDisplay,
        calories: cals,
        goal: targetGoal
      });

      tableRows.push(`
        <tr>
          <td><strong>${item.dateDisplay}</strong> <span style="font-size:11px;color:#64748b;">(${item.dayName})</span></td>
          <td>${cals.toLocaleString()} kcal</td>
          <td>${Math.round(p)}g</td>
          <td>${Math.round(cb)}g</td>
          <td>${Math.round(f)}g</td>
          <td>${water} ml</td>
          <td>${statusBadge}</td>
        </tr>
      `);
    });

    const avg = daysWithLogs > 0 ? Math.round(totalCals7Days / daysWithLogs) : 0;
    trendAvgCalories.textContent = `${avg.toLocaleString()} kcal`;
    const adhPct = daysWithLogs > 0 ? Math.round((adherenceSuccessCount / daysWithLogs) * 100) : 0;
    trendAdherence.textContent = `${adhPct}%`;

    trendsTableBody.innerHTML = tableRows.join('');

    // Draw Canvas Chart
    drawTrendsChart(ctx, canvas, chartData, targetGoal);
  }

  function drawTrendsChart(ctx, canvas, data, goal) {
    const width = canvas.width;
    const height = canvas.height;

    // Reset and clear
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(goal * 1.3, ...data.map(d => d.calories), 2400);

    // Background horizontal grid lines
    const gridLines = 4;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f1f5f9';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const val = Math.round((maxVal / gridLines) * i);
      const y = padding.top + chartH - (val / maxVal) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillText(`${val}`, padding.left - 8, y + 4);
    }

    // Draw Goal line (dashed)
    const goalY = padding.top + chartH - (goal / maxVal) * chartH;
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.moveTo(padding.left, goalY);
    ctx.lineTo(padding.left + chartW, goalY);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Goal label on right
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText(`Target: ${goal}`, padding.left + 8, goalY - 6);

    // Draw Bars
    const barCount = data.length;
    const slotW = chartW / barCount;
    const barW = Math.min(36, slotW * 0.55);

    data.forEach((d, i) => {
      const x = padding.left + i * slotW + (slotW - barW) / 2;
      const barH = d.calories > 0 ? (d.calories / maxVal) * chartH : 0;
      const y = padding.top + chartH - barH;

      // Color selection
      let barColor = '#10b981'; // Green on track
      if (d.calories > goal) {
        barColor = '#f43f5e'; // Red if exceeded
      } else if (d.calories === 0) {
        barColor = '#e2e8f0'; // Empty
      }

      // Rounded top bar
      ctx.fillStyle = barColor;
      if (barH > 0) {
        roundRect(ctx, x, y, barW, barH, 6);
        ctx.fill();

        // Value text above bar
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.calories}`, x + barW / 2, y - 6);
      } else {
        // Dot or baseline for 0
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + barW / 2 - 2, padding.top + chartH - 4, 4, 4);
      }

      // X Axis label
      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, padding.top + chartH + 18);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(d.date, x + barW / 2, padding.top + chartH + 32);
    });
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (height < radius) radius = height;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // --- Settings & Target Breakdown ---
  function updateMacroTargetSplitPreview() {
    const p = Number(settingProteinGoal.value) || 0;
    const c = Number(settingCarbsGoal.value) || 0;
    const f = Number(settingFatGoal.value) || 0;

    const pCal = p * 4;
    const cCal = c * 4;
    const fCal = f * 9;
    const totalMacroCal = pCal + cCal + fCal;

    if (totalMacroCal > 0) {
      const pPct = Math.round((pCal / totalMacroCal) * 100);
      const cPct = Math.round((cCal / totalMacroCal) * 100);
      const fPct = Math.round((fCal / totalMacroCal) * 100);
      macroTargetSplit.innerHTML = `
        <span>Total from macros: <strong>${totalMacroCal} kcal</strong></span> • 
        <span style="color:#f97316;">Protein: ${pPct}%</span> | 
        <span style="color:#0284c7;">Carbs: ${cPct}%</span> | 
        <span style="color:#eab308;">Fat: ${fPct}%</span>
      `;
    } else {
      macroTargetSplit.textContent = 'Enter values to see macro breakdown.';
    }
  }

  // --- Export & Import ---
  function exportDataJSON() {
    const jsonString = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutritrack-backup-${getTodayDateStr()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully!');
  }

  function importDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && imported.settings) {
          appData = {
            settings: { ...DEFAULT_APP_STATE.settings, ...imported.settings },
            savedFoods: imported.savedFoods || DEFAULT_SAVED_FOODS,
            days: imported.days || {}
          };
          saveData();
          renderAll();
          closeAllModals();
          showToast('Data imported successfully!');
        } else {
          showToast('Invalid backup file format');
        }
      } catch (err) {
        console.error(err);
        showToast('Error parsing JSON backup file');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  }

  // --- Toast Notifications ---
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastNotification.textContent = message;
    toastNotification.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2800);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Date Navigation
    dateInput.addEventListener('change', (e) => {
      if (e.target.value) setDate(e.target.value);
    });

    btnPrevDay.addEventListener('click', () => shiftDate(-1));
    btnNextDay.addEventListener('click', () => shiftDate(1));
    btnToday.addEventListener('click', () => setDate(getTodayDateStr()));

    // Water Controls
    btnAddWater.addEventListener('click', () => addWaterAmount(250));
    btnSubWater.addEventListener('click', () => addWaterAmount(-250));

    // Quick Add Calorie Chips (+100, +250, +500)
    document.querySelectorAll('[data-quick-cal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cal = Number(e.currentTarget.getAttribute('data-quick-cal'));
        addFoodEntry({
          meal: 'snack',
          name: `Quick Log (+${cal} kcal)`,
          serving: '',
          calories: cal,
          protein: 0,
          carbs: 0,
          fat: 0,
          saveToLibrary: false
        });
      });
    });

    // Meal Card "+ Add" Buttons
    document.querySelectorAll('.btn-add-meal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const meal = e.currentTarget.getAttribute('data-meal');
        openFoodModal(meal);
      });
    });

    // Log Food Header Button
    btnQuickAddFood.addEventListener('click', () => {
      openFoodModal('breakfast');
    });

    // Modal Close Buttons
    btnCloseFoodModal.addEventListener('click', closeAllModals);
    btnCancelFood.addEventListener('click', closeAllModals);
    btnCloseLibraryModal.addEventListener('click', closeAllModals);
    btnCloseTrendsModal.addEventListener('click', closeAllModals);
    btnCloseSettingsModal.addEventListener('click', closeAllModals);
    btnCancelSettings.addEventListener('click', closeAllModals);
    btnCancelQuick.addEventListener('click', closeAllModals);

    // Food Modal Tabs
    tabBtnCustom.addEventListener('click', () => switchTab('custom'));
    tabBtnSaved.addEventListener('click', () => switchTab('saved'));
    tabBtnQuick.addEventListener('click', () => switchTab('quick'));

    // Custom Food Form Submit
    formCustomFood.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('foodNameInput').value.trim();
      const meal = foodMealSelect.value;
      const serving = document.getElementById('foodServingInput').value.trim();
      const calories = document.getElementById('foodCaloriesInput').value;
      const protein = document.getElementById('foodProteinInput').value || 0;
      const carbs = document.getElementById('foodCarbsInput').value || 0;
      const fat = document.getElementById('foodFatInput').value || 0;
      const saveToLib = document.getElementById('checkSaveToLibrary').checked;

      if (!name || !calories) return;

      addFoodEntry({
        meal: meal,
        name: name,
        serving: serving,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        saveToLibrary: saveToLib
      });

      // Reset form
      formCustomFood.reset();
      document.getElementById('checkSaveToLibrary').checked = true;
    });

    // Quick Calories Form Submit
    formQuickAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      const meal = document.getElementById('quickMealSelect').value;
      const calories = document.getElementById('quickCaloriesInput').value;
      const note = document.getElementById('quickNoteInput').value.trim();

      if (!calories) return;

      addFoodEntry({
        meal: meal,
        name: note || 'Quick Calories',
        serving: '',
        calories: calories,
        protein: 0,
        carbs: 0,
        fat: 0,
        saveToLibrary: false
      });

      formQuickAdd.reset();
    });

    // Filter Saved Foods inside Add Modal
    libSearchInput.addEventListener('input', (e) => {
      renderLibrarySelectorList(e.target.value);
    });

    // Library Management
    btnOpenLibrary.addEventListener('click', openLibraryModal);
    libManageSearch.addEventListener('input', (e) => {
      renderFullLibraryList(e.target.value);
    });

    btnCreateNewLibItem.addEventListener('click', () => {
      newLibItemFormBox.classList.toggle('hidden');
      if (!newLibItemFormBox.classList.contains('hidden')) {
        document.getElementById('newLibName').focus();
      }
    });

    btnCancelNewLibItem.addEventListener('click', () => {
      newLibItemFormBox.classList.add('hidden');
      formNewLibItem.reset();
    });

    formNewLibItem.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newLibName').value.trim();
      const serving = document.getElementById('newLibServing').value.trim();
      const calories = document.getElementById('newLibCalories').value;
      const protein = document.getElementById('newLibProtein').value || 0;
      const carbs = document.getElementById('newLibCarbs').value || 0;
      const fat = document.getElementById('newLibFat').value || 0;

      if (!name || !calories) return;

      appData.savedFoods.unshift({
        id: 'lib_' + Date.now(),
        name: name,
        serving: serving || '1 serving',
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat)
      });

      saveData();
      formNewLibItem.reset();
      newLibItemFormBox.classList.add('hidden');
      renderFullLibraryList(libManageSearch.value);
      showToast(`Saved "${name}" to library`);
    });

    // Trends Modal
    btnOpenTrends.addEventListener('click', openTrendsModal);

    // Settings Modal
    btnOpenSettings.addEventListener('click', openSettingsModal);
    btnEditMacros.addEventListener('click', openSettingsModal);

    [settingProteinGoal, settingCarbsGoal, settingFatGoal].forEach(input => {
      input.addEventListener('input', updateMacroTargetSplitPreview);
    });

    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      appData.settings.calorieGoal = Number(settingCalorieGoal.value) || 2000;
      appData.settings.proteinGoal = Number(settingProteinGoal.value) || 150;
      appData.settings.carbsGoal = Number(settingCarbsGoal.value) || 200;
      appData.settings.fatGoal = Number(settingFatGoal.value) || 65;
      appData.settings.waterGoal = Number(settingWaterGoal.value) || 2000;

      saveData();
      renderAll();
      closeAllModals();
      showToast('Nutritional targets updated!');
    });

    // Data Backup / Restore / Reset
    btnExportData.addEventListener('click', exportDataJSON);
    importFileInput.addEventListener('change', importDataJSON);

    btnClearToday.addEventListener('click', () => {
      if (confirm(`Are you sure you want to clear all logged food and water for ${selectedDate}?`)) {
        appData.days[selectedDate] = { water: 0, entries: [] };
        saveData();
        renderAll();
        closeAllModals();
        showToast("Today's log cleared");
      }
    });

    // Close modals on clicking outside or ESC key
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeAllModals();
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  // --- Bootstrap ---
  window.addEventListener('DOMContentLoaded', init);

})();
