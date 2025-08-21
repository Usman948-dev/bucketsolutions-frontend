// frontend-react/src/App.jsx
import React, { useState, useEffect } from 'react'; 

function App() {
  // IMPORTANT: Replace this with the actual URL of your deployed Render Flask back-end
  const API_BASE_URL = "https://bucketsolutions-backend.onrender.com"; // Example: https://bucketsolutions-api.onrender.com

  const [productName, setProductName] = useState('Xerox 1918');
  const [customerId, setCustomerId] = useState('AA-10315');
  const [basketItems, setBasketItems] = useState('Staples, Paper');

  const [popularRecs, setPopularRecs] = useState([]);
  const [contentRecs, setContentRecs] = useState([]);
  const [collaborativeRecs, setCollaborativeRecs] = useState([]);
  const [basketRecs, setBasketRecs] = useState([]);

  const [loadingPopular, setLoadingPopular] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingCollaborative, setLoadingCollaborative] = useState(false);
  const [loadingBasket, setLoadingBasket] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [errorPopular, setErrorPopular] = useState(null);
  const [errorContent, setErrorContent] = useState(null);
  const [errorCollaborative, setErrorCollaborative] = useState(null);
  const [errorBasket, setErrorBasket] = useState(null);
  const [errorUpload, setErrorUpload] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);

  // Function to fetch recommendations
  const fetchRecommendations = async (endpoint, payload, setter, loadingSetter, errorSetter, method = 'POST') => {
    loadingSetter(true);
    errorSetter(null);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : null,
      });
      const data = await response.json();
      if (response.ok) {
        setter(data.recommendations);
      } else {
        errorSetter(data.error || 'An unknown error occurred.');
        setter([]);
      }
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      errorSetter('Failed to connect to the API. Is the backend running?');
      setter([]);
    } finally {
      loadingSetter(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage(null);
    setErrorUpload(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorUpload("Please select a file to upload.");
      return;
    }

    setLoadingUpload(true);
    setUploadMessage(null);
    setErrorUpload(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadMessage(data.message);
        fetchRecommendations('/recommend/popular', null, setPopularRecs, setLoadingPopular, setErrorPopular, 'GET');
      } else {
        setErrorUpload(data.error || 'An unknown error occurred during upload.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorUpload('Failed to connect to the API for upload. Is the backend running?');
    } finally {
      setLoadingUpload(false);
    }
  };

  useEffect(() => {
    fetchRecommendations('/recommend/popular', null, setPopularRecs, setLoadingPopular, setErrorPopular, 'GET');
  }, []);

  const handleGetContentRecs = () => {
    fetchRecommendations('/recommend/content', { product_name: productName }, setContentRecs, setLoadingContent, setErrorContent);
  };

  const handleGetCollaborativeRecs = () => {
    fetchRecommendations('/recommend/collaborative', { customer_id: customerId }, setCollaborativeRecs, setLoadingCollaborative, setErrorCollaborative);
  };

  const handleGetBasketRecs = () => {
    const itemsArray = basketItems.split(',').map(item => item.trim()).filter(item => item !== '');
    fetchRecommendations('/recommend/basket', { items: itemsArray }, setBasketRecs, setLoadingBasket, setErrorBasket);
  };

  // Recommendation Card Component (using JSX)
  const RecommendationCard = ({ title, recommendations, loading, error }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-semibold text-blue-400 mb-4">{title}</h3>
      {loading && <p className="text-gray-400">Loading recommendations...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {!loading && !error && (
        <ul className="list-disc list-inside text-gray-300 space-y-2 flex-grow">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))
          ) : (
            <p>No recommendations found.</p>
          )}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter p-4 sm:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-500 mb-2">Product Recommendation Dashboard</h1>
        <p className="text-gray-400 text-lg">Explore personalized and popular product suggestions.</p>
      </header>
      
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
        <h2 className="text-2xl font-semibold text-white mb-6">Upload Your Data</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
          <button
            onClick={handleFileUpload}
            disabled={loadingUpload}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingUpload ? "Uploading..." : "Upload Data"}
          </button>
        </div>
        {uploadMessage && <p className="text-green-400 mt-4">{uploadMessage}</p>}
        {errorUpload && <p className="text-red-400 mt-4">Upload Error: {errorUpload}</p>}
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
        <h2 className="text-2xl font-semibold text-white mb-6">Get Specific Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label htmlFor="productName" className="text-gray-300 text-sm mb-2">Product Name (for Content-Based)</label>
            <input
              type="text"
              id="productName"
              className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., HP Printer"
            />
            <button
              onClick={handleGetContentRecs}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition duration-300 ease-in-out transform hover:scale-105"
            >
              Get Content Recs
            </button>
          </div>

          <div className="flex flex-col">
            <label htmlFor="customerId" className="text-gray-300 text-sm mb-2">Customer ID (for Collaborative)</label>
            <input
              type="text"
              id="customerId"
              className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="e.g., AA-10315"
            />
            <button
              onClick={handleGetCollaborativeRecs}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition duration-300 ease-in-out transform hover:scale-105"
            >
              Get Collaborative Recs
            </button>
          </div>

          <div className="flex flex-col">
            <label htmlFor="basketItems" className="text-gray-300 text-sm mb-2">Items in Basket (comma-separated)</label>
            <input
              type="text"
              id="basketItems"
              className="p-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white"
              value={basketItems}
              onChange={(e) => setBasketItems(e.target.value)}
              placeholder="e.g., Staples, Paper"
            />
            <button
              onClick={handleGetBasketRecs}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition duration-300 ease-in-out transform hover:scale-105"
            >
              Get Basket Recs
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-6">Recommendation Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RecommendationCard
            title="Most Popular Products"
            recommendations={popularRecs}
            loading={loadingPopular}
            error={errorPopular}
          />
          <RecommendationCard
            title="Content-Based Recommendations"
            recommendations={contentRecs}
            loading={loadingContent}
            error={errorContent}
          />
          <RecommendationCard
            title="Collaborative Filtering Recommendations"
            recommendations={collaborativeRecs}
            loading={loadingCollaborative}
            error={errorCollaborative}
          />
          <RecommendationCard
            title="Market Basket Recommendations"
            recommendations={basketRecs}
            loading={loadingBasket}
            error={errorBasket}
          />
        </div>
      </section>
    </div>
  );
}

export default App;