import React, { useState, useEffect } from "react";
import "./App.css";


const areas = [
  "Canadian", "Indian", "Russian", "Thai", "Chinese", "Mexican",
  "Italian", "French", "Japanese", "Turkish", "Greek", "Spanish",
  "German", "Vietnamese", "Moroccan", "American",
  "Portuguese", "Filipino", "Malaysian", "Egyptian", "Polish",
];

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllRecipes = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        areas.map(area => fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`))
      );
      const allData = await Promise.all(responses.map(res => res.json()));
      const meals = allData.flatMap(data => data.meals || []);
      setRecipes(meals);
    } catch (error) {
      console.error("Error fetching all recipes:", error);
    }
    setLoading(false);
  };

  const fetchRecipesByArea = async (area) => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      console.error(`Error fetching ${area} recipes:`, error);
    }
    setLoading(false);
  };

  const fetchRecipeDetails = async (mealName) => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`);
      const data = await response.json();
      setSelectedRecipe(data.meals ? data.meals[0] : null);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      if (areas.includes(searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1))) {
        await fetchRecipesByArea(searchQuery);
      } else {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
        const data = await response.json();
        setRecipes(data.meals || []);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="text-center my-4">Recipe Finder</h1>
      
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a recipe or country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>

      {/* Fetch All Recipes */}
      <button className="btn btn-success mb-3" onClick={fetchAllRecipes}>Fetch All Recipes</button>

      {/* Country Buttons */}
      <div className="country-buttons">
        {areas.map((area) => (
          <button key={area} className="btn" onClick={() => fetchRecipesByArea(area)}>
            {area}
          </button>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-primary">Loading...</p>}

      {/* Display Recipes or Recipe Details */}
      {!selectedRecipe ? (
        <div className="row">
          {recipes.map((meal) => (
            <div key={meal.idMeal} className="card">
              <img src={meal.strMealThumb} className="img-fluid" alt={meal.strMeal} />
              <div className="card-body">
                <h5 className="card-title">{meal.strMeal}</h5>
                <button className="btn btn-outline-primary" onClick={() => fetchRecipeDetails(meal.strMeal)}>View Recipe</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-primary">{selectedRecipe.strMeal}</h2>
          <p>{selectedRecipe.strInstructions}</p>
          <img src={selectedRecipe.strMealThumb} alt={selectedRecipe.strMeal} className="img-fluid rounded shadow" />
          
          <h4 className="mt-3">Ingredients:</h4>
          <ul className="list-group">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((i) => {
              const ingredient = selectedRecipe[`strIngredient${i}`];
              const measure = selectedRecipe[`strMeasure${i}`];
              return ingredient ? <li key={i} className="list-group-item">{measure} {ingredient}</li> : null;
            })}
          </ul>

          <button className="btn btn-danger mt-3" onClick={() => setSelectedRecipe(null)}>🔙 Back to Recipes</button>
        </div>
      )}
    </div>
  );
}
