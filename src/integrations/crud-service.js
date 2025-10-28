const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const BaseCrudService = {
  async getAll(collection, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const url = `${API_BASE_URL}/${collection}${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      const data = await handleResponse(response);
      
      // Return data in the expected format
      return {
        items: data[collection] || data.stations || data.bookings || data.reviews || data.rentals || [],
        pagination: data.pagination
      };
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      throw error;
    }
  },

  async getById(collection, id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${collection}/${id}`, {
        headers: getAuthHeaders()
      });
      
      const data = await handleResponse(response);
      return data[collection] || data.station || data.booking || data.review || data.rental;
    } catch (error) {
      console.error(`Error fetching ${collection} by ID:`, error);
      throw error;
    }
  },

  async create(collection, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/${collection}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      const result = await handleResponse(response);
      return result[collection] || result.station || result.booking || result.review || result.rental || result;
    } catch (error) {
      console.error(`Error creating ${collection}:`, error);
      throw error;
    }
  },

  async update(collection, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/${collection}/${data._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      const result = await handleResponse(response);
      return result[collection] || result.station || result.booking || result.review || result.rental || result;
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      throw error;
    }
  },

  async delete(collection, id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${collection}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      await handleResponse(response);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      throw error;
    }
  },

  // Specialized methods for different collections
  async getStations(filters = {}) {
    return this.getAll('stations', filters);
  },

  async getStationById(id) {
    return this.getById('stations', id);
  },

  async createStation(stationData) {
    return this.create('stations', stationData);
  },

  async updateStation(stationData) {
    return this.update('stations', stationData);
  },

  async deleteStation(id) {
    return this.delete('stations', id);
  },

  async getBookings(filters = {}) {
    return this.getAll('bookings/my-bookings', filters);
  },

  async createBooking(bookingData) {
    return this.create('bookings', bookingData);
  },

  async updateBookingStatus(bookingId, status, cancellationReason = null) {
    const data = { status };
    if (cancellationReason) data.cancellationReason = cancellationReason;
    
    return fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse);
  },

  async cancelBooking(bookingId, cancellationReason) {
    return fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cancellationReason })
    }).then(handleResponse);
  },

  async getReviews(filters = {}) {
    return this.getAll('reviews', filters);
  },

  async createReview(reviewData) {
    return this.create('reviews', reviewData);
  },

  async getRentals(filters = {}) {
    return this.getAll('rentals/my-rentals', filters);
  },

  async createRental(rentalData) {
    return this.create('rentals', rentalData);
  },

  // Payment methods
  async createPaymentIntent(type, id) {
    const response = await fetch(`${API_BASE_URL}/payments/${type}/${id}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async confirmPayment(paymentIntentId) {
    const response = await fetch(`${API_BASE_URL}/payments/confirm/${paymentIntentId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  async getPaymentHistory() {
    const response = await fetch(`${API_BASE_URL}/payments/history`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};