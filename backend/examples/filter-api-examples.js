// Flexible Service Filter API - JavaScript Examples
// Base URL for the API
const BASE_URL = "http://localhost:3000/api";

// Example usage with fetch API
async function filterServices(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/filter-services${queryString ? "?" + queryString : ""}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching services:", error);
    return null;
  }
}

// Example 1: Filter by city
async function getServicesByCity(city) {
  return await filterServices({ city, limit: 10 });
}

// Example 2: Filter by multiple parameters
async function getFilteredServices() {
  return await filterServices({
    city: "Mumbai",
    profileType: "Service Profile",
    serviceType: "premium",
    gender: "Male",
    limit: 20,
    page: 1,
  });
}

// Example 3: Search with text query
async function searchServices(searchTerm) {
  return await filterServices({
    search: searchTerm,
    limit: 15,
  });
}

// Example 4: Filter by price range
async function getServicesByPriceRange(minPrice, maxPrice) {
  return await filterServices({
    minPrice,
    maxPrice,
    limit: 10,
  });
}

// Example 5: Filter by category and location
async function getServicesByCategoryAndLocation(category, city) {
  return await filterServices({
    category,
    city,
    sortBy: "yourName",
    sortOrder: "asc",
    limit: 25,
  });
}

// Example 6: Get premium services in a specific area
async function getPremiumServicesInArea(area, state) {
  return await filterServices({
    area,
    state,
    serviceType: "premium",
    limit: 10,
  });
}

// Example 7: Advanced filtering with pagination
async function getAdvancedFilteredServices(filters, page = 1, limit = 10) {
  return await filterServices({
    ...filters,
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
}

// Usage Examples:

// 1. Get all services in Mumbai
// getServicesByCity('Mumbai').then(console.log);

// 2. Get premium male service providers in Mumbai
// getFilteredServices().then(console.log);

// 3. Search for plumbing services
// searchServices('plumbing').then(console.log);

// 4. Get services in price range 1000-5000
// getServicesByPriceRange(1000, 5000).then(console.log);

// 5. Get home services in Delhi
// getServicesByCategoryAndLocation('Home Services', 'Delhi').then(console.log);

// 6. Get premium services in Andheri, Maharashtra
// getPremiumServicesInArea('Andheri', 'Maharashtra').then(console.log);

// 7. Advanced filtering example
// const filters = {
//     profileType: 'Business Profile',
//     city: 'Bangalore',
//     serviceType: 'featured',
//     experience: '5+ years'
// };
// getAdvancedFilteredServices(filters, 1, 20).then(console.log);

// URL Examples for direct API calls:

console.log("🔗 Direct API URL Examples:");
console.log("");

console.log("1. Filter by city:");
console.log(`${BASE_URL}/filter-services?city=Mumbai`);
console.log("");

console.log("2. Multiple filters:");
console.log(
  `${BASE_URL}/filter-services?city=Mumbai&profileType=Service%20Profile&serviceType=premium`
);
console.log("");

console.log("3. Text search:");
console.log(`${BASE_URL}/filter-services?search=plumbing`);
console.log("");

console.log("4. Price range:");
console.log(`${BASE_URL}/filter-services?minPrice=1000&maxPrice=5000`);
console.log("");

console.log("5. Category and location:");
console.log(`${BASE_URL}/filter-services?category=Home%20Services&city=Delhi`);
console.log("");

console.log("6. With pagination and sorting:");
console.log(
  `${BASE_URL}/filter-services?city=Mumbai&page=2&limit=15&sortBy=yourName&sortOrder=asc`
);
console.log("");

console.log("7. Complex multi-filter:");
console.log(
  `${BASE_URL}/filter-services?profileType=Business%20Profile&city=Bangalore&serviceType=featured&gender=Male&experience=5%2B%20years&page=1&limit=20`
);

module.exports = {
  filterServices,
  getServicesByCity,
  getFilteredServices,
  searchServices,
  getServicesByPriceRange,
  getServicesByCategoryAndLocation,
  getPremiumServicesInArea,
  getAdvancedFilteredServices,
};
