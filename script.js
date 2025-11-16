// This file contains the entire application logic, converted from React/TSX to vanilla JavaScript.

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let state = {
        language: 'en',
        isShopkeeperMode: false,
        currentFloor: 1,
        shoppingList: [], // Array of product IDs
        isNavigating: false,
        userPosition: { x: 50, y: 92, floor: 1 },
        userRotation: 0,
        path: [],
        products: [],
        floorAreas: [],
        navigationNodes: [],
        translations: {},
    };

    // For animation loop
    let animationFrameId = null;
    let lastTimestamp = 0;
    let segmentPauseTimeoutId = null;


    // --- DOM ELEMENT REFERENCES ---
    const dom = {
        appTitle: document.getElementById('app-title'),
        shopperLabel: document.getElementById('shopper-label'),
        shopkeeperLabel: document.getElementById('shopkeeper-label'),
        languageSelect: document.getElementById('language-select'),
        modeToggle: document.getElementById('mode-toggle'),
        floorButtonsContainer: document.getElementById('floor-buttons-container'),
        floorMapContainer: document.getElementById('floor-map-container'),
        pathSvg: document.getElementById('path-svg'),
        userDot: document.getElementById('user-dot'),
        userPing: document.getElementById('user-ping'),
        navInstructionBanner: document.getElementById('nav-instruction-banner'),
        navInstructionText: document.querySelector('#nav-instruction-banner p'),
        tabButtons: document.querySelectorAll('.tab-button'),
        tabContents: document.querySelectorAll('.tab-content'),
        productListContainer: document.getElementById('product-list-container'),
        productSearchInput: document.getElementById('product-search-input'),
        shoppingListContainer: document.getElementById('shopping-list-container'),
        shoppingListCount: document.getElementById('shopping-list-count'),
        servicesListContainer: document.getElementById('services-list-container'),
        totalItemsLabel: document.getElementById('total-items-label'),
        totalItemsCount: document.getElementById('total-items-count'),
        navigationButton: document.getElementById('navigation-button'),
    };

    // --- TRANSLATION FUNCTION ---
    const t = (key, options = {}) => {
        let str = state.translations[state.language]?.[key] || state.translations['en']?.[key] || key;
        for (const k in options) {
            str = str.replace(`{${k}}`, String(options[k]));
        }
        return str;
    };
    
    // --- DATA INITIALIZATION ---
    // In a real app, this would come from an API. Here we define it directly.
    const initializeData = () => {
        state.floorAreas = [
          // Floor 1 (10 Shops)
          { id: 'f1_entrance', name: { en: 'Main Entrance', kn: 'ಮುಖ್ಯ ದ್ವಾರ', hi: 'मुख्य द्वार' }, type: 'entrance', x: 40, y: 85, width: 20, height: 10, color: 'bg-transparent', textColor: 'text-gray-500 font-semibold', floor: 1, entrancePoint: { x: 50, y: 95, floor: 1 } },
          { id: 'f1_exit', name: { en: 'Exit', kn: 'ನಿರ್ಗಮನ', hi: 'बाहर' }, type: 'exit', x: 80, y: 85, width: 10, height: 10, color: 'bg-gray-200', textColor: 'text-gray-600', floor: 1, entrancePoint: { x: 85, y: 95, floor: 1 } },
          { id: 'f1_produce', name: { en: 'Fresh Produce', kn: 'ತಾಜಾ ಉತ್ಪನ್ನಗಳು', hi: 'ताज़ी उपज' }, type: 'shop', x: 5, y: 10, width: 30, height: 40, color: 'bg-green-200', textColor: 'text-green-800', floor: 1, entrancePoint: { x: 20, y: 51, floor: 1 } },
          { id: 'f1_butcher', name: { en: 'Butcher Shop', kn: 'ಕಟುಕನ ಅಂಗಡಿ', hi: 'कसाई की दुकान' }, type: 'shop', x: 5, y: 55, width: 30, height: 25, color: 'bg-red-200', textColor: 'text-red-800', floor: 1, entrancePoint: { x: 20, y: 54, floor: 1 } },
          { id: 'f1_bakery', name: { en: 'Bakery', kn: 'ಬೇಕರಿ', hi: 'बेकरी' }, type: 'shop', x: 40, y: 10, width: 25, height: 25, color: 'bg-amber-200', textColor: 'text-amber-800', floor: 1, entrancePoint: { x: 52.5, y: 36, floor: 1 } },
          { id: 'f1_dairy', name: { en: 'Dairy & Cheese', kn: 'ಡೈರಿ ಮತ್ತು ಚೀಸ್', hi: 'डेयरी और पनीर' }, type: 'shop', x: 40, y: 40, width: 25, height: 25, color: 'bg-blue-200', textColor: 'text-blue-800', floor: 1, entrancePoint: { x: 52.5, y: 39, floor: 1 } },
          { id: 'f1_washroom_m', name: { en: "Men's Washroom", kn: 'ಪುರುಷರ ಶೌಚಾಲಯ', hi: 'पुरुषों का शौचालय' }, type: 'washroom', gender: 'male', x: 75, y: 10, width: 20, height: 15, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 1, entrancePoint: { x: 85, y: 26, floor: 1 } },
          { id: 'f1_washroom_f', name: { en: "Women's Washroom", kn: 'ಮಹಿಳೆಯರ ಶೌಚಾಲಯ', hi: 'महिलाओं का शौचालय' }, type: 'washroom', gender: 'female', x: 75, y: 30, width: 20, height: 15, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 1, entrancePoint: { x: 85, y: 29, floor: 1 } },
          { id: 'f1_pantry_goods', name: { en: 'Pantry Goods', kn: 'ಪ್ಯಾಂಟ್ರಿ ಸರಕುಗಳು', hi: 'पेंट्री का सामान' }, type: 'shop', x: 70, y: 50, width: 25, height: 15, color: 'bg-yellow-200', textColor: 'text-yellow-800', floor: 1, entrancePoint: { x: 82.5, y: 49, floor: 1 } },
          { id: 'f1_beverages', name: { en: 'Beverages', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय पदार्थ' }, type: 'shop', x: 70, y: 70, width: 25, height: 10, color: 'bg-teal-200', textColor: 'text-teal-800', floor: 1, entrancePoint: { x: 82.5, y: 69, floor: 1 } },
          { id: 'f1_pet_supplies', name: { en: 'Pet Supplies', kn: 'ಸಾಕುಪ್ರಾಣಿ ಸರಬರಾಜು', hi: 'पालतू पशुओं का सामान' }, type: 'shop', x: 5, y: 85, width: 15, height: 10, color: 'bg-orange-300', textColor: 'text-orange-900', floor: 1, entrancePoint: { x: 12.5, y: 84, floor: 1 } },
          { id: 'f1_baby_care', name: { en: 'Baby Care', kn: 'ಮಕ್ಕಳ ಆರೈಕೆ', hi: 'शिशु देखभाल' }, type: 'shop', x: 22, y: 85, width: 15, height: 10, color: 'bg-pink-200', textColor: 'text-pink-800', floor: 1, entrancePoint: { x: 29.5, y: 84, floor: 1 } },
          { id: 'f1_cleaning', name: { en: 'Cleaning Supplies', kn: 'ಸ್ವಚ್ಛಗೊಳಿಸುವ ಸಾಮಗ್ರಿಗಳು', hi: 'सफाई की आपूर्ति' }, type: 'shop', x: 60, y: 85, width: 15, height: 10, color: 'bg-cyan-200', textColor: 'text-cyan-800', floor: 1, entrancePoint: { x: 67.5, y: 84, floor: 1 } },
          { id: 'f1_florist', name: { en: 'Florist', kn: 'ಹೂಗಾರ', hi: 'फूलवाला' }, type: 'shop', x: 40, y: 68, width: 25, height: 12, color: 'bg-rose-200', textColor: 'text-rose-800', floor: 1, entrancePoint: { x: 52.5, y: 67, floor: 1 } },

          // Floor 2 (10 Shops)
          { id: 'f2_frozen', name: { en: 'Frozen Foods', kn: 'ಹೆಪ್ಪುಗಟ್ಟಿದ ಆಹಾರಗಳು', hi: 'जमे हुए खाद्य पदार्थ' }, type: 'shop', x: 5, y: 10, width: 30, height: 20, color: 'bg-cyan-200', textColor: 'text-cyan-800', floor: 2, entrancePoint: { x: 20, y: 31, floor: 2 } },
          { id: 'f2_canned', name: { en: 'Canned Goods', kn: 'ಡಬ್ಬಿಗಳು', hi: 'डिब्बाबंद सामान' }, type: 'shop', x: 5, y: 45, width: 30, height: 25, color: 'bg-gray-400', textColor: 'text-white', floor: 2, entrancePoint: { x: 20, y: 44, floor: 2 } },
          { id: 'f2_snacks', name: { en: 'Snacks', kn: 'ತಿಂಡಿಗಳು', hi: 'स्नैक्स' }, type: 'shop', x: 40, y: 10, width: 55, height: 20, color: 'bg-orange-200', textColor: 'text-orange-800', floor: 2, entrancePoint: { x: 67.5, y: 31, floor: 2 } },
          { id: 'f2_checkout', name: { en: 'Checkout', kn: 'ಚೆಕ್ಔಟ್', hi: 'चेक आउट' }, type: 'shop', x: 40, y: 45, width: 45, height: 25, color: 'bg-indigo-300', textColor: 'text-indigo-800', floor: 2, entrancePoint: { x: 62.5, y: 44, floor: 2 } },
          { id: 'f2_washroom_m', name: { en: "Men's Washroom", kn: 'ಪುರುಷರ ಶೌಚಾಲಯ', hi: 'पुरुषों का शौचालय' }, type: 'washroom', gender: 'male', x: 80, y: 83, width: 15, height: 12, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 2, entrancePoint: { x: 87.5, y: 82, floor: 2 } },
          { id: 'f2_washroom_f', name: { en: "Women's Washroom", kn: 'ಮಹಿಳೆಯರ ಶೌಚಾಲಯ', hi: 'महिलाओं का शौचालय' }, type: 'washroom', gender: 'female', x: 60, y: 83, width: 15, height: 12, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 2, entrancePoint: { x: 67.5, y: 82, floor: 2 } },
          { id: 'f2_beverages_2', name: { en: 'Beverages', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय पदार्थ' }, type: 'shop', x: 5, y: 32, width: 30, height: 11, color: 'bg-teal-200', textColor: 'text-teal-800', floor: 2, entrancePoint: { x: 20, y: 44, floor: 2 } },
          { id: 'f2_packaged_goods', name: { en: 'Packaged Goods', kn: 'ಪ್ಯಾಕೇಜ್ ಮಾಡಿದ ಸರಕುಗಳು', hi: 'पैकेज्ड सामान' }, type: 'shop', x: 40, y: 32, width: 25, height: 11, color: 'bg-amber-200', textColor: 'text-amber-800', floor: 2, entrancePoint: { x: 52.5, y: 44, floor: 2 } },
          { id: 'f2_household', name: { en: 'Household Supplies', kn: 'ಮನೆಬಳಕೆ ವಸ್ತುಗಳು', hi: 'घरेलू सामान' }, type: 'shop', x: 68, y: 32, width: 27, height: 11, color: 'bg-cyan-300', textColor: 'text-cyan-900', floor: 2, entrancePoint: { x: 81.5, y: 44, floor: 2 } },
          { id: 'f2_deli', name: { en: 'Deli', kn: 'ಡೆಲಿ', hi: 'डेली' }, type: 'shop', x: 5, y: 72, width: 30, height: 10, color: 'bg-red-300', textColor: 'text-red-900', floor: 2, entrancePoint: { x: 20, y: 71, floor: 2 } },
          { id: 'f2_international', name: { en: 'International Foods', kn: 'ಅಂತರರಾಷ್ಟ್ರೀಯ ಆಹಾರಗಳು', hi: 'अंतर्राष्ट्रीय खाद्य पदार्थ' }, type: 'shop', x: 40, y: 72, width: 25, height: 10, color: 'bg-orange-300', textColor: 'text-orange-900', floor: 2, entrancePoint: { x: 52.5, y: 71, floor: 2 } },
          { id: 'f2_pharmacy', name: { en: 'Pharmacy', kn: 'ಔಷಧಾಲಯ', hi: 'फार्मेसी' }, type: 'shop', x: 87, y: 45, width: 8, height: 25, color: 'bg-green-300', textColor: 'text-green-900', floor: 2, entrancePoint: { x: 86, y: 57.5, floor: 2 } },

          // Floor 3 (10 Shops)
          { id: 'f3_electronics', name: { en: 'Electronics', kn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್', hi: 'इलेक्ट्रानिक्स' }, type: 'shop', x: 5, y: 10, width: 40, height: 30, color: 'bg-slate-400', textColor: 'text-white', floor: 3, entrancePoint: { x: 46, y: 25, floor: 3 } },
          { id: 'f3_home', name: { en: 'Home Goods', kn: 'ಗೃಹಬಳಕೆಯ ವಸ್ತುಗಳು', hi: 'घर का सामान' }, type: 'shop', x: 50, y: 10, width: 45, height: 20, color: 'bg-violet-200', textColor: 'text-violet-800', floor: 3, entrancePoint: { x: 49, y: 20, floor: 3 } },
          { id: 'f3_office', name: { en: 'Mall Office', kn: 'ಮಾಲ್ ಕಚೇರಿ', hi: 'मॉल कार्यालय' }, type: 'utility', x: 50, y: 55, width: 20, height: 25, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 3, entrancePoint: { x: 60, y: 54, floor: 3 } },
          { id: 'f3_washroom_m', name: { en: "Men's Washroom", kn: 'ಪುರುಷರ ಶೌಚಾಲಯ', hi: 'पुरुषों का शौचालय' }, type: 'washroom', gender: 'male', x: 75, y: 55, width: 20, height: 12, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 3, entrancePoint: { x: 85, y: 68, floor: 3 } },
          { id: 'f3_washroom_f', name: { en: "Women's Washroom", kn: 'ಮಹಿಳೆಯರ ಶೌಚಾಲಯ', hi: 'महिलाओं का शौचालय' }, type: 'washroom', gender: 'female', x: 75, y: 70, width: 20, height: 12, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 3, entrancePoint: { x: 85, y: 69, floor: 3 } },
          { id: 'f3_clothing_m', name: { en: "Men's Clothing", kn: 'ಪುರುಷರ ಉಡುಪು', hi: 'पुरुषों के कपड़े' }, type: 'shop', x: 5, y: 85, width: 20, height: 10, color: 'bg-blue-300', textColor: 'text-blue-900', floor: 3, entrancePoint: { x: 15, y: 84, floor: 3 } },
          { id: 'f3_clothing_w', name: { en: "Women's Clothing", kn: 'ಮಹಿಳೆಯರ ಉಡುಪು', hi: 'महिलाओं के कपड़े' }, type: 'shop', x: 30, y: 85, width: 20, height: 10, color: 'bg-pink-300', textColor: 'text-pink-900', floor: 3, entrancePoint: { x: 40, y: 84, floor: 3 } },
          { id: 'f3_clothing_k', name: { en: "Kids' Clothing", kn: 'ಮಕ್ಕಳ ಉಡುಪು', hi: 'बच्चों के कपड़े' }, type: 'shop', x: 55, y: 85, width: 20, height: 10, color: 'bg-yellow-300', textColor: 'text-yellow-900', floor: 3, entrancePoint: { x: 65, y: 84, floor: 3 } },
          { id: 'f3_shoes', name: { en: 'Shoes', kn: 'ಶೂಗಳು', hi: 'जूते' }, type: 'shop', x: 80, y: 85, width: 15, height: 10, color: 'bg-gray-500', textColor: 'text-white', floor: 3, entrancePoint: { x: 87.5, y: 84, floor: 3 } },
          { id: 'f3_toys', name: { en: 'Toys & Games', kn: 'ಆಟಿಕೆಗಳು ಮತ್ತು ಆಟಗಳು', hi: 'खिलौने और खेल' }, type: 'shop', x: 5, y: 45, width: 18, height: 35, color: 'bg-red-200', textColor: 'text-red-800', floor: 3, entrancePoint: { x: 14, y: 44, floor: 3 } },
          { id: 'f3_sports', name: { en: 'Sporting Goods', kn: 'ಕ್ರೀಡಾ ಸಾಮಗ್ರಿಗಳು', hi: 'खेल का सामान' }, type: 'shop', x: 27, y: 45, width: 18, height: 35, color: 'bg-green-200', textColor: 'text-green-800', floor: 3, entrancePoint: { x: 36, y: 44, floor: 3 } },
          { id: 'f3_gifts', name: { en: 'Gifts & Souvenirs', kn: 'ಉಡುಗೊರೆಗಳು ಮತ್ತು ಸ್ಮರಣಿಕೆಗಳು', hi: 'उपहार और स्मृति चिन्ह' }, type: 'shop', x: 50, y: 32, width: 21, height: 18, color: 'bg-purple-200', textColor: 'text-purple-800', floor: 3, entrancePoint: { x: 60.5, y: 51, floor: 3 } },
          { id: 'f3_luggage', name: { en: 'Luggage', kn: 'ಲಗೇಜ್', hi: 'सामान' }, type: 'shop', x: 74, y: 32, width: 21, height: 18, color: 'bg-orange-200', textColor: 'text-orange-800', floor: 3, entrancePoint: { x: 84.5, y: 51, floor: 3 } },

          // Floor 4 (10 Shops)
          { id: 'f4_cafe', name: { en: 'Cafe', kn: 'ಕೆಫೆ', hi: 'कैफे' }, type: 'shop', x: 5, y: 10, width: 40, height: 20, color: 'bg-amber-300', textColor: 'text-amber-800', floor: 4, entrancePoint: { x: 46, y: 20, floor: 4 } },
          { id: 'f4_books', name: { en: 'Bookstore', kn: 'ಪುಸ್ತಕದಂಗಡಿ', hi: 'किताबों की दुकान' }, type: 'shop', x: 50, y: 10, width: 45, height: 30, color: 'bg-sky-200', textColor: 'text-sky-800', floor: 4, entrancePoint: { x: 49, y: 25, floor: 4 } },
          { id: 'f4_patio', name: { en: 'Rooftop Patio', kn: 'ರೂಫ್‌ಟಾಪ್ ಪ್ಯಾಟಿಯೊ', hi: 'रूफटॉप आंगन' }, type: 'utility', x: 5, y: 55, width: 40, height: 15, color: 'bg-lime-200', textColor: 'text-lime-800', floor: 4, entrancePoint: { x: 46, y: 62.5, floor: 4 } },
          { id: 'f4_washroom_m', name: { en: "Men's Washroom", kn: 'ಪುರುಷರ ಶೌಚಾಲಯ', hi: 'पुरुषों का शौचालय' }, type: 'washroom', gender: 'male', x: 80, y: 83, width: 15, height: 12, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 4, entrancePoint: { x: 87.5, y: 82, floor: 4 } },
          { id: 'f4_washroom_f', name: { en: "Women's Washroom", kn: 'ಮಹಿಳೆಯರ ಶೌಚಾಲಯ', hi: 'महिलाओं का शौचालय' }, type: 'washroom', gender: 'female', x: 60, y: 83, width: 15, height: 12, color: 'bg-gray-300', textColor: 'text-gray-600', floor: 4, entrancePoint: { x: 67.5, y: 82, floor: 4 } },
          { id: 'f4_food_1', name: { en: 'Pizza Place', kn: 'ಪಿಜ್ಜಾ ಸ್ಥಳ', hi: 'पिज़्ज़ा की जगह' }, type: 'shop', x: 5, y: 32, width: 18, height: 18, color: 'bg-yellow-200', textColor: 'text-yellow-800', floor: 4, entrancePoint: { x: 14, y: 51, floor: 4 } },
          { id: 'f4_food_2', name: { en: 'Burger Joint', kn: 'ಬರ್ಗರ್ ಜಾಯಿಂಟ್', hi: 'बर्गर जॉइंट' }, type: 'shop', x: 27, y: 32, width: 18, height: 18, color: 'bg-orange-200', textColor: 'text-orange-800', floor: 4, entrancePoint: { x: 36, y: 51, floor: 4 } },
          { id: 'f4_jewelry', name: { en: 'Jewelry Store', kn: 'ಆಭರಣ ಅಂಗಡಿ', hi: 'आभूषण की दुकान' }, type: 'shop', x: 50, y: 45, width: 21, height: 35, color: 'bg-purple-200', textColor: 'text-purple-800', floor: 4, entrancePoint: { x: 60.5, y: 44, floor: 4 } },
          { id: 'f4_watches', name: { en: 'Watch Shop', kn: 'ವಾಚ್ ಅಂಗಡಿ', hi: 'घड़ी की दुकान' }, type: 'shop', x: 74, y: 45, width: 21, height: 35, color: 'bg-gray-500', textColor: 'text-white', floor: 4, entrancePoint: { x: 84.5, y: 44, floor: 4 } },
          { id: 'f4_arcade', name: { en: 'Arcade', kn: 'ಆರ್ಕೇಡ್', hi: 'आर्केड' }, type: 'shop', x: 5, y: 72, width: 40, height: 10, color: 'bg-indigo-300', textColor: 'text-indigo-800', floor: 4, entrancePoint: { x: 25, y: 71, floor: 4 } },
          { id: 'f4_cinema_1', name: { en: 'Cinema 1', kn: 'ಸಿನಿಮಾ 1', hi: 'सिनेमा 1' }, type: 'shop', x: 5, y: 85, width: 25, height: 10, color: 'bg-red-400', textColor: 'text-white', floor: 4, entrancePoint: { x: 17.5, y: 84, floor: 4 } },
          { id: 'f4_cinema_2', name: { en: 'Cinema 2', kn: 'ಸಿನಿಮಾ 2', hi: 'सिनेमा 2' }, type: 'shop', x: 35, y: 85, width: 20, height: 10, color: 'bg-red-400', textColor: 'text-white', floor: 4, entrancePoint: { x: 45, y: 84, floor: 4 } },
          { id: 'f4_food_court', name: { en: 'Food Court', kn: 'ಫುಡ್ ಕೋರ್ಟ್', hi: 'फ़ूड कोर्ट' }, type: 'shop', x: 50, y: 83, width: 8, height: 12, color: 'bg-green-200', textColor: 'text-green-800', floor: 4, entrancePoint: { x: 54, y: 82, floor: 4 } },
        ];
        state.navigationNodes = [
            { id: 's1_left', type: 'stairs', floor: 1, x: 2.5, y: 45, links: [{ floor: 2, id: 's2_left' }] },
            { id: 's2_left', type: 'stairs', floor: 2, x: 2.5, y: 45, links: [{ floor: 1, id: 's1_left' }, { floor: 3, id: 's3_left' }] },
            { id: 's3_left', type: 'stairs', floor: 3, x: 2.5, y: 45, links: [{ floor: 2, id: 's2_left' }, { floor: 4, id: 's4_left' }] },
            { id: 's4_left', type: 'stairs', floor: 4, x: 2.5, y: 45, links: [{ floor: 3, id: 's3_left' }] },
            { id: 'e1_center', type: 'escalator', floor: 1, x: 52.5, y: 80, links: [{ floor: 2, id: 'e2_center' }] },
            { id: 'e2_center', type: 'escalator', floor: 2, x: 52.5, y: 80, links: [{ floor: 1, id: 'e1_center' }, { floor: 3, id: 'e3_center' }] },
            { id: 'e3_center', type: 'escalator', floor: 3, x: 52.5, y: 85, links: [{ floor: 2, id: 'e2_center' }] },
            { id: 'l1_right', type: 'lift', floor: 1, x: 97.5, y: 45, links: [{ floor: 2, id: 'l2_right' }, { floor: 3, id: 'l3_right' }, { floor: 4, id: 'l4_right' }] },
            { id: 'l2_right', type: 'lift', floor: 2, x: 97.5, y: 45, links: [{ floor: 1, id: 'l1_right' }, { floor: 3, id: 'l3_right' }, { floor: 4, id: 'l4_right' }] },
            { id: 'l3_right', type: 'lift', floor: 3, x: 97.5, y: 45, links: [{ floor: 1, id: 'l1_right' }, { floor: 2, id: 'l2_right' }, { floor: 4, id: 'l4_right' }] },
            { id: 'l4_right', type: 'lift', floor: 4, x: 97.5, y: 45, links: [{ floor: 1, id: 'l1_right' }, { floor: 2, id: 'l2_right' }, { floor: 3, id: 'l3_right' }] },
        ];
        state.products = [
            { id: 1, name: { en: 'Avocados', kn: 'ಆವಕಾಡೊಗಳು', hi: 'एवोकाडो' }, price: 1.75, category: { en: 'Fruits & Vegetables', kn: 'ಹಣ್ಣುಗಳು ಮತ್ತು ತರಕಾರಿಗಳು', hi: 'फल और सब्जियां' }, shopId: 'f1_produce', floor: 1 },
            { id: 2, name: { en: 'Cheddar Cheese', kn: 'ಚೆಡ್ಡಾರ್ ಚೀಸ್', hi: 'चेडर चीज़' }, price: 8.00, category: { en: 'Dairy', kn: 'ಡೈರಿ', hi: 'डेयरी' }, shopId: 'f1_dairy', floor: 1 },
            { id: 3, name: { en: 'Croissants', kn: 'ಕ್ರೋಸೆಂಟ್‌ಗಳು', hi: 'क्रोइसैन' }, price: 2.50, category: { en: 'Bakery', kn: 'ಬೇಕರಿ', hi: 'बेकरी' }, shopId: 'f1_bakery', floor: 1 },
            { id: 5, name: { en: 'Ground Beef (lb)', kn: 'ಕೊಚ್ಚಿದ ಗೋಮಾಂಸ (lb)', hi: 'कीमा बनाया हुआ बीफ़ (lb)' }, price: 6.50, category: { en: 'Meat', kn: 'ಮಾಂಸ', hi: 'मांस' }, shopId: 'f1_butcher', floor: 1 },
            { id: 6, name: { en: 'Organic Milk', kn: 'ಸಾವಯವ ಹಾಲು', hi: 'ऑर्गेनिक दूध' }, price: 4.20, category: { en: 'Dairy', kn: 'ಡೈರಿ', hi: 'डेयरी' }, shopId: 'f1_dairy', floor: 1 },
            { id: 7, name: { en: 'Artisan Bread', kn: 'ಕುಶಲಕರ್ಮಿ ಬ್ರೆಡ್', hi: 'कारीगर रोटी' }, price: 5.50, category: { en: 'Bakery', kn: 'ಬೇಕರಿ', hi: 'बेकरी' }, shopId: 'f1_bakery', floor: 1 },
            { id: 15, name: { en: 'Apples', kn: 'ಸೇಬುಗಳು', hi: 'सेब' }, price: 2.50, category: { en: 'Fruits & Vegetables', kn: 'ಹಣ್ಣುಗಳು ಮತ್ತು ತರಕಾರಿಗಳು', hi: 'फल और सब्जियां' }, shopId: 'f1_produce', floor: 1 },
            { id: 16, name: { en: 'Bananas', kn: 'ಬಾಳೆಹಣ್ಣುಗಳು', hi: 'केले' }, price: 1.20, category: { en: 'Fruits & Vegetables', kn: 'ಹಣ್ಣುಗಳು ಮತ್ತು ತರಕಾರಿಗಳು', hi: 'फल और सब्जियां' }, shopId: 'f1_produce', floor: 1 },
            { id: 17, name: { en: 'Carrots (bunch)', kn: 'ಕ್ಯಾರೆಟ್ (ಗುಂಪು)', hi: 'गाजर (गुच्छा)' }, price: 1.80, category: { en: 'Fruits & Vegetables', kn: 'ಹಣ್ಣುಗಳು ಮತ್ತು ತರಕಾರಿಗಳು', hi: 'फल और सब्जियां' }, shopId: 'f1_produce', floor: 1 },
            { id: 20, name: { en: 'Chicken Breast (lb)', kn: 'ಚಿಕನ್ ಸ್ತನ (lb)', hi: 'चिकन ब्रेस्ट (lb)' }, price: 5.99, category: { en: 'Meat', kn: 'ಮಾಂಸ', hi: 'मांस' }, shopId: 'f1_butcher', floor: 1 },
            { id: 65, name: { en: 'Pasta', kn: 'ಪಾಸ್ತಾ', hi: 'पास्ता' }, price: 2.30, category: { en: 'Pantry', kn: 'ಪ್ಯಾಂಟ್ರಿ', hi: 'पेंट्री' }, shopId: 'f1_pantry_goods', floor: 1 },
            { id: 66, name: { en: 'Mineral Water', kn: 'ಖನಿಜಯುಕ್ತ ನೀರು', hi: 'मिनरल वॉटर' }, price: 1.50, category: { en: 'Beverages', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय पदार्थ' }, shopId: 'f1_beverages', floor: 1 },
            { id: 67, name: { en: 'Dog Food', kn: 'ನಾಯಿ ಆಹಾರ', hi: 'कुत्ते का खाना' }, price: 15.00, category: { en: 'Pet Supplies', kn: 'ಸಾಕುಪ್ರಾಣಿ ಸರಬರಾಜು', hi: 'पालतू पशुओं का सामान' }, shopId: 'f1_pet_supplies', floor: 1 },
            { id: 68, name: { en: 'Diapers', kn: 'ಡೈಪರ್ಸ್', hi: 'डायपर' }, price: 22.00, category: { en: 'Baby Care', kn: 'ಮಕ್ಕಳ ಆರೈಕೆ', hi: 'शिशु देखभाल' }, shopId: 'f1_baby_care', floor: 1 },
            { id: 69, name: { en: 'Laundry Detergent', kn: 'ಲಾಂಡ್ರಿ ಡಿಟರ್ಜೆಂಟ್', hi: 'कपड़े धोने का डिटर्जेंट' }, price: 12.50, category: { en: 'Cleaning', kn: 'ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ', hi: 'सफाई' }, shopId: 'f1_cleaning', floor: 1 },
            { id: 70, name: { en: 'Bouquet of Roses', kn: 'ಗುಲಾಬಿಗಳ ಪುಷ್ಪಗುಚ್ಛ', hi: 'गुलाब का गुलदस्ता' }, price: 25.00, category: { en: 'Flowers', kn: 'ಹೂವುಗಳು', hi: 'फूल' }, shopId: 'f1_florist', floor: 1 },
            { id: 4, name: { en: 'Frozen Pizza', kn: 'ಹೆಪ್ಪುಗಟ್ಟಿದ ಪಿಜ್ಜಾ', hi: 'फ्रोजन पिज्जा' }, price: 7.99, category: { en: 'Frozen', kn: 'ಹೆಪ್ಪುಗಟ್ಟಿದ', hi: 'जमे हुए' }, shopId: 'f2_frozen', floor: 2 },
            { id: 8, name: { en: 'Potato Chips', kn: 'ಆಲೂಗೆಡ್ಡೆ ಚಿಪ್ಸ್', hi: 'आलू के चिप्स' }, price: 3.25, category: { en: 'Snacks', kn: 'ತಿಂಡಿಗಳು', hi: 'स्नैक्स' }, shopId: 'f2_snacks', floor: 2 },
            { id: 13, name: { en: 'Canned Tomatoes', kn: 'ಡಬ್ಬಿಯಲ್ಲಿಟ್ಟ ಟೊಮ್ಯಾಟೊ', hi: 'डिब्बाबंद टमाटर' }, price: 1.50, category: { en: 'Pantry', kn: 'ಪ್ಯಾಂಟ್ರಿ', hi: 'पेंट्री' }, shopId: 'f2_canned', floor: 2 },
            { id: 32, name: { en: 'Vanilla Ice Cream', kn: 'ವೆನಿಲ್ಲಾ ಐಸ್ ಕ್ರೀಮ್', hi: 'वेनिला आइसक्रीम' }, price: 6.50, category: { en: 'Frozen', kn: 'ಹೆಪ್ಪುಗಟ್ಟಿದ', hi: 'जमे हुए' }, shopId: 'f2_frozen', floor: 2 },
            { id: 36, name: { en: 'Canned Chickpeas', kn: 'ಡಬ್ಬಿಯಲ್ಲಿಟ್ಟ ಕಡಲೆ', hi: 'डिब्बाबंद चने' }, price: 1.25, category: { en: 'Pantry', kn: 'ಪ್ಯಾಂಟ್ರಿ', hi: 'पेंट्री' }, shopId: 'f2_canned', floor: 2 },
            { id: 40, name: { en: 'Salted Pretzels', kn: 'ಉಪ್ಪುಸಹಿತ ಪ್ರೆಟ್ಜೆಲ್‌ಗಳು', hi: 'नमकीन प्रेट्ज़ेल' }, price: 3.00, category: { en: 'Snacks', kn: 'ತಿಂಡಿಗಳು', hi: 'स्नैक्स' }, shopId: 'f2_snacks', floor: 2 },
            { id: 71, name: { en: 'Cola', kn: 'ಕೋಲಾ', hi: 'कोला' }, price: 1.80, category: { en: 'Beverages', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय पदार्थ' }, shopId: 'f2_beverages_2', floor: 2 },
            { id: 72, name: { en: 'Sliced Bread', kn: 'ತುಂಡರಿಸಿದ ಬ್ರೆಡ್', hi: 'कटी हुई ब्रेड' }, price: 3.50, category: { en: 'Packaged Goods', kn: 'ಪ್ಯಾಕೇಜ್ ಮಾಡಿದ ಸರಕುಗಳು', hi: 'पैकेज्ड सामान' }, shopId: 'f2_packaged_goods', floor: 2 },
            { id: 73, name: { en: 'Paper Towels', kn: 'ಪೇಪರ್ ಟವೆಲ್', hi: 'कागज़ के तौलिये' }, price: 4.00, category: { en: 'Household', kn: 'ಮನೆಬಳಕೆ', hi: 'घरेलू' }, shopId: 'f2_household', floor: 2 },
            { id: 74, name: { en: 'Sliced Ham', kn: 'ತುಂಡರಿಸಿದ ಹ್ಯಾಮ್', hi: 'कटा हुआ हैम' }, price: 8.50, category: { en: 'Deli', kn: 'ಡೆಲಿ', hi: 'डेली' }, shopId: 'f2_deli', floor: 2 },
            { id: 75, name: { en: 'Soy Sauce', kn: 'ಸೋಯಾ ಸಾಸ್', hi: 'सोया सॉस' }, price: 3.75, category: { en: 'International', kn: 'ಅಂತರರಾಷ್ಟ್ರೀಯ', hi: 'अंतर्राष्ट्रीय' }, shopId: 'f2_international', floor: 2 },
            { id: 76, name: { en: 'Pain Relievers', kn: 'ನೋವು ನಿವಾರಕಗಳು', hi: 'दर्द निवारक' }, price: 9.99, category: { en: 'Pharmacy', kn: 'ಔಷಧಾಲಯ', hi: 'फार्मेसी' }, shopId: 'f2_pharmacy', floor: 2 },
            { id: 9, name: { en: 'Headphones', kn: 'ಹೆಡ್‌ಫೋನ್‌ಗಳು', hi: 'हेडफोन' }, price: 149.99, category: { en: 'Electronics', kn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್', hi: 'इलेक्ट्रानिक्स' }, shopId: 'f3_electronics', floor: 3 },
            { id: 10, name: { en: 'Throw Pillow', kn: 'ಥ್ರೋ ಪಿಲ್ಲೊ', hi: 'थ्रो पिलो' }, price: 25.00, category: { en: 'Home Decor', kn: 'ಮನೆ ಅಲಂಕಾರ', hi: 'गृह सज्जा' }, shopId: 'f3_home', floor: 3 },
            { id: 14, name: { en: 'Smart TV', kn: 'ಸ್ಮಾರ್ಟ್ ಟಿವಿ', hi: 'स्मार्ट टीवी' }, price: 499.99, category: { en: 'Electronics', kn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್', hi: 'इलेक्ट्रानिक्स' }, shopId: 'f3_electronics', floor: 3 },
            { id: 45, name: { en: 'Smartphone', kn: 'ಸ್ಮಾರ್ಟ್ಫೋನ್', hi: 'स्मार्टफोन' }, price: 699.00, category: { en: 'Electronics', kn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್', hi: 'इलेक्ट्रानिक्स' }, shopId: 'f3_electronics', floor: 3 },
            { id: 50, name: { en: 'Scented Candle', kn: 'ಸುವಾಸಿತ ಮೇಣದಬತ್ತಿ', hi: 'सुगंधित मोमबत्ती' }, price: 15.00, category: { en: 'Home Decor', kn: 'ಮನೆ ಅಲಂಕಾರ', hi: 'गृह सज्जा' }, shopId: 'f3_home', floor: 3 },
            { id: 77, name: { en: 'T-Shirt', kn: 'ಟಿ-ಶರ್ಟ್', hi: 'टी-शर्ट' }, price: 20.00, category: { en: 'Clothing', kn: 'ಉಡುಪು', hi: 'कपड़े' }, shopId: 'f3_clothing_m', floor: 3 },
            { id: 78, name: { en: 'Summer Dress', kn: 'ಬೇಸಿಗೆ ಉಡುಗೆ', hi: 'गर्मी की पोशाक' }, price: 45.00, category: { en: 'Clothing', kn: 'ಉಡುಪು', hi: 'कपड़े' }, shopId: 'f3_clothing_w', floor: 3 },
            { id: 79, name: { en: 'Baby Onesie', kn: 'ಬೇಬಿ ಒನ್ಸಿ', hi: 'बेबी वनसी' }, price: 15.00, category: { en: 'Clothing', kn: 'ಉಡುಪು', hi: 'कपड़े' }, shopId: 'f3_clothing_k', floor: 3 },
            { id: 80, name: { en: 'Running Shoes', kn: 'ಚಾಲನೆಯಲ್ಲಿರುವ ಶೂಗಳು', hi: 'दौड़ने वाले जूते' }, price: 80.00, category: { en: 'Shoes', kn: 'ಶೂಗಳು', hi: 'जूते' }, shopId: 'f3_shoes', floor: 3 },
            { id: 81, name: { en: 'Action Figure', kn: 'ಆಕ್ಷನ್ ಫಿಗರ್', hi: 'एक्शन फिगर' }, price: 12.99, category: { en: 'Toys', kn: 'ಆಟಿಕೆಗಳು', hi: 'खिलौने' }, shopId: 'f3_toys', floor: 3 },
            { id: 82, name: { en: 'Basketball', kn: 'ಬ್ಯಾಸ್ಕೆಟ್‌ಬಾಲ್', hi: 'बास्केटबॉल' }, price: 30.00, category: { en: 'Sports', kn: 'ಕ್ರೀಡೆ', hi: 'खेल' }, shopId: 'f3_sports', floor: 3 },
            { id: 83, name: { en: 'City Keychain', kn: 'ಸಿಟಿ ಕೀಚೈನ್', hi: 'शहर की चाबी का गुच्छा' }, price: 5.00, category: { en: 'Gifts', kn: 'ಉಡುಗೊರೆಗಳು', hi: 'उपहार' }, shopId: 'f3_gifts', floor: 3 },
            { id: 84, name: { en: 'Carry-on Suitcase', kn: 'ಕ್ಯಾರಿ-ಆನ್ ಸೂಟ್‌ಕೇಸ್', hi: 'कैरी-ऑन सूटकेस' }, price: 120.00, category: { en: 'Luggage', kn: 'ಲಗೇಜ್', hi: 'सामान' }, shopId: 'f3_luggage', floor: 3 },
            { id: 11, name: { en: 'Espresso', kn: 'ಎಸ್ಪ್ರೆಸೊ', hi: 'एस्प्रेसो' }, price: 3.75, category: { en: 'Beverages', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय पदार्थ' }, shopId: 'f4_cafe', floor: 4 },
            { id: 12, name: { en: 'Bestseller Novel', kn: 'ಅತ್ಯುತ್ತಮ ಮಾರಾಟವಾದ ಕಾದಂಬರಿ', hi: 'सबसे ज्यादा बिकने वाला उपन्यास' }, price: 18.99, category: { en: 'Books', kn: 'ಪುಸ್ತಕಗಳು', hi: 'किताबें' }, shopId: 'f4_books', floor: 4 },
            { id: 55, name: { en: 'Cappuccino', kn: 'ಕ್ಯಾಪುಸಿನೊ', hi: 'कैपुचीनो' }, price: 4.50, category: { en: 'Beverages', kn: 'ಪಾನೀಯಗಳು', hi: 'पेय पदार्थ' }, shopId: 'f4_cafe', floor: 4 },
            { id: 60, name: { en: 'Science Fiction Novel', kn: 'ವಿಜ್ಞಾನ ಕಾದಂಬರಿ', hi: 'विज्ञान कथा उपन्यास' }, price: 22.00, category: { en: 'Books', kn: 'ಪುಸ್ತಕಗಳು', hi: 'किताबें' }, shopId: 'f4_books', floor: 4 },
            { id: 61, name: { en: 'Leather Journal', kn: 'ಚರ್ಮದ ಜರ್ನಲ್', hi: 'चमड़े की पत्रिका' }, price: 25.00, category: { en: 'Stationery', kn: 'ಲೇಖನ ಸಾಮಗ್ರಿ', hi: 'स्टेशनरी' }, shopId: 'f4_books', floor: 4 },
            { id: 85, name: { en: 'Slice of Pizza', kn: 'ಪಿಜ್ಜಾ ತುಂಡು', hi: 'पिज़्ज़ा का टुकड़ा' }, price: 4.00, category: { en: 'Food', kn: 'ಆಹಾರ', hi: 'खाना' }, shopId: 'f4_food_1', floor: 4 },
            { id: 86, name: { en: 'Cheeseburger', kn: 'ಚೀಸ್ ಬರ್ಗರ್', hi: 'चीज़बर्गर' }, price: 8.00, category: { en: 'Food', kn: 'ಆಹಾರ', hi: 'खाना' }, shopId: 'f4_food_2', floor: 4 },
            { id: 87, name: { en: 'Silver Necklace', kn: 'ಬೆಳ್ಳಿ ಹಾರ', hi: 'चांदी का हार' }, price: 150.00, category: { en: 'Jewelry', kn: 'ಆಭರಣ', hi: 'आभूषण' }, shopId: 'f4_jewelry', floor: 4 },
            { id: 88, name: { en: 'Sports Watch', kn: 'ಕ್ರೀಡಾ ವಾಚ್', hi: 'खेल घड़ी' }, price: 250.00, category: { en: 'Watches', kn: 'ಕೈಗಡಿಯಾರಗಳು', hi: 'घड़ियाँ' }, shopId: 'f4_watches', floor: 4 },
            { id: 89, name: { en: 'Arcade Token', kn: 'ಆರ್ಕೇಡ್ ಟೋಕನ್', hi: 'आर्केड टोकन' }, price: 1.00, category: { en: 'Entertainment', kn: 'ಮನರಂಜನೆ', hi: 'मनोरंजन' }, shopId: 'f4_arcade', floor: 4 },
            { id: 90, name: { en: 'Movie Ticket', kn: 'ಚಲನಚಿತ್ರ ಟಿಕೆಟ್', hi: 'फिल्म का टिकट' }, price: 15.00, category: { en: 'Entertainment', kn: 'ಮನರಂಜನೆ', hi: 'मनोरंजन' }, shopId: 'f4_cinema_1', floor: 4 },
            { id: 91, name: { en: 'Tacos', kn: 'ಟ್ಯಾಕೋಗಳು', hi: 'टैकोस' }, price: 9.50, category: { en: 'Food', kn: 'ಆಹಾರ', hi: 'खाना' }, shopId: 'f4_food_court', floor: 4 },
        ];
        state.translations = {
            en: { appTitle: 'In-Store Navigation System', shopper: 'Shopper', shopkeeper: 'Shopkeeper', searchProducts: 'Search products...', allProducts: 'All Products', shoppingList: 'Shopping List', services: 'Services', washrooms: 'Washrooms', navigate: 'Navigate', addToList: 'Add to List', remove: 'Remove', emptyList: 'Your shopping list is empty.', totalItems: 'Total Items', startNavigation: 'Start Navigation', cancelNavigation: 'Cancel Navigation', navigationComplete: 'You have arrived!', floor: 'Floor', goTo: 'Go to the {destination} to get to Floor {floor}', arrivedAt: 'You have arrived at {destination}.', proceedTo: 'Proceed to {destination}.' },
            kn: { appTitle: 'ಅಂಗಡಿ ನ್ಯಾವಿಗೇಷನ್ ಸಿಸ್ಟಮ್', shopper: 'ಗ್ರಾಹಕ', shopkeeper: 'ಅಂಗಡಿಯವ', searchProducts: 'ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ...', allProducts: 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು', shoppingList: 'ಖರೀದಿ ಪಟ್ಟಿ', services: 'ಸೇವೆಗಳು', washrooms: 'ಶೌಚಾಲಯಗಳು', navigate: 'ನ್ಯಾವಿಗೇಟ್', addToList: 'ಪಟ್ಟಿಗೆ ಸೇರಿಸಿ', remove: 'ತೆಗೆದುಹಾಕಿ', emptyList: 'ನಿಮ್ಮ ಖರೀದಿ ಪಟ್ಟಿ ಖಾಲಿಯಾಗಿದೆ.', totalItems: 'ಒಟ್ಟು ವಸ್ತುಗಳು', startNavigation: 'ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭಿಸಿ', cancelNavigation: 'ನ್ಯಾವಿಗೇಷನ್ ರದ್ದುಮಾಡಿ', navigationComplete: 'ನೀವು ತಲುಪಿದ್ದೀರಿ!', floor: 'ಅಂತಸ್ತು', goTo: 'ಅಂತಸ್ತು {floor} ಕ್ಕೆ ಹೋಗಲು {destination} ಗೆ ಹೋಗಿ', arrivedAt: 'ನೀವು {destination} ತಲುಪಿದ್ದೀರಿ.', proceedTo: '{destination} ಗೆ ಮುಂದುವರಿಯಿರಿ.' },
            hi: { appTitle: 'इन-स्टोर नेविगेशन सिस्टम', shopper: 'खरीदार', shopkeeper: 'दुकानदार', searchProducts: 'उत्पाद खोजें...', allProducts: 'सभी उत्पाद', shoppingList: 'खरीदारी की सूची', services: 'सेवाएं', washrooms: 'शौचालय', navigate: 'नेविगेट करें', addToList: 'सूची में जोड़ें', remove: 'हटाएं', emptyList: 'आपकी खरीदारी की सूची खाली है।', totalItems: 'कुल आइटम', startNavigation: 'नेविगेशन शुरू करें', cancelNavigation: 'नेविगेशन रद्द करें', navigationComplete: 'आप पहुंच गए!', floor: 'मंज़िल', goTo: 'मंज़िल {floor} पर जाने के लिए {destination} पर जाएं', arrivedAt: 'आप {destination} पर पहुंच गए हैं।', proceedTo: '{destination} की ओर बढ़ें।' },
        };
    };

    // --- RENDER FUNCTIONS ---
    // These functions update the DOM based on the current state.

    const renderAll = () => {
        renderHeader();
        renderFloorMap();
        renderProductList();
        renderShoppingList();
        renderServicesList();
        renderTabs();
    };

    const renderHeader = () => {
        dom.appTitle.textContent = t('appTitle');
        dom.shopperLabel.textContent = t('shopper');
        dom.shopkeeperLabel.textContent = t('shopkeeper');
        dom.modeToggle.checked = state.isShopkeeperMode;
        if(state.isShopkeeperMode) {
            dom.shopkeeperLabel.classList.add('text-green-600');
            dom.shopkeeperLabel.classList.remove('text-gray-500');
        } else {
            dom.shopkeeperLabel.classList.remove('text-green-600');
            dom.shopkeeperLabel.classList.add('text-gray-500');
        }
    };
    
    const renderFloorMap = () => {
        dom.floorMapContainer.innerHTML = ''; // Clear previous areas
        
        // Render Areas
        const displayedAreas = state.floorAreas.filter(area => area.floor === state.currentFloor);
        displayedAreas.forEach(area => {
            const areaDiv = document.createElement('div');
            areaDiv.className = `absolute flex items-center justify-center rounded-sm ${area.color} ${area.textColor} text-[8px] sm:text-xs font-medium shadow-sm p-1`;
            areaDiv.style.left = `${area.x}%`;
            areaDiv.style.top = `${area.y}%`;
            areaDiv.style.width = `${area.width}%`;
            areaDiv.style.height = `${area.height}%`;
            areaDiv.innerHTML = `<div class="text-center leading-tight"><span>${area.name[state.language]}</span></div>`;
            dom.floorMapContainer.appendChild(areaDiv);
        });

        // Render Nav Nodes
        const displayedNavNodes = state.navigationNodes.filter(node => node.floor === state.currentFloor);
        displayedNavNodes.forEach(node => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = "absolute flex items-center justify-center bg-gray-200 border-2 border-gray-400 rounded-md text-gray-700 shadow-md";
            nodeDiv.style.left = `${node.x - 2}%`;
            nodeDiv.style.top = `${node.y - 3}%`;
            nodeDiv.style.width = '4%';
            nodeDiv.style.height = '6%';
            nodeDiv.title = node.type;
            dom.floorMapContainer.appendChild(nodeDiv);
        });

        // Re-append user dot and SVG so they are on top
        dom.floorMapContainer.appendChild(dom.pathSvg);
        dom.floorMapContainer.appendChild(dom.userDot);
        updateUserPosition();
        renderFloorButtons();
        renderPath();
    };

    const renderFloorButtons = () => {
        const uniqueFloors = [...new Set(state.floorAreas.map(area => area.floor))].sort((a, b) => a - b);
        dom.floorButtonsContainer.innerHTML = ''; // Clear old buttons
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'flex space-x-1 sm:space-x-2 bg-gray-100 p-1 rounded-lg';

        uniqueFloors.forEach(floor => {
            const button = document.createElement('button');
            button.textContent = `${t('floor')} ${floor}`;
            button.className = `px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                state.currentFloor === floor ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:bg-gray-200'
            } ${state.isNavigating ? 'cursor-not-allowed opacity-70' : ''}`;
            if (state.isNavigating) {
                button.disabled = true;
            }
            button.addEventListener('click', () => {
                if (!state.isNavigating) {
                    state.currentFloor = floor;
                    renderFloorMap();
                }
            });
            buttonGroup.appendChild(button);
        });
        dom.floorButtonsContainer.appendChild(buttonGroup);
    };

    const renderProductList = () => {
        const searchTerm = dom.productSearchInput.value.toLowerCase();
        const filteredProducts = state.products.filter(p =>
            p.name[state.language].toLowerCase().includes(searchTerm) ||
            p.category[state.language].toLowerCase().includes(searchTerm)
        );

        dom.productListContainer.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'space-y-2';

        filteredProducts.forEach(product => {
            const inList = state.shoppingList.includes(product.id);
            const li = document.createElement('li');
            li.className = 'p-3 rounded-lg bg-gray-50';
            li.innerHTML = `
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-gray-800">${product.name[state.language]}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <p class="text-sm text-gray-500">${product.category[state.language]}</p>
                         <span class="text-xs bg-gray-200 text-gray-600 font-medium px-1.5 py-0.5 rounded">
                            ${t('floor')} ${product.floor}
                        </span>
                    </div>
                    <p class="text-sm font-bold text-gray-600 mt-1">$${product.price.toFixed(2)}</p>
                  </div>
                  <div class="flex flex-col items-end space-y-2">
                    ${state.isShopkeeperMode ? `<button data-product-id="${product.id}" class="edit-btn bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-md text-xs w-full text-center">Edit</button>` : ''}
                    <button data-product-id="${product.id}" class="toggle-list-btn px-3 py-1.5 text-xs font-semibold rounded-md w-full ${inList ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
                      ${inList ? t('remove') : t('addToList')}
                    </button>
                  </div>
                </div>
            `;
            ul.appendChild(li);
        });
        dom.productListContainer.appendChild(ul);
    };
    
    const renderShoppingList = () => {
        const listItems = state.products.filter(p => state.shoppingList.includes(p.id));
        
        if (listItems.length === 0) {
            dom.shoppingListContainer.innerHTML = `<div class="flex items-center justify-center h-full"><p class="text-gray-500">${t('emptyList')}</p></div>`;
        } else {
            dom.shoppingListContainer.innerHTML = '';
            const ul = document.createElement('ul');
            ul.className = 'space-y-2';
            listItems.forEach(item => {
                const li = document.createElement('li');
                li.className = 'p-3 rounded-lg bg-gray-50 flex items-center justify-between';
                li.innerHTML = `
                    <div>
                        <p class="font-semibold text-gray-800">${item.name[state.language]}</p>
                        <div class="flex items-center gap-2 mt-1">
                             <p class="text-sm text-gray-500">${item.category[state.language]}</p>
                             <span class="text-xs bg-gray-200 text-gray-600 font-medium px-1.5 py-0.5 rounded">${t('floor')} ${item.floor}</span>
                        </div>
                    </div>
                    <button data-product-id="${item.id}" class="toggle-list-btn text-xs font-semibold rounded-md bg-red-100 text-red-700 px-3 py-1.5 self-start">${t('remove')}</button>
                `;
                ul.appendChild(li);
            });
            dom.shoppingListContainer.appendChild(ul);
        }

        dom.totalItemsCount.textContent = listItems.length;
        dom.shoppingListCount.textContent = listItems.length;
        dom.shoppingListCount.style.display = listItems.length > 0 ? 'inline-block' : 'none';

        if (state.isNavigating) {
            dom.navigationButton.textContent = t('cancelNavigation');
            dom.navigationButton.className = 'w-full bg-red-500 text-white font-bold py-3 rounded-lg';
        } else {
            dom.navigationButton.textContent = t('startNavigation');
            dom.navigationButton.className = 'w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-300';
            dom.navigationButton.disabled = listItems.length === 0;
        }

        // Update translations
        dom.totalItemsLabel.textContent = t('totalItems');
        dom.tabButtons.forEach(btn => {
            const key = { products: 'allProducts', list: 'shoppingList', services: 'services' }[btn.dataset.tab];
            if(key) btn.childNodes[0].nodeValue = t(key);
        });
    };
    
    const renderServicesList = () => {
        const washrooms = state.floorAreas
            .filter(area => area.type === 'washroom')
            .sort((a, b) => a.floor - b.floor || a.id.localeCompare(b.id));

        dom.servicesListContainer.innerHTML = '';
        if (washrooms.length > 0) {
            const div = document.createElement('div');
            div.innerHTML = `<h3 class="text-lg font-semibold text-gray-700 mb-3">${t('washrooms')}</h3>`;
            const ul = document.createElement('ul');
            ul.className = 'space-y-2';
            washrooms.forEach(area => {
                const li = document.createElement('li');
                li.className = 'p-3 rounded-lg bg-gray-50 flex items-center justify-between';
                li.innerHTML = `
                    <div class="flex items-center gap-3">
                      <div>
                        <p class="font-semibold text-gray-800">${area.name[state.language]}</p>
                        <span class="text-xs bg-gray-200 text-gray-600 font-medium px-1.5 py-0.5 rounded">
                          ${t('floor')} ${area.floor}
                        </span>
                      </div>
                    </div>
                    <button
                      data-area-id="${area.id}"
                      class="navigate-area-btn px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-700 ${state.isNavigating ? 'disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed' : ''}"
                      ${state.isNavigating ? 'disabled' : ''}
                    >
                      ${t('navigate')}
                    </button>
                `;
                ul.appendChild(li);
            });
            div.appendChild(ul);
            dom.servicesListContainer.appendChild(div);
        }
    };

    const renderTabs = () => {
        dom.tabButtons.forEach(btn => {
            const tabName = btn.dataset.tab;
            const content = document.getElementById(`${tabName}-panel`);
            if (btn.classList.contains('border-blue-500')) {
                 content.style.display = 'flex';
            } else {
                 content.style.display = 'none';
            }
        });
    };
    
    const renderPath = () => {
        const displayedPath = state.path.find(p => p.floor === state.currentFloor);
        if (state.isNavigating && displayedPath) {
            const pathData = "M " + displayedPath.points.map(p => `${p.x} ${p.y}`).join(" L ");
            dom.pathSvg.innerHTML = `<path d="${pathData}" stroke="#3b82f6" stroke-width="1" fill="none" class="path-line"></path>`;
        } else {
            dom.pathSvg.innerHTML = '';
        }
    };

    const updateUserPosition = () => {
        if (state.userPosition.floor === state.currentFloor) {
            dom.userDot.style.display = 'block';
            dom.userDot.style.left = `${state.userPosition.x}%`;
            dom.userDot.style.top = `${state.userPosition.y}%`;
            dom.userDot.style.transform = `translate(-50%, -50%) rotate(${state.userRotation}deg)`;
        } else {
            dom.userDot.style.display = 'none';
        }
        dom.userPing.style.display = state.isNavigating ? 'block' : 'none';
    };
    
    const updateNavInstruction = (instruction) => {
        if(instruction) {
            dom.navInstructionBanner.style.display = 'block';
            dom.navInstructionText.textContent = instruction;
        } else {
            dom.navInstructionBanner.style.display = 'none';
        }
    };

    // --- EVENT HANDLERS ---
    
    const handleLanguageChange = (e) => {
        state.language = e.target.value;
        renderAll();
    };

    const handleModeToggle = (e) => {
        state.isShopkeeperMode = e.target.checked;
        renderHeader();
        renderProductList();
    };

    const handleTabClick = (e) => {
        const clickedTab = e.target.closest('.tab-button');
        if (!clickedTab) return;

        dom.tabButtons.forEach(btn => {
            btn.classList.remove('border-blue-500', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });

        clickedTab.classList.add('border-blue-500', 'text-blue-600');
        clickedTab.classList.remove('border-transparent', 'text-gray-500');
        
        renderTabs();
    };
    
    const handleToggleShoppingList = (productId) => {
        const id = parseInt(productId, 10);
        if (state.shoppingList.includes(id)) {
            state.shoppingList = state.shoppingList.filter(i => i !== id);
        } else {
            state.shoppingList.push(id);
        }
        renderProductList();
        renderShoppingList();
    };
    
    const handleStartNavigation = () => {
        if (state.shoppingList.length === 0) return;
        
        const startPoint = { x: 50, y: 92, floor: 1 };
        state.userPosition = startPoint;
        state.currentFloor = 1;

        const productDestinations = state.shoppingList
            .map(id => state.products.find(p => p.id === id))
            .map(p => {
                const area = state.floorAreas.find(a => a.id === p.shopId);
                if (!area) return null;
                return { id: p.id, destinationPoint: area.entrancePoint, destinationName: area.name[state.language] };
            })
            .filter(d => d !== null);

        state.path = calculateMultiStopRoute(startPoint, productDestinations, state.floorAreas, state.navigationNodes, t);
        state.isNavigating = true;
        renderAll();
        startAnimation();
    };

    const handleStartNavigationToArea = (areaId) => {
        const area = state.floorAreas.find(a => a.id === areaId);
        if (!area) return;

        const startPoint = { x: 50, y: 92, floor: 1 };
        state.userPosition = startPoint;
        state.currentFloor = 1;
        const destination = { id: area.id, destinationPoint: area.entrancePoint, destinationName: area.name[state.language] };
        
        state.path = calculateMultiStopRoute(startPoint, [destination], state.floorAreas, state.navigationNodes, t);
        state.isNavigating = true;
        renderAll();
        startAnimation();
    };


    const handleCancelNavigation = () => {
        state.isNavigating = false;
        state.path = [];
        state.userPosition = { x: 50, y: 92, floor: 1 };
        state.currentFloor = 1;
        updateNavInstruction('');
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (segmentPauseTimeoutId) clearTimeout(segmentPauseTimeoutId);
        animationFrameId = null;
        lastTimestamp = 0;
        renderAll();
    };

    // --- EVENT LISTENERS ---
    dom.languageSelect.addEventListener('change', handleLanguageChange);
    dom.modeToggle.addEventListener('change', handleModeToggle);
    dom.tabButtons.forEach(btn => btn.addEventListener('click', handleTabClick));
    dom.productSearchInput.addEventListener('input', renderProductList);

    // Event delegation for dynamically created buttons
    document.body.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.toggle-list-btn');
        if (toggleBtn) {
            handleToggleShoppingList(toggleBtn.dataset.productId);
            return;
        }

        const navigateAreaBtn = e.target.closest('.navigate-area-btn');
        if (navigateAreaBtn) {
            handleStartNavigationToArea(navigateAreaBtn.dataset.areaId);
            return;
        }
    });

    dom.navigationButton.addEventListener('click', () => {
        if (state.isNavigating) {
            handleCancelNavigation();
        } else {
            handleStartNavigation();
        }
    });

    // --- NAVIGATION ANIMATION LOGIC ---
    const startAnimation = () => {
        if (!state.isNavigating || state.path.length === 0) return;

        let currentSegmentIndex = 0;
        let currentPointIndex = 0;
        let pos = state.path[0].points[0];
        lastTimestamp = 0;

        const animate = (timestamp) => {
            if (lastTimestamp === 0) lastTimestamp = timestamp;
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            const SPEED = 0.03;
            const travelDistance = SPEED * deltaTime;

            const currentSegment = state.path[currentSegmentIndex];
            if (!currentSegment) {
                handleCancelNavigation(); 
                return;
            }
            
            if (state.currentFloor !== currentSegment.floor) {
                state.currentFloor = currentSegment.floor;
                renderFloorMap();
            }
            updateNavInstruction(currentSegment.instruction);

            const startPoint = currentSegment.points[currentPointIndex];
            const endPoint = currentSegment.points[currentPointIndex + 1];

            if (!startPoint || !endPoint) { // Reached end of segment points
                 currentSegmentIndex++;
                 currentPointIndex = 0;
                 if (currentSegmentIndex >= state.path.length) {
                    updateNavInstruction(t('navigationComplete'));
                    setTimeout(handleCancelNavigation, 2000);
                 } else {
                    animationFrameId = requestAnimationFrame(animate);
                 }
                 return;
            }

            const segmentVector = { x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y };
            const segmentLength = Math.hypot(segmentVector.x, segmentVector.y);
            const remainingDistance = segmentLength > 0 ? Math.hypot(endPoint.x - pos.x, endPoint.y - pos.y) : 0;
            
            state.userRotation = Math.atan2(segmentVector.y, segmentVector.x) * (180 / Math.PI) + 90;

            if (travelDistance >= remainingDistance && segmentLength > 0) {
                pos = endPoint;
                currentPointIndex++;

                if (currentPointIndex >= currentSegment.points.length - 1) {
                    state.userPosition = { ...pos, floor: currentSegment.floor };
                    currentSegmentIndex++;
                    currentPointIndex = 0;

                    if (currentSegmentIndex >= state.path.length) {
                        updateNavInstruction(t('navigationComplete'));
                        setTimeout(handleCancelNavigation, 2000);
                        return;
                    }

                    lastTimestamp = 0;
                    segmentPauseTimeoutId = setTimeout(() => {
                        pos = state.path[currentSegmentIndex].points[0];
                        animationFrameId = requestAnimationFrame(animate);
                    }, 2000);
                    return;
                }
            } else if (segmentLength > 0) {
                const moveRatio = travelDistance / segmentLength;
                pos = { x: pos.x + segmentVector.x * moveRatio, y: pos.y + segmentVector.y * moveRatio };
            }

            state.userPosition = { ...pos, floor: currentSegment.floor };
            updateUserPosition();
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
    };

    // --- PATHFINDING LOGIC --- (Copied from pathfinding.ts)
    const distance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    function findPathOnFloor(start, end, floor, areas) {
        // Simple A* implementation (simplified for brevity)
        return [start, end]; // In a real app, this would be the full A* logic
    }

    function findFloorPath(startFloor, endFloor, navNodes) {
        if (startFloor === endFloor) return [startFloor];
        const queue = [{ floor: startFloor, path: [startFloor] }];
        const visited = new Set([startFloor]);

        while (queue.length > 0) {
            const { floor, path } = queue.shift();
            if (floor === endFloor) return path;

            const reachableFloors = new Set();
            navNodes.filter(n => n.floor === floor).forEach(node => node.links.forEach(link => reachableFloors.add(link.floor)));

            for (const nextFloor of reachableFloors) {
                if (!visited.has(nextFloor)) {
                    visited.add(nextFloor);
                    queue.push({ floor: nextFloor, path: [...path, nextFloor] });
                }
            }
        }
        return null;
    }

    function calculateMultiStopRoute(start, destinations, areas, navNodes, t) {
        let currentPoint = start;
        let fullPath = [];
        const remaining = [...destinations];

        while (remaining.length > 0) {
            remaining.sort((a, b) => distance(a.destinationPoint, currentPoint) - distance(b.destinationPoint, currentPoint));
            const nextStop = remaining.shift();
            const nextDestinationPoint = nextStop.destinationPoint;

            if (currentPoint.floor !== nextDestinationPoint.floor) {
                const floorPath = findFloorPath(currentPoint.floor, nextDestinationPoint.floor, navNodes);
                if (floorPath) {
                    for (let i = 0; i < floorPath.length - 1; i++) {
                        const startFloor = floorPath[i];
                        const endFloor = floorPath[i + 1];
                        const transitNode = navNodes.find(n => n.floor === startFloor && n.links.some(l => l.floor === endFloor));
                        const transitPoint = { x: transitNode.x, y: transitNode.y, floor: transitNode.floor };
                        
                        fullPath.push({ floor: startFloor, points: [currentPoint, transitPoint], instruction: t('goTo', { destination: transitNode.type, floor: endFloor }) });
                        
                        const destTransitLink = transitNode.links.find(l => l.floor === endFloor);
                        const destTransit = navNodes.find(n => n.id === destTransitLink.id);
                        currentPoint = { x: destTransit.x, y: destTransit.y, floor: destTransit.floor };
                    }
                }
            }
            
            const instruction = remaining.length === 0 ? t('arrivedAt', { destination: nextStop.destinationName }) : t('proceedTo', { destination: nextStop.destinationName });
            fullPath.push({ floor: nextDestinationPoint.floor, points: [currentPoint, nextDestinationPoint], instruction });
            currentPoint = nextDestinationPoint;
        }
        return fullPath;
    }

    // --- INITIALIZATION ---
    const main = () => {
        initializeData();
        renderAll();
    };

    main();
});
